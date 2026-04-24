import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
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
export class LandingPage implements OnInit {
  protected readonly title = signal('Frontend-CRCoach');

  @ViewChild('grid', { static: false }) grid!: ElementRef<HTMLElement>;

  ngOnInit(): void {
    requestAnimationFrame(() => {
      const root = this.grid?.nativeElement;
      if (!root) return;

      // 🔥 Creamos un wrapper interno SIN modificar HTML original
      const track = document.createElement('div');

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

      gsap.to(track, {
        x: -totalWidth,
        duration: 25,
        ease: 'none',
        repeat: -1,
      });
    });
  }
}
