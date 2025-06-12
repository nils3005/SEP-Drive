import { TestBed } from '@angular/core/testing';

import { RideSimulationStoreService } from './ride-simulation-store.service';

describe('RideSimulationStoreService', () => {
  let service: RideSimulationStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RideSimulationStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
