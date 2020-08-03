import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'environments/environment';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SectionService {
  url = `/api/public/section`;
  public globalSection;
  private list = this.http.get(this.url).pipe(
    map((v) => {
      // 初始化空仓
      if (v === null) {
        return of(undefined);
      }
      let dataList = this.handleData(v);
      dataList.section.dataset.sort((a, b) => {
        return a.y - b.y;
      });
      //排序不能删除
      return dataList;
    }),
  );
  constructor(private http: HttpClient) {
    // this.http.get('/api/public/section').toPromise();
  }
  async getList() {
    return await this.list.toPromise();
  }
  handleData(data: any) {
    //console.log(data)
    let tmp = [];
    if (navigator) {
      environment.store_env.language = navigator.language.replace('-', '_');
    }
    const languages = [data.section.language.default, environment.store_env.language];
    for (let i = 0; i < data.section.dataset.length; i++) {
      let item = data.section.dataset[i];
      let params = {
        x: item.x,
        y: item.y,
        cols: item.cols,
        rows: item.rows,
        name: this.getValue(item.name, languages)[0].name,
        // name: item.name.find(v => v.language === environment.store_env.language).name,
        type: item.type,
        width: item.width,
        height: item.height,
        items: item.items,
      } as any;

      if (item.type === 5) {
        params.items.name = this.getValue(item.name, languages)[0];
      }
      //；轮播图、背景图、热门专题图

      params.items = params.items.map((v) => {
        if (v.image) {
          v.image = this.fitImage(v.image);
        }
        if (v.cover) {
          v.cover = this.fitImage(v.cover);
        }
        if (v.background_image) {
          v.background_image = this.fitImage(v.background_image);
        }
        if (v.name) {
          v.name = this.getValue(v.name, languages)[0].name;
          // v.name = v.name.find(v => v.language === environment.locale).name;
        }
        if (v.phrase) {
          v.phrase = this.getValue(v.phrase, languages)[0].phrase;
          // v.phrase = v.phrase.find(v => v.language === environment.locale).phrase;
        }
        return v;
      });

      tmp.push(params);
    }

    let tmpHandleData = { section: { dataset: tmp } };
    //存一份所有数据
    this.globalSection = tmpHandleData.section.dataset;
    return tmpHandleData;
  }
  getValue(dataItem, languagesArr) {
    return dataItem.sort((a, b) => languagesArr.indexOf(b.language) - languagesArr.indexOf(a.language));
  }
  fitImage(value: string[]) {
    if (!Array.isArray(value)) {
      return value;
    }
    if (devicePixelRatio > 1) {
      value.reverse();
    }
    return value.filter(Boolean).map((v) => environment.server + '/api/public/blob/' + v)[0];
  }
}

export enum SectionType {
  Carousel,
  Cover,
  Phrase,
  Ranking,
  Category,
  Topic,
}
export const SectionTypeString = {
  [SectionType.Carousel]: '轮播图',
  [SectionType.Cover]: '大图展示',
  [SectionType.Phrase]: '装机必备',
  [SectionType.Ranking]: '排行展示',
  [SectionType.Category]: '大小图组合竖排展示',
  [SectionType.Topic]: '专题展示',
};
export class SectionRanking {
  category = '';
  count = 10;
}
export class Section {
  type: SectionType = SectionType.Carousel;
  title: string[] = ['新建栏目', ''];
  cols = 1;
  rows = 1;
  show = true;
  more = true;
  items = [];
  ranking: SectionRanking = new SectionRanking();
  name: [];
}

export class SectionApp {
  name = '';
  show = true;
}

export enum CarouselType {
  App,
  Topic = 1,
}
export class SectionCarousel {
  type = CarouselType.App;
  link = '';
  images = [];
  show = true;
}

export class SectionPhrase extends SectionApp {
  phrases: string[] = ['', ''];
}

export class SectionTopic {
  name: string[] = ['', ''];
  show = true;
  cover = '';
  coverHD = '';
  backgroundImage = '';
  backgroundImageHD = '';
  backgroundColor = '';
  nameColor = '';
  subTitleColor: '';
  apps: SectionApp[] = [];
}

export class SectionAssemble {
  category = '';
  show = true;
  apps: SectionApp[] = [];
}

export class SectionList {
  x = 0;
  y = 0;
  cols = 0;
  name = '';
  rows = 0;
  type = 0;
  items = [];
  width = 0;
  height = 0;
}

export class SectionItem {
  show = false;
  type = '';
  image = [];
  app_id = 0;
  topic_index = null;
  category? = 'null';
  items? = [];
}
export class SectionTopicItem {
  name = [{ name: '', language: '' }];
  show = true;
  cover = ['', ''];
  items = [{ show: true, app_id: 0 }];
  title_color = '#f8e71c';
  subtitle_color = '#417505';
  background_color = '#7ed321';
  background_image = ['', ''];
}
