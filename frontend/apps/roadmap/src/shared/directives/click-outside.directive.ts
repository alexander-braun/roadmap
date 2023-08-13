import { Directive, OnInit, OnDestroy, EventEmitter, Output, ElementRef } from '@angular/core';
import { Subject, fromEvent, takeUntil } from 'rxjs';

@Directive({
  selector: '[clickOutside]',
})
export class ClickOutsideDirective implements OnInit, OnDestroy {
  @Output() clickOutside = new EventEmitter<void>();
  private destroy$ = new Subject<void>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    fromEvent<MouseEvent>(document, 'mouseup')
      .pipe(takeUntil(this.destroy$))
      .subscribe((e) => {
        const clickedInside = this.elementRef.nativeElement.contains(e.target);
        if (!clickedInside) {
          this.clickOutside.emit();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
