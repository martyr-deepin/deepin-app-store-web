import { TestBed } from '@angular/core/testing';

import { UnauthorizedService } from './unauthorized.service';

describe('UnauthorizedService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UnauthorizedService = TestBed.get(UnauthorizedService);
    expect(service).toBeTruthy();
  });
});
