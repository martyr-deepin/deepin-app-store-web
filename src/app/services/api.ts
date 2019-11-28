import { HttpClient, HttpParams, HttpParameterCodec } from '@angular/common/http';
export class APIBase<RModel, WModel = RModel> {
  constructor(private _http: HttpClient, private api: string) {}
  private encoder = new CustomEncoder();
  async list(opt: ListOption = {}) {
    const resp = await this._http
      .get<RModel[]>(this.api, {
        observe: 'response',
        params: new HttpParams({ fromObject: opt as any, encoder: this.encoder }),
      })
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
class CustomEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}
