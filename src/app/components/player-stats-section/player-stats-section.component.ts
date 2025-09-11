import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player-stats-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-stats-section.component.html',
  styleUrls: ['./player-stats-section.component.scss']
})
export class PlayerStatsSectionComponent {
  @Input() player: any;
}
