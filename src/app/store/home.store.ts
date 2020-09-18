import { Store, StoreConfig } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Software } from 'app/services/software.service';

export interface HomeState {
  section: {
    dataset: any[];
  };
}

export function createInitialState(): HomeState {
  return {
    section: {
      dataset: [],
    }
  };
}

@Injectable({
  providedIn: 'root',
})
@StoreConfig({ name: 'home'})
export class HomeStore extends Store<HomeState> {
  constructor() {
    super(createInitialState());
  }
}
