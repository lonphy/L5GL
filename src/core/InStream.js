import { D3Object } from './D3Object'
import { VERSION } from '../util/version'

/**
 * 输入流处理 - InStream
 **/
export class InStream {
    constructor(file) {
        this.filePath = file;
        this.fileLength = 0;
        this.fileOffset = 0;
        this.source = null;  // 文件内容
        this.onerror = (...str) => console.error(...str);
        this.topLevel = [];
        this.linked = new Map();
        this.ordered = [];
    }
    /**
     * 读取文件
     * @returns {Promise}
     */
    read() {
        return new Promise((resolve, reject) => {
            var file = new XhrTask(this.filePath, 'arraybuffer');
            file.then(buffer => {
                this.fileLength = buffer.byteLength;
                this.source = new DataView(buffer);
                this.parse();
                resolve(this);
            }).catch(reject);
        });
    }
    /**
     * 检查文件版本
     * @return {boolean}
     */
    checkVersion() {
        let len = VERSION.length;
        if (this.fileLength < len) {
            delete this.source;
            return false;
        }

        let fileVersion = '';
        for (let i = 0; i < len; ++i) {
            fileVersion += String.fromCharCode(this.source.getUint8(i));
        }
        if (fileVersion !== VERSION) {
            delete this.source;
            return false;
        }

        this.fileOffset += len;
        return true;
    }

    /**
     * 读取字符串
     * @returns {string}
     */
    readString() {
        let length = this.source.getUint32(this.fileOffset, true);
        this.fileOffset += 4;
        if (length <= 0) {
            return '';
        }
        let padding = (length % 4);
        if (padding > 0) {
            padding = 4 - padding;
        }

        let str = '', i = this.fileOffset, len = this.fileOffset + length;
        for (; i < len; ++i) {
            str += String.fromCharCode(this.source.getUint8(i));
        }
        this.fileOffset += length + padding;
        return str;
    }

    /**
     * 读取字符串数组
     * @returns {Array<String>}
     */
    readStringArray() {
        let numElements = this.readUint32();
        if (numElements === undefined || numElements <= 0) {
            return [];
        }

        let ret = [], i;
        for (i = 0; i < numElements; ++i) {
            ret[i] = this.readString();
            if (ret[i] === '') {
                return [];
            }
        }
        return ret;
    }

    /**
     * 读取字符串数组
     * @param {number} numElements 需要读取的字符串数组大小
     * @returns {Array<String>}
     */
    readSizedStringArray(numElements) {
        if (numElements <= 0) {
            return [];
        }
        let ret = [], i, str;
        for (i = 0; i < numElements; ++i) {
            ret[i] = this.readString();
            if (!ret[i]) {
                return [];
            }
        }
        return ret;
    }

    // 解析文件
    parse() {
        if (!this.checkVersion()) {
            return this.onerror(this.filePath, ', invalid version, can not parse.');
        }
        let topLevel = 'Top Level',
            totalSize = this.fileLength,
            name, isTopLevel, factory;
        while (this.fileOffset < totalSize) {
            name = this.readString();
            isTopLevel = (name === topLevel);
            if (isTopLevel) {
                name = this.readString();
            }
            factory = D3Object.find(name);
            if (!factory) {
                this.onerror(`${this.filePath}, Cannot find factory for ${name}`);
                return;
            }
            var obj = factory(this);
            if (isTopLevel) {
                this.topLevel.push(obj);
            }
        }
        this.ordered.forEach(obj => obj.link(this));
        this.ordered.forEach(obj => obj.postLink(this));
        this.linked.clear();
        this.ordered.length = 0;
        this.source = null;
    }

    getObjectAt(i) {
        if (0 <= i && i < this.topLevel.length) {
            return this.topLevel[i];
        }
        return null;
    }

    /**
     * @param {D3Object} obj
     */
    readUniqueID(obj) {
        let uniqueID = this.source.getUint32(this.fileOffset, true);
        this.fileOffset += 4;
        if (uniqueID) {
            this.linked.set(uniqueID, obj);
            this.ordered.push(obj);
        }
    }

    readUint32() {
        let limit = this.fileOffset + 4;
        if (limit <= this.fileLength) {
            var ret = this.source.getUint32(this.fileOffset, true);
            this.fileOffset = limit;
            return ret;
        }
        return undefined;
    }

    readSizedInt32Array(numElements) {
        if (numElements <= 0) {
            return [];
        }
        let limit = this.fileOffset + 4 * numElements;
        if (limit >= this.fileLength) {
            return [];
        }

        let ret = [], i;
        for (i = this.fileOffset; i < limit; i += 4) {
            ret[i] = this.source.getInt32(i, true);
        }
        this.fileOffset = limit;
        return ret;
    }

    readFloat32Range(num) {
        let limit = this.fileOffset + 4 * num;
        if (limit <= this.fileLength) {
            let ret = [], i;
            for (i = this.fileOffset; i < limit; i += 4) {
                ret.push(this.source.getFloat32(i, true));
            }
            this.fileOffset = limit;
            return ret;
        }
        return undefined;
    }

    readFloat32() {
        let limit = this.fileOffset + 4;
        if (limit <= this.fileLength) {
            var ret = this.source.getFloat32(this.fileOffset, true);
            this.fileOffset = limit;
            return ret;
        }
        return undefined;
    }

    readFloat64() {
        let limit = this.fileOffset + 8;
        if (limit <= this.fileLength) {
            var ret = this.source.getFloat64(this.fileOffset, true);
            this.fileOffset = limit;
            return ret;
        }
        return undefined;
    }

    readEnum() {
        var value = this.readUint32();
        if (value === undefined) {
            return false;
        }
        return value;
    }

