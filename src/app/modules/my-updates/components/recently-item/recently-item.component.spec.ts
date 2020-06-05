import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentlyItemComponent } from './recently-item.component';

describe('RecentlyItemComponent', () => {
  let component: RecentlyItemComponent;
  let fixture: ComponentFixture<RecentlyItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecentlyItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentlyItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
