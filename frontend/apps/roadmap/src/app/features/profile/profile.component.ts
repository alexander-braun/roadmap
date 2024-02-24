import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, Subject, take } from 'rxjs';
import { ModalService } from '../../shared/services/modal.service';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { MapService } from '../map/map.service';
import { Roadmap } from '../map/map.model';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'rdmp-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  public readonly faTimes = faTimes;
  public loading$ = new Subject<void>();
  constructor(private modalService: ModalService, private mapService: MapService, private fb: FormBuilder) {}

  ngOnInit(): void {}

  public close(): void {
    this.modalService.close();
  }
}
