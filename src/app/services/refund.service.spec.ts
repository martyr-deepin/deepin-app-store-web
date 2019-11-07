import { TestBed } from '@angular/core/testing';

import { RefundService } from './refund.service';

describe('RefundService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RefundService = TestBed.get(RefundService);
    expect(service).toBeTruthy();
  });
});
