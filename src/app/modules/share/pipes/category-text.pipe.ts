import { Pipe, PipeTransform } from '@angular/core';
import { CategoryService } from 'app/services/category.service';

@Pipe({
  name: 'categoryText',
})
export class CategoryTextPipe implements PipeTransform {
  constructor(private categoryService: CategoryService) {}
  transform(category: string) {
    return this.categoryService.categoryLocaleName(category);
  }
}
