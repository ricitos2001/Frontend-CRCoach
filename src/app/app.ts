import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MainComponent } from './components/layout/main/main.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { filter } from 'rxjs';
import { ToastComponent } from './components/shared/toast/toast.component';
import { LanguageService } from './services/language/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, MainComponent, FooterComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})
export class App implements OnInit {
  private languageService = inject(LanguageService);

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd));
    this.languageService.init();
  }
}
