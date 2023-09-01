import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, forkJoin, Observable, Subject, take, tap } from 'rxjs';
import { CardData, CardDataTree, CardCoordinateCollection, PresetInfo, RoadmapPatchResponse } from './map.model';
import { v4 as uuidv4 } from 'uuid';
import { SettingsService } from './settings/settings.service';
import { Categories } from './settings/settings.model';
import { HttpClient } from '@angular/common/http';
import { NodeId, Nodes } from 'apps/roadmap/src/assets/data';
import { AuthService } from '../../shared/services/auth.service';
import { Roadmap } from './map.model';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private cardCoordinateCollection$$ = new BehaviorSubject<Readonly<CardCoordinateCollection>>([]);
  public cardCoordinateCollection$ = this.cardCoordinateCollection$$.asObservable();
  private nodes$$ = new BehaviorSubject<Readonly<Nodes>>({});
  public nodes$ = this.nodes$$.asObservable();
  private cardDataTree$$ = new BehaviorSubject<Readonly<CardDataTree>>({});
  public cardDataTree$ = this.cardDataTree$$.asObservable();
  public presetInfo$$ = new BehaviorSubject<Readonly<PresetInfo>>({} as PresetInfo);
  private availableRoadmaps$$ = new BehaviorSubject<Readonly<Roadmap[]>>([]);
  public availableRoadmaps$ = this.availableRoadmaps$$.asObservable();
  public loading$$ = new Subject<boolean>();
  public loading$ = this.loading$$.asObservable();

  constructor(private settingsService: SettingsService, private http: HttpClient, private authService: AuthService) {
    this.handleCategoriesUpdates();
    this.authService.isAuthorized$.subscribe(() => {
      this.getData();
    });
  }

  public getData(): void {
    this.loading$$.next(true);
    this.removeCurrentRoadmap();

    if (!this.authService.isUserAuthorized()) {
      this.getDefaultRoadmap();
    } else if (localStorage.getItem('lastVisitedMapId') !== null) {
      this.getRoadmapByLastUsedFromLocalStorage();
    } else {
      this.getAllRoadmapsAndAssignFirst();
    }
  }

  private getAllRoadmapsAndAssignFirst(): void {
    this.getAllRoadmaps().subscribe((roadmaps) => {
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

  private getDefaultRoadmap(): void {
    forkJoin([
      this.http.get<[{ nodes: Nodes; defaultMap: boolean }]>('/api/default-nodes'),
      this.http.get<[{ cards: CardDataTree; defaultMap: boolean }]>('/api/default-card-data'),
    ]).subscribe(([nodesData, cardData]) => {
      this.presetInfo$$.next({
        ...this.presetInfo$$.value,
        title: 'Frontend Developer',
        subtitle: 'Default Frontend Roadmap',
      });
      const nodes = nodesData?.[0]?.nodes;
      const newNodes = this.appendEndingNode(nodes || {});
      this.setNodes(newNodes);
      this.cardDataTree$$.next(cardData?.[0]?.cards);
      this.loading$$.next(false);
    });
  }

  private getRoadmapByLastUsedFromLocalStorage(): void {
    this.http.get<Roadmap>(`/api/roadmaps/${localStorage.getItem('lastVisitedMapId')}`).subscribe((roadmap) => {
      this.handleMapResponse(roadmap);
      this.loading$$.next(false);
    });
  }

  public getAllPresets(): Roadmap[] {
    return this.availableRoadmaps$$.value.slice();
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

  private handleMapResponse(roadmap: Roadmap) {
    this.setCardDataTreeFromRoadmap(roadmap);
    this.setPresetInfoFromRoadmap(roadmap);
    this.generateNodesFromRoadmap(roadmap);
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
      const newNodes = this.appendEndingNode(nodes);
      this.setNodes(newNodes);
    } else {
      this.setNodes({});
    }
  }

  private appendEndingNode(nodes: Nodes): Nodes {
    const newNodes = Object.assign({}, nodes);
    newNodes['last-node'] = {
      mainKnot: true,
      children: [],
    };
    return newNodes;
  }

  private handleCategoriesUpdates(): void {
    this.settingsService.categories$.subscribe((categories) => {
      this.patchCardDataOnCategoriesChange(categories);
    });
  }

  private patchCardDataOnCategoriesChange(categories: Categories): void {
    const tempTree = this.cardDataTree$$.value;
    Object.keys(tempTree).forEach((key) => {
      if (categories.findIndex((c) => c.categoryId === tempTree[key].categoryId) < 0) {
        tempTree[key].categoryId = '';
      }
    });
    this.cardDataTree$$.next(tempTree);
  }

  public setCardDataForId(id: NodeId, data: CardData): void {
    const newTree = { ...this.cardDataTree$$.value };
    newTree[id] = {
      ...newTree[id],
      ...data,
    };
    this.cardDataTree$$.next(newTree);
    // Save here (check for changes before)
  }

  // Communicates to svg-path component to draw new svg
  public setCardCoordinateCollection(collection: CardCoordinateCollection): void {
    this.cardCoordinateCollection$$.next(collection);
  }

  public getNodes(): Nodes {
    return this.nodes$$.value;
  }

  public setNodes(nodes: Nodes): void {
    this.nodes$$.next(nodes);
  }

  public addNode(id: NodeId): void {
    const tempNodeTree = { ...this.nodes$$.value };
    const tempCardDataTree = { ...this.cardDataTree$$.value };

    const newNodeId = uuidv4();
    tempNodeTree[newNodeId] = {
      children: [],
      mainKnot: false,
    };
    tempNodeTree[id].children.push(newNodeId);
    tempCardDataTree[newNodeId] = {
      title: 'Edit Me!',
    };
    this.nodes$$.next(tempNodeTree);
    this.cardDataTree$$.next(tempCardDataTree);
  }

  public deleteNode(id: NodeId): void {
    const tempNodesTree = { ...this.nodes$$.value };
    const tempCardDataTree = { ...this.cardDataTree$$.value };

    for (const child of tempNodesTree[id]?.children || []) {
      for (const subChild of tempNodesTree[child]?.children || []) {
        delete tempNodesTree[subChild];
        delete tempCardDataTree[subChild];
      }
      delete tempNodesTree[child];
      delete tempCardDataTree[child];
    }
    delete tempNodesTree[id];
    delete tempCardDataTree[id];

    for (const node of Object.keys(tempNodesTree)) {
      if (tempNodesTree[node].children.includes(id)) {
        const index = tempNodesTree[node].children.indexOf(id);
        tempNodesTree[node].children.splice(index, 1);
      }
    }

    // If last center node was deleted create fresh center node
    if (Object.keys(tempNodesTree).length === 1 && tempNodesTree['last-node'] !== undefined) {
      delete tempNodesTree['last-node'];
      tempNodesTree[uuidv4()] = {
        mainKnot: true,
        children: [],
      };
      const newNodes = this.appendEndingNode(tempNodesTree);
      this.setNodes(newNodes);
      this.cardDataTree$$.next({});
    } else {
      this.cardDataTree$$.next(tempCardDataTree);
      this.nodes$$.next(tempNodesTree);
    }
  }

  public getCardDataForNode(node: NodeId): CardData {
    return this.cardDataTree$$.value[node];
  }

  public addCenterNodeAfterNodeId(nodeId: NodeId): void {
    const currentNodes = this.nodes$$.value;
    const newCenterId = uuidv4();
    const keys = Object.keys(currentNodes);
    const newNodes = {} as Nodes;
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === nodeId) {
        newNodes[keys[i]] = currentNodes[keys[i]];
        newNodes[newCenterId] = {
          children: [],
          mainKnot: true,
        };
      } else {
        newNodes[keys[i]] = currentNodes[keys[i]];
      }
    }
    this.nodes$$.next(newNodes);
  }
}
