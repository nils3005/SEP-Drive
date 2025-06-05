import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideoffersComponent } from './rideoffers.component';

describe('RideoffersComponent', () => {
  let component: RideoffersComponent;
  let fixture: ComponentFixture<RideoffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideoffersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideoffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
