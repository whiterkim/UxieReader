import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpubViewComponent } from './epub-view.component';

describe('EpubViewComponent', () => {
  let component: EpubViewComponent;
  let fixture: ComponentFixture<EpubViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EpubViewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpubViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
