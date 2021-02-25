import { AfterViewInit, Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControlName } from '@angular/forms';
import { Router } from '@angular/router';

import { fromEvent, merge, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { AuthenticationService } from '../services/authentication.service';
import { MessageProcessor } from '../utils/message-processor.util';
import { WhitespaceValidator } from '../validators/whitespace.validator';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit, AfterViewInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  
  // view propoerties
  pageTitle: string;
  authenticationAlert: string;
  displayMessage: { [key: string]: string };
  passwordToggleMessage: string;
  passwordInputType: string;
  loginForm: FormGroup;

  // validation properties
  private minUsernameLength: number;
  private maxUsernameLength: number;
  private maxPasswordLength: number;
  
  private validationMessages: { [key: string]: { [key: string]: string } };
  private msgProcessor: MessageProcessor;
  
  constructor(private formBuilder: FormBuilder, 
              private authService: AuthenticationService, 
              private router: Router) {

    this.pageTitle = 'User Login';
    this.authenticationAlert = '';
    this.displayMessage = {};
    this.passwordToggleMessage = 'show password';
    this.passwordInputType = 'password'
    this.minUsernameLength = 1;
    this.maxUsernameLength = 25;
    this.maxPasswordLength = 25;

    this.validationMessages = {
      username: {
        required: 'Please enter your username.',
        minlength: `Your username must contain at least ${this.minUsernameLength} characters.`,
        maxlength: `Your username must contain less than ${this.maxUsernameLength} characters.` 
      },
      password: {
        required: 'Please enter your chosen password.',
        maxLength: `Your password must contain less than ${this.maxPasswordLength} characters.`,
        pattern: 'Please enter a valid password.'
      }
    }
    this.msgProcessor = new MessageProcessor(this.validationMessages);
  }

  ngOnInit(): void {  
    this.loginForm = this.formBuilder.group (
      {
        username: ['', [Validators.required, 
                        Validators.minLength(this.minUsernameLength), 
                        Validators.maxLength(this.maxUsernameLength), 
                        WhitespaceValidator.removeSpaces]],
        password: ['', [Validators.required, 
                        Validators.maxLength(this.maxPasswordLength),
                        Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/), 
                        WhitespaceValidator.removeSpaces]]
      }
    );
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    // This is required because the valueChanges does not provide notification on blur
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));
    // Merge the blur event observable with the valueChanges observable
    // so we only need to subscribe once.
    merge(this.loginForm.valueChanges, ...controlBlurs)
      .pipe(debounceTime(800))
        .subscribe(() => {
          this.displayMessage = this.msgProcessor.processMessages(this.loginForm, null);
        });
  }

  // method called on click of password button to toggle whether password can be viewed
  showPassword(): void {
    if (this.passwordInputType === 'text') {
      this.passwordInputType = 'password';
      this.passwordToggleMessage = 'show password'
    } else {
      this.passwordInputType = 'text';
      this.passwordToggleMessage = 'hide password'
    }
  }

  // method called on click of login button
  onSubmit(): void {
    let userLoginDetails: Object = {
      username: this.loginForm.get('username').value,
      password: this.loginForm.get('password').value
    }
    this.authService.authenticateUser(userLoginDetails)
      .subscribe({
        next: () => this.onLoginComplete(),
        error: () => this.authenticationAlert = 'Invalid login credentials.'
      })
  }
  // method called on successful login
  onLoginComplete(): void {
    this.authenticationAlert = '';
    this.loginForm.reset();
    this.passwordInputType = 'password';
    this.passwordToggleMessage = 'show password';
    this.router.navigate(['/advert-list', 'all-adverts']);
  }
}
