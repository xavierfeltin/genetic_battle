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

    it ('outputs the product of two rectangular matrices 1/2', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 2, 3);
        const m2 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const expected = Matrix.fromArray([2, 2, 2, 2, 2, 2, 2, 2, 2], 3, 3);

        const product = Matrix.product(m1, m2);
        expect(product.isEqual(expected));
    });

    it ('outputs the product of two rectangular matrices 2/2', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const m2 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 2, 3);
        const expected = Matrix.fromArray([2, 2, 2, 2, 2, 2, 2, 2, 2], 3, 3);

        const product = Matrix.product(m1, m2);
        expect(product.isEqual(expected));
    });

    it ('outputs a null matrix for not matching matrix for product operation', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const m2 = Matrix.fromArray([1, 1, 1, 1], 2, 2);

        const product = Matrix.product(m1, m2);
        expect(product === null);
    });
  });

  describe('toArray', () => {
    it('outputs matrix into an array', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const arr1 = m1.toArray();
        expect(arr1.length === m1.rows * m1.columns);

        let equal = true;
        for (const val of arr1) {
            equal = val === 1;
            if (!equal) {
                break;
            }
        }
        expect(equal === true);
    });
  });

  describe('add', () => {
    it('outputs the result of the addition of two matrixes', () => {
        const result = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const m2 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        result.add(m2);
        const expected = Matrix.fromArray([2, 2, 2, 2, 2, 2], 3, 2);
        expect(result.isEqual(expected));
    });

    it('outputs same original matrix since the matrixes are not the same size', () => {
        const result = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const m2 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 2, 3);
        result.add(m2);
        const expected = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        expect(result.isEqual(expected));
    });
  });

  describe('setValueAt', () => {
    it('outputs the updated matrix', () => {
        const result = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        result.setValueAt(2, 0, 0);
        const expected = Matrix.fromArray([2, 1, 1, 1, 1, 1], 3, 2);
        expect(result.isEqual(expected));
    });

    it('outputs same original matrix since the modification is done outside the matrix dimension', () => {
        const result = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        result.setValueAt(2, 5, 5);
        const expected = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        expect(result.isEqual(expected));
    });
  });

  describe('extract', () => {
    it('outputs the sub matrix extracted from the main matrix', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const result = m1.extract(1, 2);
        const expected = Matrix.fromArray([1, 1, 1, 1], 2, 2);
        expect(result.isEqual(expected));
    });

    it('outputs a random matrix of the size of the expected sub matrix size since the dimension do not match the main matrix', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const result = m1.extract(1, 5);
        expect(result.rows === 5);
        expect(result.columns === 2);
    });
  });

  describe('getValueAt', () => {});

  describe('setValues', () => {});

  describe('random', () => {});
});
