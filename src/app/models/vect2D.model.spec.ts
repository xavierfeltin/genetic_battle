import { Vect2D } from './vect2D.model';

describe('Vect2D', () => {
    describe('angle between vectors', () => {
        it('outputs a 0 angle between a vector and itself', () => {
            const v1 = new Vect2D(2, 2);
            const angle = v1.angleWithVector(v1);
            expect(angle).toBe(0);
        });
        it('outputs a 45° angle between the X axis and a vector (2,2)', () => {
            const xAxis = new Vect2D(1, 0);
            const v = new Vect2D(2, 2);
            const angle = xAxis.angleWithVector(v);
            expect(angle.toFixed(6)).toBe('0.785398'); // 45° in radian
        });
        it('outputs a -45° angle between the X axis and a vector (2,-2)', () => {
            const xAxis = new Vect2D(1, 0);
            const v = new Vect2D(2, -2);
            const angle = xAxis.angleWithVector(v);
            expect(angle.toFixed(6)).toBe('-0.785398'); // -45° in radian
        });
        it('outputs a -180° angle between the X axis and a vector (-1,0)', () => {
            const xAxis = new Vect2D(1, 0);
            const v = new Vect2D(-1, 0);
            const angle = xAxis.angleWithVector(v);
            expect(angle.toFixed(6)).toBe('3.141593'); // 180° in radian
        });
        it('outputs a 135° angle between the X axis and a vector (-2,2)', () => {
            const xAxis = new Vect2D(1, 0);
            const v = new Vect2D(-2, 2);
            const angle = xAxis.angleWithVector(v);
            expect(angle.toFixed(6)).toBe('2.356194'); // 135° in radian
        });
        it('outputs a -135° angle between the X axis and a vector (-2,-2)', () => {
            const xAxis = new Vect2D(1, 0);
            const v = new Vect2D(-2, -2);
            const angle = xAxis.angleWithVector(v);
            expect(angle.toFixed(6)).toBe('-2.356194'); // -135° in radian
        });
    });
});
