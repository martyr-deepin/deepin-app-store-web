import { Component, OnInit } from '@angular/core';
import { Section, SectionApp } from '../../services/section.service';
import { SoftwareService, Software } from 'app/services/software.service';
import { SectionItemBase } from '../section-item-base';
import { KeyvalueService } from 'app/services/keyvalue.service';

@Component({
  selector: 'index-cover',
  templateUrl: './cover.component.html',
  styleUrls: ['./cover.component.scss'],
})
export class CoverComponent extends SectionItemBase implements OnInit {
  constructor(private softwareService: SoftwareService, private keyvalue: KeyvalueService) {
    super();
  }
  more: string;
  ngOnInit() {
    const apps: { app_id: number; show: boolean }[] = this.section.items;
    this.more = `more/${this.keyvalue.add(this.section)}`;
    this.softs$ = this.softwareService
      .list({ ids: apps.filter(app => app.show).map(app => app.app_id) })
      .then(data => {
        return data;
      })
      .finally(() => this.loaded.emit(true));
  }
}
