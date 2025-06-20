import { TestBed } from '@angular/core/testing';

import { RideofferService } from './rideoffer.service';

describe('RideofferService', () => {
  let service: RideofferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RideofferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
