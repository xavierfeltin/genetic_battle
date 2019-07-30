export enum ModificationType {
    Add = 0,
    Split = 1
}

export interface HistoryEntry {
    modificationType: ModificationType;
    innovationId: number;
    inNodeId: number;
    outNodeId: number;
}

export class Historic {
    private table: {};

    constructor() {
        this.table = {};
    }

    addEntry(entry: HistoryEntry) {
        if (!this.table[entry.inNodeId]) {
            this.table[entry.inNodeId] = [];
        }
        this.table[entry.inNodeId].push(entry);
    }

    find(inNodeId: number, type: ModificationType, outNodeId: number) {
        if (this.table[inNodeId]) {
            const histories: HistoryEntry[] = this.table[inNodeId];
            return histories.find((value) => value.modificationType === type && value.outNodeId === outNodeId);
        }
        return null;
    }
}
