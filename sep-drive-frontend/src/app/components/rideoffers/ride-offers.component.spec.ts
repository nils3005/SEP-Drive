import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideOffersComponent } from './ride-offers.component';

describe('RideoffersComponent', () => {
  let component: RideOffersComponent;
  let fixture: ComponentFixture<RideOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideOffersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
