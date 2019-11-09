import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Software } from './software.service';

// global buy app dialog control
@Injectable({
  providedIn: 'root',
})
export class BuyService {
  constructor() {}
  buyDialogShow$ = new Subject<Software>();
  buy$ = new Subject<Software>();
}
