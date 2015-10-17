/**
 * Scene Node - 场景节点
 *
 * @class
 * @extends {L5.Spatial}
 *
 * @author lonphy
 * @version 1.0
 */
L5.Node = function () {
    L5.Spatial.call(this);
    this.childs = [];
};
L5.nameFix(L5.Node, 'Node');
L5.extendFix(L5.Node, L5.Spatial);

/**
 * 获取子节点数量
 * @returns {number}
 */
L5.Node.prototype.getChildsNumber = function () {
    return this.childs.length;
};

/**
 * 加载子节点.
 * 如果执行成功，则返回子节点存储的索引i, 0 <= i < getNumChildren()
 * 数组中第一个空槽将被用来存储子节点. 如果所有的槽都不为空，则添加到数组末尾[js底层可能需要重新分配空间]
 *
 * 以下情况会失败,并返回-1
 * child === null or child.parent !== null
 *
 * @param child {L5.Spatial}
 * @returns {number}
 */
L5.Node.prototype.attachChild = function (child) {
    if (child === null) {
        L5.assert(false, 'You cannot attach null children to a node.');
        return -1;
    }
    if (child.parent !== null) {
        L5.assert(false, 'The child already has a parent.');
        return -1;
    }

    child.parent = this;

    var nodes = this.childs.slice(),
        max = nodes.length;
    for (var idx = 0; idx < max; ++idx) {
        if (nodes[idx] === null) {
            this.childs[idx] = child;
            return idx;
        }
    }
    this.childs[max] = child;
    return max;
};

/**
 * 从当前节点卸载子节点
 * 如果child不为null且在数组中， 则返回存储的索引， 否则返回-1
 * @param child {L5.Spatial}
 * @returns {number}
 */
L5.Node.prototype.detachChild = function (child) {
    if (child !== null) {
        var nodes = this.childs.slice(),
            max = nodes.length;
        for (var idx = 0; idx < max; ++idx) {
            if (nodes[idx] === child) {
                this.childs[idx] = null;
                child.parent = null;
                return idx;
            }
        }
    }
    return -1;
};

/**
 * 从当前节点卸载子节点
 * 如果 0 <= index < getNumChildren(), 则返回存储在index位置的子节点，否则返回null
 *
 * @param index {number}
 * @returns {L5.Spatial|null}
 */
L5.Node.prototype.detachChildAt = function (index) {
    var child = null;
    if (index >= 0 && index < this.childs.length) {
        child = this.childs[index];
        if (child !== null) {
            child.parent = null;
            this.childs[index] = null;
        }
    }
    return child;
};

/**
 * 在index位置放入child,并返回被替换的元素
 * @param index {number}
 * @param child {L5.Spatial}
 * @returns {L5.Spatial|null}
 */
L5.Node.prototype.setChild = function (index, child) {
    if (child && child.parent !== null) return null;

    if (index >= 0 && index < this.childs.length) {
        var prev = this.childs[index];
        if (prev !== null) {
            prev.parent = null;
        }
        if (child) {
            child.parent = this;
        }
        this.childs[index] = child;
        return prev;
    }

    if (child) {
        child.parent = this;
    }
    this.childs.push(child);
    return null;
};

/**
 * 通过索引获取子节点
 * @param index {number}
 * @returns {L5.Spatial|null}
 */
L5.Node.prototype.getChild = function (index) {
    var child = null;
    if (index >= 0 && index < this.childs.length) {
        child = this.childs[index];
    }
    return child;
};

/**
 * @param applicationTime {number}
 */
L5.Node.prototype.updateWorldData = function (applicationTime) {
    L5.Spatial.prototype.updateWorldData.call(this, applicationTime);
    var nodes = this.childs.slice(),
        max = nodes.length;
    for (var idx = 0; idx < max; ++idx) {
        if (nodes[idx]) {
            nodes[idx].update(applicationTime, false);
        }
    }
};

L5.Node.prototype.updateWorldBound = function () {
    if (!this.worldBoundIsCurrent) {
        // Start with an invalid bound.
        this.worldBound.center = L5.Point.ORIGIN;
        this.worldBound.radius = 0;
        var nodes = this.childs.slice(),
            max = nodes.length;
        for (var idx = 0; idx < max; ++idx) {
            if (nodes[idx]) {
                this.worldBound.growToContain(nodes[idx].worldBound);
            }
        }
    }
};
/**
 *
 * @param culler {L5.Culler}
 * @param noCull {boolean}
 */
L5.Node.prototype.getVisibleSet = function (culler, noCull) {
    var nodes = this.childs.slice(),
        max = nodes.length;
    for (var idx = 0; idx < max; ++idx) {
        if (nodes[idx]) {
            nodes[idx].onGetVisibleSet(culler, noCull);
        }
    }
};

/**
 * @param inStream {L5.InStream}
 */
L5.Node.prototype.load = function (inStream) {

    L5.Spatial.prototype.load.call(this, inStream);

    var numChildren = inStream.readUint32();
    if (numChildren > 0) {
        this.childs = inStream.readSizedPointerArray(numChildren);
    }
};

/**
 * @param inStream {L5.InStream}
 */
L5.Node.prototype.link = function (inStream) {

    L5.Spatial.prototype.link.call(this, inStream);

    this.childs.forEach(function (c, i) {
        this.childs[i] = inStream.resolveLink(c);
        this.setChild(i, this.childs[i]);
    }, this);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.Node}
 */
L5.Node.factory = function (inStream) {
    var obj = new L5.Node();
    obj.load(inStream);
    return obj;
};

L5.D3Object.factories.set('Wm5.Node', L5.Node.factory);