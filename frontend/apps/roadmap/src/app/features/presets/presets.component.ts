import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { EMPTY, Observable, Subject, catchError, of, take } from 'rxjs';
import { ModalService } from '../../shared/services/modal.service';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { MapService } from '../map/map.service';
import { Roadmap } from '../map/map.model';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'rdmp-presets',
  templateUrl: './presets.component.html',
  styleUrls: ['./presets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresetsComponent implements OnInit {
  public loading$ = new Subject<boolean>();
  public readonly faTimes = faTimes;
  public availableRoadmaps$!: Observable<Readonly<Roadmap[]>>;
  public newTemplateForm = this.fb.nonNullable.group({
    presetTitle: ['', Validators.required],
    presetSubtitle: [''],
  });

  constructor(private modalService: ModalService, private mapService: MapService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.availableRoadmaps$ = this.mapService.availableRoadmaps$;
  }

  public close(): void {
    this.modalService.close();
  }

  public setMap(roadmap: Roadmap): void {
    this.mapService.handleMapResponse(roadmap);
    this.close();
  }

  public deleteMap(id: string): void {
    this.loading$.next(true);
    this.mapService
      .deleteRoadmapById(id)
      .pipe(take(1))
      .subscribe(() => this.loading$.next(false));
  }

  public createNewDefaultMap() {
    this.loading$.next(true);
    this.mapService
      .generateNewDefaultMap(
        this.newTemplateForm.controls.presetTitle.value,
        this.newTemplateForm.controls.presetSubtitle.value
      )
      .pipe(
        catchError((err) => {
          if (err.error.error.indexOf('duplicate key error') > -1) {
            this.newTemplateForm.controls.presetTitle.setErrors({ duplicateTitle: true });
          }
          this.loading$.next(false);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.newTemplateForm.reset();
        this.loading$.next(false);
      });
  }
}
