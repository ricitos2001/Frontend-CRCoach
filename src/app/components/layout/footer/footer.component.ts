import { Component, HostBinding } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: '../../../../styles/styles.css',
  standalone: true,
})
export class FooterComponent {
  constructor(protected router: Router) {}

  openDiscord($event: MouseEvent) {
    $event.preventDefault();
    window.open('https://discord.gg/y3uXnHjBK6', '_blank');
  }

  openIstagram($event: MouseEvent) {
    $event.preventDefault();
    window.open('https://www.instagram.com/ricitos2001/?hl=es%2F', '_blank');
  }

  openTwitter($event: MouseEvent) {
    $event.preventDefault();
    window.open('https://x.com/ricitos2001', '_blank');
  }

  openGithub($event: MouseEvent) {
    $event.preventDefault();
    window.open('https://github.com/ricitos2001', '_blank');
  }

  openLinkedin($event: MouseEvent) {
    $event.preventDefault();
    window.open('https://www.linkedin.com/in/cesar-gabriel-ucha-sousa-78386339a/', '_blank');
  }

  openKofi($event: MouseEvent) {
    $event.preventDefault();
    window.open('https://ko-fi.com/ricitos2001/tip', '_blank');
  }
}
