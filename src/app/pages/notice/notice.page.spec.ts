import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticePage } from './notice.page';

describe('NoticePage', () => {
  let component: NoticePage;
  let fixture: ComponentFixture<NoticePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoticePage],
    }).compileComponents();

    fixture = TestBed.createComponent(NoticePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
