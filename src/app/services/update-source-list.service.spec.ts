import { TestBed } from '@angular/core/testing';

import { UpdateSourceListService } from './update-source-list.service';

describe('UpdateSourceListService', () => {
  let service: UpdateSourceListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateSourceListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
