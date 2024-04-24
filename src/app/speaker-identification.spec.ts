import { SpeakerIdentification } from './speaker-identification';

describe('SpeakerIdentification', () => {
  it('should create an instance', () => {
    expect(new SpeakerIdentification({} as any ,[], [])).toBeTruthy();
  });
});
