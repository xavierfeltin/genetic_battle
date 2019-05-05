import { TestBed } from '@angular/core/testing';

import { SimuInfoService } from './simu-info.service';

describe('SimuInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SimuInfoService = TestBed.get(SimuInfoService);
    expect(service).toBeTruthy();
  });
});
