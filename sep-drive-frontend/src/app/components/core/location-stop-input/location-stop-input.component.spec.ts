import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationStopInputComponent } from './location-stop-input.component';

describe('LocationStopInputComponent', () => {
  let component: LocationStopInputComponent;
  let fixture: ComponentFixture<LocationStopInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationStopInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationStopInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
