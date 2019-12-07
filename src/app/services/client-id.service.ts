import { Injectable } from '@angular/core';
import { UuidService } from './uuid.service';

@Injectable({
  providedIn: 'root',
})
export class ClientIdService {
  constructor(private uuid: UuidService) {}
  private key = 'client-id';
  clientID() {
    if (!localStorage.getItem(this.key)) {
      localStorage.setItem(this.key, this.uuid.uuidv4());
    }
    return localStorage.getItem(this.key);
  }
}
