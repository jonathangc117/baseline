import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-view-match',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, ButtonModule, AvatarModule, RouterModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './view-match.component.html',
  styleUrls: ['./view-match.component.scss']
})
export class ViewMatchComponent implements OnInit {
  loading = false;
  match: any;
  user: any;
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private supabaseService: SupabaseService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') as string;
    if (!id) {
      this.router.navigate(['/my-matches/singles']);
      return;
    }
    this.loading = true;
    try {
      const { data } = await this.supabaseService.getMatchById(id);
      this.user = await this.supabaseService.getCurrentUser();
      this.match = data;
    } finally {
      this.loading = false;
    }
  }

  claimPlayer(isPlayer1: boolean) {
    this.confirmationService.confirm({
      message: `Claim ${isPlayer1 ? this.match.player1_name : this.match.player2_name} as you?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        debugger
        const uid = this.user?.data?.user?.id;
        if (!uid) return;
        const { data: player } = await this.supabaseService.getPlayerByUserId(uid);
        const playerId = player?.id;
        if (!playerId || !this.match?.id) return;
        const update: any = {};
        if (isPlayer1) {
          update.player1 = playerId;
        } else {
          update.player2 = playerId;
        }
        await this.supabaseService.updateRecord('singles_match', this.match.id, update);
        // Refresh
        const { data } = await this.supabaseService.getMatchById(this.match.id);
        this.match = data;
      }
    });
  }
}


