import { AudioGeneration } from './audio-generation';

describe('AudioGeneration', () => {
  it('should create an instance', () => {
    expect(new AudioGeneration({} as any, [], {} as any)).toBeTruthy();
  });
});
