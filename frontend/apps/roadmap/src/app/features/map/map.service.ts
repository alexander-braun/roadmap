import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  EMPTY,
  map,
  merge,
  Observable,
  Subject,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {
  CardData,
  CardDataTree,
  CardCoordinateCollection,
  PresetInfo,
  RoadmapPatchResponse,
  NodeEntry,
} from './map.model';
import { v4 as uuidv4 } from 'uuid';
import { Categories, Category, StatusChoices } from './settings/settings.model';
import { HttpClient } from '@angular/common/http';
import { NodeId, Nodes, statusChoices } from 'apps/roadmap/src/assets/data';
import { AuthService } from '../../shared/services/auth.service';
import { Roadmap } from './map.model';

// CLEANUP!

@Injectable({
  providedIn: 'root',
})
export class MapService {
  // View related
  private cardCoordinateCollection$$ = new BehaviorSubject<Readonly<CardCoordinateCollection>>([]);
  public cardCoordinateCollection$ = this.cardCoordinateCollection$$.asObservable();

  public loading$$ = new Subject<boolean>();
  public loading$ = this.loading$$.asObservable();

  // Collection of all maps belonging to user
  private availableRoadmaps$$ = new BehaviorSubject<Readonly<Roadmap[]>>([]);
  public availableRoadmaps$ = this.availableRoadmaps$$.asObservable();

  // All parts of the roadmap split up
  private nodes$$ = new BehaviorSubject<Readonly<Nodes>>({});
  public nodes$ = this.nodes$$.asObservable();

  private cardDataTree$$ = new BehaviorSubject<Readonly<CardDataTree>>({});
  public cardDataTree$ = this.cardDataTree$$.asObservable();

  private presetInfo$$ = new BehaviorSubject<Readonly<PresetInfo>>({} as PresetInfo);
  public presetInfo$ = this.presetInfo$$.asObservable();

  private categories$$ = new BehaviorSubject<Categories>([]);
  public categories$ = this.categories$$.asObservable();

  // Hardcoded, not from backend (maybe just remove and use const)
  private statusChoices$$ = new BehaviorSubject<StatusChoices>([]);
  public statusChoices$ = this.statusChoices$$.asObservable();

  //private updates = [] as { type: 'ADD' | 'UPDATE' | 'DELETE'; data: NodeEntry }[];

  constructor(private http: HttpClient, private authService: AuthService) {
    this.statusChoices$$.next(statusChoices);
    this.removeRoadmapOnAuthFail();
    this.handleAutoSave();
  }

  // TODO IMPLEMENT SAVE LOGIC
  private handleAutoSave() {
    const cardDataTreeTagged$ = this.cardDataTree$.pipe(
      debounceTime(2000),
      map((data) => ({ source: 'cardDataTree', data }))
    );
    const presetInfoTagged$ = this.presetInfo$.pipe(
      debounceTime(2000),
      map((data) => ({ source: 'presetInfo', data }))
    );
    const categoriesTagged$ = this.categories$.pipe(
      debounceTime(2000),
      map((data) => ({ source: 'categories', data }))
    );
    const nodesTagged$ = this.nodes$.pipe(
      debounceTime(2000),
      map((data) => ({ source: 'nodes', data }))
    );
    // Create queue
    merge(cardDataTreeTagged$, presetInfoTagged$, categoriesTagged$, nodesTagged$).subscribe();
  }

  private removeRoadmapOnAuthFail(): void {
    this.authService.isAuthorized$.subscribe(() => {
      this.getData();
    });
  }

  public deleteRoadmapById(id: string): Observable<Roadmap> {
    return this.http.delete<Roadmap>(`/api/roadmaps/${id}`).pipe(
      tap(() => {
        this.getData();
      })
    );
  }

  public getData(): void {
    this.loading$$.next(true);
    this.removeCurrentRoadmap();

    if (!this.authService.isUserAuthorized()) {
      this.getDefaultRoadmap();
    } else if (this.authService.isUserAuthorized() && localStorage.getItem('lastVisitedMapId') !== null) {
      this.getRoadmapByLastUsedFromLocalStorage();
    } else if (this.authService.isUserAuthorized()) {
      this.getAllRoadmapsAndAssignFirst();
    }
  }

  private getAllRoadmapsAndAssignFirst(): void {
    this.getAllRoadmaps()
      .pipe(take(1))
      .subscribe((roadmaps) => {
        this.handleMapResponse(roadmaps[0]);
        this.loading$$.next(false);
      });
  }

