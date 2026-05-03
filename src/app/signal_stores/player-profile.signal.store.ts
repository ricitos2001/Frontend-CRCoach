import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PlayerProfilesService } from '../services/player-profiles/player-profiles.service';
import { PlayerProfile } from '../interfaces/PlayerProfile';

@Injectable({ providedIn: 'root' })
export class PlayerProfileSignalStore {
  public profile = signal<PlayerProfile | null>(null);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor(private profilesService: PlayerProfilesService) {}

  private setLoading(v: boolean) {
    this.loading.set(v);
  }

  private setError(e: any) {
    const msg = e?.message ?? String(e ?? 'Unknown error');
    this.error.set(msg);
  }

  async loadByTag(tag: string) {
    if (!tag) return;
    this.setLoading(true);
    this.error.set(null);
    try {
      this.profilesService.token = localStorage.getItem('token');
      const res = await firstValueFrom(this.profilesService.getProfileByTag(tag));
      this.profile.set(res);
    } catch (err) {
      console.error('PlayerProfileSignalStore.loadByTag error', err);
      this.profile.set(null);
      this.setError(err);
    } finally {
      this.setLoading(false);
    }
  }

  async importProfile(tag: string) {
    if (!tag) return;
    this.setLoading(true);
    this.error.set(null);
    try {
      this.profilesService.token = localStorage.getItem('token');
      const res = await firstValueFrom(this.profilesService.importProfile(tag));
      this.profile.set(res);
    } catch (err) {
      console.error('PlayerProfileSignalStore.importProfile error', err);
      this.profile.set(null);
      this.setError(err);
    } finally {
      this.setLoading(false);
    }
  }

  setProfile(p: PlayerProfile | null) {
    this.profile.set(p);
  }

  clear() {
    this.profile.set(null);
    this.loading.set(false);
    this.error.set(null);
  }
}

