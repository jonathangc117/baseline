import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { SupabaseService } from '../../services/supabase.service';
import { CreateChallengeComponent } from '../../components/create-challenge/create-challenge.component';

@Component({
  selector: 'app-my-challenges',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableModule, TagModule, MessageModule, CreateChallengeComponent],
  templateUrl: './my-challenges.component.html',
  styleUrls: ['./my-challenges.component.scss']
})
export class MyChallengesComponent implements OnInit {
  challenges: any[] = [];
  loading = false;
  error: string | null = null;
  user: any;
  currentPlayerId: string | null = null;
  showCreateChallengeModal = false;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadChallenges();
  }

  async loadChallenges() {
    this.loading = true;
    this.error = null;
    try {
      const { data } = await this.supabaseService.getCurrentUser();
      this.user = data?.user;
      if (this.user?.id) {
        const { data: player } = await this.supabaseService.getPlayerByUserId(this.user.id);
        if (player?.id) {
          this.currentPlayerId = player.id;
          const { data: challenges, error } = await this.supabaseService.getChallenges(player.id);
          if (error) {
            this.error = 'Failed to load challenges';
            console.error('Error loading challenges:', error);
          } else {
            this.challenges = challenges || [];
          }
        } else {
          this.error = 'Player profile not found';
        }
      } else {
        this.error = 'User not found';
      }
    } catch (err) {
      this.error = 'An unexpected error occurred';
      console.error('Unexpected error:', err);
    } finally {
      this.loading = false;
    }
  }

  acceptChallenge(challengeId: string) {
    // TODO: Implement accept challenge logic
    console.log('Accepting challenge:', challengeId);
  }

  declineChallenge(challengeId: string) {
    // TODO: Implement decline challenge logic
    console.log('Declining challenge:', challengeId);
  }

  getStatusSeverity(challenge: any): "success" | "info" | "warn" | "secondary" | "contrast" | "danger" | undefined {
    switch (challenge.status?.toLowerCase()) {
      case 'pending':
        return 'warn';
      case 'accepted':
        return 'success';
      case 'declined':
        return 'danger';
      case 'completed':
        return 'info';
      default:
        return 'secondary';
    }
  }

  getStatusDisplay(challenge: any): string {
    switch (challenge.status?.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  }

  getChallengerName(challenge: any): string {
    if (!this.currentPlayerId) return 'Unknown Player';
    
    // Determine which player is the challenger (the one who is not the current user)
    if (challenge.player1_id === this.currentPlayerId) {
      // Current user is player1, so player2 is the challenger
      return challenge.player2_player?.name || challenge.player2_player?.email || 'Unknown Player';
    } else if (challenge.player2_id === this.currentPlayerId) {
      // Current user is player2, so player1 is the challenger
      return challenge.player1_player?.name || challenge.player1_player?.email || 'Unknown Player';
    }
    
    return 'Unknown Player';
  }

  createChallenge() {
    this.showCreateChallengeModal = true;
  }

  onChallengeCreated(challenge: any) {
    // Reload challenges to show the new one
    this.loadChallenges();
  }
}
