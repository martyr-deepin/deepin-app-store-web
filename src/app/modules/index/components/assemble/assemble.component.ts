import { Component, OnInit } from '@angular/core';
import { SectionItemBase } from '../section-item-base';
import { SectionAssemble, Section, SectionItem } from '../../services/section.service';
import { Software, SoftwareService } from 'app/services/software.service';

@Component({
  selector: 'index-assemble',
  templateUrl: './assemble.component.html',
  styleUrls: ['./assemble.component.scss'],
})
export class AssembleComponent extends SectionItemBase implements OnInit {
  constructor(private softwareService: SoftwareService) {
    super();
  }
  assembles: SectionItem[];
  softs = new Map<string, Promise<Software[]>>();
  assembleSection;
  ngOnInit() {
    this.assembleSection = this.section;
    console.log(this.section, '分类secation');
    this.assembles = (this.section.items as SectionItem[]).filter(a => a.show);

    this.assembles.forEach(assemble => {
      let isShowIitem = assemble.items.filter(v => v.show);
      const softs$ = this.softwareService.list({ ids: isShowIitem.map(app => app.app_id) });
      this.softs.set(assemble.category, softs$);
    });
    this.wait().finally(() => this.loaded.emit(true));
  }
  async wait() {
    for (const p of this.softs.values()) {
      await p;
    }
  }
}
