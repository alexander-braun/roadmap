import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { NodeId } from 'apps/roadmap/src/assets/data';
import { CardData } from '../map.model';
import { MapService } from '../map.service';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'rdmp-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements OnInit {
  @Input() nodeId!: NodeId;
  @Input() position!: 'subchild-left' | 'left' | 'center' | 'right' | 'subchild-right';
  faTrashAlt = faTrashAlt;
  public cardForm = this.fb.group({
    ...(this.position !== 'center' && {
      title: this.fb.control<string>('Edit me!', Validators.required),
      date: this.fb.control<string | undefined>(undefined),
      notes: this.fb.array<FormControl<string>>([this.fb.nonNullable.control<string>('')]),
      category: this.fb.control<string | undefined>(undefined),
      status: this.fb.control<string | undefined>(undefined),
    }),
  });

  constructor(private mapService: MapService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.patchForm();
  }

  private patchForm(): void {
    const cardData = this.getCardDataFromTree() || {};
    this.cardForm.patchValue({
      ...cardData,
    });
    if (cardData.notes) {
      cardData.notes.forEach((note, i) => {
        if (!this.notes?.controls[i]) {
          const control = this.fb.nonNullable.control<string>(note);
          this.notes?.push(control);
        } else {
          this.notes.controls[i].patchValue(note);
        }
      });
    }
  }

  private getCardDataFromTree(): CardData {
    return this.mapService.getCardDataForNode(this.nodeId);
  }

  get notes(): FormArray<FormControl<string>> | undefined {
    return this.cardForm.controls.notes;
  }

  public addNote(): void {
    this.notes?.push(this.fb.nonNullable.control<string>(''));
  }

  public removeNote(i: number): void {
    this.notes?.controls.splice(i, 1);
  }
}

/* 
Categories:
  User should be able to add a category
  User should be able to add a custom icon for category
  User should be able to delete a category
  User should be able to pick a background color for a category
  User should be able to pick an icon color for a category
  Categories should be shown on each card with correct colors etc.
  Date, Comment, Status, Categories, Comments should be optional - can
  be set on the card directly (settings button on bottom) 
  or in a general settings menue
*/
