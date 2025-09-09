import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CardModule, AvatarModule, ButtonModule, InputTextModule, FileUploadModule, InputNumberModule, DatePickerModule, SelectModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
})
export class MyProfileComponent implements OnInit {
  loading = false;
  user: any;
  player: any;
  form: FormGroup;
  isEditing = false;

  constructor(private supabaseService: SupabaseService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: [''],
      email: [''],
      age: [null],
      gender: [null],
      weight: [null],
      height: [null],
      turned_pro: [null],
      birth_place: [''],
      plays: [''],
      coach: [''],
      country: ['']
    });
  }

  async ngOnInit() {
    this.loading = true;
    try {
      const { data } = await this.supabaseService.getCurrentUser();
      this.user = data?.user;
      if (this.user?.id) {
        const { data: player } = await this.supabaseService.getPlayerByUserId(this.user.id);
        this.player = player;
        this.form.patchValue({
          name: this.player?.name || '',
          email: this.user.email || '',
          age: this.player?.age ?? null,
          gender: this.player?.gender ?? null,
          weight: this.player?.weight ?? null,
          height: this.player?.height ?? null,
          turned_pro: this.player?.turned_pro ? new Date(this.player.turned_pro) : null,
          birth_place: this.player?.birth_place || '',
          plays: this.player?.plays || '',
          coach: this.player?.coach || '',
          country: this.player?.country || ''
        });
      }
    } finally {
      this.loading = false;
    }
  }

  async onAvatarUpload(event: any) {
    const file: File = event.files?.[0];
    if (!file || !this.user?.id) return;
    const path = `${this.user.id}/${Date.now()}_${file.name}`;
    const { data, error } = await this.supabaseService.uploadFile('profile-pictures', path, file);
    if (!error) {
      const { data: urlData } = await this.supabaseService.getPublicUrl('profile-pictures', path);
      await this.supabaseService.updateRecord('player', this.player.id, { profile_picture: urlData.publicUrl });
      this.player.profile_picture = urlData.publicUrl;
    }
  }

  async save() {
    if (!this.player?.id) return;
    const payload: any = {
      name: this.form.value.name,
      age: this.form.value.age,
      gender: this.form.value.gender,
      weight: this.form.value.weight,
      height: this.form.value.height,
      turned_pro: this.form.value.turned_pro ? new Date(this.form.value.turned_pro).toISOString() : null,
      birth_place: this.form.value.birth_place,
      plays: this.form.value.plays,
      coach: this.form.value.coach,
      country: this.form.value.country
    };
    await this.supabaseService.updateRecord('player', this.player.id, payload);
    this.player.name = this.form.value.name;
    this.player.age = this.form.value.age;
    this.player.gender = this.form.value.gender;
    this.player.weight = this.form.value.weight;
    this.player.height = this.form.value.height;
    this.player.turned_pro = this.form.value.turned_pro ? new Date(this.form.value.turned_pro).toISOString() : null;
    this.player.birth_place = this.form.value.birth_place;
    this.player.plays = this.form.value.plays;
    this.player.coach = this.form.value.coach;
    this.player.country = this.form.value.country;
    this.isEditing = false;
  }

  edit() {
    this.isEditing = true;
  }

  cancel() {
    this.isEditing = false;
    this.form.patchValue({ name: this.player?.name || '', email: this.user?.email || '' });
  }
}
