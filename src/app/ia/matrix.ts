export class Matrix {
    public rows: number;
    public columns: number;
    public values: number[][];

    constructor(r: number, c: number) {
        this.rows = r;
        this.columns = c;
        
        for(let i = 0; i < this.rows; i++){
            let line = new Array<number>(this.columns);
            line.fill(0, 0, this.columns);
            this.values.fill(line, 0, r);
        } 
    }

    copy(): Matrix {
        let result = new Matrix(this.rows, this.columns);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
              result.values[i][j] = this.values[i][j];
            }
        }
        return result;
    }

    toString():string {
        let result = ''
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (j != 0) {
                    result += ' ';
                }
                result += this.values[i][j].toString();
            }
            result += '\n';
        }
        return result;
    }

    scalarMultiply(n : number) {
        for (let i = 0; i < this.rows; i++){
            for (let j = 0; j < this.columns; j++){
                this.values[i][j] *= n;
            }
        }
    }
          
    scalarAdd(n : number) {
        for (let i = 0; i < this.rows; i++){
            for (let j = 0; j < this.columns; j++){
                this.values[i][j] += n;
            }
        }
    }

    scalarSubstract(n : number) {
        for (let i = 0; i < this.rows; i++){
            for (let j = 0; j < this.columns; j++){
                this.values[i][j] -= n;
            }
        }
    }
    
    randomize() {
        for (let i = 0; i < this.rows; i++){
            for (let j = 0; j < this.columns; j++){
                this.values[i][j] = Math.random() * 2 - 1;
            }
        }
    }

    static random(rows: number, cols: number): Matrix {
        let result = new Matrix(rows, cols);
        result.randomize();
        return result;
    }

    hadamard(m: Matrix) {
        if (m.rows !== this.rows || m.columns !== this.columns) {
            return;
        }

        for (let i = 0; i < this.rows; i++){
            for (let j = 0; j < this.columns; j++){
                this.values[i][j] = m.values[i][j] * this.values[i][j];
            }
        }
    }

    add(m: Matrix) {
        if (m.rows !== this.rows || m.columns !== this.columns) {
            return;
        }

        for (let i = 0; i < this.rows; i++){
            for (let j = 0; j < this.columns; j++){
                this.values[i][j] += m.values[i][j];
            }
        }
    }

    substract(m: Matrix) {
        if (m.rows !== this.rows || m.columns !== this.columns) {
            return;
        }

        for (let i = 0; i < this.rows; i++){
            for (let j = 0; j < this.columns; j++){
                this.values[i][j] = m.values[i][j] - this.values[i][j];
            }
        }
    }

    static product(A: Matrix, B: Matrix): Matrix {
        if(A.columns != B.rows) {
            return null;
        }

        let result = new Matrix(A.rows, B.columns);
        for (let i = 0; i < result.rows; i++){
            for (let j = 0; j < result.columns; j++){
                let sum = 0;
                for (let k = 0; k < A.columns; k++) {
                    sum += A.values[i][k] * B.values[k][j];    
                }
                result.values[j][i] = sum;
            }
        }
        return result;
    }  

    transpose(): Matrix {
        let result = new Matrix(this.columns, this.rows);
        for (let i = 0; i < this.rows; i++){
            for (let j = 0; j < this.columns; j++){
                result.values[j][i] = this.values[i][j];
            }
        }
        return result;
    }

    static fromArray(arr: number[]): Matrix {
        let result = new Matrix(arr.length,  1);
        for (let i = 0; i < result.rows; i++) {
            result.values[i][0] = arr[i];
        }
        return result;
    }

    toArray(): number[] {
        let result = Array<number>(this.columns * this.rows);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                result.push(this.values[i][j]);
            }
        }
        return result;
    }
}