import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';
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
      const res = await firstValueFrom(this.profilesService.getProfileByTag(tag).pipe(defaultIfEmpty(null as unknown as PlayerProfile)));
      this.profile.set(res);
    } catch (err) {
      const httpErr = err as HttpErrorResponse | undefined;
      if (httpErr && (httpErr.status === 400 || httpErr.status === 404)) {
        // Debug log only — not a production-level error (profile may be missing)
        console.debug('PlayerProfileSignalStore.loadByTag: profile not found', httpErr.message ?? httpErr.status);
        this.profile.set(null);
        this.error.set(null);
      } else {
        console.error('PlayerProfileSignalStore.loadByTag error', err);
        this.profile.set(null);
        this.setError(err);
      }
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
      await firstValueFrom(this.profilesService.importProfile(tag).pipe(defaultIfEmpty(null as any)));
      await this.loadByTag(tag);
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

