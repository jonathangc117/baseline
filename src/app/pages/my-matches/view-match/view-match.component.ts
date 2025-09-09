import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-view-match',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, ButtonModule],
  templateUrl: './view-match.component.html',
  styleUrls: ['./view-match.component.scss']
})
export class ViewMatchComponent implements OnInit {
  loading = false;
  match: any;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private supabaseService: SupabaseService
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
      this.match = data;
    } finally {
      this.loading = false;
    }
  }
}


