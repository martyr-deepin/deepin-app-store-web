import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AgreementService {
  constructor(private http: HttpClient) {}
  private readonly baseURL = environment.operationServer + '/api/blob';
  async privacy() {
    const getUrl = await this.http.get<{ agreement: string }>('/api/public/links').toPromise();
    return this.http.get(getUrl.agreement, { responseType: 'text' }).toPromise();
  }
  donation() {
    return this.http
      .get<Agreement>(this.baseURL + '/donation')
      .pipe(
        switchMap(agreement => fetch(agreement[environment.locale] || agreement['en_US']).then(resp => resp.text())),
      );
  }
}

interface Agreement {
  [key: string]: string;
}
