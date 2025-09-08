import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
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
      
      if (!error && data?.user) {
        // User is already authenticated, redirect to dashboard
        this.router.navigate(['/dashboard']);
        return false;
      }
      
      // User is not authenticated, allow access to login
      return true;
    } catch (error) {
      console.error('Guest guard error:', error);
      // On error, allow access to login
      return true;
    }
  }
}
