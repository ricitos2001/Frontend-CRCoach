import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../loading/loading.service';
import { Observable } from 'rxjs';
import { WeaknessReport } from '../../interfaces/WeaknessReport';
import { environment } from '../../../enviroments/enviroment';
import { finalize } from 'rxjs/operators';
import { Snapshot } from '../../interfaces/Snapshot';

@Injectable({
  providedIn: 'root',
})
export class SnapshotsService {
  token = localStorage.getItem('token');

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
  ) {}

  getSnapshots(tag: string): Observable<Snapshot[]> {
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    const encodedTag = encodeURIComponent(normalizedTag);

    return this.http
      .get<Snapshot[]>(
        `${environment.apiUrl}/api/v1/snapshots/mySnapshots/${encodedTag}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      )
      .pipe(finalize(() => this.loadingService.hide()));
  }
}
