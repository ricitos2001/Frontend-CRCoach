import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkPlayerProfilePage } from './link-player-profile.page';

describe('LinkPlayerProfilePage', () => {
  let component: LinkPlayerProfilePage;
  let fixture: ComponentFixture<LinkPlayerProfilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkPlayerProfilePage],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkPlayerProfilePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
