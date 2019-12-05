import { Component, OnInit, HostBinding } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first, switchMap } from 'rxjs/operators';
import { KeyvalueService } from 'app/services/keyvalue.service';
import { Section, SectionApp, SectionTopicItem } from '../../services/section.service';
import { SoftwareService, Software } from 'app/services/software.service';
import { SectionItemBase } from '../section-item-base';

@Component({
  selector: 'dstore-topic-detail',
  templateUrl: './topic-detail.component.html',
  styleUrls: ['./topic-detail.component.scss'],
})
export class TopicDetailComponent extends SectionItemBase implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private keyvalue: KeyvalueService,
    private softwareService: SoftwareService,
  ) {
    super();
  }
  @HostBinding('style.background-color') bgColor: string;
  section$ = this.route.paramMap
    .pipe(first())
    .toPromise()
    .then(param => param.get('key'))
    .then(key => this.keyvalue.get<SectionTopicItem>(key))
    .then(data => {
      if (data.items.length === 0 || !data.items.find(v => v.show)) {
        return null;
      } else {
        return data;
      }
    });
  softs$ = this.section$.then(section => {
    if (!section) {
      return null;
    }
    this.bgColor = section.background_color;
    return this.softwareService
      .list({ ids: section.items.filter(app => app.show).map(app => app.app_id) })
      .then(data => {
        return data;
      });
  });
  ngOnInit() {}
}
