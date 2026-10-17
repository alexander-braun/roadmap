import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input } from '@angular/core';
import { faListUl } from '@fortawesome/free-solid-svg-icons';
import { ChangeDetectorRef, OnChanges, OnDestroy } from '@angular/core';

export interface RoadmapNavigationItem {
  id: string;
  title: string;
}

@Component({
  selector: 'rdmp-roadmap-navigator',
  templateUrl: './roadmap-navigator.component.html',
  styleUrls: ['./roadmap-navigator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoadmapNavigatorComponent implements OnChanges, OnDestroy {
  private readonly activationRatio = 0.65;
  @Input() navigationItems: RoadmapNavigationItem[] = [];
  readonly faListUl = faListUl;
  isOpen = false;
  activeId: string | null = null;
  private scrollFrame: number | null = null;
  desktopHidden = true;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  @HostListener('document:pointerdown', ['$event'])
  onOutsideClick(event: PointerEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    this.scheduleActiveSectionUpdate();
  }

  constructor(private elementRef: ElementRef<HTMLElement>, private cdr: ChangeDetectorRef) {}

  ngOnChanges(): void {
    this.scheduleActiveSectionUpdate();
  }

  ngOnDestroy(): void {
    if (this.scrollFrame !== null) {
      cancelAnimationFrame(this.scrollFrame);
    }
  }

  get isDesktop(): boolean {
    return window.matchMedia('(min-width: 1600px)').matches;
  }

  get isNavigatorOpen(): boolean {
    return this.isDesktop ? !this.desktopHidden : this.isOpen;
  }

  hideDesktop(): void {
    this.desktopHidden = true;
    this.isOpen = false;
  }

  toggle(): void {
    if (this.isDesktop) {
      this.desktopHidden = false;
    } else {
      this.isOpen = !this.isOpen;
    }
  }

  navigateTo(id: string): void {
    const element = document.getElementById(id);

    if (!element) {
      return;
    }

    // Land comfortably above the scroll-spy threshold
    const landingLine = window.innerHeight * 0.45;

    const targetY = window.scrollY + element.getBoundingClientRect().top - landingLine;

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: 'smooth',
    });

    this.activeId = id;
    this.cdr.markForCheck();
    this.close();
  }

  onFocusOut(event: FocusEvent): void {
    if (!this.elementRef.nativeElement.contains(event.relatedTarget as Node)) {
      this.close();
    }
  }

  trackById(_: number, item: RoadmapNavigationItem): string {
    return item.id;
  }

  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
  }

  private scheduleActiveSectionUpdate(): void {
    if (this.scrollFrame !== null) {
      return;
    }

    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = null;
      this.updateActiveSection();
    });
  }


private updateActiveSection(): void {
  const activationLine = window.innerHeight * 0.65;

  let activeId = this.navigationItems[0]?.id ?? null;

  for (const item of this.navigationItems) {
    const element = document.getElementById(item.id);

    if (!element) {
      continue;
    }

    if (element.getBoundingClientRect().top <= activationLine) {
      activeId = item.id;
    } else {
      break;
    }
  }

  if (this.activeId !== activeId) {
    this.activeId = activeId;
    this.cdr.markForCheck();
  }
}

}
