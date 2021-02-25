import { TestBed } from '@angular/core/testing';

import { AdvertCheckoutGuard } from './advert-checkout.guard';

describe('AdvertCheckoutGuard', () => {
  let guard: AdvertCheckoutGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AdvertCheckoutGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
