import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';

import { Observable } from 'rxjs';

import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AdvertListGuard implements CanActivate {
  
  constructor(private router: Router){}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const routeId: string = route.paramMap.get('id');
    const currentUser: User = JSON.parse(localStorage.getItem("currentUser"));
    if (routeId === 'my-adverts' && currentUser){
      return true;
    }
    if (routeId === 'all-adverts') {
      return true
    } 
    alert('This page is not accessable at this time');
    this.router.navigate(['/welcome']);
    return false;
  }
}
