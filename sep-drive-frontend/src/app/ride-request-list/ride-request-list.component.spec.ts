import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideRequestListComponent } from './ride-request-list.component';

describe('RideRequestListComponent', () => {
  let component: RideRequestListComponent;
  let fixture: ComponentFixture<RideRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideRequestListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
