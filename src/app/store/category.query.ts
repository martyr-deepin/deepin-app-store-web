import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { CategoryState, CategoryStore } from './category.store';


@Injectable({ providedIn: 'root' })
export class CategoryQuery extends Query<CategoryState> {  

  constructor(protected store: CategoryStore) {
    super(store);
  }
}