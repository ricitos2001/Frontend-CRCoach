import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy, signal, ViewChild } from '@angular/core';
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
  protected readonly title = signal('Frontend-CRCoach');
  private _routerSub?: Subscription;

  @ViewChild('grid', { static: false }) grid!: ElementRef<HTMLElement>;

  private _track?: HTMLElement;
  private _tween?: any;

  ngOnInit(): void {
  }

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    requestAnimationFrame(() => this.setupRibbon());

    this._routerSub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd && ev.urlAfterRedirects.includes('/landing')) {
        requestAnimationFrame(() => this.setupRibbon());
      }
    });
  }

  ngOnDestroy(): void {
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
}
