export class Vect2D {
    public x: number;
    public y: number;
    public norm: number;

    constructor(a: number, b: number) {
        this.x = a;
        this.y = b;
        this.norm = this.computeNorm();
    }

    public setV(v: Vect2D) {
        this.x = v.x;
        this.y = v.y;
        this.norm = this.computeNorm();
    }

    public static add(v1: Vect2D, v2: Vect2D): Vect2D {
        return new Vect2D(v1.x + v2.x, v1.y + v2.y);
    }

    public static sub(v1: Vect2D, v2: Vect2D): Vect2D {
        return new Vect2D(v1.x - v2.x, v1.y - v2.y);
    }

    public mul(coeff: number) {
        this.x *= coeff;
        this.y *= coeff;
        this.norm = this.computeNorm();
    }

    private computeNorm() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public dotProduct(v: Vect2D): number {
        return this.x * v.x + this.y * v.y;
    }

    public normalize() {
        const norm = this.norm === 0 ? 1 : this.norm;
        this.x /= norm;
        this.y /= norm;
        this.norm = 1;
    } 

    public distance2(v: Vect2D) {
        const x = this.x - v.x;
        const y = this.y - v.y;
        return x * x + y * y;
    }

    public distance(v: Vect2D) {
        return Math.sqrt(this.distance2(v));
    }

    public limit(lim: number) {
        if (this.norm > lim) {
            this.normalize();
            this.mul(lim);
            this.norm = this.computeNorm();
        }
    }

    public setMag(mag: number) {
        this.normalize();
        this.mul(mag);
        this.norm = this.computeNorm();
    }

    public getHeading(): number {
        return Math.atan2(this.y, this.x) * 180 / Math.PI;
    }

    public eq(v: Vect2D): boolean {
        return this.x === v.x && this.y === v.y;
    }

    public round() {
        this.x = Math.round(this.x * 1000) / 1000;
        this.y = Math.round(this.y * 1000) / 1000;
    }
}