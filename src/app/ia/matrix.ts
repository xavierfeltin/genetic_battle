export class Matrix {
    public rows: number;
    public columns: number;
    public values: number[][];
    private nbValues: number;

    public static product(A: Matrix, B: Matrix): Matrix {
        if (A.columns !== B.rows) {
            console.error('A columns (' + A.columns + ') !== B rows (' + B.rows + ')');
            return null;
        }

        const result = new Matrix(A.rows, B.columns);
        for (let i = 0; i < result.rows; i++) {
            for (let j = 0; j < result.columns; j++) {
                let sum = 0;
                for (let k = 0; k < A.columns; k++) {
                    sum += A.values[i][k] * B.values[k][j];
                }
                result.values[i][j] = sum;
            }
        }

        return result;
    }

    public static fromArray(arr: number[], rows: number, columns: number): Matrix {
        if (rows * columns !== arr.length) {
            console.error('The specified rows and columns do not match the array length');
            return null;
        }

        const result = new Matrix(rows,  columns);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                result.values[i][j] = arr[j + (i * columns)];
            }
        }
        return result;
    }

    public static random(rows: number, cols: number): Matrix {
        const result = new Matrix(rows, cols);
        result.randomize();
        return result;
    }

    constructor(r: number, c: number) {
        this.rows = r;
        this.columns = c;
        this.values = [];

        for (let i = 0; i < this.rows; i++) {
            const line = new Array<number>(this.columns);
            line.fill(0, 0, this.columns);
            this.values.push(line);
        }

        this.nbValues = this.rows * this.columns;
    }

    public copy(): Matrix {
        const result = new Matrix(this.rows, this.columns);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
              result.values[i][j] = this.values[i][j];
            }
        }
        return result;
    }

    public getNbValues(): number {
        return this.nbValues;
    }

    public toString(): string {
        let result = '';
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (j !== 0) {
                    result += ' ';
                }
                result += this.values[i][j].toString();
            }
            result += '\n';
        }
        return result;
    }

    public scalarMultiply(n: number) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.values[i][j] *= n;
            }
        }
    }

    public scalarAdd(n: number) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.values[i][j] += n;
            }
        }
    }

    public scalarSubstract(n: number) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.values[i][j] -= n;
            }
        }
    }

    public randomize() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.values[i][j] = Math.random() * 2 - 1;
            }
        }
    }

    public setValues(values: number[]) {
        if (values.length !== (this.rows * this.columns)) {
            return;
        }

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.values[i][j] = values[i * j];
            }
        }
    }

    public getValueAt(row: number, column: number): number {
        if (row < 0 || column < 0 || row >= this.rows || column >= this.columns) {
            console.error('Try to access a data outside of the matrix row: ' + row + ', column: ' + column);
            return null;
        }

        return this.values[row][column];
    }

    public extract(start: number, nbRows: number): Matrix {
        if ((start >= this.rows) || (start + nbRows - 1 >= this.rows)) {
            return new Matrix(nbRows, this.columns);
        }

        const m = new Matrix(nbRows, this.columns);
        for (let i = 0; i < nbRows; i++) {
            for (let j = 0; j < this.columns; j++) {
                m.values[i][j] = this.values[start + i][j];
            }
        }

        return m;
    }

    public setValueAt(value: number, row: number, column: number) {
        if (row < 0 || column < 0 || row >= this.rows || column >= this.columns) {
            console.error('Try to access a data outside of the matrix row: ' + row + ', column: ' + column);
            return;
        }

        this.values[row][column] = value;
    }

    public hadamard(m: Matrix) {
        if (m.rows !== this.rows || m.columns !== this.columns) {
            console.error('A columns (' + this.columns + ') !== B columns (' + m.columns + ')');
            return;
        }

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.values[i][j] = m.values[i][j] * this.values[i][j];
            }
        }
    }

    public add(m: Matrix) {
        if (m.rows !== this.rows || m.columns !== this.columns) {
            console.error('A columns (' + this.columns + ') !== B columns (' + m.columns + ')');
            return;
        }

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.values[i][j] += m.values[i][j];
            }
        }
    }

    public substract(m: Matrix) {
        if (m.rows !== this.rows || m.columns !== this.columns) {
            console.error('A columns (' + this.columns + ') !== B columns (' + m.columns + ')');
            return;
        }

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.values[i][j] = m.values[i][j] - this.values[i][j];
            }
        }
    }

    public transpose(): Matrix {
        const result = new Matrix(this.columns, this.rows);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                result.values[j][i] = this.values[i][j];
            }
        }
        return result;
    }

    public toArray(): number[] {
        const result = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                result.push(this.values[i][j]);
            }
        }
        return result;
    }

    public isEqual(m: Matrix): boolean {
        if (m === null) {
            return false;
        }

        if (m.rows !== this.rows && m.columns !== this.columns) {
            return false;
        }

        let isEqual = true;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (this.getValueAt(i, j) !== m.getValueAt(i, j)) {
                    isEqual = false;
                    break;
                }
            }
        }

        return isEqual;
    }
}
