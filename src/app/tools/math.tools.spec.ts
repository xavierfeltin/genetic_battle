import { MyMath } from './math.tools';

describe('MyMath', () => {
  describe('random', () => {
    it('outputs random number', () => {
      expect(MyMath.random(0, 10)).not.toBeNaN();
    });
  });
});
