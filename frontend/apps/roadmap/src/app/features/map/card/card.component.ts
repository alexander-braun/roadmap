import { ChangeDetectionStrategy, Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CardData, Status } from '../map.model';
import { MapService } from '../map.service';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { faTrashAlt, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Subject, debounceTime, skip, take, takeUntil } from 'rxjs';
import { Categories, Category } from '../settings/settings.model';
import { iconsMap } from '../settings/icons-preset.data';
import { NodeId } from 'apps/roadmap/src/assets/data';
import { ResizeObserverService } from '../../../shared/services/resize-observer.service';

@Component({
  selector: 'rdmp-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements OnInit, OnDestroy {
  @Input() nodeId!: NodeId;
  @Input() position!: 'subchild-left' | 'left' | 'center' | 'right' | 'subchild-right';
  public readonly iconsMap = iconsMap;
  public readonly faTrashAlt = faTrashAlt;
  public readonly faPlus = faPlus;
  public readonly faTrash = faTrash;
  public categories$ = this.mapService.categories$;
  public currentCategory$$ = new BehaviorSubject({} as Category);
  public isHover = false;
  public hoverDelays: string[] = [];
  public statusChoices$ = this.mapService.statusChoices$;
  private destroy$ = new Subject<void>();

  public cardForm = this.fb.group({
    title: this.fb.nonNullable.control<string>('Edit me!', Validators.required),
    ...(this.position !== 'center' && {
      date: this.fb.nonNullable.control<string>(''),
      notes: this.fb.nonNullable.array<FormControl<string>>([]),
      categoryId: this.fb.nonNullable.control<string>(''),
      status: this.fb.nonNullable.control<Status>('pending'),
    }),
  });

  constructor(
    private mapService: MapService,
    private fb: FormBuilder,
    private resizeObserverService: ResizeObserverService
  ) {}

  ngOnInit(): void {
    this.patchForm();
    this.resizeFormOnValueChange();
    this.mapService.categories$.pipe(takeUntil(this.destroy$)).subscribe((categories) => {
      this.currentCategory$$.next(this.findCurrentCategory() || ({} as Category));
      this.setAnimationDelay(categories);
    });
    this.mapService.cardDataTree$.pipe(take(1)).subscribe(() => {
      this.patchForm();
    });
    this.cardForm.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(2000)).subscribe(() => {
      this.save();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save() {
    this.mapService.setCardDataForId(this.nodeId, this.cardForm.value);
  }

  public pickStatus(status: Status): void {
    this.cardForm.patchValue({
      status,
    });
  }

  public getStatusColor(statusName?: string): string {
    return this.mapService.statusChoices.find((choice) => choice.statusName === statusName)?.statusColor || '';
  }

  public addNode(): void {
    this.mapService.addNode(this.nodeId);
  }

  public deleteNode(): void {
    this.mapService.deleteNode(this.nodeId);
    this.resize();
  }

  private setAnimationDelay(categories: Categories): void {
    this.hoverDelays = [];
    for (let i = categories.length; i >= 0; i--) {
      if (i < 10) {
        this.hoverDelays.push(`0.${i}s`);
      } else {
        this.hoverDelays.push(i.toString().split('').join('.') + 's');
      }
    }
  }

  public handleMouseEnter(): void {
    this.isHover = true;
  }

  public setCategory(i: number): void {
    this.cardForm.patchValue({
      categoryId: this.mapService.categories[i].categoryId,
    });
    this.currentCategory$$.next(this.findCurrentCategory() || ({} as Category));
  }

  public handleMouseLeave(): void {
    this.isHover = false;
  }

  private findCurrentCategory(): Category | undefined {
    return this.mapService.categories.find(
      (category) => category.categoryId === this.cardForm.controls.categoryId?.value
    );
  }

  private resizeFormOnValueChange(): void {
    this.cardForm.valueChanges.pipe(skip(1), takeUntil(this.destroy$)).subscribe(() => {
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
    return this.mapService.getCardDataTreeValue()[this.nodeId];
  }

  get notes(): FormArray<FormControl<string>> | undefined {
    return this.cardForm.controls.notes;
  }

  public addNote(): void {
    this.notes?.push(this.fb.nonNullable.control<string>(''));
  }

  public removeNote(i: number): void {
    this.notes?.removeAt(i);
  }
}
