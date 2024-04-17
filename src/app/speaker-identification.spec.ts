import { SpeakerIdentification } from './speaker-identification';

describe('CharacterIdentification', () => {
  it('should create an instance', () => {
    expect(new SpeakerIdentification({} as any ,[], [])).toBeTruthy();
  });
});
