import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Only create Supabase client in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.supabase = createClient(
        environment.supabaseUrl,
        environment.supabaseAnonKey
      );
    }
  }

  // Get the Supabase client instance
  get client(): SupabaseClient | null {
    if (!this.supabase && isPlatformBrowser(this.platformId)) {
      this.supabase = createClient(
        environment.supabaseUrl,
        environment.supabaseAnonKey
      );
    }
    return this.supabase;
  }

  // Authentication methods
  async signUp(email: string, password: string, name: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return { data: null, error: { message: 'Not available on server' } };
    }
    
    const user = await this.client?.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    // Note: Player record creation should be handled by a database trigger
    // or the user should be redirected to complete their profile after email confirmation
    // The RLS policy prevents direct insertion during signup

    return user;
  }

  async signIn(email: string, password: string) {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: null, error: { message: 'Not available on server' } };
    }
    return await this.client.auth.signInWithPassword({
      email,
      password
    });
  }

  async signOut() {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { error: { message: 'Not available on server' } };
    }
    return await this.client.auth.signOut();
  }

  async getCurrentUser() {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: null, error: { message: 'Not available on server' } };
    }
    return await this.client.auth.getUser();
  }

  // Database methods
  async getTable(tableName: string) {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: [], error: null };
    }
    return await this.client
      .from(tableName)
      .select('*');
  }

  async insertRecord(tableName: string, data: any) {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: null, error: { message: 'Not available on server' } };
    }
    return await this.client
      .from(tableName)
      .insert(data);
  }

  async updateRecord(tableName: string, id: string, data: any) {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: null, error: { message: 'Not available on server' } };
    }
    return await this.client
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select('*');
  }

  async deleteRecord(tableName: string, id: string) {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: null, error: { message: 'Not available on server' } };
    }
    return await this.client
      .from(tableName)
      .delete()
      .eq('id', id);
  }

  // Tennis-specific methods
  async getTournaments() {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: [], error: null };
    }
    return await this.client
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async getMatches(userId?: string) {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: [], error: null };
    }
    
    let query = this.client
      .from('singles_match')
      .select(`
        *,
        player1_player:player!player1(id,name,email),
        player2_player:player!player2(id,name,email)
      `)
      .order('created_at', { ascending: false });
    
    // if (userId) {
    //   query = query.or(`player1.eq.${userId},player2.eq.${userId}`);
    // }
    
    return await query;
  }

  async getMatchesPaged(params: { page: number; pageSize: number; search?: string }) {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: [], count: 0, error: null } as any;
    }

    const { page, pageSize, search } = params;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = this.client
      .from('singles_match')
      .select(`
        *,
        player1_player:player!player1(id,name,email),
        player2_player:player!player2(id,name,email)
      `, { count: 'exact' })
      .order('date', { ascending: false })
      .range(from, to);

    const q = (search || '').trim();
    if (q) {
      const like = `*${q}*`;
      const orFilters: string[] = [
        `player2_name.ilike.${like}`
      ];

      // If the query looks like a set score (e.g., 7-6), search the score array by overlap
      const setToken = q.match(/^\d+\s*-\s*\d+$/) ? q.replace(/\s+/g, '') : null;
      if (setToken) {
        orFilters.push(`score.ov.{${setToken}}`);
      }

      // Fetch matching player ids by name to search by foreign keys
      const { data: playersMatch } = await this.client
        .from('player')
        .select('id')
        .ilike('name', like);

      const playerIds = (playersMatch || []).map((p: any) => p.id);
      if (playerIds.length > 0) {
        const ids = `(${playerIds.join(',')})`;
        orFilters.push(`player1.in.${ids}`);
        orFilters.push(`player2.in.${ids}`);
      }

      if (orFilters.length > 0) {
        query = query.or(orFilters.join(','));
      }
    }

    return await query;
  }

  async getMatchById(id: string) {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: null, error: { message: 'Not available on server' } };
    }

    // Use the same embeds as list to keep fields consistent
    return await this.client
      .from('singles_match')
      .select(`
        *,
        player1_player:player!player1(id,name,email, profile_picture, user_id),
        player2_player:player!player2(id,name,email, profile_picture, user_id)
      `)
      .eq('id', id)
      .single();
  }

  async getPlayers() {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: [], error: null };
    }
    return await this.client
      .from('player')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
  }

  async getPlayerById(id: string) {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: null, error: { message: 'Not available on server' } };
    }
    return await this.client
      .from('player')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();
  }

  async getPlayerByUserId(userId: string) {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: null, error: { message: 'Not available on server' } };
    }
    return await this.client
      .from('player')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
  }

  async getChallenges(playerId: string) {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: [], error: { message: 'Not available on server' } };
    }
    return await this.client
      .from('challenge')
      .select(`
        *,
        player1_player:player!player1_id(id, name, email, profile_picture),
        player2_player:player!player2_id(id, name, email, profile_picture)
      `)
      .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
      .order('created_at', { ascending: false });
  }

  async getUserProfile(userId: string) {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: null, error: { message: 'Not available on server' } };
    }
    return await this.client
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
  }

  // Real-time subscriptions
  subscribeToTable(tableName: string, callback: (payload: any) => void) {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { unsubscribe: () => {} };
    }
    return this.client
      .channel(`${tableName}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: tableName }, 
        callback
      )
      .subscribe();
  }

  // File storage methods
  async uploadFile(bucket: string, path: string, file: File) {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: null, error: { message: 'Not available on server' } };
    }
    return await this.client.storage
      .from(bucket)
      .upload(path, file);
  }

  async downloadFile(bucket: string, path: string) {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: null, error: { message: 'Not available on server' } };
    }
    return await this.client.storage
      .from(bucket)
      .download(path);
  }

  async getPublicUrl(bucket: string, path: string) {
    if (!isPlatformBrowser(this.platformId) || !this.client) {
      return { data: { publicUrl: '' } };
    }
    return this.client.storage
      .from(bucket)
      .getPublicUrl(path);
  }
}
