import { CharacterIdentification } from './character-identification';

describe('CharacterIdentification', () => {
  it('should create an instance', () => {
    expect(new CharacterIdentification({} as any ,[], 0)).toBeTruthy();
  });
});
