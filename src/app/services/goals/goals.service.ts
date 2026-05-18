import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoadingService } from '../loading/loading.service';
import { finalize, Observable } from 'rxjs';
import { Goal } from '../../interfaces/Goal';
import { environment } from '../../../enviroments/enviroment';
import { PaginatedResponse } from '../../interfaces/PaginatedResponse';

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
  ) {}
  token = localStorage.getItem('token');

  getGoalsByUserEmail(
    page: number,
    pageSize: number,
    email: string | null,
  ): Observable<PaginatedResponse<Goal>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PaginatedResponse<Goal>>(
      `${environment.apiUrl}/api/v1/goals/myGoals/${email}`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
        params,
      },
    );
  }

  getGoal(id: string): Observable<Goal> {
    this.loadingService.show();
    return this.http
      .get<Goal>(`${environment.apiUrl}/api/v1/goals/id/${id}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(finalize(() => this.loadingService.hide()));
  }

  createGoal(goal: Goal): Observable<Goal> {
    return this.http.post<Goal>(`${environment.apiUrl}/api/v1/goals`, goal, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }

  editGoal(id: string | null, goal: Goal): Observable<Goal> {
    return this.http.put<Goal>(`${environment.apiUrl}/api/v1/goals/${id}`, goal, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }

  removeGoal(id: string): Observable<Goal> {
    return this.http.delete<Goal>(`${environment.apiUrl}/api/v1/goals/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }
}
