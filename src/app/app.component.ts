import { Component, OnInit } from '@angular/core';
import { environment } from 'environments/environment';
import { first, filter } from 'rxjs/operators';

import { RegionService } from './services/region.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private region: RegionService, private auth: AuthService) {}
  title = 'deepin-app-store-web';
  installing = true;
  ngOnInit() {
    this.init().finally(() => (this.installing = false));
  }
  async init() {
    const info = await this.auth.info$
      .pipe(
        filter(v => v !== undefined),
        first(),
      )
      .toPromise();
    if (info) {
      environment.store_env.region = info.region;
    } else {
      const code = await this.region.region();
      environment.store_env.region = code;
    }
  }
}
