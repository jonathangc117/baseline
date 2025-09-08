import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-singles-matches',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule],
  templateUrl: './singles-matches.component.html',
  styleUrls: ['./singles-matches.component.scss']
})
export class SinglesMatchesComponent implements OnInit {
  loading = false;
  matches: any[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loading = true;
    try {
      const [ { data: matches }] = await Promise.all([
        this.supabaseService.getMatches()
      ]);

      this.matches = (matches || []);
    } finally {
      this.loading = false;
    }
  }

  addMatch() {
    this.router.navigate(['/my-matches/add']);
  }
}
