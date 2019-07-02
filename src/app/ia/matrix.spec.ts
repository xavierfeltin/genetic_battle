import { Matrix } from './matrix';

describe('Matrix', () => {
  describe('constructor', () => {
    it('outputs an empty matrix with correct dimensions', () => {
        const m = new Matrix(2, 2);
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                expect(m.getValueAt(i, j) === 0);
            }
        }
    });
  });

  describe('fromArray', () => {
    it ('ouputs a matrix from an array with specified squared dimensions', () => {
        const m = Matrix.fromArray([1, 1, 1, 1], 2, 2);
        const expected = new Matrix(2, 2);
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                m.setValueAt(i, j, 1);
            }
        }
        expect(m.isEqual(expected));
    });

    it ('ouputs a matrix from an array with specified rectangular dimensions', () => {
        const m = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const expected = new Matrix(3, 2);
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                m.setValueAt(i, j, 1);
            }
        }
        expect(m.isEqual(expected));
    });

    it ('ouputs a null matrix from an array with wrong dimensions defined', () => {
        const m = Matrix.fromArray([1, 1, 1, 1], 3, 2);
        expect(m === null);
    });
  });

  describe('product', () => {
    it ('outputs the product of two squared matrices', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1], 2, 2);
        const m2 = Matrix.fromArray([1, 1, 1, 1], 2, 2);
        const expected = Matrix.fromArray([2, 2, 2, 2], 2, 2);

        const product = Matrix.product(m1, m2);
        expect(product.isEqual(expected));
    });

    // TODO
    it ('outputs the product of two rectangular matrices', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1], 2, 2);
        const m2 = Matrix.fromArray([1, 1, 1, 1], 2, 2);
        const expected = Matrix.fromArray([2, 2, 2, 2], 2, 2);

        const product = Matrix.product(m1, m2);
        expect(product.isEqual(expected));
    });

    // TODO
    it ('outputs the product of two rectangular matrices transposed', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1], 2, 2);
        const m2 = Matrix.fromArray([1, 1, 1, 1], 2, 2);
        const expected = Matrix.fromArray([2, 2, 2, 2], 2, 2);

        const product = Matrix.product(m1, m2);
        expect(product.isEqual(expected));
    });
  });
});
