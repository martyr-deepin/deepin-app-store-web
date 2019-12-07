import { TestBed } from '@angular/core/testing';

import { ClientIdService } from './client-id.service';

describe('ClientIdService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ClientIdService = TestBed.get(ClientIdService);
    expect(service).toBeTruthy();
  });
});
