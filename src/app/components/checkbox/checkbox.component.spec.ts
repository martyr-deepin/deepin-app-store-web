import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenCheckboxComponent } from './checkbox.component';

describe('CheckBoxComponent', () => {
  let component: ScreenCheckboxComponent;
  let fixture: ComponentFixture<ScreenCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScreenCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreenCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
