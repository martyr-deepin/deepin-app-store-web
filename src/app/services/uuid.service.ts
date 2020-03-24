import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UuidService {
  constructor() {}
  // uuid generator from https://stackoverflow.com/a/2117523
  uuidv4() {
    return [1e7, 1e3, 4e3, 8e3, 1e11].join('-').replace(/[018]/g, s => {
      const c = Number(s);
      return (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16);
    });
  }
}
