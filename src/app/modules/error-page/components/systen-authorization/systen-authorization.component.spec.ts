import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystenAuthorizationComponent } from './systen-authorization.component';

describe('SystenAuthorizationComponent', () => {
  let component: SystenAuthorizationComponent;
  let fixture: ComponentFixture<SystenAuthorizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystenAuthorizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystenAuthorizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
