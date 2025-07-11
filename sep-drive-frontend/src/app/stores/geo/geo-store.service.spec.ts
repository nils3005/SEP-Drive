import { TestBed } from '@angular/core/testing';

import { GeoStoreService } from './geo-store.service';

describe('GeoStoreService', () => {
  let service: GeoStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeoStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
