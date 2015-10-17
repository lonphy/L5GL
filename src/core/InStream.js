/**
 * 输入流处理 - InStream
 *
 * @param file {String} 文件名
 * @constructor
 *
 * @author lonphy
 * @version 1.0
 */
L5.InStream = function (file) {
    this.filePath = 'wmof/' + file;
    this.fileLength = 0;
    this.fileOffset = 0;
    this.source = null;
    this.onload = null;
    this.onerror = null;
    this.topLevel = [];
    this.linked = new Map();
    this.ordered = [];
};
L5.nameFix(L5.InStream, 'InStream');

Object.defineProperties(
    L5.InStream.prototype,
    {
        numObjects: {
            get: function () {

            }
        }

    }
);

L5.InStream.prototype.read = function () {
    var $this = this;
    return new Promise(function (resolve, reject) {
        var file = new L5.XhrTask($this.filePath, 'arraybuffer');
        file.then(function (buffer) {
            $this.fileLength = buffer.byteLength;
            $this.source = new DataView(buffer);
            $this.parse();
            resolve($this);
        }).catch(function (e) {
            reject(e);
        });
    });
};

// 检查文件版本
L5.InStream.prototype.checkVersion = function () {
    var length = L5.VERSION.length;
    if (this.fileLength < length) {
        delete this.source;
        return false;
    }

    var fileVersion = '';
    for (i = 0; i < length; ++i) {
        fileVersion += String.fromCharCode(this.source.getUint8(i));
    }
    if (fileVersion !== L5.VERSION) {
        delete this.source;
        return false;
    }

    this.fileOffset += length;
    return true;
};

L5.InStream.prototype.readString = function () {
    var length = this.source.getUint32(this.fileOffset, true);
    this.fileOffset += 4;
    if (length <= 0) {
        return '';
    }
    var padding = (length % 4);
    if (padding > 0) {
        padding = 4 - padding;
    }

    var str = '', i = this.fileOffset, len = this.fileOffset + length;
    for (; i < len; ++i) {
        str += String.fromCharCode(this.source.getUint8(i));
    }
    this.fileOffset += length + padding;
    return str;
};
/**
 * 读取字符串数组
 * @returns {Array<string>}
 */
L5.InStream.prototype.readStringArray = function () {
    var numElements = this.readUint32();
    if (numElements === undefined) {
        return [];
    }

    if (numElements > 0) {
        var ret = [], i, str;
        for (i = 0; i < numElements; ++i) {
            ret[i] = this.readString();
            if (ret[i] === '') {
                return [];
            }
        }
        return ret;
    }
    return [];
};
/**
 * 读取字符串数组
 * @param numElements {number}
 * @returns {Array<string>}
 */
L5.InStream.prototype.readSizedStringArray = function (numElements) {
    if (numElements > 0) {
        var ret = [], i, str;
        for (i = 0; i < numElements; ++i) {
            ret[i] = this.readString();
            if (!ret[i]) {
                return [];
            }
        }
        return ret;
    }
    return [];
};

// 解析
L5.InStream.prototype.parse = function () {
    if (!this.checkVersion()) {
        return this.onerror && this.onerror('invalid File: ', this.filePath, ', can not parse.');
    }

    var topLevel = 'Top Level';
    while (this.fileOffset < this.fileLength) {
        var name = this.readString();
        var isTopLevel = (name == topLevel);
        if (isTopLevel) {
            // Read the RTTI name.
            name = this.readString();
        }
        // console.log('正在解析', name);

        var factory = L5.D3Object.find(name);
        if (!factory) {
            L5.assert(false, "Cannot find factory for " + name);
            return;
        }
        var obj = factory(this);
        if (isTopLevel) {
            this.topLevel.push(obj);
        }
    }
    var $this = this;
    this.ordered.forEach(function (obj) {
        obj.link($this);
    });


    this.ordered.forEach(function (obj) {
        obj.postLink($this);
    });

    this.linked.clear();
    this.ordered.length = 0;
    this.source = null;

};
L5.InStream.prototype.getObjectAt = function (i) {
    if (0 <= i && i < this.topLevel.length) {
        return this.topLevel[i];
    }
    return null;
};

