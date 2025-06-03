import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrivinghistoryComponent } from './drivinghistory.component';

describe('DrivinghistoryComponent', () => {
  let component: DrivinghistoryComponent;
  let fixture: ComponentFixture<DrivinghistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrivinghistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrivinghistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
