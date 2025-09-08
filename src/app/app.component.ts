import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { BottomMenuComponent } from './components/bottom-menu/bottom-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    BottomMenuComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'baseline';
  showMenu = true;

  constructor(private router: Router) {
    this.updateMenuVisibility(this.router.url);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateMenuVisibility(event.urlAfterRedirects);
      }
    });
  }

  private updateMenuVisibility(url: string) {
    this.showMenu = !url.startsWith('/login');
  }
}