/**
 * @param obj {L5.D3Object}
 */
L5.InStream.prototype.readUniqueID = function (obj) {
    var uniqueID = this.source.getUint32(this.fileOffset, true);
    this.fileOffset += 4;
    if (uniqueID) {
        this.linked.set(uniqueID, obj);
        this.ordered.push(obj);
    }
};
L5.InStream.prototype.readUint32 = function () {
    var limit = this.fileOffset + 4;
    if (limit <= this.fileLength) {
        var ret = this.source.getUint32(this.fileOffset, true);
        this.fileOffset = limit;
        return ret;
    }
    return undefined;
};
L5.InStream.prototype.readSizedInt32Array = function (numElements) {
    if (numElements <= 0) {
        return [];
    }
    var limit = this.fileOffset + 4 * numElements;
    if (limit >= this.fileLength) {
        return [];
    }

    var ret = [], i;
    for (i = this.fileOffset; i < limit; i += 4) {
        ret[i] = this.source.getInt32(i, true);
    }
    this.fileOffset = limit;
    return ret;
};
L5.InStream.prototype.readFloat32Range = function (num) {
    var limit = this.fileOffset + 4 * num;
    if (limit <= this.fileLength) {
        var ret = [];
        for (var i = this.fileOffset; i < limit; i += 4) {
            ret.push(this.source.getFloat32(i, true));
        }
        this.fileOffset = limit;
        return ret;
    }
    return undefined;
};

L5.InStream.prototype.readFloat32 = function () {
    var limit = this.fileOffset + 4;
    if (limit <= this.fileLength) {
        var ret = this.source.getFloat32(this.fileOffset, true);
        this.fileOffset = limit;
        return ret;
    }
    return undefined;
};

L5.InStream.prototype.readFloat64 = function () {
    var limit = this.fileOffset + 8;
    if (limit <= this.fileLength) {
        var ret = this.source.getFloat64(this.fileOffset, true);
        this.fileOffset = limit;
        return ret;
    }
    return undefined;
};

L5.InStream.prototype.readEnum = function () {
    var value = this.readUint32();
    if (value === undefined) {
        return false;
    }
    return value;
};

L5.InStream.prototype.readSizedEnumArray = function (numElements) {
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
};

L5.InStream.prototype.readBool = function () {
    var val = this.readUint32();
    if (val === undefined) {
        return false;
    }
    return val !== 0;
};

