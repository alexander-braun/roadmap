import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, BehaviorSubject, Observable, take, catchError, EMPTY } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { ExpiresAt, LoginResponse, Token, User } from './auth.model';
import { WorkerService } from './worker.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: Token | undefined;
  private expiresAt: ExpiresAt | undefined;
  private isAuthorized$$ = new BehaviorSubject(false);
  public isAuthorized$ = this.isAuthorized$$.asObservable();

  constructor(private http: HttpClient, private cookieService: CookieService, private workerService: WorkerService) {
    this.token = this.cookieService.get('token');
    this.expiresAt = Number(this.cookieService.get('expiresAt'));
    if (this.token && this.expiresAt) {
      this.isAuthorized$$.next(true);
      this.startAuthWorker();
    }
  }

  public login(email: string | null, password: string | null): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/users/login', { email, password }).pipe(
      tap((response) => {
        this.token = response.token;
        this.expiresAt = response.expiresAt;
        this.cookieService.set('token', response.token);
        this.cookieService.set('expiresAt', response.expiresAt.toString());

        if (this.token) {
          this.isAuthorized$$.next(true);
          this.startAuthWorker();
        }
      })
    );
  }

  public signup(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/users', { email, password }).pipe(
      tap((response) => {
        this.token = response.token;
        this.expiresAt = response.expiresAt;
        this.cookieService.set('token', response.token);
        this.cookieService.set('expiresAt', response.expiresAt.toString());

        if (this.token) {
          this.isAuthorized$$.next(true);
          this.startAuthWorker();
        }
      })
    );
  }

  public logout(): Observable<User> {
    return this.http
      .post<{ _id: string; name: string; email: string; createdAt: string; updatedAt: string }>('api/users/logout', {})
      .pipe(
        catchError((e) => {
          this.removeToken();
          return EMPTY;
        }),
        tap(() => {
          this.removeToken();
          this.workerService.removeWorker('auth-timer');
        })
      );
  }

  public isUserAuthorized(): boolean {
    return this.isAuthorized$$.value;
  }

  private startAuthWorker(): void {
    this.workerService
      .createWorker<string>('auth-timer', this.getExpiration())
      .pipe(take(1))
      .subscribe({
        complete: () => {
          this.removeToken();
        },
      });
  }

  private removeToken(): void {
    this.token = undefined;
    this.expiresAt = undefined;
    this.cookieService.set('token', '');
    this.cookieService.set('expiresAt', '');
    this.isAuthorized$$.next(false);
  }

  public getToken(): Token | undefined {
    return this.token;
  }

  public getExpiration(): ExpiresAt {
    return this.expiresAt || 0;
  }

  public tokenIsValid(): boolean {
    if (!this.token || !this.expiresAt) {
      return false;
    }

    return new Date().getTime() < this.expiresAt * 1000;
  }
}
