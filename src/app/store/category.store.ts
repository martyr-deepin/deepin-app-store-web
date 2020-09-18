import { Injectable } from '@angular/core';
import { StoreConfig, Store } from '@datorama/akita';
import { Software } from 'app/services/software.service';

export interface CategoryState {
  office: Software[],
  development: Software[],
  reading: Software[],
  graphics: Software[],
  game: Software[],
  music: Software[],
  system: Software[],
  video: Software[],
  chat: Software[],
  others: Software[],
  internet: Software[],
}

export function createInitialState(): CategoryState {
  return {
    office: [],
    development: [],
    reading: [],
    graphics: [],
    game: [],
    music: [],
    system: [],
    video: [],
    chat: [],
    others: [],
    internet: [],
  };
}

@Injectable({
  providedIn: 'root',
})
@StoreConfig({ name: 'category',deepFreezeFn: (obj) => obj })
export class CategoryStore extends Store<CategoryState> {
  constructor() {
    super(createInitialState());
  }

}