  private getAllRoadmaps(): Observable<Roadmap[]> {
    return this.http.get<Roadmap[]>('/api/roadmaps').pipe(
      tap((roadmaps) => {
        this.availableRoadmaps$$.next(roadmaps);
      })
    );
  }

  public generateNewDefaultMap(title: string, subtitle: string): Observable<Roadmap[]> {
    // FIRST SAVE WHOLE ROADMAP THEN CREATE NEW THEN FETCH WITH GETDATA
    return this.http
      .post('/api/roadmaps/default', { newDefault: true, title, subtitle })
      .pipe(switchMap(() => this.getAllRoadmaps()));
  }

  public patchSettings(settings: Category[]) {
    return this.http.post(`/api/roadmaps/settings/${this.presetInfo$$.value.id}`, settings).subscribe({
      next: () => {
        this.categories$$.next(settings);
      },
      error: () => {
        this.cancelCategories();
      },
    });
  }

  private getDefaultRoadmap(): void {
    this.http.get<Roadmap>('/api/roadmaps/default-frontend').subscribe({
      next: (roadmap) => {
        this.handleMapResponse(roadmap);
        this.loading$$.next(false);
      },
    });
  }

  private getRoadmapByLastUsedFromLocalStorage(): void {
    // Always get all roadmaps for presets selection
    // Might be good to create endpoint to only get name+id of roadmaps
    this.getAllRoadmaps()
      .pipe(take(1))
      .subscribe((roadmaps) => {
        const newCurrentRoadmap = roadmaps.find((roadmap) => roadmap._id === localStorage.getItem('lastVisitedMapId'));
        this.handleMapResponse(newCurrentRoadmap || ({} as Roadmap));
        this.loading$$.next(false);
      });
  }

