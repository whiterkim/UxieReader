import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceDialogComponent } from './voice-dialog.component';

describe('VoiceDialogComponent', () => {
  let component: VoiceDialogComponent;
  let fixture: ComponentFixture<VoiceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoiceDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VoiceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
