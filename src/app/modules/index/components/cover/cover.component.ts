import { Component, OnInit } from '@angular/core';
import { SoftwareService } from 'app/services/software.service';
import { SectionItemBase } from '../section-item-base';
import { KeyvalueService } from 'app/services/keyvalue.service';
import { DatasetQuery } from 'app/store/dataset.query';
import { DatasetStore } from 'app/store/dataset.store';

@Component({
  selector: 'index-cover',
  templateUrl: './cover.component.html',
  styleUrls: ['./cover.component.scss'],
})
export class CoverComponent extends SectionItemBase implements OnInit {
  constructor(
    private softwareService: SoftwareService,
    private keyvalue: KeyvalueService,
    protected datasetStore: DatasetStore,
    protected datasetQuery: DatasetQuery,
  ) {
    super(datasetStore,datasetQuery);
  }
  more: string;
  ngOnInit() {
    const apps: { app_id: number; show: boolean }[] = this.section.items;
    this.more = `more/${this.keyvalue.add(this.section)}`;

    this.softwareService
      .list({ ids: apps.filter((app) => app.show).map((app) => app.app_id) })
      .then((v) => {
        this.setSofts(v);
      })
      .finally(() => this.loaded.emit(true));
  }
}
