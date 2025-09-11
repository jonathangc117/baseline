import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-bottom-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule],
  templateUrl: './bottom-menu.component.html',
  styleUrl: './bottom-menu.component.scss'
})
export class BottomMenuComponent {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: '/dashboard'
    },
    {
      label: 'Matches',
      icon: 'pi pi-calendar',
      items: [
        {
          label: 'Singles',
          icon: 'pi pi-user',
          routerLink: '/my-matches/singles'
        },
        {
          label: 'Doubles',
          icon: 'pi pi-users',
          routerLink: '/my-matches/doubles'
        }
      ]
    },
    {
      label: 'Challenges',
      icon: 'pi pi-bell',
      routerLink: '/my-challenges'
    },
    {
      label: 'My Profile',
      icon: 'pi pi-user',
      routerLink: '/my-profile'
    },
    {
      label: 'Stats',
      icon: 'pi pi-chart-bar',
      routerLink: '/stats'
    },
    {
      label: 'Players',
      icon: 'pi pi-users',
      routerLink: '/players'
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  async logout() {
    try {
      await this.supabaseService.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
