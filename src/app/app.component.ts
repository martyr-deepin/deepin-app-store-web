import { Component, OnInit } from '@angular/core';
import { RegionService } from './services/region.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private region: RegionService) {}
  title = 'deepin-appstore-web';
  installing = true;
  ngOnInit() {
    this.init().finally(() => (this.installing = false));
  }
  async init() {
    const code = await this.region.region();
    environment.region = code;
  }
}
