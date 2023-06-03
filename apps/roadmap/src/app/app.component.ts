import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MapService } from './map/map.service';
import { tap, Observable } from 'rxjs';
import { CardPropertyCollection } from './map/map.model';
import { ResizeObserverService } from '../shared/services/resize-observer.service';

@Component({
  selector: 'rdmp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public cardPropertyCollection$: Observable<CardPropertyCollection> = this.mapService.cardPropertyCollection$;
  constructor(
    private mapService: MapService,
    private cr: ChangeDetectorRef,
    private resizeObserver: ResizeObserverService
  ) {}

  ngOnInit(): void {
    this.cardPropertyCollection$.pipe(tap(() => this.cr.detectChanges())).subscribe();
  }
}
