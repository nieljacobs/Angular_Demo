import { Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { fromEvent, merge, Observable, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { Advert } from '../models/advert';
import { User } from '../models/user';
import { AdvertService } from '../services/advert.service';
import { AuthenticationService } from '../services/authentication.service';
import { MessageProcessor } from '../utils/message-processor.util';
import { NumberValidators } from '../validators/number.validator';

function getNewDate(): string {
  const dateObj: Date = new Date();
  const month: number = dateObj.getUTCMonth() + 1; //months from 1-12
  const day: number = dateObj.getUTCDate();
  const year: number = dateObj.getUTCFullYear();
  const newDate: string = year + "/" + month + "/" + day;
  return newDate;
}

@Component({
  selector: 'app-advert-edit',
  templateUrl: './advert-edit.component.html',
  styleUrls: ['./advert-edit.component.css']
})
export class AdvertEditComponent implements OnInit {
  
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  // view properties
  pageTitle: string;
  errorMessage: string;
  displayMessage: { [key: string]: string }
  advertForm: FormGroup;

  // validation properties
  private minHeaderLength: number;
  private maxHeaderLength: number;
  private maxDescriptionLength: number;
  private minPriceRange: number;
  private maxPriceRange: number;

  private advert: Advert;
  private validationMessages: { [key: string]: { [key: string]: string } };
  private msgProcessor: MessageProcessor;
  private sub: Subscription;
  private currentUser: User;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private adService: AdvertService,
              private authService: AuthenticationService) {

    this.pageTitle = '';
    this.errorMessage = '';
    this.displayMessage = {}
    this.minHeaderLength = 20;
    this.maxHeaderLength = 120;
    this.maxDescriptionLength = 500;
    this.minPriceRange = 1;
    this.maxPriceRange = 99999;
    
    this.validationMessages = {
      header: {
        required: 'Please enter an advert heading.',
        minlength: `The advert header must contain at least ${this.minHeaderLength} characters.`,
        maxlength: `The advert header must contain less than ${this.maxHeaderLength} characters.`
      },
      description: {
        maxlength: `The description must contain less than ${this.maxDescriptionLength} characters.`,
      },
      price: {
        required: 'Please enter a price.',
        min: `The price must be at least R${this.minPriceRange}`,
        max: `The price can't exceed R${this.maxPriceRange}`
      }
    };
    this.msgProcessor = new MessageProcessor(this.validationMessages);
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit(): void {
    this.advertForm = this.formBuilder.group({
      header: ['', [Validators.required, 
                    Validators.minLength(this.minHeaderLength), 
                    Validators.maxLength(this.maxHeaderLength)]],
      description: ['', [Validators.maxLength(this.maxDescriptionLength)]],
      price: ['',  [Validators.required, 
                    Validators.min(this.minPriceRange), 
                    Validators.max(this.maxPriceRange)]],
    });

    // Read the product Id from the route parameter
    this.sub = this.route.paramMap.subscribe(
      params => {
        const id = +params.get('id');
        this.getAdvert(id);
      }
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    // This is required because the valueChanges does not provide notification on blur
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));
    // Merge the blur event observable with the valueChanges observable
    // so we only need to subscribe once.
    merge(this.advertForm.valueChanges, ...controlBlurs)
      .pipe(debounceTime(800))
        .subscribe(() => {
          this.displayMessage = this.msgProcessor.processMessages(this.advertForm, null);
        });
  }

  getAdvert(id: number): void {
    if (id === 0) {
      const newAdvert = this.initAdvert();
      this.displayAdvert(newAdvert)
    } else {
      this.adService.getAdvert(id)
      .subscribe({
        next: (advert: Advert) => this.displayAdvert(advert),
        error: (err: any) => this.errorMessage = err
      });
    }
  }

  displayAdvert(advert: Advert): void {
    if (this.advertForm) {
      this.advertForm.reset();
    }
    this.advert = advert;

    if (this.advert.id === 0) {
      this.pageTitle = 'Add Advert';
    } else {
      this.pageTitle = 'Edit Advert';
    }

    // Update the data on the form
    this.advertForm.patchValue({
      header: this.advert.header,
      description: this.advert.description,
      price: this.advert.price,
    });
  }

  deleteAdvert(): void {
    if (this.advert.id === 0) {
      // Don't delete, it was never saved.
      this.onSaveComplete();
    } else {
      if (confirm('Are you sure you want to delete this advert?')) {
        this.adService.deleteAdvert(this.advert.id)
          .subscribe({
            next: () => this.onSaveComplete(),
            error: (err: any) => this.errorMessage = err
          });
      }
    }
  }

  onSubmit(): void {
    if (this.advertForm.dirty) {
      const advert = { ...this.advert, ...this.advertForm.value };
      
      if (advert.id === 0) {
        advert.date = getNewDate(); // set date property to current date
        this.adService.createAdvert(advert)
          .subscribe({
            next: () => this.onSaveComplete(),
            error: (err: any) => this.errorMessage = err
          });
        
      } else {
        this.adService.updateAdvert(advert)
          .subscribe({
            next: () => this.onSaveComplete(),
            error: (err: any) => this.errorMessage = err
          });
      }
    } else {
      this.onSaveComplete();
    }
  }

  private onSaveComplete(): void {
    // Reset the form to clear the flags
    this.advertForm.reset();
    this.router.navigate(['/advert-list', 'my-adverts']);
  }

  // private method to initiate new advert used in onSubmit method
  private initAdvert(): Advert {
    return {
      id: 0,
      header: null,
      description: null,
      price: null,
      date: null,
      ownerId: this.currentUser.id
    };
  }
}
