import { Injectable } from '@angular/core';
import { UuidService } from './uuid.service';

@Injectable({
  providedIn: 'root',
})
export class ClientIdService {
  constructor(private uuid: UuidService) {}
  private key = 'client-id';
  clientID() {
    let id = localStorage.getItem(this.key);
    if (!id) {
      id = this.uuid.uuidv4();
      localStorage.setItem(this.key, id);
    }
    return id;
  }
}
