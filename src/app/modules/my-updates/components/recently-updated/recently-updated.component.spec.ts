import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentlyUpdatedComponent } from './recently-updated.component';

describe('RecentlyUpdatedComponent', () => {
  let component: RecentlyUpdatedComponent;
  let fixture: ComponentFixture<RecentlyUpdatedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecentlyUpdatedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentlyUpdatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
