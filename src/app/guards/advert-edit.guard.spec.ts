import { TestBed } from '@angular/core/testing';

import { AdvertEditGuard } from './advert-edit.guard';

describe('AdvertEditGuard', () => {
  let guard: AdvertEditGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AdvertEditGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
