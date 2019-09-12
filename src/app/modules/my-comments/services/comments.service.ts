import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { Software, SoftwareService } from 'app/services/software.service';
import { APIBase, ListOption } from 'app/services/api';

@Injectable({
  providedIn: 'root',
})
export class CommentsService extends APIBase<UserComment> {
  constructor(private http: HttpClient, private softService: SoftwareService) {
    super(http, '/api/user/comment');
  }
  async list(opt: ListOption) {
    const resp = await super.list(opt);
    const softs = await this.softService.list({ ids: resp.items.map(c => c.app_id), active: '' });
    resp.items.forEach(c => {
      c.soft = softs.find(soft => soft.id === c.app_id);
    });
    return resp;
  }
  async get(id: number) {
    const resp = await super.get(id);
    const softs = await this.softService.list({ ids: [resp.app_id], active: '' });
    resp.soft = softs[0];
    return resp;
  }
}

export interface UserComment {
  id: number;
  created_at: Date;
  updated_at: Date;
  commenter: number;
  content: string;
  score: number;
  app_id: number;
  app_version: string;
  tags?: string[];
  likes?: { liker: number }[];
  reply?: any;

  isHot?: boolean;
  soft: Software;
}
