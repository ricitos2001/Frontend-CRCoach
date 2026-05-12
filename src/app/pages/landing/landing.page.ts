import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy, signal, ViewChild, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';

@Component({
  selector: 'app-landing',
  imports: [TranslatePipe, CommonButtonComponent, RouterLink],
  templateUrl: './landing.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class LandingPage implements OnInit, AfterViewInit, OnDestroy {
  protected readonly title = signal('Coach Royale');
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private _routerSub?: Subscription;
  private _safeTimer: ReturnType<typeof setTimeout> | null = null;

  @ViewChild('grid', { static: false }) grid!: ElementRef<HTMLElement>;

  private _track?: HTMLElement;
  private _tween?: any;

  ngOnInit(): void {
  }

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.preserveInitialState();
    requestAnimationFrame(() => this.setupRibbon());
    requestAnimationFrame(() => this.setupAnimations());

    this._routerSub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd && ev.urlAfterRedirects.includes('/landing')) {
        requestAnimationFrame(() => this.setupRibbon());
        requestAnimationFrame(() => this.setupAnimations());
      }
    });
  }

  ngOnDestroy(): void {
    if (this._safeTimer) {
      clearTimeout(this._safeTimer);
      this._safeTimer = null;
    }
    if (this._tween) {
      this._tween.kill();
      this._tween = undefined;
    }
    if (this._track) {
      const track = this._track;
      import('gsap').then(({ gsap }) => gsap.killTweensOf(track));
      this._track = undefined;
    }
    if (this._routerSub) {
      this._routerSub.unsubscribe();
      this._routerSub = undefined;
    }

    import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    });

    const host = this.elementRef.nativeElement;
    (host.querySelectorAll('[style*="will-change"]') as NodeListOf<HTMLElement>).forEach((el) => {
      el.style.willChange = '';
    });
  }

  private async setupRibbon(): Promise<void> {
    const root = this.grid?.nativeElement;
    if (!root) return;

    const { gsap } = await import('gsap');

    const existing = root.querySelector<HTMLElement>('[data-ribbon-track]');
    if (existing) {
      gsap.killTweensOf(existing);
      const totalWidth = existing.scrollWidth / 2;
      this._tween = gsap.to(existing, {
        x: -totalWidth,
        duration: 25,
        ease: 'none',
        repeat: -1,
      });
      this._track = existing;
      return;
    }

    const track = document.createElement('div');
    track.setAttribute('data-ribbon-track', 'true');

    while (root.firstChild) {
      track.appendChild(root.firstChild);
    }

    track.innerHTML += track.innerHTML;

    track.style.display = 'grid';
    track.style.gridAutoFlow = 'column';
    track.style.gridAutoColumns = 'max-content';
    track.style.gap = '1.6rem';
    track.style.width = 'max-content';
    track.style.willChange = 'transform';

    root.appendChild(track);

    const totalWidth = track.scrollWidth / 2;

    this._tween = gsap.to(track, {
      x: -totalWidth,
      duration: 25,
      ease: 'none',
      repeat: -1,
    });

    this._track = track;
  }

  private preserveInitialState(): void {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const host = this.elementRef.nativeElement;

    const setInit = (el: HTMLElement) => {
      if (reduced) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px)';
    };

    (host.querySelectorAll('.landing__hero') as NodeListOf<HTMLElement>).forEach((hero) => {
      if (hero.querySelector('.landing__grid-container-x2, .landing__grid-container-x3')) return;
      setInit(hero);
    });

    (host.querySelectorAll('.landing__grid-container-x2 > section, .landing__grid-container-x3 > article') as NodeListOf<HTMLElement>).forEach(setInit);
  }

  private async setupAnimations(): Promise<void> {
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const host = this.elementRef.nativeElement;

    if (reduced) {
      gsap.set(
        host.querySelectorAll('.landing__hero, .landing__grid-container-x2 > section, .landing__grid-container-x3 > article'),
        { opacity: 1, y: 0, clearProps: 'opacity,transform' }
      );
      return;
    }

    const setWillChange = (els: Element[] | NodeListOf<Element> | HTMLCollection, val: string) => {
      Array.from(els).forEach((el) => (el as HTMLElement).style.willChange = val);
    };

    const animateFadeUp = (
      targets: Element[] | NodeListOf<Element> | HTMLCollection,
      trigger: Element,
      stagger = 0,
    ) => {
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: stagger ? 0.6 : 0.8,
        ease: 'power2.out',
        stagger: stagger || undefined,
        scrollTrigger: {
          trigger,
          start: 'top 85%',
          toggleActions: 'play reverse play reverse',
          onEnter: () => setWillChange(targets, 'opacity, transform'),
          onLeave: () => setWillChange(targets, ''),
          onEnterBack: () => setWillChange(targets, 'opacity, transform'),
          onLeaveBack: () => setWillChange(targets, ''),
        },
      });
    };

    // Hero sections without nested grids -> block fade-up
    (host.querySelectorAll('.landing__hero') as NodeListOf<HTMLElement>).forEach((hero) => {
      if (hero.querySelector('.landing__grid-container-x2, .landing__grid-container-x3')) return;
      animateFadeUp([hero], hero);
    });

    // x2 grids -> cascade daughters
    (host.querySelectorAll('.landing__grid-container-x2') as NodeListOf<HTMLElement>).forEach((container) => {
      animateFadeUp(container.children, container, 0.15);
    });

    // x3 grids -> cascade daughters
    (host.querySelectorAll('.landing__grid-container-x3') as NodeListOf<HTMLElement>).forEach((container) => {
      animateFadeUp(container.children, container, 0.15);
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    if (!this._safeTimer) {
      this._safeTimer = setTimeout(() => {
        (host.querySelectorAll('.landing__hero, .landing__grid-container-x2 > section, .landing__grid-container-x3 > article') as NodeListOf<HTMLElement>).forEach((el) => {
          if (getComputedStyle(el).opacity === '0') {
            gsap.set(el, { opacity: 1, y: 0, clearProps: 'opacity,transform' });
          }
        });
        this._safeTimer = null;
      }, 3000);
    }
  }
}
