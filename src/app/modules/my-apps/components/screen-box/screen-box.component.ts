import { Component, OnInit } from '@angular/core';
import { cloneDeep } from 'lodash';
import { CheckboxType, CheckboxConfig } from './components/checkbox/checkbox.component';
import { LocalAppService, ScreenBoxKeys } from '../../services/local-app.service';
import { map, first } from 'rxjs/operators';
import { CategoryType } from 'app/services/category.service';
import { Router } from '@angular/router';

@Component({
  selector: 'screen-box',
  templateUrl: './screen-box.component.html',
  styleUrls: ['./screen-box.component.scss']
})
export class ScreenBoxComponent implements OnInit {

  constructor(
    private service:LocalAppService,
    private router: Router
  ) { }

  CheckboxType = CheckboxType;

  private defaultDatas:CheckboxConfig[] = [
    {value:ScreenBoxKeys.lowScore,label: ScreenBoxKeys.lowScore},
    {value:ScreenBoxKeys.freeApp,label: ScreenBoxKeys.freeApp},
    {value:ScreenBoxKeys.paidApp,label: ScreenBoxKeys.paidApp}
  ]

  checkboxList = cloneDeep(this.defaultDatas);

  checkedList:boolean[] = []

  allChecked:boolean = false;

  allCheckConfig:CheckboxConfig = {value:ScreenBoxKeys.all,label:ScreenBoxKeys.all}

  allCheckChange(event:boolean) {
    let empty = new Array(this.checkboxList.length).fill(false)
    if(event) {
      empty = empty.map(()=>true)
      this.allCheckConfig.mixed = false;
    }
    this.checkedList = empty
  }

  itemCheckChange(event:boolean[]) {
    let length = event.filter(item=>item).length;
    if(length>0 && length < this.checkboxList.length) {
      this.allCheckConfig.mixed = true;
      this.allChecked = false;
    }
    if(length === 0) {
      this.allCheckConfig.mixed = false;
      this.allChecked = false;
    }
    if(length === this.checkboxList.length) {
      this.allCheckConfig.mixed = false;
      this.allChecked = true;
    }
  }


  ngOnInit(): void {
    //this.softs$.pipe(first()).subscribe();
  }

  searchName=""

  confirm(){
    this.service.query.name = this.searchName
    this.service.query.check = this.checkboxList.filter((item,index)=>this.checkedList[index]).map(item=>item.value)
    this.router.navigate([], { queryParams: { page: 0, timestamp:new Date().getTime() } });
    //this.checkedList = this.checkedList.map(item=>false)
  }

  appLength$ = this.service.installedSofts$.pipe(
    map(apps => {
      return apps.length
    })
  );
  //从已下载应用中获取分类
  checkboxList$ = this.service.installedSofts$.pipe(
    first(),
    map(apps => {
      for(var key in CategoryType) {
        let categorys = apps.filter(item => item.software?.info.category === CategoryType[key].toLowerCase())
        if(categorys.length>0) {
          this.checkboxList.push({label:CategoryType[key],value:CategoryType[key],data1:categorys.length})
        }
      }
      this.comptedCount(apps)
      return this.checkboxList;
    })
  );

  //计算各种分类的数量
  comptedCount(apps:any[]){
    this.checkboxList.forEach(item=>{
      switch(item.value) {
        case ScreenBoxKeys.all:
          item.data1 = apps.length;
          break;
        case ScreenBoxKeys.lowScore:
          item.data1 = apps.filter(app=>(app.software?.stat&&app.software?.stat.score&&app.software?.stat.score_count>20&&app.software?.stat.score<5)).length
          break;
        case ScreenBoxKeys.freeApp:
          item.data1 = apps.filter(app=>app.software?.free||app.software?.free===undefined).length
          break;
        case ScreenBoxKeys.paidApp:
          item.data1 = apps.filter(app=>app.software?.free===false).length
          break;
      }
    })
  }

  submitDisable(){
    return !this.checkedList.filter(item=>item).length && !this.searchName.length
  }
}