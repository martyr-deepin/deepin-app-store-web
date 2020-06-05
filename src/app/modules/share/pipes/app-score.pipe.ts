import { Pipe, PipeTransform } from '@angular/core';
import { isNull } from 'util';
@Pipe({
  name: 'appScore',
})
export class AppScorePipe implements PipeTransform {
  transform(value: number): any {
    if(isNaN(value)||isNull(value)) {
			return "0.0"
    }
		let score = Math.round(value/2*10)/10
		if((score+"").indexOf(".")>-1) {
			return score
		}else {
			return score+".0"
		}
  }
}
