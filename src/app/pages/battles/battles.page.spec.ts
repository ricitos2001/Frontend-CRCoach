import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BattlesPage } from './battles.page';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('BattlesPage', () => {
  let component: BattlesPage;
  let fixture: ComponentFixture<BattlesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattlesPage, TranslateModule.forRoot()],
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
