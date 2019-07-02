import { MyMath } from './math.tools';

describe('MyMath', () => {
  describe('random', () => {
    it('outputs random number', () => {
      expect(MyMath.random(0, 10)).not.toBeNaN();
    });
  });

  describe('map', () => {
    it('outputs number mapped to positive destination range', () => {
      const result = MyMath.map(1, 0, 2, 4, 6);
      expect(result === 5);
    });

    it('outputs number mapped to negative destination range', () => {
      const result = MyMath.map(1, 0, 2, -4, -6);
      expect(result === -5);
    });
  });
});
