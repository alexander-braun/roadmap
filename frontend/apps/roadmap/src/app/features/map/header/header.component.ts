import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapService } from '../map.service';
import { Observable, Subject, combineLatest, startWith, takeUntil, tap } from 'rxjs';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'rdmp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public loading$?: Observable<boolean>;
  private destroy$ = new Subject<void>();
  form = this.fb.nonNullable.group({
    title: [''],
    subtitle: [''],
  });

  constructor(private mapService: MapService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loading$ = this.mapService.loading$.pipe(startWith(true));
    this.patchForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public patchForm() {
    this.mapService.presetInfo$.subscribe({
      next: (preset) => {
        this.form.patchValue({
          title: preset.title,
          subtitle: preset.subtitle,
        });
      },
    });
  }

  public updateRoadmap(): void {
    this.mapService.setPresetInformation(this.form.controls.title.value, this.form.controls.subtitle.value);
  }
}
