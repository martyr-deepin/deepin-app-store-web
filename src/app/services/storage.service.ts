import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  localStorage:any;

  constructor() { 
    if (!localStorage) {
      throw new Error('Current browser does not support Local Storage');
    }
    this.localStorage = localStorage;
  }

  public setArr(key:string, value:Array<any>):void{
    this.localStorage[key] = value;
  }

  public setObject(key:string, value:any):void {
    this.localStorage[key] = JSON.stringify(value);
  }
 
  public getObject(key:string):any {
    return JSON.parse(this.localStorage[key] || null);
  }
 
  public remove(key:string):any {
    this.localStorage.removeItem(key);
  }

  public removeAll():any{
    this.localStorage.clear();
  }

}

//缓存的项目（添加请注明）
export enum StorageKey {
  recentlyAppMap="recentlyAppMap",//近期更新的应用列表
  ignoreAppMap="ignoreAppMap",//忽略更新的应用列表
}
