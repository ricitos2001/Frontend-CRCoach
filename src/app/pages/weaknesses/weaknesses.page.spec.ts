import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { WeaknessesPage } from './weaknesses.page';

describe('WeaknessesPage', () => {
  let component: WeaknessesPage;
  let fixture: ComponentFixture<WeaknessesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeaknessesPage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WeaknessesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
