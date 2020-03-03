import { TestBed } from '@angular/core/testing';

import { SystemGuardService } from './system-guard.service';

describe('SystemGuardService', () => {
  let service: SystemGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
