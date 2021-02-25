import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Advert } from '../models/advert';
import { User } from '../models/user';
import { AdvertService } from '../services/advert.service';

@Injectable({
  providedIn: 'root'
})
export class AdvertCheckoutGuard implements CanActivate {
  
  constructor(private router: Router,
              private adService: AdvertService) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      
      return this.adService.getAdverts()
      .pipe(
        map((adverts: Advert[]) => {
          const routeId: number = +route.paramMap.get('id');
          const currentUser: User = JSON.parse(localStorage.getItem("currentUser"));
          if (currentUser){
            const validAdverts: Advert[] = adverts
              .filter((advert: Advert) => advert.id === routeId);
            if (validAdverts && validAdverts.length) {
              return true;
            } else {
              alert('This page is not accessable at this time');
              this.router.navigate(['/welcome'])
              return false;
            }
          } else {
            alert('You have to be logged in to make a purchase.');
            this.router.navigate(['/user-login'])
            return false;
          }
        })
      )
  }
  
}
