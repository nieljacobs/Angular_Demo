import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { Advert } from '../models/advert';
import { AdvertService } from '../services/advert.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './advert-checkout.component.html',
  styleUrls: ['./advert-checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  pageTitle: string;
  errorMessage: string;
  advert: Advert;
  private sub: Subscription;

  constructor(private route: ActivatedRoute,
              private adService: AdvertService,
              private router: Router) {
    this.pageTitle = 'Checkout:';
    this.advert = null;
  }

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(
      params => {
        const id = +params.get('id');
        this.getAdvert(id);
      }
    );
  }

  onCheckout(): void {
    alert('You have successfully purchased an item!');
    this.router.navigate(['/welcome']);
  }
  
  private getAdvert(id: number): void {
    this.adService.getAdvert(id)
      .subscribe({
        next: (advert: Advert) => this.advert = advert,
        error: (err: any) => this.errorMessage = err
      });
  }
}
