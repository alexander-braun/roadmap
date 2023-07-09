import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { NodeId } from 'apps/roadmap/src/assets/data';
import { CardData } from '../map.model';
import { MapService } from '../map.service';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { faTrashAlt, faPlus, faDeleteLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ResizeObserverService } from 'apps/roadmap/src/shared/services/resize-observer.service';
import { SettingsService } from '../settings/settings.service';
import { BehaviorSubject } from 'rxjs';
import { Categories, Category } from '../settings/settings.model';
import { iconsMap } from '../settings/icons-preset.data';

@Component({
  selector: 'rdmp-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements OnInit {
  @Input() nodeId!: NodeId;
  @Input() position!: 'subchild-left' | 'left' | 'center' | 'right' | 'subchild-right';
  public readonly iconsMap = iconsMap;
  public readonly faTrashAlt = faTrashAlt;
  public readonly faPlus = faPlus;
  public readonly faTrash = faTrash;
  public categoriesSettings$$ = new BehaviorSubject({} as Categories);
  public currentCategory$$ = new BehaviorSubject({} as Category);
  public isHover = false;
  public hoverDelays: string[] = [];

  public cardForm = this.fb.group({
    title: this.fb.control<string>('Edit me!', Validators.required),
    ...(this.position !== 'center' && {
      date: this.fb.nonNullable.control<string | undefined>(undefined),
      notes: this.fb.nonNullable.array<FormControl<string>>([]),
      categoryId: this.fb.nonNullable.control<string | undefined>(undefined),
      status: this.fb.nonNullable.control<string | undefined>(undefined),
    }),
  });

  constructor(
    private mapService: MapService,
    private fb: FormBuilder,
    private resizeObserverService: ResizeObserverService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.patchForm();
    this.resizeFormOnValueChange();
    this.settingsService.categories$.subscribe((categories) => {
      this.categoriesSettings$$.next(categories);
      this.currentCategory$$.next(this.findCurrentCategory() || ({} as Category));
      this.setAnimationDelay(categories);
    });
    this.mapService.cardDataTree$.subscribe(() => {
      this.patchForm();
    });
  }

  public addNode(): void {
    this.mapService.addNode(this.nodeId);
  }

  public deleteNode(): void {
    this.mapService.deleteNode(this.nodeId);
  }

  private setAnimationDelay(categories: Categories): void {
    for (let i = categories.length; i >= 0; i--) {
      this.hoverDelays.push(`0.${i}s`);
    }
  }

  public handleMouseEnter(): void {
    this.isHover = true;
  }

  public setCategory(i: number): void {
    this.cardForm.patchValue({
      categoryId: this.categoriesSettings$$.value[i].categoryId,
    });
    this.currentCategory$$.next(this.findCurrentCategory() || ({} as Category));
  }

  public handleMouseLeave(): void {
    this.isHover = false;
  }

  private findCurrentCategory(): Category | undefined {
    return this.categoriesSettings$$.value.find(
      (category) => category.categoryId === this.cardForm.controls.categoryId?.value
    );
  }

  private resizeFormOnValueChange(): void {
    this.cardForm.valueChanges.subscribe(() => {
      this.resize();
    });
  }

  private resize(): void {
    this.resizeObserverService.setResizeNext();
  }

  private patchForm(): void {
    const cardData = this.getCardDataFromTree() || {};
    this.cardForm.patchValue({
      ...cardData,
      date: cardData.date ? cardData.date : this.createDateNow(),
    });
    this.patchNotesFormArray(cardData);
  }

  createDateNow(): string {
    const date = new Date(Date.now());
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  }

  private patchNotesFormArray(cardData: CardData): void {
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
    this.resize();
  }

  public removeNote(i: number): void {
    this.notes?.controls.splice(i, 1);
    this.resize();
  }
}
