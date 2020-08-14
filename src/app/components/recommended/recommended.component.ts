import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { LayerComponent } from 'app/modules/share/components/layer/layer.component';
import { StorageKey } from 'app/services/storage.service';
import { chunk } from 'lodash';
import { SoftwareService, Software } from 'app/services/software.service';

@Component({
  selector: 'dstore-recommended',
  templateUrl: './recommended.component.html',
  styleUrls: ['./recommended.component.scss'],
})
export class RecommendedComponent implements OnInit, AfterViewInit {
  @ViewChild('dstoreLayer')
  commentRef: LayerComponent;

  @Input()
  ids: string;

  list: RecommendedInfo[] = [];

  constructor(private softwareService: SoftwareService) {}

  ngAfterViewInit(): void {
    this.init();
  }

  ngOnInit(): void {}

  //加载全部应用
  async init() {
    const ids = this.ids;
    if (ids) {
      //显示弹窗
      setTimeout(() => {
        this.commentRef.show();
      }, 100);
      const idarr = ids.split(/[\r\n]/g).map((m) => m.substr(0, m.length - 1));
      const allIds = idarr[1]?.split(';').map((id) => parseInt(id));
      const checkedIds = idarr[0]?.split(';').map((id) => parseInt(id));
      let idList = chunk(allIds, 20) || [];
      for (let index in idList) {
        let param = idList[index];
        let apps = await this.softwareService.list({ ids: param });
        let arr = apps.map((s) => {
          let disabled = !(s.package?.localVersion === '');
          return {
            soft: s,
            checked: checkedIds.includes(s.id) || disabled,
            disabled: disabled,
          } as RecommendedInfo;
        });
        this.list.push(...arr);
      }
      this.isAllChecked();
    }
  }


  mixed = false;
  allChecked = false;

  isAllChecked() {
    const list = this.list.filter((item) => !item.disabled);
    let length = list.filter((item) => !item.checked).length;
    if (length > 0 && length < list.length) {
      let st = setTimeout(() => {
        this.allChecked = false;
        this.mixed = true;
        clearTimeout(st);
      });
    } else {
      let st = setTimeout(() => {
        this.allChecked = false;
        this.mixed = false;
        clearTimeout(st);
      });
    }
    if (length === 0) {
      let st = setTimeout(() => {
        this.allChecked = true;
        clearTimeout(st);
      });
    }
  }

  checkChange() {
    this.isAllChecked();
  }

  change(event: MouseEvent) {
    let checked = (<HTMLInputElement>event.target)?.checked;
    if (checked) {
      this.list.map((item) => {
        item.checked = true;
      });
    } else {
      this.list.map((item) => {
        if (!item.disabled) {
          item.checked = false;
        }
      });
    }
    this.isAllChecked();
  }

  installAll() {
    const softs = this.list.filter((item) => !item.disabled && item.checked).map((item) => item.soft);
    this.softwareService.install(...softs);
    this.close()
  }

  close(){
    this.commentRef.close();
    localStorage.removeItem(StorageKey.recommendedIds);
  }
}

export interface RecommendedInfo {
  disabled: boolean;
  soft: Software;
  checked: boolean;
}