L5.InStream.prototype.readSizedPointerArray = function (numElements) {
    if (numElements > 0) {
        var ret = new Array(numElements), v;
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
};

L5.InStream.prototype.readPointerArray = function () {
    var numElements = this.readUint32();
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
};

L5.InStream.prototype.readPointer = function () {
    return this.readUint32();
};
/**
 * 读取变换Transform
 * @returns {L5.Transform|boolean}
 */
L5.InStream.prototype.readAggregate = function () {
    var ret = new L5.Transform();
    var t = this.readMatrix();
    if (t === false) {
        return false;
    }
    ret.__matrix = t;

    t = this.readMatrix();
    if (t === false) {
        return false;
    }
    ret._invMatrix = t;

    t = this.readMatrix();
    if (t === false) {
        return false;
    }
    ret._matrix = t;

    t = this.readPoint();
    if (t === false) {
        return false;
    }
    ret._translate = t;

    t = this.readPoint();
    if (t === false) {
        return false;
    }
    ret._scale = t;

    ret._isIdentity = this.readBool();
    ret._isRSMatrix = this.readBool();
    ret._isUniformScale = this.readBool();
    ret._inverseNeedsUpdate = this.readBool();
    return ret;
};

L5.InStream.prototype.readArray = function (num) {
    return this.readFloat32Range(num);
};

L5.InStream.prototype.readSizedFFloatArray = function (numElements) {
    if (numElements <= 0) {
        return [];
    }
    var ret = [], i;
    for (i = 0; i < numElements; ++i) {
        ret[i] = this.readFloat32Range(4);
    }
    return ret;
};

/**
 * 获取浮点数数组
 * @returns {Array<number>}
 */
L5.InStream.prototype.readFloatArray = function () {
    var num = this.readUint32();
    if (num > 0) {
        var ret = new Array(num);
        for (var i = 0; i < num; ++i) {
            ret[i] = this.readFloat32();
        }
        return ret;
    }
    return [];
};
L5.InStream.prototype.readTransformArray = function () {
    var num = this.readUint32();
    if (num > 0) {
        var ret = new Array(num);
        for (var i = 0; i < num; ++i) {
            ret[i] = this.readAggregate();
        }
        return ret;
    }
    return [];
};

L5.InStream.prototype.readMatrix = function () {
    var d = this.readFloat32Range(16);
    if (d === undefined) {
        return false;
    }
    return L5.Matrix.fromArray(d);
};

L5.InStream.prototype.readPoint = function () {
    var d = this.readFloat32Range(4);
    if (d === undefined) {
        return false;
    }
    return new L5.Point(d[0], d[1], d[2], d[3]);
};
L5.InStream.prototype.readPointArray = function () {
    var num = this.readUint32();
    if (num > 0) {
        var ret = new Array(num);
        for (var i = 0; i < num; ++i) {
            ret[i] = this.readPoint();
        }
        return ret;
    }
    return [];
};
L5.InStream.prototype.readSizedPointArray = function (size) {
    if (size > 0) {
        var ret = new Array(size);
        for (var i = 0; i < size; ++i) {
            ret[i] = this.readPoint();
        }
        return ret;
    }
    return [];
};
/**
 * 读取四元素
 * @returns {L5.Quaternion|boolean}
 */
L5.InStream.prototype.readQuaternion = function () {
    var d = this.readFloat32Range(4);
    if (d === undefined) {
        return false;
    }
    return new L5.Quaternion(d[0], d[1], d[2], d[3]);
};
/**
 * 读取四元素数组
 * @returns {Array<L5.Quaternion>}
 */
L5.InStream.prototype.readQuaternionArray = function () {
    var num = this.readUint32();
    if (num > 0) {
        var ret = new Array(num);
        for (var i = 0; i < num; ++i) {
            ret[i] = this.readQuaternion();
        }
        return ret;
    }
    return [];
};
/**
 * 读取四元素数组
 * @param size {number} 数组大小
 * @returns {Array<L5.Quaternion>}
 */
L5.InStream.prototype.readSizedQuaternionArray = function (size) {
    if (size > 0) {
        var ret = new Array(size);
        for (var i = 0; i < size; ++i) {
            ret[i] = this.readQuaternion();
        }
        return ret;
    }
    return [];
};

L5.InStream.prototype.readBound = function () {
    var b = new L5.Bound();
    var t1 = this.readPoint();
    var t2 = this.readFloat32();
    if (t1 === false || t2 === undefined) {
        return false;
    }
    b.center = t1;
    b.radius = t2;
    return b;
};
/**
 * 读取2进制
 * @returns {ArrayBuffer}
 */
L5.InStream.prototype.readBinary = function () {
    var byteSize = this.readUint32();
    if (byteSize > 0) {
        var limit = this.fileOffset + byteSize;
        if (limit <= this.fileLength) {
            var ret = this.source.buffer.slice(this.fileOffset, limit);
            this.fileOffset = limit;
            return ret;
        }
    }
    return new ArrayBuffer(0);
};

L5.InStream.prototype.resolveLink = function (obj) {
    if (obj) {
        var t = this.linked.get(obj);
        if (t !== undefined) {
            return t;
        }
        else {
            L5.assert(false, "Unexpected link failure");
            return null;
        }
    }
};

L5.InStream.prototype.resolveArrayLink = function (numElements, objs) {
    var ret = [];
    for (var i = 0; i < numElements; ++i) {
        ret[i] = this.resolveLink(objs[i]);
    }
    return ret;
};