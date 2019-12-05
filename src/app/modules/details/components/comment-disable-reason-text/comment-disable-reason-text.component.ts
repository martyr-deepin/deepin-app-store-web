import { Component, OnInit, Input } from '@angular/core';
import { CommentDisableReason } from '../../services/comment.service';

@Component({
  selector: 'm-comment-disable-reason-text',
  templateUrl: './comment-disable-reason-text.component.html',
  styleUrls: ['./comment-disable-reason-text.component.scss'],
})
export class CommentDisableReasonTextComponent implements OnInit {
  constructor() {}
  readonly CommentDisableReason = CommentDisableReason;
  @Input() reason: CommentDisableReason;
  ngOnInit() {}
}
