import { Component, OnInit } from '@angular/core';
import { SectionItemBase } from '../section-item-base';
import { SectionTopicItem } from '../../services/section.service';
import { KeyvalueService } from 'app/services/keyvalue.service';
import { DatasetStore } from 'app/store/dataset.store';
import { DatasetQuery } from 'app/store/dataset.query';

@Component({
  selector: 'index-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss'],
})
export class TopicComponent extends SectionItemBase implements OnInit {
  constructor(private keyvalue: KeyvalueService, protected datasetStore: DatasetStore, protected datasetQuery: DatasetQuery) {
    super(datasetStore,datasetQuery);
  }
  ids = new Map<number, string>();
  topics: SectionTopicItem[];
  ngOnInit() {
    this.loaded.emit(true);
    this.topics = (this.section.items as SectionTopicItem[])
      .filter((topic) => topic.show)
      .map((topic, index) => {
        const id = this.keyvalue.add(topic);

        this.ids.set(index, id);

        return topic;
      });
  }
}
