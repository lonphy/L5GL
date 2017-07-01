import { D3Object } from '../../core/D3Object';
import { Point } from '../../math/Point';
import { Spatial } from './Spatial';

class Node extends Spatial {
    constructor() {
        super();
        this.childs = [];
    }

    /**
     * 获取子节点数量
     * @returns {number}
     */
    getChildsNumber() {
        return this.childs.length;
    }

    /**
     * 加载子节点.
     * 如果执行成功，则返回子节点存储的索引i, 0 <= i < getNumChildren()
     * 数组中第一个空槽将被用来存储子节点. 如果所有的槽都不为空，则添加到数组末尾[js底层可能需要重新分配空间]
     *
     * 以下情况会失败,并返回-1
     * child === null or child.parent !== null
     *
     * @param {Spatial} child
     * @returns {number}
     */
    attachChild(child) {
        if (child === null) {
            console.assert(false, 'You cannot attach null children to a node.');
            return -1;
        }
        if (child.parent !== null) {
            console.assert(false, 'The child already has a parent.');
            return -1;
        }

        child.parent = this;

        let nodes = this.childs.slice(),
            max = nodes.length;
        for (let idx = 0; idx < max; ++idx) {
            if (nodes[idx] === null) {
                this.childs[idx] = child;
                return idx;
            }
        }
        this.childs[max] = child;
        return max;
    }

    /**
     * 从当前节点卸载子节点
     * 如果child不为null且在数组中， 则返回存储的索引， 否则返回-1
     * @param {Spatial} child
     * @returns {number}
     */
    detachChild(child) {
        if (child !== null) {
            let nodes = this.childs.slice(),
                max = nodes.length;
            for (let idx = 0; idx < max; ++idx) {
                if (nodes[idx] === child) {
                    this.childs[idx] = null;
                    child.parent = null;
                    return idx;
                }
            }
        }
        return -1;
    }

    /**
     * 从当前节点卸载子节点
     * 如果 0 <= index < getNumChildren(), 则返回存储在index位置的子节点，否则返回null
     *
     * @param {number} index
     * @returns {Spatial|null}
     */
    detachChildAt(index) {
        let child = null;
        if (index >= 0 && index < this.childs.length) {
            child = this.childs[index];
            if (child !== null) {
                child.parent = null;
                this.childs[index] = null;
            }
        }
        return child;
    }

    /**
     * 在index位置放入child,并返回被替换的元素
     * @param {number} index
     * @param {Spatial} child
     * @returns {Spatial|null}
     */
    setChild(index, child) {
        if (child && child.parent !== null) return null;

        if (index >= 0 && index < this.childs.length) {
            let prev = this.childs[index];
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
    }

    /**
     * 通过索引获取子节点
     * @param {number} index
     * @returns {Spatial|null}
     */
    getChild(index) {
        let child = null;
        if (index >= 0 && index < this.childs.length) {
            child = this.childs[index];
        }
        return child;
    }

    /**
     * @param {number} applicationTime
     */
    updateWorldData(applicationTime) {
        super.updateWorldData(applicationTime);
        let nodes = this.childs.slice(),
            max = nodes.length;
        for (let idx = 0; idx < max; ++idx) {
            if (nodes[idx]) {
                nodes[idx].update(applicationTime, false);
            }
        }
    }

    updateWorldBound() {
        if (!this.worldBoundIsCurrent) {
            // Start with an invalid bound.
            this.worldBound.center = Point.ORIGIN;
            this.worldBound.radius = 0;
            let nodes = this.childs.slice(),
                max = nodes.length;
            for (let idx = 0; idx < max; ++idx) {
                if (nodes[idx]) {
                    this.worldBound.growToContain(nodes[idx].worldBound);
                }
            }
        }
    }

    /**
     * @param {Culler} culler
     * @param {boolean} noCull
     */
    getVisibleSet(culler, noCull) {
        let nodes = this.childs.slice(),
            max = nodes.length;
        for (let idx = 0; idx < max; ++idx) {
            if (nodes[idx]) {
                nodes[idx].onGetVisibleSet(culler, noCull);
            }
        }
    }
    /**
     * @param {InStream} inStream
     */
    load(inStream) {
        super.load(inStream);
        let numChildren = inStream.readUint32();
        if (numChildren > 0) {
            this.childs = inStream.readSizedPointerArray(numChildren);
        }
    }
    /**
     * @param {InStream} inStream
     */
    link(inStream) {
        super.link(inStream);
        this.childs.forEach(function (c, i) {
            this.childs[i] = inStream.resolveLink(c);
            this.setChild(i, this.childs[i]);
        }, this);
    }
}

D3Object.Register('Node', Node.factory);

export { Node };