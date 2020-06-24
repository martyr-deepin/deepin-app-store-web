import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'environments/environment';
@Pipe({
  name: 'coverImage',
})
export class CoverImagePipe implements PipeTransform {
  transform(img: string): string {
    if (!img) {
      return '';
    }
    return environment.server + '/api/public/blob/' + img;
  }
}
