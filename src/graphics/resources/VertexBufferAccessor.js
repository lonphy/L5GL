/**
 * VertexBufferAccessor 顶点缓冲访问器
 * @param format {L5.VertexFormat}
 * @param buffer {L5.VertexBuffer}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.VertexBufferAccessor = function (format, buffer) {
    /**
     * @type {L5.VertexFormat}
     */
    this.format = format;
    /**
     * @type {L5.VertexBuffer}
     */
    this.vertexBuffer = buffer;

    this.stride = format.stride;

    /**
     * @type {ArrayBuffer}
     */
    this.data = buffer.getData();

    var i;
    const MAX_TCOORD_UNITS = L5.VertexFormat.MAX_TCOORD_UNITS;
    const MAX_COLOR_UNITS = L5.VertexFormat.MAX_COLOR_UNITS;

    // byte offsets
    this.position = -1;
    this.normal = -1;
    this.tangent = -1;
    this.binormal = -1;
    this.tCoord = new Array(MAX_TCOORD_UNITS);
    this.color = new Array(MAX_COLOR_UNITS);
    this.blendIndices = -1;
    this.blendWeight = -1;

    this.positionChannels = 0;
    this.normalChannels = 0;
    this.tangentChannels = 0;
    this.binormalChannels = 0;
    this.tCoordChannels = new Array(MAX_TCOORD_UNITS);
    this.colorChannels = new Array(MAX_COLOR_UNITS);

    for (i = 0; i < MAX_TCOORD_UNITS; ++i) {
        this.tCoord[i] = -1;
        this.tCoordChannels[i] = 0;
    }
    for (i = 0; i < MAX_COLOR_UNITS; ++i) {
        this.color[i] = -1;
        this.colorChannels[i] = 0;
    }

    this.initialize();
};
L5.nameFix(L5.VertexBufferAccessor, 'VertexBufferAccessor');

/**
 * @param visual {L5.Visual}
 * @returns {L5.VertexBufferAccessor}
 */
L5.VertexBufferAccessor.fromVisual = function (visual) {
    return new L5.VertexBufferAccessor(visual.format, visual.vertexBuffer);
};

/**
 * 获取顶点数量
 * @returns {number}
 */
L5.VertexBufferAccessor.prototype.getNumVertices = function () {
    return this.vertexBuffer.numElements;
};

/**
 * 获取顶点坐标
 * @param index {number} 索引
 * @returns {Float32Array} 顶点坐标引用
 */
L5.VertexBufferAccessor.prototype.getPosition = function (index) {
    return new Float32Array
    (
        this.data.buffer,
        this.position + index * this.stride,
        this.positionChannels
    );
};
/**
 * @param index {number}
 * @param dataArr {Array}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.setPosition = function (index, dataArr) {
    var tar = new Float32Array(
        this.data.buffer,
        this.position + index * this.stride,
        this.positionChannels
    );
    tar.forEach(function (v, k) {
        tar[k] = dataArr[k];
    });
};
L5.VertexBufferAccessor.prototype.hasPosition = function () {
    return this.position !== -1;
};

/**
 * @param index {number}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.getNormal = function (index) {
    return new Float32Array
    (
        this.data.buffer,
        this.normal + index * this.stride,
        this.normalChannels
    );
};

/**
 * @param index {number}
 * @param dataArr {Array}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.setNormal = function (index, dataArr) {
    var tar = new Float32Array(
        this.data.buffer,
        this.normal + index * this.stride,
        this.normalChannels
    );
    tar.forEach(function (v, k) {
        tar[k] = dataArr[k];
    });
};

L5.VertexBufferAccessor.prototype.hasNormal = function () {
    return this.normal !== -1;
};

/**
 * @param index {number}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.getTangent = function (index) {
    return new Float32Array
    (
        this.data.buffer,
        this.tangent + index * this.stride,
        this.tangentChannels
    );
};
/**
 * @param index {number}
 * @param dataArr {Array}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.setTangent = function (index, dataArr) {
    var tar = new Float32Array(
        this.data.buffer,
        this.tangent + index * this.stride,
        this.tangentChannels
    );
    tar.forEach(function (v, k) {
        tar[k] = dataArr[k];
    });
};
L5.VertexBufferAccessor.prototype.hasTangent = function () {
    return this.tangent !== -1;
};

/**
 * @param index {number}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.getBinormal = function (index) {
    return new Float32Array
    (
        this.data.buffer,
        this.binormal + index * this.stride,
        this.binormalChannels
    );
};
/**
 * @param index {number}
 * @param dataArr {Array}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.setBinormal = function (index, dataArr) {
    var tar = new Float32Array(
        this.data.buffer,
        this.binormal + index * this.stride,
        this.binormalChannels
    );
    tar.forEach(function (v, k) {
        tar[k] = dataArr[k];
    });
};

L5.VertexBufferAccessor.prototype.hasBinormal = function () {
    return this.binormal !== -1;
};

/**
 * @param unit {number}
 * @param index {number}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.getTCoord = function (unit, index) {
    return new Float32Array
    (
        this.data.buffer,
        this.tCoord[unit] + index * this.stride,
        this.tCoordChannels[unit]
    );
};
L5.VertexBufferAccessor.prototype.setTCoord = function (unit, index, dataArr) {
    var tar = new Float32Array(
        this.data.buffer,
        this.tCoord[unit] + index * this.stride,
        this.tCoordChannels[unit]
    );
    tar.forEach(function (v, k) {
        tar[k] = dataArr[k];
    });
};

/**
 * @param unit {number}
 * @returns {boolean}
 */
