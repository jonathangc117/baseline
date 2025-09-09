import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';

interface Player {
  id: string;
  name: string;
  email: string;
  skill_level: string;
  wins: number;
  losses: number;
  avatar_url?: string;
  created_at: string;
}

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, AvatarModule, TagModule],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss'
})
export class PlayersComponent implements OnInit {
  players: Player[] = [];
  loading = true;
  error: string | null = null;

  onPlayerClick(id: string) {
    this.router.navigate(['/players', id]);
  }

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    // Only load players if running in browser (not during SSR)
    if (isPlatformBrowser(this.platformId)) {
      await this.loadPlayers();
    } else {
      this.loading = false;
    }
  }

  async loadPlayers() {
    try {
      this.loading = true;
      const { data, error } = await this.supabaseService.getPlayers();
      
      if (error) {
        this.error = 'Failed to load players';
        console.error('Error loading players:', error);
      } else {
        this.players = data || [];
      }
    } catch (err) {
      this.error = 'An unexpected error occurred';
      console.error('Unexpected error:', err);
    } finally {
      this.loading = false;
    }
  }

  // getSkillLevelColor(skillLevel: string): string {
  //   switch (skillLevel?.toLowerCase()) {
  //     case 'beginner':
  //       return 'success';
  //     case 'intermediate':
  //       return 'warning';
  //     case 'advanced':
  //       return 'danger';
  //     case 'professional':
  //       return 'info';
  //     default:
  //       return 'secondary';
  //   }
  // }

  // getWinRate(wins: number, losses: number): number {
  //   const total = wins + losses;
  //   return total > 0 ? Math.round((wins / total) * 100) : 0;
  // }
}
