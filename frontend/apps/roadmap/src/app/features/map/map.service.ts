import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Subject } from 'rxjs';
import { CardData, CardDataTree, CardPropertyCollection } from './map.model';
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
  private cardPropertyCollection$$ = new BehaviorSubject<Readonly<CardPropertyCollection>>([]);
  public cardPropertyCollection$ = this.cardPropertyCollection$$.asObservable();
  private nodes$$ = new BehaviorSubject<Readonly<Nodes>>({});
  public nodes$ = this.nodes$$.asObservable();
  private cardDataTree$$ = new BehaviorSubject<Readonly<CardDataTree>>({});
  public cardDataTree$ = this.cardDataTree$$.asObservable();
  public presetName$ = new BehaviorSubject<string>('');
  public presetSubline$ = new BehaviorSubject<string>('');
  public loading$ = new Subject<boolean>();

  constructor(private settingsService: SettingsService, private http: HttpClient, private authService: AuthService) {
    this.handleCategoriesUpdates();
    this.authService.isAuthorized$.subscribe(() => {
      this.getData();
    });
  }

  public getData(): void {
    this.loading$.next(true);
    this.removeCurrentRoadmap();
    if (!this.authService.isUserAuthorized()) {
      forkJoin([
        this.http.get<[{ nodes: Nodes; defaultMap: boolean }]>('/api/default-nodes'),
        this.http.get<[{ cards: CardDataTree; defaultMap: boolean }]>('/api/default-card-data'),
      ]).subscribe(([nodesData, cardData]) => {
        this.presetName$.next('Frontend Developer');
        this.presetSubline$.next('Default Frontend Roadmap');
        const nodes = nodesData?.[0]?.nodes;
        this.appendEndingNode(nodes || {});
        this.cardDataTree$$.next(cardData?.[0]?.cards);
        this.loading$.next(false);
      });
    } else if (localStorage.getItem('lastVisitedMapId') !== null) {
      this.http.get<Roadmap>(`/api/roadmaps/${localStorage.getItem('lastVisitedMapId')}`).subscribe((roadmap) => {
        this.handleMapResponse(roadmap);
        this.loading$.next(false);
      });
    } else {
      this.http.get<Roadmap[]>('/api/roadmaps').subscribe((roadmaps) => {
        this.handleMapResponse(roadmaps[0]);
        this.loading$.next(false);
      });
    }
  }

  private removeCurrentRoadmap() {
    this.handleMapResponse({} as Roadmap);
  }

  private handleMapResponse(roadmap: Roadmap) {
    const cardDataTree: CardDataTree = {};
    const nodes: Nodes = {};
    roadmap?.map?.forEach((node) => {
      const { title, date, notes, categoryId, status } = node;
      const { mainKnot, children } = node;
      cardDataTree[node.id] = { title, date, notes, categoryId, status };
      nodes[node.id] = { mainKnot, children };
    });
    this.presetName$.next(roadmap?.title);
    this.presetSubline$.next(roadmap?.subtitle);
    this.cardDataTree$$.next(cardDataTree);
    if (Object.keys(nodes).length > 0) {
      this.appendEndingNode(nodes);
    } else {
      this.setNodes({});
    }
  }

  private appendEndingNode(nodes: Nodes): void {
    const newNodes = nodes;
    newNodes['last-node'] = {
      mainKnot: true,
      children: [],
    };
    this.setNodes(newNodes);
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
  public setCardPropertyCollection(collection: CardPropertyCollection): void {
    this.cardPropertyCollection$$.next(collection);
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
      this.appendEndingNode(tempNodesTree);
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