    readSizedEnumArray(numElements) {
        if (numElements > 0) {
            var ret = [], i, e;
            for (i = 0; i < numElements; ++i) {
                ret[i] = this.readEnum();
                if (ret[i] === undefined) {
                    return [];
                }
            }
            return ret;
        }
        return [];
    }

    readBool() {
        var val = this.readUint32();
        if (val === undefined) {
            return false;
        }
        return val !== 0;
    }

    readSizedPointerArray(numElements) {
        if (numElements > 0) {
            let ret = new Array(numElements), v;
            for (var i = 0; i < numElements; ++i) {
                v = this.readPointer();
                if (v === undefined) {
                    return false;
                }
                ret[i] = v;
            }
            return ret;
        }
        return false;
    }

    readPointerArray() {
        let numElements = this.readUint32();
        if (numElements === undefined) {
            return false;
        }

        if (numElements > 0) {
            var ret = new Array(numElements);
            for (var i = 0; i < numElements; ++i) {
                ret[i] = this.readPointer();
                if (ret[i] === undefined) {
                    return false;
                }
            }
            return ret;
        }
        return false;
    }

    readPointer() {
        return this.readUint32();
    }


    readArray(num) {
        return this.readFloat32Range(num);
    }

    readSizedFFloatArray(numElements) {
        if (numElements <= 0) {
            return [];
        }
        var ret = [], i;
        for (i = 0; i < numElements; ++i) {
            ret[i] = this.readFloat32Range(4);
        }
        return ret;
    }

    /**
     * 获取浮点数数组
     * @returns {Array<number>}
     */
    readFloatArray() {
        let num = this.readUint32();
        if (num > 0) {
            var ret = new Array(num);
            for (var i = 0; i < num; ++i) {
                ret[i] = this.readFloat32();
            }
            return ret;
        }
        return [];
    }

    /**
     * 读取L5.Transform
     * @returns {L5.Transform}
     */
    readTransform() {
        var tf = new L5.Transform();
        tf.__matrix.copy(this.readMatrix());
        tf._invMatrix.copy(this.readMatrix());
        tf._matrix.copy(this.readMatrix());
        tf._translate.copy(this.readPoint());
        tf._scale.copy(this.readPoint());
        tf._isIdentity = this.readBool();
        tf._isRSMatrix = this.readBool();
        tf._isUniformScale = this.readBool();
        tf._inverseNeedsUpdate = this.readBool();
        return tf;
    }

    readTransformArray() {
        let num = this.readUint32();
        if (num > 0) {
            var ret = new Array(num);
            for (var i = 0; i < num; ++i) {
                ret[i] = this.readTransform();
            }
            return ret;
        }
        return [];
    }

    readMatrix() {
        let d = this.readFloat32Range(16);
        if (d === undefined) {
            return false;
        }
        return L5.Matrix.fromArray(d);
    }

    readPoint() {
        let d = this.readFloat32Range(4);
        if (d === undefined) {
            return false;
        }
        return new Point(d[0], d[1], d[2], d[3]);
    }

    readPointArray() {
        let num = this.readUint32();
        if (num > 0) {
            var ret = new Array(num);
            for (var i = 0; i < num; ++i) {
                ret[i] = this.readPoint();
            }
            return ret;
        }
        return [];
    }

    readSizedPointArray(size) {
        if (size > 0) {
            var ret = new Array(size);
            for (var i = 0; i < size; ++i) {
                ret[i] = this.readPoint();
            }
            return ret;
        }
        return [];
    }

    /**
     * 读取四元素
     * @returns {Quaternion|boolean}
     */
    readQuaternion() {
        let d = this.readFloat32Range(4);
        if (d === undefined) {
            return false;
        }
        return new Quaternion(d[0], d[1], d[2], d[3]);
    }

    /**
     * 读取四元素数组
     * @returns {Array<Quaternion>}
     */
    readQuaternionArray() {
        let num = this.readUint32();
        if (num > 0) {
            var ret = new Array(num);
            for (var i = 0; i < num; ++i) {
                ret[i] = this.readQuaternion();
            }
            return ret;
        }
        return [];
    }

    /**
     * 读取四元素数组
     * @param size {number} 数组大小
     * @returns {Array<Quaternion>}
     */
    readSizedQuaternionArray(size) {
        if (size > 0) {
            var ret = new Array(size);
            for (let i = 0; i < size; ++i) {
                ret[i] = this.readQuaternion();
            }
            return ret;
        }
        return [];
    }

    readBound() {
        var b = new Bound();
        let t1 = this.readPoint();
        let t2 = this.readFloat32();
        if (t1 === false || t2 === undefined) {
            return false;
        }
        b.center.copy(t1);
        b.radius = t2;
        return b;
    }

    /**
     * 读取2进制
     * @returns {ArrayBuffer}
     */
    readBinary() {
        let byteSize = this.readUint32();
        if (byteSize > 0) {
            let limit = this.fileOffset + byteSize;
            if (limit <= this.fileLength) {
                var ret = this.source.buffer.slice(this.fileOffset, limit);
                this.fileOffset = limit;
                return ret;
            }
        }
        return new ArrayBuffer(0);
    }

    resolveLink(obj) {
        if (obj) {
            var t = this.linked.get(obj);
            if (t !== undefined) {
                return t;
            }
            else {
                console.assert(false, "Unexpected link failure");
                return null;
            }
        }
    }
    resolveArrayLink(numElements, objs) {
        var ret = [];
        for (let i = 0; i < numElements; ++i) {
            ret[i] = this.resolveLink(objs[i]);
        }
        return ret;
    }
}
