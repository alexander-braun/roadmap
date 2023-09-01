import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
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
  public loading$ = new Subject<void>();
  public readonly faTimes = faTimes;
  public availableRoadmaps$: Observable<Readonly<Roadmap[]>>;
  public newTemplateForm = this.fb.nonNullable.group({
    presetTitle: ['', Validators.required],
    presetSubtitle: [''],
  });

  constructor(private modalService: ModalService, private mapService: MapService, private fb: FormBuilder) {
    this.availableRoadmaps$ = this.mapService.availableRoadmaps$;
  }

  ngOnInit(): void {}

  public close(): void {
    this.modalService.close();
  }
}
