import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdvertEditComponent } from './advert-edit.component';
import { AdvertListComponent } from './advert-list.component';
import { AdvertDetailComponent } from './advert-detail.component';
import { AdvertEditGuard } from '../guards/advert-edit.guard';
import { AdvertListGuard } from '../guards/advert-list.guard';
import { CheckoutComponent } from './advert-checkout.component';
import { AdvertCheckoutGuard } from '../guards/advert-checkout.guard';

@NgModule({
  declarations: [
    AdvertEditComponent,
    AdvertListComponent,
    AdvertDetailComponent,
    CheckoutComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild([
      { path: 'advert-list/:id', 
        canActivate: [AdvertListGuard], 
        component: AdvertListComponent },
      { path: 'advert/:id/edit', 
        canActivate: [AdvertEditGuard], 
        component: AdvertEditComponent },
      { path: 'checkout/:id',
        canActivate: [AdvertCheckoutGuard],
        component: CheckoutComponent}
    ])  
  ] 
})
export class AdvertModule { }
