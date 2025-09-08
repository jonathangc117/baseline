import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async canActivate(): Promise<boolean> {
    // Skip check on server-side rendering
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    try {
      const { data, error } = await this.supabaseService.getCurrentUser();
      
      if (error || !data?.user) {
        // User is not authenticated, redirect to login
        this.router.navigate(['/login']);
        return false;
      }
      
      // User is authenticated
      return true;
    } catch (error) {
      console.error('Auth guard error:', error);
      // On error, redirect to login for safety
      this.router.navigate(['/login']);
      return false;
    }
  }
}
