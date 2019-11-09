import { TestBed } from '@angular/core/testing';

import { UserAppsService } from './user-apps.service';

describe('UserAppsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserAppsService = TestBed.get(UserAppsService);
    expect(service).toBeTruthy();
  });
});
