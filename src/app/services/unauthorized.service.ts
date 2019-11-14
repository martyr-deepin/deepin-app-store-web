import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UnauthorizedService {
  constructor() {}
  unauthorized$ = new Subject();
}
