import { Injectable } from '@angular/core';
import { StoreConfig, Store } from '@datorama/akita';
import { Software } from 'app/services/software.service';

export interface CategoryState {
  [key: string]: Software[]
}

export function createInitialState(): CategoryState {
  return {
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