  public patchMap(map: NodeEntry[]) {
    const roadmapId = this.presetInfo$$.value.id;
    if (this.authService.isUserAuthorized() && roadmapId) {
      this.http
        .patch<RoadmapPatchResponse>('/api/roadmaps/' + roadmapId, {
          map,
        })
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            // Create save done logic
            // some spinner
          },
        });
    }
  }

  public setPresetInformation(title: string, subtitle: string): void {
    const roadmapId = this.presetInfo$$.value.id;
    if (
      (this.presetInfo$$.value.title !== title || this.presetInfo$$.value.subtitle !== subtitle) &&
      this.authService.isUserAuthorized() &&
      roadmapId
    ) {
      this.http
        .patch<RoadmapPatchResponse>('/api/roadmaps/' + roadmapId, {
          title,
          subtitle,
        })
        .pipe(
          take(1),
          catchError(() => EMPTY)
        )
        .subscribe({
          next: (response) => {
            this.presetInfo$$.next({
              title: response.title,
              subtitle: response.subtitle,
              id: response._id,
              updatedAt: response.updatedAt,
              createdAt: response.createdAt,
              date: response.date,
            });
          },
        });
    }
  }

  private removeCurrentRoadmap() {
    this.cardDataTree$$.next({});
    this.setNodes({});
    this.presetInfo$$.next({} as PresetInfo);
    this.availableRoadmaps$$.next([]);
  }

  public cancelCategories(): void {
    this.categories$$.next(this.categories$$.value);
  }

  public getCategoriesValue(): Categories {
    return this.categories$$.value;
  }

  // TODO Dont use get do deep clone
  public get categories(): Categories {
    return this.categories$$.value;
  }

  // TODO Dont use get do deep clone
  public get statusChoices(): StatusChoices {
    return this.statusChoices$$.value;
  }

  // Make all this to 1 roadmap
  public handleMapResponse(roadmap: Roadmap) {
    this.setCardDataTreeFromRoadmap(roadmap);
    this.setPresetInfoFromRoadmap(roadmap);
    this.generateNodesFromRoadmap(roadmap);
    if (roadmap.settings) {
      this.categories$$.next(roadmap.settings);
    }
    if (roadmap._id) {
      localStorage.setItem('lastVisitedMapId', roadmap._id);
    }
  }

  private setCardDataTreeFromRoadmap(roadmap: Roadmap): void {
    const cardDataTree: CardDataTree = {};
    roadmap?.map?.forEach((node) => {
      const { title, date, notes, categoryId, status } = node;
      cardDataTree[node.id] = { title, date, notes, categoryId, status };
    });
    this.cardDataTree$$.next(cardDataTree);
  }

  private setPresetInfoFromRoadmap(roadmap: Roadmap) {
    const { title, subtitle, _id, createdAt, date, updatedAt } = roadmap;
    this.presetInfo$$.next({
      title,
      subtitle,
      id: _id,
      createdAt,
      date,
      updatedAt,
    });
  }

  private generateNodesFromRoadmap(roadmap: Roadmap): void {
    const nodes: Nodes = {};
    roadmap?.map?.forEach((node) => {
      const { mainKnot, children } = node;
      nodes[node.id] = { mainKnot, children };
    });

    // If the map is not empty an ending-node is added and if not just show empty (something went wrong / no map)
    if (Object.keys(nodes).length > 0) {
      this.setNodes(nodes);
    } else {
      this.setNodes({});
    }
  }

  public patchCardDataOnCategoriesChange(categories: Categories): void {
    const tempTree = this.cardDataTree$$.value;
    Object.keys(tempTree).forEach((key) => {
      if (categories.findIndex((c) => c.categoryId === tempTree[key].categoryId) < 0) {
        tempTree[key].categoryId = '';
      }
    });
    this.cardDataTree$$.next(tempTree);
  }

  // Communicates to svg-path component to draw new svg
  public setCardCoordinateCollection(collection: CardCoordinateCollection): void {
    this.cardCoordinateCollection$$.next(collection);
  }

  public getNodesValue(): Nodes {
    // Make sure only the value is given here
    // Values are only string arrays and boolean so this is ok
    return JSON.parse(JSON.stringify(this.nodes$$.value));
  }

  public getCardDataTreeValue(): CardDataTree {
    return JSON.parse(JSON.stringify(this.cardDataTree$$.value));
  }

  public setNodes(nodes: Nodes): void {
    this.nodes$$.next(nodes);
  }

  private patchCardDataById(id: NodeId) {
    this.http
      .patch(`api/roadmaps/${this.presetInfo$$.value.id}/mapnode/${id}`, {
        ...this.getCardDataTreeValue()[id],
        ...this.nodes$$.value[id],
      })
      .subscribe({
        next: (res) => {
          // do nothing
        },
        error: (err) => {
          // show toast something went wrong
        },
      });
  }

  // Save here
  public setCardDataForId(id: NodeId, data: CardData): void {
    const newTree = this.getCardDataTreeValue();
    newTree[id] = {
      ...newTree[id],
      ...data,
    };
    //this.updates.push({ data: { ...newTree[id], ...this.nodes$$.value[id], id }, type: 'UPDATE' });
    this.cardDataTree$$.next(newTree);

    // Need to track changes to put debounceTime() in here together with the other addNode/etc.. patches
    this.patchCardDataById(id);
  }

  private generateMap(): NodeEntry[] {
    const map = [] as NodeEntry[];
    Object.entries(this.getNodesValue()).forEach(([id, node]) => {
      map.push({ ...node, id, ...this.cardDataTree$$.value[id] });
    });
    return map;
  }

  // Save here
  public addNode(id: NodeId): void {
    const tempNodeTree = { ...this.nodes$$.value };
    const tempCardDataTree = this.getCardDataTreeValue();

    const newNodeId = uuidv4();
    tempNodeTree[newNodeId] = {
      children: [],
      mainKnot: false,
    };
    tempNodeTree[id].children.push(newNodeId);
    tempCardDataTree[newNodeId] = {
      title: 'Edit Me!',
    };
    //this.updates.push({ data: { id: newNodeId, ...tempNodeTree[newNodeId], ...tempCardDataTree[newNodeId]}, type: "ADD" })
    //this.updates.push({ data: { id, ...tempNodeTree[id], ...tempCardDataTree[id]}, type: 'UPDATE'})
    this.setNodes(tempNodeTree);
    this.cardDataTree$$.next(tempCardDataTree);
    this.patchMap(this.generateMap());
  }

  // Save here
  public deleteNode(id: NodeId) {
    let nodes = this.getNodesValue();
    let cardDataTree = this.getCardDataTreeValue();
    // handle if Mainknot
    if (nodes[id].mainKnot) {
      // get previous mainKnot to link to
      const parentMainKnot = this.findParentKnot(id);
      // If no parentKnot then knot was first knot
      if (!parentMainKnot) {
        [nodes, cardDataTree] = this.removeNodeAndAllNoneMainKnotChildren(id, nodes, cardDataTree);
        // Else there is a parent and it has to be re-linked to the next child
      } else {
        let childMainKnot = this.findChildMainKnot(id);
        // will always have a child because 'last-node' can't be deleted
        // Handle parent children, link to new child
        const parentChildren = nodes[parentMainKnot].children.slice();
        const indexOfCurrentMiddleNode = parentChildren.indexOf(id);
        parentChildren.splice(indexOfCurrentMiddleNode, 1);
        if (childMainKnot) {
          parentChildren.push(childMainKnot);
        }
        nodes[parentMainKnot].children = parentChildren;
        [nodes, cardDataTree] = this.removeNodeAndAllNoneMainKnotChildren(id, nodes, cardDataTree);
      }
      // handle if child of Mainknot
    } else {
      // first remove reference to child from parent mainKnot
      const relatedParentKnot = this.findParentKnot(id);
      if (relatedParentKnot) {
        const parentKnotChildren = nodes[relatedParentKnot].children;
        parentKnotChildren.splice(parentKnotChildren.indexOf(id), 1);
        nodes[relatedParentKnot].children = parentKnotChildren;
      }
      // now remove all the children and the node itself
      [nodes, cardDataTree] = this.removeNodeAndAllNoneMainKnotChildren(id, nodes, cardDataTree);
    }

    const entries = Object.keys(nodes);
    // Add new Center node in case only last-node is left
    if (entries.length === 1) {
      nodes[uuidv4()] = {
        mainKnot: true,
        children: ['last-node'],
      };
    }
    this.setNodes(nodes);
    this.cardDataTree$$.next(cardDataTree);
    this.patchMap(this.generateMap());
  }

  private removeNodeAndAllNoneMainKnotChildren(
    id: NodeId,
    nodes: Nodes,
    cardDataTree: CardDataTree
  ): [Nodes, CardDataTree] {
    const nodeChildren = nodes[id].children;
    nodeChildren?.forEach((childId) => {
      if (!nodes[childId].mainKnot) {
        const subChildren = nodes[childId].children;
        subChildren.forEach((subChildId) => {
          if (!nodes[subChildId].mainKnot) {
            delete nodes[subChildId];
            delete cardDataTree[subChildId];
          }
        });
        if (!nodes[childId].mainKnot) {
          delete nodes[childId];
          delete cardDataTree[childId];
        }
      }
    });
    delete nodes[id];
    delete cardDataTree[id];
    return [nodes, cardDataTree];
  }

  // Save here
  public addCenterNodeAfterNodeId(nodeId: NodeId): void {
    const currentNodes = this.getNodesValue();
    const newCenterId = uuidv4();
    let childForNewCenterNode: string | undefined = undefined;
    const currentChildrenIds = currentNodes[nodeId].children;
    const newChildrenForNode: string[] = [];
    currentChildrenIds.forEach((child) => {
      if (currentNodes[child].mainKnot) {
        childForNewCenterNode = child;
      } else {
        newChildrenForNode.push(child);
      }
    });
    newChildrenForNode.push(newCenterId);
    currentNodes[nodeId] = {
      mainKnot: true,
      children: newChildrenForNode,
    };
    currentNodes[newCenterId] = {
      children: childForNewCenterNode ? [childForNewCenterNode] : [],
      mainKnot: true,
    };
    const cardDataTree = this.getCardDataTreeValue();
    cardDataTree[newCenterId] = { title: 'Edit me! ' };
    this.cardDataTree$$.next(cardDataTree);
    this.nodes$$.next(currentNodes);
    this.patchMap(this.generateMap());
  }

  private findParentKnot(id: NodeId): NodeId | undefined {
    const nodes = this.getNodesValue();
    let previous: string | undefined;
    Object.entries(nodes).forEach(([nodeId, node]) => {
      if (node.children?.indexOf(id) >= 0) {
        previous = nodeId;
      }
    });
    return previous;
  }

  private findChildMainKnot(id: NodeId): NodeId | undefined {
    const nodes = this.getNodesValue();
    let childMainKnot: string | undefined;
    const children = nodes[id].children;
    children?.forEach((child) => {
      if (nodes[child].mainKnot) {
        childMainKnot = child;
      }
    });
    return childMainKnot;
  }
}