L5.VertexBufferAccessor.prototype.hasTCoord = function (unit) {
    return this.tCoord[unit] !== -1;
};
/**
 * @param unit {number}
 * @returns {number}
 */
L5.VertexBufferAccessor.prototype.getTCoordChannels = function (unit) {
    return this.tCoordChannels[unit];
};

/**
 * @param unit {number}
 * @param index {number}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.getColor = function (unit, index) {
    return new Float32Array
    (
        this.data.buffer,
        this.color[unit] + index * this.stride,
        this.colorChannels[unit]
    );
};
L5.VertexBufferAccessor.prototype.setColor = function (unit, index, dataArr) {
    var tar = new Float32Array(
        this.data.buffer,
        this.color[unit] + index * this.stride,
        this.colorChannels[unit]
    );
    tar.forEach(function (v, k) {
        tar[k] = dataArr[k];
    });
};
/**
 * @param unit {number}
 * @returns {boolean}
 */
L5.VertexBufferAccessor.prototype.hasColor = function (unit) {
    return this.color[unit] !== -1;
};
/**
 * @param unit {number}
 * @returns {boolean}
 */
L5.VertexBufferAccessor.prototype.getColorChannels = function (unit) {
    return this.colorChannels[unit];
};

/**
 * @fixme
 * @param index {number}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.getBlendIndices = function (index) {
    return new Float32Array
    (
        this.data.buffer,
        this.blendIndices + index * this.stride,
        1
    );
};
L5.VertexBufferAccessor.prototype.hasBlendIndices = function () {
    return this.blendIndices !== -1;
};

/**
 * @fixme
 * @param index {number}
 * @returns {Float32Array}
 */
L5.VertexBufferAccessor.prototype.getBlendWeight = function (index) {
    return new Float32Array
    (
        this.data.buffer,
        this.blendWeight + index * this.stride,
        1
    );
};
L5.VertexBufferAccessor.prototype.hasBlendWeight = function () {
    return this.blendWeight !== -1;
};

L5.VertexBufferAccessor.prototype.getData = function () {
    return this.data;
};

/**
 * @private
 */
L5.VertexBufferAccessor.prototype.initialize = function () {
    var format = this.format;
    var data = this.data;

    var type;

    // 顶点坐标
    var index = format.getIndex(L5.VertexFormat.AU_POSITION);
    if (index >= 0) {
        this.position = format.getOffset(index);
        type = format.getAttributeType(index);
        this.positionChannels = type;
        if (this.positionChannels > 4) {
            this.positionChannels = 0;
        }
    }

    // 法线
    index = format.getIndex(L5.VertexFormat.AU_NORMAL);
    if (index >= 0) {
        this.normal = format.getOffset(index);
        type = format.getAttributeType(index);
        this.normalChannels = type;
        if (this.normalChannels > 4) {
            this.normalChannels = 0;
        }
    }

    // 切线
    index = format.getIndex(L5.VertexFormat.AU_TANGENT);
    if (index >= 0) {
        this.tangent = format.getOffset(index);
        type = format.getAttributeType(index);
        this.tangentChannels = type;
        if (this.tangentChannels > 4) {
            this.tangentChannels = 0;
        }
    }

    // 双切线
    index = format.getIndex(L5.VertexFormat.AU_BINORMAL);
    if (index >= 0) {
        this.binormal = format.getOffset(index);
        type = format.getAttributeType(index);
        this.binormalChannels = type;
        if (this.binormalChannels > 4) {
            this.binormalChannels = 0;
        }
    }

    // 纹理坐标
    var unit;
    var units = L5.VertexFormat.MAX_TCOORD_UNITS;
    const AU_TEXCOORD = L5.VertexFormat.AU_TEXCOORD;
    for (unit = 0; unit < units; ++unit) {
        index = format.getIndex(AU_TEXCOORD, unit);
        if (index >= 0) {
            this.tCoord[unit] = format.getOffset(index);
            type = format.getAttributeType(index);
            this.tCoordChannels[unit] = type;
            if (this.tCoordChannels[unit] > 4) {
                this.tCoordChannels[unit] = 0;
            }
        }
    }

    // 颜色
    units = L5.VertexFormat.MAX_COLOR_UNITS;
    const AU_COLOR = L5.VertexFormat.AU_COLOR;
    for (unit = 0; unit < units; ++unit) {
        index = format.getIndex(AU_COLOR, unit);
        if (index >= 0) {
            this.color[unit] = format.getOffset(index);
            type = format.getAttributeType(index);
            this.colorChannels[unit] = type;
            if (this.colorChannels[unit] > 4) {
                this.colorChannels[unit] = 0;
            }
        }
    }

    index = format.getIndex(L5.VertexFormat.AU_BLENDINDICES);
    if (index >= 0) {
        this.blendIndices = format.getOffset(index);
    }

    index = format.getIndex(L5.VertexFormat.AU_BLENDWEIGHT);
    if (index >= 0) {
        this.blendWeight = format.getOffset(index);
    }
};


