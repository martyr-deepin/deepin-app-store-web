import { Store, StoreConfig } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Software } from 'app/services/software.service';

export interface DatasetState {
  [key: number]: Software[];
}

export function createInitialState(): DatasetState {
  return {};
}

@Injectable({
  providedIn: 'root',
})
@StoreConfig({ name: 'dataset', deepFreezeFn: (obj) => obj })
export class DatasetStore extends Store<DatasetState> {
  constructor() {
    super(createInitialState());
  }
}
