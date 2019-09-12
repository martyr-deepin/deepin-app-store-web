import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { UserComment, CommentsService } from '../../services/comments.service';
import { SoftwareService } from 'app/services/software.service';
import { CommentError } from 'app/modules/details/components/comment/app-comment.component';

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

  constructor(
    private fb: FormBuilder,
    private commentService: CommentsService,
    private softwareService: SoftwareService,
  ) {}

  comment: UserComment;
  CommentError = CommentError;
  error: CommentError;

  commentGroup = this.fb.group({
    content: [],
    score: [],
  });

  ngOnInit() {
    this.commentGroup.valueChanges.subscribe(v => console.log(v));
    this.init();
    this.dialogRef.nativeElement.addEventListener('close', () => {
      this.closed();
    });
  }
  async init() {
    const resp = await this.commentService.get(this.commentID);
    this.comment = resp;
    this.commentGroup.patchValue(this.comment);
    this.dialogRef.nativeElement.showModal();
  }
  closed(changed: boolean = false) {
    this.close.emit(changed);
  }
  async submit() {
    this.commentGroup.markAsDirty();
    const content = this.commentGroup.get('content');
    content.setValue(content.value.trim());
    console.log(this.commentGroup);
    if (content.invalid) {
      this.commentGroup.setErrors({ error: CommentError.CommentInvalid });
      return;
    }
    try {
      await this.commentService.put(this.comment.id, { ...this.commentGroup.value });
      this.closed(true);
    } catch {
      this.commentGroup.setErrors({ error: CommentError.Failed });
    }
  }
  async delete() {
    await this.commentService.delete(this.comment.id);
    this.closed();
  }
}
