import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupercodeComponent } from './supercode.component';

describe('SupercodeComponent', () => {
  let component: SupercodeComponent;
  let fixture: ComponentFixture<SupercodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupercodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupercodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
