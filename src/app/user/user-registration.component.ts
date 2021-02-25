import { AfterViewInit, Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControlName } from '@angular/forms';
import { Router } from '@angular/router';

import { fromEvent, merge, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { MessageProcessor } from '../utils/message-processor.util';
import { MatchValidator } from '../validators/match.validator';
import { WhitespaceValidator } from '../validators/whitespace.validator';

@Component({
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css']
})
export class UserRegistrationComponent implements OnInit, AfterViewInit {
  
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
 
  // view properties
  pageTitle: string;
  errorMessage: string;
  duplicateUserAlert: string;
  displayMessage: { [key: string]: string };
  passwordToggleMessage: string;
  passwordInputType: string;
  registrationForm: FormGroup;
  
  // validation properties
  private minUsernameLength: number;
  private maxUsernameLength: number ;
  private minFirstNameLength: number;
  private maxFirstNameLength: number;
  private minLastNameLength: number;
  private maxLastNameLength: number;
  private maxEmailLength: number;
  private maxPasswordLength: number;

  private validationMessages: { [key: string]: { [key: string]: string } };
  private msgProcessor: MessageProcessor;

  constructor(private formBuilder: FormBuilder, 
              private userService: UserService, 
              private router: Router) {

    this.pageTitle = 'Please register your details';
    this.errorMessage = '';
    this.duplicateUserAlert = '';
    this.displayMessage = {};
    this.passwordToggleMessage = 'show password';
    this.passwordInputType = 'password';
    this.minUsernameLength = 1;
    this.maxUsernameLength = 25;
    this.minFirstNameLength = 1;
    this.maxFirstNameLength = 25;
    this.minLastNameLength = 2;
    this.maxLastNameLength = 25;
    this.maxEmailLength = 30;
    this.maxPasswordLength = 25;
    
    this.validationMessages = {
      username: {
        required: 'Please enter your username.',
        minlength: `Your username must contain at least ${this.minUsernameLength} characters.`,
        maxlength: `Your username must contain less than ${this.maxUsernameLength} characters.` 
      },
      firstName: {
        required: 'Please enter your first name.',
        minlength: `Your first name must contain at least ${this.minFirstNameLength} characters.`,
        maxlength: `Your first name must contain less than ${this.maxFirstNameLength} characters.`
      },
      lastName: {
        required: 'Please enter your last name.',
        minlength: `Your last name must contain at least ${this.minLastNameLength} characters.`,
        maxlength: `Your last name must contain less than ${this.maxLastNameLength} characters.`
      },
      emailGroup: {
        match: 'Please make sure the confirmation matches your email.',
      },
      email: {
        required: 'Please enter your email address.',
        email: 'Please enter a valid email address.',
        maxLength: `Your email address must contain less than ${this.maxEmailLength} characters.`
      },
      emailConfirm: {
        required: 'Please confirm your email address.'
      },
      passwordGroup: {
        match: 'Please make sure the confirmation matches your password.',
      },
      password: {
        required: 'Please enter your chosen password.',
        maxLength: `Your password must contain less than ${this.maxPasswordLength} characters.`,
        pattern: 'Please enter a valid password.'
      },
      passwordConfirm: {
        reequired: 'Please confirm your password.'
      }
    };
    this.msgProcessor = new MessageProcessor(this.validationMessages);
  }

  ngOnInit(): void {

    this.registrationForm = this.formBuilder.group(
      {
        username: ['', [Validators.required, 
                        Validators.minLength(this.minUsernameLength),
                        Validators.maxLength(this.maxUsernameLength), 
                        WhitespaceValidator.removeSpaces]],
        firstName: ['', [ Validators.required, 
                          Validators.minLength(this.minFirstNameLength),
                          Validators.maxLength(this.maxFirstNameLength), 
                          WhitespaceValidator.removeSpaces]],
        lastName: ['', [Validators.required, 
                        Validators.minLength(this.minLastNameLength), 
                        Validators.maxLength(this.maxLastNameLength), 
                        WhitespaceValidator.removeSpaces]],
        emailGroup: this.formBuilder.group(
          {
            email: ['', [ Validators.required, 
                          Validators.email, 
                          Validators.maxLength(this.maxEmailLength), 
                          WhitespaceValidator.removeSpaces]],
            emailConfirm: ['', [Validators.required, 
                                WhitespaceValidator.removeSpaces]]
          }
        ),
        passwordGroup: this.formBuilder.group(
          {
            password: ['', [Validators.required, 
                            Validators.maxLength(this.maxPasswordLength),
                            Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/), 
                            WhitespaceValidator.removeSpaces]],
            passwordConfirm: ['', [ Validators.required, 
                                    WhitespaceValidator.removeSpaces]]
          }
        )
      }
    );
    //add match validator to email form group after registrationForm initialization in order to access child form controls
    const emailFormGroup = this.registrationForm.get('emailGroup');
    emailFormGroup.setValidators(MatchValidator.match(emailFormGroup.get('email'),emailFormGroup.get('emailConfirm')));
    
    //add match validator to password form group after registrationForm initialization in order to access child form controls
    const passwordFormGroup = this.registrationForm.get('passwordGroup');
    passwordFormGroup.setValidators(MatchValidator.match(passwordFormGroup.get('password'),passwordFormGroup.get('passwordConfirm')));
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    // This is required because the valueChanges does not provide notification on blur
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));
    // Merge the blur event observable with the valueChanges observable
    // so we only need to subscribe once.
    merge(this.registrationForm.valueChanges, ...controlBlurs)
      .pipe(
        debounceTime(800))
          .subscribe(() => {
            this.displayMessage = this.msgProcessor.processMessages(this.registrationForm, null);
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

  // method called on click of register button
  // first checks if duplicate user exissts before creating new one
  onSubmit(): void {
    const newUser: User = this.initUser();
    this.userService.checkDuplicateUser(newUser)
      .subscribe({
        next: () => {
          this.userService.createUser(newUser)
            .subscribe({
              next: () => this.onSaveComplete(),
              error: (err: any) => this.errorMessage = err
            })
        },
        error: () => this.duplicateUserAlert = 'This username is already taken. Please use a different one.'
      });
  }
  
  // private method used in onSubmit method
  private initUser(): User {
    return {
      id: null,
      username: this.registrationForm.get('username').value,
      firstName: this.registrationForm.get('firstName').value,
      lastName: this.registrationForm.get('lastName').value,
      email: this.registrationForm.get('emailGroup.email').value,
      password: this.registrationForm.get('passwordGroup.password').value,
    };
  }

  // method called on successful registration
  onSaveComplete(): void {
    this.registrationForm.reset();
    this.router.navigate(['/user-login']);
  }
}
