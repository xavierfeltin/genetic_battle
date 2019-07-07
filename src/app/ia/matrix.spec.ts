import { Matrix } from './matrix';
import { cpus } from 'os';

describe('Matrix', () => {
  describe('constructor', () => {
    it('outputs an empty matrix with correct dimensions', () => {
        const m = new Matrix(2, 2);
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                expect(m.getValueAt(i, j)).toBe(0);
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
                expected.setValueAt(1, i, j);
            }
        }
        expect(m.isEqual(expected)).toBeTruthy();
    });

    it ('ouputs a matrix from an array with specified rectangular dimensions', () => {
        const m = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const expected = new Matrix(3, 2);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                expected.setValueAt(1, i, j);
            }
        }
        expect(m.isEqual(expected)).toBeTruthy();
    });

    it ('ouputs a null matrix from an array with wrong dimensions defined', () => {
        const m = Matrix.fromArray([1, 1, 1, 1], 3, 2);
        expect(m === null).toBeTruthy();
    });
  });

  describe('product', () => {
    it ('outputs the product of two squared matrices', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1], 2, 2);
        const m2 = Matrix.fromArray([1, 1, 1, 1], 2, 2);
        const expected = Matrix.fromArray([2, 2, 2, 2], 2, 2);

        const product = Matrix.product(m1, m2);
        expect(product.isEqual(expected)).toBeTruthy();
    });

    it ('outputs the product of two rectangular matrices 1/2', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 2, 3);
        const m2 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const expected = Matrix.fromArray([3, 3, 3, 3], 2, 2);

        const product = Matrix.product(m1, m2);
        console.log(product);
        expect(product.isEqual(expected)).toBeTruthy();
    });

    it ('outputs the product of two rectangular matrices 2/2', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const m2 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 2, 3);
        const expected = Matrix.fromArray([2, 2, 2, 2, 2, 2, 2, 2, 2], 3, 3);

        const product = Matrix.product(m1, m2);
        expect(product.isEqual(expected)).toBeTruthy();
    });

    it ('outputs a null matrix for not matching matrix for product operation', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const m2 = Matrix.fromArray([1, 1], 1, 2);

        const product = Matrix.product(m1, m2);
        expect(product === null).toBeTruthy();
    });
  });

  describe('toArray', () => {
    it('outputs matrix into an array', () => {
        const ref = [1, 2, 3, 4, 5, 6];
        const m1 = Matrix.fromArray(ref, 3, 2);
        const arr1 = m1.toArray();
        expect(arr1.length).toBe(m1.rows * m1.columns);

        let equal = true;
        for (let i = 0; i < arr1.length; i++) {
            equal = (arr1[i] === ref[i]);
            if (!equal) {
                break;
            }
        }
        expect(equal).toBeTruthy();
    });
  });

  describe('add', () => {
    it('outputs the result of the addition of two matrixes', () => {
        const result = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const m2 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        result.add(m2);
        const expected = Matrix.fromArray([2, 2, 2, 2, 2, 2], 3, 2);
        expect(result.isEqual(expected)).toBeTruthy();
    });

    it('outputs same original matrix since the matrixes are not the same size', () => {
        const result = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const m2 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 2, 3);
        result.add(m2);
        const expected = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        expect(result.isEqual(expected)).toBeTruthy();
    });
  });

  describe('setValueAt', () => {
    it('outputs the updated matrix', () => {
        const result = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        result.setValueAt(2, 0, 0);
        const expected = Matrix.fromArray([2, 1, 1, 1, 1, 1], 3, 2);
        expect(result.isEqual(expected)).toBeTruthy();
    });

    it('outputs same original matrix since the modification is done outside the matrix dimension', () => {
        const result = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        result.setValueAt(2, 5, 5);
        const expected = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        expect(result.isEqual(expected)).toBeTruthy();
    });
  });

  describe('extract', () => {
    it('outputs the sub matrix extracted from the main matrix', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const result = m1.extract(1, 2);
        const expected = Matrix.fromArray([1, 1, 1, 1], 2, 2);
        expect(result.isEqual(expected)).toBeTruthy();
    });

    it('outputs a random matrix of the size of the expected sub matrix size since the dimension do not match the main matrix', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const result = m1.extract(1, 5);
        expect(result.rows).toBe(5);
        expect(result.columns).toBe(2);
    });
  });

  describe('getValueAt', () => {
    it('outputs the selected value from the matrix', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const result = m1.getValueAt(1, 1);
        expect(result).toBe(1);
    });

    it('outputs null since the value is picked outside the matrix', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        const result = m1.getValueAt(5, 5);
        expect(result === null).toBeTruthy();
    });
  });

  describe('setValues', () => {
    it('outputs the updated matrix with the values set', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        m1.setValues([2, 2, 2, 2, 2, 2]);
        const expected = Matrix.fromArray([2, 2, 2, 2, 2, 2], 3, 2);
        expect(m1.isEqual(expected)).toBeTruthy();
    });

    it('outputs the same matrix since the values to set are too big', () => {
        const m1 = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        m1.setValues([2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);
        const expected = Matrix.fromArray([1, 1, 1, 1, 1, 1], 3, 2);
        expect(m1.isEqual(expected)).toBeTruthy();
    });
  });

  describe('random', () => {
    it('outputs a matrix randomly initialized', () => {
        const m1 = Matrix.random(3, 2);
        const expected = Matrix.fromArray([0, 0, 0, 0, 0, 0], 3, 2);
        expect(m1.rows).toBe(3);
        expect(m1.columns).toBe(2);
        expect(m1.isEqual(expected)).toBeFalsy();
    });
  });
});
