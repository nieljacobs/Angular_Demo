
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { User } from '../models/user'

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userUrl = 'api/users';
  
  constructor(private http: HttpClient) { }

  // method to return all users in in-memory db
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.userUrl)
      .pipe(
        tap(data => console.log('getUsers: ' + JSON.stringify(data))),
        catchError(this.handleError)
      );
  }

  // method READ
  getUser(id: number): Observable<User> {
    const url = `${this.userUrl}/${id}`;
    return this.http.get<User>(url)
      .pipe(
        tap(data => console.log('getUser: ' + JSON.stringify(data))),
        catchError(this.handleError)
      );
  }

  // custom method to check for duplicate user
  checkDuplicateUser(user: User): Observable<User> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<User>('api/checkduplicate', user, { headers })
      .pipe(
        tap((data) => console.log('checkDuplicateUser: ' + user.username)),
        catchError(this.handleError)
      );
  }
  
  // method CREATE
  createUser(user: User): Observable<User> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<User>(this.userUrl, user, { headers })
      .pipe(
        tap(data => console.log('createUser: ' + JSON.stringify(data))),
        catchError(this.handleError)
      );
  }

  // method DELETE
  deleteUser(id: number): Observable<{}> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.userUrl}/${id}`;
    return this.http.delete<User>(url, { headers })
      .pipe(
        tap(data => console.log('deleteUser: ' + id)),
        catchError(this.handleError)
      );
  }

  // method UPDATE
  updateUser(user: User): Observable<User> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.userUrl}/${user.id}`;
    return this.http.put<User>(url, user, { headers })
      .pipe(
        tap(() => console.log('updateUser: ' + user.id)),
        // return user on update as angular-in-memory-web-api does not
        map(() => user),
        catchError(this.handleError)
      );
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
