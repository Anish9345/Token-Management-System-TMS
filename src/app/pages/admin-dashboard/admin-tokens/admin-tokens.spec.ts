import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTokens } from './admin-tokens';

describe('AdminTokens', () => {
  let component: AdminTokens;
  let fixture: ComponentFixture<AdminTokens>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTokens],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTokens);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
