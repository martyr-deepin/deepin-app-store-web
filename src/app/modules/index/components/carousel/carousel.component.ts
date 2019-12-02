import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { trigger, transition, animate, keyframes, style, state } from '@angular/animations';
import { Observable, Subject, BehaviorSubject, timer } from 'rxjs';
import { throttleTime, switchMap, map } from 'rxjs/operators';
import { get } from 'lodash';

import { SectionItemBase } from '../section-item-base';
import { SectionService, SectionItem } from '../../services/section.service';
import { SoftwareService } from 'app/services/software.service';
import { KeyvalueService } from 'app/services/keyvalue.service';
import { environment } from 'environments/environment';

const timings = 500;

@Component({
  selector: 'index-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  animations: [
    trigger('carousel', [
      state('left', style({ transform: 'translateX(-101%)' })),
      state('center', style({ transform: 'translateX(0)' })),
      state('right', style({ transform: 'translateX(101%)' })),
      state('hidden', style({ display: 'none' })),
      transition(
        'right => center',
        animate(timings, keyframes([style({ transform: 'translateX(101%)' }), style({ transform: 'translateX(0)' })])),
      ),
      transition(
        'left => center',
        animate(timings, keyframes([style({ transform: 'translateX(-101%)' }), style({ transform: 'translateX(0)' })])),
      ),
      transition('center => right', animate(timings, style({ transform: 'translateX(101%)' }))),
      transition('center => left', animate(timings, style({ transform: 'translateX(-101%)' }))),
      transition(
        'hidden => right',
        animate(
          timings,
          keyframes([
            style({ display: 'block', transform: 'translateX(200%)' }),
            style({ transform: 'translateX(101%)' }),
          ]),
        ),
      ),
      transition(
        'hidden => left',
        animate(
          timings,
          keyframes([
            style({ display: 'block', transform: 'translateX(-200%)' }),
            style({ transform: 'translateX(-101%)' }),
          ]),
        ),
      ),
      transition('left => hidden', animate(timings, style({ transform: 'translateX(-200%)' }))),
      transition('right => hidden', animate(timings, style({ transform: 'translateX(200%)' }))),
    ]),
  ],
})
export class CarouselComponent extends SectionItemBase implements OnInit {
  constructor(
    private router: Router,
    private keyvalue: KeyvalueService,
    private sectionService: SectionService,
    private softwareService: SoftwareService,
    private activeRouter: ActivatedRoute,
  ) {
    super();
    this.imgUrlOrigin = environment.server;
  }
  imgUrlOrigin = '';
  click$ = new BehaviorSubject<string>('');
  carousels: SectionItem[];
  current: Ring<SectionItem>;
  state: { [key: number]: string } = {
    0: 'left',
    1: 'center',
    2: 'right',
  };
  running$: Observable<void>;
  ngOnInit() {
    this.init().finally(() => {
      this.loaded.emit(true);

      this.current = new Ring(this.carousels);
      setTimeout(() => this.move(0));
      this.running$ = this.click$.pipe(
        throttleTime(500),
        map(s => {
          if (!s) {
            return;
          }
          const i = { left: -1, center: 0, right: 1 }[s];
          if (i !== 0) {
            this.move(i);
            return;
          }
          const c = this.current.value();

          if (c.type === 'app') {
            this.router.navigate(['app/', c.app_id], { relativeTo: this.activeRouter });
          } else {
            const topicIndex = c.topic_index.split('-').map(Number);
            const globalSection = this.sectionService.globalSection as SectionItem[];
            const topicData = globalSection[topicIndex[0]].items[topicIndex[1]];
            console.log(topicData);
            // console.log(topic);
            // this.sectionService.getList().then(list => {
            //   const topic = get(list, [sindex, 'items', tindex]);
            //   if (!topic) {
            //     this.router.navigate(['app', Math.random()]);
            //     return;
            //   }

            this.router.navigate(['topic', this.keyvalue.add(topicData)], { relativeTo: this.activeRouter });
            // });
          }
        }),
        switchMap(() => {
          return timer(3000, 3000).pipe(map(() => this.move(1)));
        }),
      );
    });
  }
  // filter soft
  async init() {
    this.carousels = (this.section.items as SectionItem[]) || [];
    if (this.carousels.length === 0) {
      return;
    }
    this.carousels = this.carousels.filter(c => c.show);
    //标记app:现已从number改为string
    // const names = this.carousels.filter(c => c.type === CarouselType.Topic).map(c => c.app_id);
    const ids = this.carousels.filter(c => c.type === 'app').map(c => c.app_id);
    const softs = await this.softwareService.list({ ids });
    this.carousels = this.carousels.filter(c => {
      //CarouselType.Topic改为字符串
      //   if (c.type === CarouselType.Topic) {
      if (c.type === 'Topic') {
        return true;
      }
      return softs.some(soft => soft.id === c.app_id);
    });
    if (!this.carousels || this.carousels.length === 0) {
      this.carousels = [];
      return;
    }
    while (this.carousels.length < 5) {
      this.carousels = [...this.carousels, ...this.carousels];
    }
  }
  async goto(index: number) {
    const left = [];
    for (let c = this.current; c.index !== index; c = c.prev()) {
      left.push(-1);
    }
    const right = [];
    for (let c = this.current; c.index !== index; c = c.next()) {
      right.push(1);
    }
    const sorttest = [right, left].sort((a, b) => a.length - b.length)[0];
    for (const i of sorttest) {
      this.move(i);
      this.click$.next('');
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  // move image (-1,1)
  move(i: number) {
    switch (i) {
      case -1:
        this.current = this.current.prev();
        break;
      case 1:
        this.current = this.current.next();
        break;
    }
    this.state = {
      [this.current.prev().index]: 'left',
      [this.current.index]: 'center',
      [this.current.next().index]: 'right',
    };
  }
}

class Ring<T> {
  constructor(private data: Array<T>, public readonly index = 0) {}
  prev() {
    const p = this.index <= 0 ? this.data.length - 1 : this.index - 1;
    return new Ring(this.data, p);
  }
  next() {
    const n = this.index >= this.data.length - 1 ? 0 : this.index + 1;
    return new Ring(this.data, n);
  }
  value() {
    return this.data[this.index];
  }
}
interface Seciton {
  x: number;
  y: number;
  cols: number;
  name: Name[];
  rows: number;
  type: number;
  items: Item[];
  width: number;
  height: number;
}

interface Item {
  show: boolean;
  type: string;
  image: string[];
  app_id: number;
  topic_index?: any;
}

interface Name {
  name: string;
  language: string;
}
