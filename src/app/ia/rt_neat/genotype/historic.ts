export enum ModificationType {
    Add = 0,
    Split = 1
}

export interface HistoryEntry {
    modificationType: ModificationType;
    innovationId: number;
    newNodeId?: number; // use for split
    inNodeId: number;
    outNodeId: number;
    age: number;
}

export class Historic {
    public static readonly MAX_AGE = 50;
    private table: {};

    constructor() {
        this.table = {};
    }

    public reset() {
        this.table = {};
    }

    public addEntry(entry: HistoryEntry) {
        if (!this.table[entry.inNodeId]) {
            this.table[entry.inNodeId] = [];
        }
    }

    public find(inNodeId: number, type: ModificationType, outNodeId: number) {
        if (this.table[inNodeId]) {
            const histories: HistoryEntry[] = this.table[inNodeId];
            const result = histories.find((value) => value.modificationType === type && value.outNodeId === outNodeId);
            
            this.age();
            if (result) {
                // Entry still used do not forget it yet
                result.age -= 1;
            }
            
            return result ? result : null;
        }
        return null;
    }

    /**
     * Make historic older and delete too old historic entries
     */
    private age() {
        for (const key of Object.keys(this.table)) {
            const logs: HistoryEntry[] = this.table[key];
            let i = logs.length - 1;
            while (i >= 0) {
                logs[i].age += 1;
                if (logs[i].age > Historic.MAX_AGE) {
                    this.table[key] = logs.splice(i, 1);
                }
                i--;
            }
        }
    }
}
