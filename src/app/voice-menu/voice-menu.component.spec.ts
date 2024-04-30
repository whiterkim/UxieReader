import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceMenuComponent } from './voice-menu.component';

describe('VoiceMenuComponent', () => {
  let component: VoiceMenuComponent;
  let fixture: ComponentFixture<VoiceMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoiceMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VoiceMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
