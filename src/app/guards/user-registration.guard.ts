import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

import { Observable } from 'rxjs';

import { UserRegistrationComponent } from '../user/user-registration.component';

@Injectable({
  providedIn: 'root'
})
export class UserRegistrationGuard implements CanDeactivate<UserRegistrationComponent> {
  canDeactivate(component: UserRegistrationComponent): Observable<boolean> | Promise<boolean> | boolean {
    if (component.registrationForm.dirty) {
      return confirm('Leaving this page will clear the registration form and all of its content.');
    }
    return true;
  }
}
