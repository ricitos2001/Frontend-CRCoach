import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoalFormComponent } from './goal-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('GoalFormComponent', () => {
  let component: GoalFormComponent;
  let fixture: ComponentFixture<GoalFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalFormComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(GoalFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
