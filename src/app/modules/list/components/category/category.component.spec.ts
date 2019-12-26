import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCategory } from './category.component';

describe('RefundReasonComponent', () => {
  let component: ListCategory;
  let fixture: ComponentFixture<ListCategory>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListCategory ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
