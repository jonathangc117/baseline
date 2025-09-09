import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CardModule, AvatarModule, ButtonModule, InputTextModule, FileUploadModule],
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
      email: ['']
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
        this.form.patchValue({ name: this.player?.name || '', email: this.user.email || '' });
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
    await this.supabaseService.updateRecord('player', this.player.id, { name: this.form.value.name });
    this.player.name = this.form.value.name;
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
