import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-singles-matches',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, TagModule, InputTextModule],
  templateUrl: './singles-matches.component.html',
  styleUrls: ['./singles-matches.component.scss']
})
export class SinglesMatchesComponent implements OnInit {
  loading = false;
  matches: any[] = [];
  total = 0;
  search = '';
  page = 0;
  pageSize = 10;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    await this.loadPage();
  }

  async loadPage() {
    this.loading = true;
    try {
      const { data, count } = await this.supabaseService.getMatchesPaged({
        page: this.page,
        pageSize: this.pageSize,
        search: this.search
      } as any);
      this.matches = data || [];
      this.total = count || 0;
    } finally {
      this.loading = false;
    }
  }

  onPage(event: any) {
    this.page = Math.floor(event.first / event.rows);
    this.pageSize = event.rows;
    this.loadPage();
  }

  onSearchChange() {
    this.page = 0;
    this.loadPage();
  }

  addMatch() {
    this.router.navigate(['/my-matches/add']);
  }

  onMatchClick(id: string) {
    this.router.navigate(['/my-matches/view', id]);
  }
}
