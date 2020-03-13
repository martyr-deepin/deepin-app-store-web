import { TestBed } from '@angular/core/testing';

import { SysAuthService } from './sys-auth.service';

describe('SysAuthService', () => {
  let service: SysAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SysAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
