import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MapService } from './map/map.service';
import { Observable } from 'rxjs';
import { CardPropertyCollection } from './map/map.model';

@Component({
  selector: 'rdmp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public cardPropertyCollection$: Observable<CardPropertyCollection> = this.mapService.cardPropertyCollection$;

  constructor(private mapService: MapService, private cr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.handleChangesOnCardPropertyCollectionUpdate();
  }

  private handleChangesOnCardPropertyCollectionUpdate(): void {
    this.cardPropertyCollection$.subscribe(() => {
      this.cr.detectChanges();
    });
  }
}
