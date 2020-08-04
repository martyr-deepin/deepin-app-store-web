import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { UserComment, CommentsService } from '../../services/comments.service';
import { CommentError } from 'app/modules/details/services/comment.service';

@Component({
  selector: 'dstore-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
  @ViewChild('dialog', { static: true })
  dialogRef: ElementRef<HTMLDialogElement>;

  @Input()
  commentID: number;
  @Output() close = new EventEmitter<boolean>();

  deleteConfirm = false;

  constructor(private fb: FormBuilder, private commentService: CommentsService) {}

  comment: UserComment;
  CommentError = CommentError;
  error: CommentError;

  commentGroup = this.fb.group({
    content: [],
    score: [],
  });

  ngOnInit() {
    //this.commentGroup.valueChanges.subscribe(v => console.log(v));
    this.init();
    this.dialogRef.nativeElement.addEventListener('close', () => {
      this.closed();
    });
  }
  init() {
    this.commentService.get(this.commentID).then((resp) => {
      this.comment = resp;
      this.commentGroup.patchValue(this.comment);
      this.dialogRef.nativeElement.showModal();
    });
  }
  closed(changed: boolean = false) {
    this.close.emit(changed);
  }
  submit() {
    this.commentGroup.markAsDirty();
    const content = this.commentGroup.get('content');
    content.setValue(content.value.trim());

    if (content.invalid) {
      //console.log(this.commentGroup);
      this.commentGroup.setErrors({ error: CommentError.CommentInvalid });
      return;
    }
    try {
      this.commentService.put(this.comment.id, { ...this.commentGroup.value })
      .then(res=>{
        this.closed(true);
      });
    } catch {
      this.commentGroup.setErrors({ error: CommentError.Failed });
    }
  }
  delete() {
    this.commentService.delete(this.comment.id).then(res=>{
      this.closed(true);
    });
  }
}
