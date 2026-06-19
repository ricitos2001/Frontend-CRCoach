import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { CookiesPage } from './cookies.page';

describe('CookiesPage', () => {
  let component: CookiesPage;
  let fixture: ComponentFixture<CookiesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookiesPage, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CookiesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
