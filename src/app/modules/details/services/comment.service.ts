import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import * as _ from 'lodash';
import { map, first, switchMap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { AuthService } from 'app/services/auth.service';
import { APIBase, ListOption } from 'app/services/api';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private server = environment.operationServer;
  sourceCount$ = new Subject<any>();
  constructor(private http: HttpClient, private auth: AuthService) {}
  publicAPI(app_id: number) {
    interface CommentListOption extends ListOption {
      version?: string;
      exclude_version?: string;
      top?: boolean;
    }
    class CommentAPI extends APIBase<AppComment> {
      list(opt: CommentListOption) {
        return super.list(opt);
      }
    }
    return new CommentAPI(this.http, `/api/public/app/${app_id}/comment`);
  }
  userAPI(app_id: number) {
    interface CommentListOption extends ListOption {
      app_id?: number;
      version?: string;
      exclude_version?: string;
    }
    class UserCommentAPI extends APIBase<AppComment> {
      list(opt: CommentListOption) {
        return super.list(opt);
      }
    }
    return new UserCommentAPI(this.http, `/api/user/comment`);
  }
  like(cid: number) {
    return this.http.post(`/api/user/comment/${cid}/like`, null);
  }
  dislike(cid: number) {
    return this.http.delete(`/api/user/comment/${cid}/like`);
  }
}

export interface AppComment {
  id: number;
  created_at: string;
  commenter: number;
  content: string;
  score: number;
  app_id: number;
  app_version: string;
  tags?: { tag: string }[];
  likes?: { liker: number }[];
  reply?: any;

  isHot?: boolean;
}
