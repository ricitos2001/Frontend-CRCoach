import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionsPage } from './sessions.page';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SessionsPage', () => {
  let component: SessionsPage;
  let fixture: ComponentFixture<SessionsPage>;

  beforeAll(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsPage, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
