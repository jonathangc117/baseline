import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomMenuComponent } from './components/bottom-menu/bottom-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    BottomMenuComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'baseline';
}
