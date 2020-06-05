import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewableComponent } from './renewable.component';

describe('RenewableComponent', () => {
  let component: RenewableComponent;
  let fixture: ComponentFixture<RenewableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RenewableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenewableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
