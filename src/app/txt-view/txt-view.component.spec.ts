import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TxtViewComponent } from './txt-view.component';

describe('TxtViewComponent', () => {
  let component: TxtViewComponent;
  let fixture: ComponentFixture<TxtViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TxtViewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TxtViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
