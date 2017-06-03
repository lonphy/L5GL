export class VisibleSet {
    constructor() {
        this.numVisible = 0;
        this.visibles = [];
    }

    getNumVisible() {
        return this.numVisible;
    }

    getAllVisible() {
        return this.visibles;
    }

    getVisible(index) {
        console.assert(0 <= index && index < this.numVisible, 'Invalid index to getVisible');
        return this.visibles[index];
    }

    insert(visible) {
        var size = this.visibles.length;
        if (this.numVisible < size) {
            this.visibles[this.numVisible] = visible;
        }
        else {
            this.visibles.push(visible);
        }
        ++this.numVisible;
    }

    clear() {
        this.numVisible = 0;
    }
}
