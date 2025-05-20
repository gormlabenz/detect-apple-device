import { detectAppleDevice } from '../src';

describe('index', () => {
  describe('detectAppleDevice', () => {
    it('should return a string containing the message', () => {
      const message = 'Hello';

      const result = detectAppleDevice(message);

      expect(result).toMatch(message);
    });
  });
});
