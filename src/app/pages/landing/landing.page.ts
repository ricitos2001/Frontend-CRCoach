import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy, signal, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';
import { gsap } from 'gsap';

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
  private _tween?: gsap.core.Tween;

  ngOnInit(): void {
    // no-op here: animation needs DOM, handled in ngAfterViewInit
  }

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    // ensure animation runs when the view is ready; also safe to call again
    requestAnimationFrame(() => this.setupRibbon());

    // Si el componente se reutiliza por la estrategia de rutas, hacemos re-setup
    // al recibir NavigationEnd apuntando a esta ruta.
    this._routerSub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd && ev.urlAfterRedirects.includes('/landing')) {
        // small delay to ensure DOM is stable
        requestAnimationFrame(() => this.setupRibbon());
      }
    });
  }

  ngOnDestroy(): void {
    // cleanup any running tween to avoid side-effects when navigating away
    if (this._tween) {
      this._tween.kill();
      this._tween = undefined;
    }
    if (this._track) {
      gsap.killTweensOf(this._track);
      this._track = undefined;
    }
    if (this._routerSub) {
      this._routerSub.unsubscribe();
      this._routerSub = undefined;
    }
  }

  private setupRibbon(): void {
    const root = this.grid?.nativeElement;
    if (!root) return;

    // If there's already a prepared track, restart its animation.
    const existing = root.querySelector<HTMLElement>('[data-ribbon-track]');
    if (existing) {
      // kill any previous tweens and restart
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

    // 🔥 Creamos un wrapper interno SIN modificar HTML original
    const track = document.createElement('div');
    track.setAttribute('data-ribbon-track', 'true');

    // transferimos hijos al track
    while (root.firstChild) {
      track.appendChild(root.firstChild);
    }

    // duplicamos contenido para loop
    track.innerHTML += track.innerHTML;

    // estilos críticos del track
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
