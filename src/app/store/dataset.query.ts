import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { DatasetState, DatasetStore } from './dataset.store';


@Injectable({ providedIn: 'root' })
export class DatasetQuery extends Query<DatasetState> {  

  constructor(protected store: DatasetStore) {
    super(store);
  }
}