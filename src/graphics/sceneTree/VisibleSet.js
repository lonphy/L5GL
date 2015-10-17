/**
 * VisibleSet
 * @version 1.0
 * @author lonphy
 */

L5.VisibleSet = function () {
    this.numVisible = 0;
    this.visibles = [];
};

L5.VisibleSet.name = "VisibleSet";


L5.VisibleSet.prototype.getNumVisible = function () {
    return this.numVisible;
};

L5.VisibleSet.prototype.getAllVisible = function () {
    return this.visibles;
};

L5.VisibleSet.prototype.getVisible = function (index) {
    L5.assert(0 <= index && index < this.numVisible, 'Invalid index to getVisible');
    return this.visibles[index];
};

L5.VisibleSet.prototype.insert = function (visible) {
    var size = this.visibles.length;
    if (this.numVisible < size) {
        this.visibles[this.numVisible] = visible;
    }
    else {
        this.visibles.push(visible);
    }
    ++this.numVisible;
};

L5.VisibleSet.prototype.clear = function () {
    this.numVisible = 0;
};