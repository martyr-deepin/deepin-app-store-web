import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreDetailComponent } from './pre-detail.component';

describe('PreDetailComponent', () => {
  let component: PreDetailComponent;
  let fixture: ComponentFixture<PreDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
