import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import {
  NavigationEnd,
  NavigationStart,
  NavigationCancel,
  NavigationError,
  Router,
  RouterOutlet,
} from '@angular/router';
import { MainComponent } from './components/layout/main/main.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { Subscription } from 'rxjs';
import { ToastComponent } from './components/shared/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, MainComponent, FooterComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})
export class App implements AfterViewInit, OnDestroy {
  @ViewChild('transitionContainer', { read: ElementRef, static: true })
  private transitionContainer!: ElementRef<HTMLElement>;

  private readonly router = inject(Router);
  private readonly routerSub: Subscription;

  constructor() {
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.onNavStart();
      } else if (event instanceof NavigationEnd) {
        this.onNavEnd(event);
      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.onNavFail();
      }
    });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
  }

  private onNavStart(): void {
    const el = this.transitionContainer?.nativeElement;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.style.opacity = '0';
    el.style.willChange = 'opacity';
  }

  private async onNavEnd(event: NavigationEnd): Promise<void> {
    const el = this.transitionContainer?.nativeElement;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.opacity = '1';
      el.style.willChange = '';
      return;
    }

    if (event.id === 1) {
      el.style.opacity = '1';
      el.style.willChange = '';
      return;
    }

    const { gsap } = await import('gsap');
    gsap.to(el, {
      opacity: 1,
      duration: 0.25,
      ease: 'power2.out',
      onComplete: () => {
        el.style.willChange = '';
      },
    });
  }

  private onNavFail(): void {
    const el = this.transitionContainer?.nativeElement;
    if (!el) return;

    el.style.opacity = '1';
    el.style.willChange = '';
  }
}
