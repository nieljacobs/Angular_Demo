import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { Advert } from '../models/advert';
import { User } from '../models/user';
import { AdvertService } from '../services/advert.service';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-advert-list',
  templateUrl: './advert-list.component.html',
  styleUrls: ['./advert-list.component.css']
})
export class AdvertListComponent implements OnInit, OnDestroy {
  
  // view properties
  pageTitle: string;
  errorMessage: string;
  listFilter: string;
  adverts: Advert[];
  filteredAdverts: Advert[];
  filterControl: FormControl;
  isUserList: boolean; 
  
  private currentUser: User;
  private sub: Subscription;
  
  constructor(private adService: AdvertService,
              private route: ActivatedRoute) {

    this.pageTitle = '';
    this.errorMessage = '';
    this.listFilter = '';
    this.adverts = [];
    this.filteredAdverts = [];
    this.filterControl = new FormControl('');
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit(): void {
    // subscribe to changes in filterControl to update filter for lists to display
    this.filterControl.valueChanges
      .subscribe((value: string) => {
        this.listFilter = value;
        this.filteredAdverts = this.listFilter ? this.performFilter(this.listFilter) : this.adverts
      })

    // Read id from the route parameter
    this.sub = this.route.paramMap.subscribe(
      params => {
        const id = params.get('id');
        if (id === 'all-adverts') {
          this.getAllAdverts();
          this.pageTitle = 'Listed adverts';
          this.isUserList = false;
        }
        
        if (id === 'my-adverts') {
          if (this.currentUser) {
            this.getCurrentUserAdverts();
            this.pageTitle = `${this.currentUser.username}'s adverts`;
            this.isUserList = true;
          }
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onDelete(id: number): void {
    if (confirm('Are you sure you want to delete this advert?')) {
      // delete advert
      this.adService.deleteAdvert(id)
        .subscribe({
          next: () => this.onDeleteComplete(),
          error: (err: any) => this.errorMessage = err
        });
    } 
  }
  
  // private method to pefrom filter based on filter input
  private performFilter(filterBy: string): Advert[] {
    filterBy = filterBy.toLocaleLowerCase();
    return this.adverts.filter((advert: Advert) =>
      advert.header.toLocaleLowerCase().indexOf(filterBy) !== -1 ||
      advert.description.toLocaleLowerCase().indexOf(filterBy) !== -1
    );
  }
  // private method to get all adverts 
  private getAllAdverts(): void {
    this.adService.getAdverts().subscribe({
      next: (adverts: Advert[]) => {
        this.adverts = adverts;
        this.filteredAdverts = this.adverts;
      },
      error: err => this.errorMessage = err
    });
  }
  // private method to get currentUser adverts and assign to adverts and filtered adverts lists
  private getCurrentUserAdverts(): void {
    this.adService.getAdverts().subscribe({
      next: (adverts: Advert[]) => {
        const userAdverts: Advert[] = adverts
          .filter((advert: Advert) => this.currentUser.id === advert.ownerId);
          this.adverts = userAdverts;
          this.filteredAdverts = this.adverts;
      },
      error: (err: any) => this.errorMessage = err
    });
  }
  // private method called onDelete to refresh currentUser adverts
  private onDeleteComplete(): void {
    this.getCurrentUserAdverts();
  }
}
