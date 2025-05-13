import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideRequestSummaryComponent } from './ride-request-summary.component';

describe('RideRequestSummaryComponent', () => {
  let component: RideRequestSummaryComponent;
  let fixture: ComponentFixture<RideRequestSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideRequestSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideRequestSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
