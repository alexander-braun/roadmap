import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NodeId } from 'apps/roadmap/src/assets/data';

export interface CardForm {
  title: string;
  date: Date;
  notes: string[];
  category: string;
  status: 'pending' | 'in-progress' | 'done' | 'ignore';
}

@Component({
  selector: 'rdmp-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() child!: NodeId;
  @Input() position!: 'subchild-left' | 'left' | 'center' | 'right' | 'subchild-right';
}

/* 
Categories:
  User should be able to add a category
  User should be able to add a custom icon for category
  User should be able to delete a category
  User should be able to pick a background color for a category
  User should be able to pick an icon color for a category
  Categories should be shown on each card with correct colors etc.
*/
