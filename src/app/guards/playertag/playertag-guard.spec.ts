import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { playertagGuard } from './playertag-guard';

describe('playertagGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => playertagGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
