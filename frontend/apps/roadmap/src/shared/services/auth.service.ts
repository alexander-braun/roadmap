import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, BehaviorSubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

export interface User {
  createdAt: string;
  email: string;
  name: string;
  updatedAt: string;
  _id: string;
}

export type Token = string;
export type ExpiresAt = number;

export interface LoginResponse {
  user: User;
  token: Token;
  expiresAt: ExpiresAt;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: Token | undefined;
  private expiresAt: ExpiresAt | undefined;
  private isAuthorized$$ = new BehaviorSubject(false);
  public isAuthorized$ = this.isAuthorized$$.asObservable();

  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.token = this.cookieService.get('token');
    this.expiresAt = Number(this.cookieService.get('expiresAt'));
    if (this.token && this.expiresAt) {
      this.isAuthorized$$.next(true);
    }
  }

  public login(email: string | null, password: string | null) {
    return this.http.post<LoginResponse>('/api/users/login', { email, password }).pipe(
      tap((response) => {
        this.token = response.token;
        this.expiresAt = response.expiresAt;
        this.cookieService.set('token', response.token);
        this.cookieService.set('expiresAt', response.expiresAt.toString());
        if (this.token) {
          this.isAuthorized$$.next(true);
        }
      })
    );
  }

  public logout(): Observable<{
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  }> {
    return this.http
      .post<{ _id: string; name: string; email: string; createdAt: string; updatedAt: string }>('api/users/logout', {})
      .pipe(
        tap(() => {
          this.token = undefined;
          this.expiresAt = undefined;
          this.cookieService.set('token', '');
          this.cookieService.set('expiresAt', '');
          this.isAuthorized$$.next(false);
        })
      );
  }

  public getToken(): string | undefined {
    return this.token;
  }

  public tokenIsValid(): boolean {
    if (!this.token || !this.expiresAt) {
      return false;
    }

    return new Date().getTime() < this.expiresAt * 1000;
  }
}
