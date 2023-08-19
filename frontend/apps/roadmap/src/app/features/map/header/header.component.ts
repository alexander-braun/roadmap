import { Component, OnInit } from '@angular/core';
import { MapService } from '../map.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'rdmp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public presetName?: string;
  public presetSubline?: string;

  constructor(private mapService: MapService) {}

  ngOnInit(): void {
    combineLatest([
      this.mapService.presetName$.asObservable(),
      this.mapService.presetSubline$.asObservable(),
    ]).subscribe(([presetName, presetSubline]) => {
      this.presetName = presetName;
      this.presetSubline = presetSubline;
    });
  }
}
