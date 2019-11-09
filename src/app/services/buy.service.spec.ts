import { TestBed } from '@angular/core/testing';

import { BuyService } from './buy.service';

describe('BuyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BuyService = TestBed.get(BuyService);
    expect(service).toBeTruthy();
  });
});
