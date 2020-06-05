import { Component, OnInit } from '@angular/core';
import { MyUpdatesService } from '../../services/my-updates.service';
import { switchMap} from 'rxjs/operators';

@Component({
  selector: 'm-recently-updated',
  templateUrl: './recently-updated.component.html',
  styleUrls: ['./recently-updated.component.scss']
})
export class RecentlyUpdatedComponent implements OnInit {

  constructor(
    private myUpdateService: MyUpdatesService
  ) {}

  ngOnInit(): void {
  }

  //最近更新的列表
  recentUpdatedList$ = this.myUpdateService.recentlyApps$.pipe(
    switchMap(async result => {
      const recents = Object.keys(result).map(val => result[val] )
      //按日期倒序
      return recents.sort((a,b)=> parseInt(b.updated_at) - parseInt(a.updated_at))
    })
  )

}