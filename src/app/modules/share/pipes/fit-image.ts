import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'environments/environment';
// select image based on ratio
@Pipe({
  name: 'fitImage',
})
export class FitImage implements PipeTransform {
  transform(value: string[]) {
    if (value.length === 0) {
      return '';
    }
    console.log('px', devicePixelRatio);
    if (devicePixelRatio > 1) {
      value.reverse();
    }
    return value.filter(Boolean).map(v => environment.server + '/api/public/blob/' + v)[0];
  }
}
