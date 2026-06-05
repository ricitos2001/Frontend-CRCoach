import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BattlesPage } from './battles.page';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { ImportingSpinnerComponent } from '../../components/shared/importing-spinner/importing-spinner.component';

describe('BattlesPage', () => {
  let component: BattlesPage;
  let fixture: ComponentFixture<BattlesPage>;

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
      imports: [BattlesPage, TranslateModule.forRoot(), ImportingSpinnerComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BattlesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
