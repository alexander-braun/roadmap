import { Component, OnInit } from '@angular/core';
import { MapService } from '../map.service';
import { Observable, Subject, combineLatest, startWith, tap } from 'rxjs';

@Component({
  selector: 'rdmp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public presetName?: string;
  public presetSubline?: string;
  public loading$?: Observable<boolean>;

  constructor(private mapService: MapService) {}

  ngOnInit(): void {
    this.loading$ = this.mapService.loading$.asObservable().pipe(
      startWith(true),
      tap((val) => console.log(val))
    );
    combineLatest([
      this.mapService.presetName$.asObservable(),
      this.mapService.presetSubline$.asObservable(),
    ]).subscribe({
      next: ([presetName, presetSubline]) => {
        this.presetName = presetName;
        this.presetSubline = presetSubline;
      },
    });
  }
}
