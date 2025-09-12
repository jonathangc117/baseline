import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { SupabaseService } from '../../services/supabase.service';

interface Player {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-create-challenge',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    TextareaModule,
    MessageModule,
    DialogModule
  ],
  templateUrl: './create-challenge.component.html',
  styleUrls: ['./create-challenge.component.scss']
})
export class CreateChallengeComponent implements OnInit, OnDestroy {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() challengeCreated = new EventEmitter<any>();

  players: Player[] = [];
  loading = false;
  error: string | null = null;
  currentPlayerId: string | null = null;
  minDate = new Date();
  challengeForm: FormGroup;

  constructor(
    private supabaseService: SupabaseService,
    private fb: FormBuilder
  ) {
    this.challengeForm = this.fb.group({
      selectedPlayer: [null, Validators.required],
      date: [null, Validators.required],
      invitation_message: ['']
    });
  }

  async ngOnInit() {
    await this.getCurrentPlayer();
    await this.loadPlayers();
  }

  async loadPlayers() {
    try {
      const { data: players, error } = await this.supabaseService.getPlayers();
      if (error) {
        this.error = 'Failed to load players';
        console.error('Error loading players:', error);
      } else {
        // Filter out the current user from the players list
        this.players = (players || []).filter(player => player.id !== this.currentPlayerId);
      }
    } catch (err) {
      this.error = 'An unexpected error occurred while loading players';
      console.error('Unexpected error:', err);
    }
  }

  async getCurrentPlayer() {
    try {
      const { data } = await this.supabaseService.getCurrentUser();
      if (data?.user?.id) {
        const { data: player } = await this.supabaseService.getPlayerByUserId(data.user.id);
        this.currentPlayerId = player?.id || null;
      }
    } catch (err) {
      console.error('Error getting current player:', err);
    }
  }

  async createChallenge() {
    if (this.challengeForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (!this.currentPlayerId) {
      this.error = 'Current player not found';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const formValue = this.challengeForm.value;
      const challengeData = {
        player1_id: this.currentPlayerId,
        player2_id: formValue.selectedPlayer.id,
        date: formValue.date.toISOString(),
        invitation_message: formValue.invitation_message,
        seen: false,
        status: 'pending'
      };

      const { data, error } = await this.supabaseService.insertRecord('challenge', challengeData);
      
      if (error) {
        this.error = 'Failed to create challenge';
        console.error('Error creating challenge:', error);
      } else {
        this.challengeCreated.emit(data);
        this.closeModal();
        this.resetForm();
      }
    } catch (err) {
      this.error = 'An unexpected error occurred';
      console.error('Unexpected error:', err);
    } finally {
      this.loading = false;
    }
  }

  closeModal() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  resetForm() {
    this.challengeForm.reset();
    this.error = null;
  }

  markFormGroupTouched() {
    Object.keys(this.challengeForm.controls).forEach(key => {
      const control = this.challengeForm.get(key);
      control?.markAsTouched();
    });
  }

  onModalShow() {
    this.visible = true;
    this.visibleChange.emit(true);
  }

  onModalHide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.resetForm();
  }

  ngOnDestroy() {
    // Reset form when component is destroyed
    this.resetForm();
  }
}
