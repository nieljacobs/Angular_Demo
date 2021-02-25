import { TestBed } from '@angular/core/testing';

import { AdvertListGuard } from './advert-list.guard';

describe('AdvertListGuard', () => {
  let guard: AdvertListGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AdvertListGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
