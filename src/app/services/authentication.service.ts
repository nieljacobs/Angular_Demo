import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  
  static currentUser: BehaviorSubject<string>; 
  
  constructor(private http: HttpClient) {
    AuthenticationService.currentUser = new BehaviorSubject(localStorage.getItem('currentUser'));
  }

  // http method to authenticate user
  authenticateUser(userLoginDetails: Object): Observable<Object> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<User>('api/authenticate', userLoginDetails, { headers })
    .pipe(
      tap(() => console.log('authenticateUser: ' + JSON.stringify(userLoginDetails))),
      catchError(this.handleError)
    );
  }
  
  // method to remove user from local storage
  removeCurrentUser(): void {
    localStorage.removeItem('currentUser');
    // update static observable
    AuthenticationService.currentUser.next('');
  }

  // method to get current user
  getCurrentUser(): Observable<string> {
    return AuthenticationService.currentUser.asObservable();
  }
 
  // private method to handle errors
  private handleError(err: any): Observable<never> {
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}
