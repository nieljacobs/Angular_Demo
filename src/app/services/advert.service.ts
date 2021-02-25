import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Advert } from '../models/advert';

@Injectable({
  providedIn: 'root'
})
export class AdvertService {
  
  private advertUrl = 'api/adverts';
  
  constructor(private http: HttpClient) { }

  // method to return all adverts in in-memory db
  getAdverts(): Observable<Advert[]> {
    return this.http.get<Advert[]>(this.advertUrl)
      .pipe(
        tap(data => console.log('getAdverts: ' + JSON.stringify(data))),
        catchError(this.handleError)
      );
  }

  // method READ
  getAdvert(id: number): Observable<Advert> {
    const url = `${this.advertUrl}/${id}`;
    return this.http.get<Advert>(url)
      .pipe(
        tap(data => console.log('getAdvert: ' + JSON.stringify(data))),
        catchError(this.handleError)
      );
  }

  // method DELETE
  deleteAdvert(id: number): Observable<{}> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.advertUrl}/${id}`;
    return this.http.delete<Advert>(url, { headers })
      .pipe(
        tap(data => console.log('deleteAdvert: ' + id)),
        catchError(this.handleError)
      );
  }

    // method UPDATE
    updateAdvert(advert: Advert): Observable<Advert> {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const url = `${this.advertUrl}/${advert.id}`;
      return this.http.put<Advert>(url, advert, { headers })
        .pipe(
          tap(() => console.log('updateAdvert: ' + advert.id)),
          // return advert on update as angular-in-memory-web-api does not
          map(() => advert),
          catchError(this.handleError)
        );
    }

    // method CREATE
    createAdvert(advert: Advert): Observable<Advert> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    advert.id = null;
    return this.http.post<Advert>(this.advertUrl, advert, { headers })
      .pipe(
        tap(data => console.log('createAdvert: ' + JSON.stringify(data))),
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
