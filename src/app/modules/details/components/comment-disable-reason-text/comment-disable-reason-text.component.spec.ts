import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentDisableReasonTextComponent } from './comment-disable-reason-text.component';

describe('CommentDisableReasonTextComponent', () => {
  let component: CommentDisableReasonTextComponent;
  let fixture: ComponentFixture<CommentDisableReasonTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentDisableReasonTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentDisableReasonTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
