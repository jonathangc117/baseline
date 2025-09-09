import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';
import { SupabaseService } from '../../../services/supabase.service';

interface PlayerOption { label: string; value: string; }

@Component({
  selector: 'app-add-match',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    ButtonModule,
    MessageModule,
    CheckboxModule,
  ],
  templateUrl: './add-match.component.html',
  styleUrls: ['./add-match.component.scss']
})
export class AddMatchComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  players: PlayerOption[] = [];
  private playersFull: any[] = [];
  private currentUserPlayerId: string | null = null;
  submitted = false;
  bestOfOptions = [
    { label: '1', value: 1 },
    { label: '3', value: 3 },
    { label: '5', value: 5 },
  ];

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.form = this.fb.group({
      matchDate: [new Date(), Validators.required],
      bestOf: [1, Validators.required],
      won: [true, Validators.required],
      player1: [null, Validators.required],
      player2: [null],
      player2Name: [''],
      player2NotRegistered: [false],
      useMePlayer1: [false],
      sets: this.fb.array([] as any[]),
    });
  }

  async ngOnInit() {
    const [{ data: playersData }, { data: userData }] = await Promise.all([
      this.supabaseService.getPlayers(),
      this.supabaseService.getCurrentUser()
    ]);

    this.playersFull = playersData || [];
    this.players = this.playersFull.map((p: any) => ({ label: p.name, value: p.id }));

    const uid = userData?.user?.id;
    if (uid) {
      const mine = this.playersFull.find((p: any) => p.user_id === uid);
      this.currentUserPlayerId = mine?.id || null;
    }

    // Trim sets if bestOf decreases
    this.form.get('bestOf')?.valueChanges.subscribe((max: number) => {
      if (typeof max !== 'number') return;
      while (this.sets.length > max) {
        this.sets.removeAt(this.sets.length - 1);
      }
    });
  }

  async submit() {
    this.submitted = true;
    // dynamic validators for player 2 depending on checkbox
    const notReg = this.form.get('player2NotRegistered')?.value;
    if (notReg) {
      this.form.get('player2')?.clearValidators();
      this.form.get('player2')?.updateValueAndValidity({ emitEvent: false });
      this.form.get('player2Name')?.setValidators([Validators.required]);
      this.form.get('player2Name')?.updateValueAndValidity({ emitEvent: false });
    } else {
      this.form.get('player2Name')?.clearValidators();
      this.form.get('player2Name')?.updateValueAndValidity({ emitEvent: false });
      this.form.get('player2')?.setValidators([Validators.required]);
      this.form.get('player2')?.updateValueAndValidity({ emitEvent: false });
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.sets.length === 0) {
      return;
    }
    this.loading = true;
    this.error = null;
    this.success = null;

    try {
      const values = this.form.value;

      const sets = values.sets;

      let  formattedScore = '';


      // Build formattedScore string from sets array
      const formattedSets: string[] = [];
      values.sets.forEach((element: any) => {
        const set = (element.set || '').trim();
        const tiebreak = (element.tiebreak || '').trim();

        if (set && tiebreak) {
          formattedSets.push(`${set}(${tiebreak})`);
        } else if (set) {
          formattedSets.push(set);
        } else if (tiebreak) {
          formattedSets.push(`(${tiebreak})`);
        }
        // If both are empty, skip
      });
      formattedScore = formattedSets.join(', ');

      const record = {
        date: values.matchDate,
        player1: values.player1,
        player2: !values.player2NotRegistered ? values.player2 : null,
        player2_name: values.player2NotRegistered ? values.player2Name : null,
        score: formattedSets,
        winner: values.won,
        best_of: values.bestOf
      };

      const { error } = await this.supabaseService.insertRecord('singles_match', record);
      if (error) {
        this.error = error.message || 'Failed to save match';
      } else {
        this.success = 'Match saved!';
        setTimeout(() => this.router.navigate(['/my-matches/singles']), 800);
      }
    } catch (e: any) {
      this.error = e?.message || 'Unexpected error';
    } finally {
      this.loading = false;
    }
  }

  get sets(): FormArray {
    return this.form.get('sets') as FormArray;
  }

  private createSetGroup(): FormGroup {
    return this.fb.group({
      set: ['', [ Validators.pattern(/^\s*\d+\s*-\s*\d+\s*$/)]],
      tiebreak: ['', [Validators.pattern(/^\s*\d+\s*-\s*\d+\s*$/)]]
    });
  }

  addSet() {
    if (this.canAddSet()) {
      this.sets.push(this.createSetGroup());
    }
  }

  removeSet(index: number) {
    this.sets.removeAt(index);
  }

  onUseMeToggle() {
    const checked = this.form.get('useMePlayer1')?.value;
    const control = this.form.get('player1');
    if (checked) {
      if (this.currentUserPlayerId) {
        control?.setValue(this.currentUserPlayerId);
        control?.disable();
      } else {
        this.error = 'Your player profile was not found.';
        this.form.get('useMePlayer1')?.setValue(false);
      }
    } else {
      control?.enable();
    }
  }

  canAddSet(): boolean {
    const max = this.form.get('bestOf')?.value as number;
    if (!max || typeof max !== 'number') return true;
    return this.sets.length < max;
  }

  get winnerOptions(): { label: string; value: boolean }[] {
    const p1Id = this.form.get('player1')?.value;
    const p2Id = this.form.get('player2')?.value;
    const notReg = this.form.get('player2NotRegistered')?.value;
    const p2Name = this.form.get('player2Name')?.value?.trim();

    const p1Label = this.players.find(p => p.value === p1Id)?.label || 'Player 1';
    const p2Label = notReg ? (p2Name || 'Player 2') : (this.players.find(p => p.value === p2Id)?.label || 'Player 2');

    return [
      { label: p1Label, value: true },
      { label: p2Label, value: false },
    ];
  }

  hasTwoPlayers(): boolean {
    const p1Id = this.form.get('player1')?.value;
    const notReg = this.form.get('player2NotRegistered')?.value;
    const p2Id = this.form.get('player2')?.value;
    const p2Name = this.form.get('player2Name')?.value?.trim();
    if (!p1Id) return false;
    return notReg ? !!p2Name : !!p2Id;
  }
}


