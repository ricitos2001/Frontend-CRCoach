import { TestBed } from '@angular/core/testing';

import { HeaderContentService } from './header-content.service';

describe('HeaderContentService', () => {
  let service: HeaderContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
