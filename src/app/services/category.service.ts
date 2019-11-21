import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { map } from 'rxjs/operators';

import { APIBase } from './api';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private http: HttpClient) {}
  private category$ = this.http.get<CategoryJSON[]>('/api/public/category').pipe(
    map(list => {
      const m = new Map<string, string>();
      const languages = [environment.locale];
      list.forEach(category => {
        const localeName = category.locale_names.sort(
          (a, b) => languages.indexOf(b.language) - languages.indexOf(a.language),
        )[0];
        m.set(category.name, localeName.name);
      });
      return m;
    }),
  );
  categoryLocaleName(categoryCode: string) {
    return this.category$.pipe(map(m => m.get(categoryCode))).toPromise();
  }
}
interface CategoryJSON {
  name: string;
  icon: string;
  icon_active: string;
  locale_names: LocaleName[];
  LocaleGroupID: string;
}

interface LocaleName {
  name: string;
  language: string;
}
