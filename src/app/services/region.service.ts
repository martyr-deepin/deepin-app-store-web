import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RegionService {
  constructor(private http: HttpClient) {}
  async region() {
    const resp = await this.http
      .get<Region>('/api/public/region')
      .pipe(timeout(1000))
      .toPromise();
    return resp.code;
  }
}
interface Region {
  ip: string;
  code: string;
}
