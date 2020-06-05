import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenBoxComponent } from './screen-box.component';

describe('ScreenBoxComponent', () => {
  let component: ScreenBoxComponent;
  let fixture: ComponentFixture<ScreenBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScreenBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreenBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
