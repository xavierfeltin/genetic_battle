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
}

export class Historic {
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
        this.table[entry.inNodeId].push(entry);
    }

    public find(inNodeId: number, type: ModificationType, outNodeId: number) {
        if (this.table[inNodeId]) {
            const histories: HistoryEntry[] = this.table[inNodeId];
            const result = histories.find((value) => value.modificationType === type && value.outNodeId === outNodeId);
            return result ? result : null;
        }
        return null;
    }
}
