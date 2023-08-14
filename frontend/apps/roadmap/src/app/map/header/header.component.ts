import { Component } from '@angular/core';
import { MapService } from '../map.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'rdmp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public presetName$?: Subject<string>;
  public presetSubline$?: Subject<string>;

  constructor(private mapService: MapService) {
    this.presetName$ = this.mapService.presetName$;
    this.presetSubline$ = this.mapService.presetSubline$;
  }
}
