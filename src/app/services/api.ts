import { HttpClient } from '@angular/common/http';

export class APIBase<RModel, WModel = RModel> {
  constructor(private _http: HttpClient, private api: string) {}
  async list(opt: ListOption = {}) {
    const resp = await this._http
      .get<RModel[]>(this.api, { observe: 'response', params: opt as any })
      .toPromise();
    return { items: resp.body, count: Number(resp.headers.get('X-Total-Count')) };
  }
  get(id: number) {
    return this._http.get<RModel>(this.api + '/' + id).toPromise();
  }
  post(v: Partial<WModel>) {
    return this._http.post<RModel>(this.api, v).toPromise();
  }
  patch(id: number, v: Partial<RModel>) {
    return this._http.patch<void>(this.api + '/' + id, v).toPromise();
  }
  put(id: number, v: Partial<RModel>) {
    return this._http.put<void>(this.api + '/' + id, v).toPromise();
  }
  delete(id: number) {
    return this._http.delete(this.api + '/' + id).toPromise();
  }
}
export interface ListOption {
  offset?: number;
  limit?: number;
}
