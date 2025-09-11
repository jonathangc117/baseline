import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { SupabaseService } from '../../../services/supabase.service';
import { PlayerStatsSectionComponent } from '../../../components/player-stats-section/player-stats-section.component';
import { PersonalDetailsComponent } from './personal-details/personal-details.component';


@Component({
  selector: 'app-player',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    AvatarModule,
    TagModule,
    ButtonModule,
    MessageModule,
    TabViewModule,
    PlayerStatsSectionComponent,
    PersonalDetailsComponent
  ],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  loading = false;
  player: any;
  error: string | null = null;
  user: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'No player id provided';
      return;
    }
    this.loading = true;
    try {
      const { data, error } = await this.supabaseService.getPlayerById(id);
      if (error) {
        this.error = error.message || 'Failed to load player';
      } else {
        this.player = data;
        this.user = await this.supabaseService.getCurrentUser();
      }
    } finally {
      this.loading = false;
    }
  }

  challengePlayer() {
    this.router.navigate(['/my-matches/add']);
  }
}


