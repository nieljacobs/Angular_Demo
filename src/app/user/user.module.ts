import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { InMemoryWebApiModule } from 'angular-in-memory-web-api';

import { UserData } from '../backend/data';
import { UserRegistrationComponent } from './user-registration.component';
import { UserLoginComponent } from './user-login.component';
import { UserRegistrationGuard } from '../guards/user-registration.guard';

@NgModule({
  declarations: [
    UserRegistrationComponent,
    UserLoginComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InMemoryWebApiModule.forRoot(UserData),
    RouterModule.forChild([
        { path: 'user-registration',
          canDeactivate: [UserRegistrationGuard], 
          component: UserRegistrationComponent},
        { path: 'user-login', component: UserLoginComponent}
    ])  
  ]
})
export class UserModule { }