import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoverPasswordPage } from './recover-password.page';

describe('RecoverPasswordPage', () => {
  let component: RecoverPasswordPage;
  let fixture: ComponentFixture<RecoverPasswordPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecoverPasswordPage],
    }).compileComponents();

    fixture = TestBed.createComponent(RecoverPasswordPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
