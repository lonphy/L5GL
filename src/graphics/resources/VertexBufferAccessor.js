import { VertexFormat } from './VertexFormat'

export let VBAAttr = {
    offset: -1, // 偏移
    eType: 0,  // 元素类型构造
    wFn: 0,  // DataView 写函数名
    rFn: 0,  // DataView 读函数名
    eNum: 0,  // 元素类型数量
    cSize: 0   // 单元大小, 字节, 缓存值
};


/**
 * VertexBufferAccessor 顶点缓冲访问器
 */
export class VertexBufferAccessor {

    /**
     * @param {VertexFormat} format
     * @param {VertexBuffer} buffer
     * @param {Boolean} endian 字节序, 默认为小端
     */
    constructor(format, buffer, endian = true) {
        /**
         * @type {VertexFormat}
         */
        this.format = format;
        /**
         * @type {VertexBuffer}
         */
        this.vertexBuffer = buffer;

        this.stride = format.stride;
        this.endian = endian;

        /**
         * @type {ArrayBuffer}
         */
        this.data = buffer.getData();
        this.rw = new DataView(this.data.buffer);

        var i;
        const MAX_TCOORD_UNITS = VertexFormat.MAX_TCOORD_UNITS;
        const MAX_COLOR_UNITS = VertexFormat.MAX_COLOR_UNITS;

        this.position = Object.create(VBAAttr);
        this.normal = Object.create(VBAAttr);
        this.tangent = Object.create(VBAAttr);
        this.binormal = Object.create(VBAAttr);
        this.pointSize = Object.create(VBAAttr);
        this.tCoord = new Array(MAX_TCOORD_UNITS);
        this.color = new Array(MAX_COLOR_UNITS);
        this.blendIndices = Object.create(VBAAttr);
        this.blendWeight = Object.create(VBAAttr);


        for (i = 0; i < MAX_TCOORD_UNITS; ++i) {
            this.tCoord[i] = Object.create(VBAAttr);
        }
        for (i = 0; i < MAX_COLOR_UNITS; ++i) {
            this.color[i] = Object.create(VBAAttr);
        }

        this._initialize();
    }

    /**
     * @private
     */
    _initialize() {
        let fmt = this.format;
        let unit, units;

        // 顶点坐标
        fmt.fillVBAttr(VertexFormat.AU_POSITION, this.position);
        // 法线
        fmt.fillVBAttr(VertexFormat.AU_NORMAL, this.normal);
        // 切线
        fmt.fillVBAttr(VertexFormat.AU_TANGENT, this.tangent);
        // 双切线
        fmt.fillVBAttr(VertexFormat.AU_BINORMAL, this.binormal);
        // 点大小
        fmt.fillVBAttr(VertexFormat.AU_PSIZE, this.pointSize);
        // 纹理坐标
        units = VertexFormat.MAX_TCOORD_UNITS;
        for (unit = 0; unit < units; ++unit) {
            fmt.fillVBAttr(VertexFormat.AU_TEXCOORD, this.tCoord[unit], unit);
        }

        // 颜色
        units = VertexFormat.MAX_COLOR_UNITS;
        for (unit = 0; unit < units; ++unit) {
            fmt.fillVBAttr(VertexFormat.AU_COLOR, this.color[unit], unit);
        }

        fmt.fillVBAttr(VertexFormat.AU_BLENDINDICES, this.blendIndices);
        fmt.fillVBAttr(VertexFormat.AU_BLENDWEIGHT, this.blendWeight);
    }

    /**
     * @param visual {Visual}
     * @returns {VertexBufferAccessor}
     */
    static fromVisual(visual) {
        return new VertexBufferAccessor(visual.format, visual.vertexBuffer);
    }

    /**
     * 获取顶点数量
     * @returns {number}
     */
    get numVertices() {
        return this.vertexBuffer.numElements;
    }

    getData() {
        return this.data;
    }

    ////////////////// 顶点 ///////////////////////////////
    getPosition(index) {
        let t = this.position;
        let startOffset = t.offset + index * this.stride;
        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
    }

    setPosition(index, dataArr) {
        let t = this.position;
        let startOffset = t.offset + index * this.stride;

        for (let i = 0, l = t.eNum; i < l; ++i) {
            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
        }
    }

    hasPosition() {
        return this.position.offset !== -1;
    }

    ////////////////// 法线 ///////////////////////////////
    getNormal(index) {
        let t = this.normal;
        let startOffset = t.offset + index * this.stride;
        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
    }

    setNormal(index, dataArr) {
        let t = this.normal;
        let startOffset = t.offset + index * this.stride;

        for (let i = 0, l = t.eNum; i < l; ++i) {
            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
        }
    }

    hasNormal() {
        return this.normal.offset !== -1;
    }

    //////////////////////////////////////////////////////
    getTangent(index) {
        let t = this.tangent;
        let startOffset = t.offset + index * this.stride;
        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
    }

    setTangent(index, dataArr) {
        let t = this.tangent;
        let startOffset = t.offset + index * this.stride;

        for (let i = 0, l = t.eNum; i < l; ++i) {
            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
        }
    }

    hasTangent() {
        return this.tangent.offset !== -1;
    }

    //////////////////////////////////////////////////////
    getBinormal(index) {
        let t = this.binormal;
        let startOffset = t.offset + index * this.stride;
        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
    }

    setBinormal(index, dataArr) {
        let t = this.binormal;
        let startOffset = t.offset + index * this.stride;

        for (let i = 0, l = t.eNum; i < l; ++i) {
            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
        }
    }

    hasBinormal() {
        return this.binormal.offset !== -1;
    }

    //////////////////////////////////////////////////////
    getPointSize(index) {
        let t = this.pointSize;
        let startOffset = t.offset + index * this.stride;
        return this.rw[t.rFn](startOffset, this.endian);
    }

    setPointSize(index, val) {
        let t = this.pointSize;
        let startOffset = t.offset + index * this.stride;
        this.rw[t.wFn](startOffset, val, this.endian);
    }

    hasPointSize() {
        return this.pointSize.offset !== -1;
    }

    ///////////////////////////////////////////////////////////
    getTCoord(unit, index) {
        let t = this.tCoord[unit];
        let startOffset = t.offset + index * this.stride;
        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
    }

    /**
     * @param {number} unit 
     * @param {number} index 
     * @param {Array<number>|DataView} dataArr 
     */
    setTCoord(unit, index, dataArr) {
        let t = this.tCoord[unit];
        let startOffset = t.offset + index * this.stride;

        for (let i = 0, l = t.eNum; i < l; ++i) {
            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
        }
    }

    hasTCoord(unit) {
        return this.tCoord[unit].offset !== -1;
    }

    ///////////////////////////////////////////////////////////
    getColor(unit, index) {
        let t = this.color[unit];
        let startOffset = t.offset + index * this.stride;
        return new t.eType(this.data.buffer.slice(startOffset, startOffset + t.eNum * t.eType.BYTES_PER_ELEMENT));
    }

    setColor(unit, index, dataArr) {
        let t = this.color[unit];
        let startOffset = t.offset + index * this.stride;

        for (let i = 0, l = t.eNum; i < l; ++i) {
            this.rw[t.wFn](startOffset + i * t.eType.BYTES_PER_ELEMENT, dataArr[i], this.endian);
        }
    }

    hasColor(unit) {
        return this.color[unit].offset !== -1;
    }

    //////////////////////////////////////////////////////
    getBlendIndices(index) {
        let t = this.blendIndices;
        let startOffset = t.offset + index * this.stride;
        return this.rw[t.rFn](startOffset, this.endian);
    }

    setBlendIndices(index, val) {
        let t = this.blendIndices;
        let startOffset = t.offset + index * this.stride;
        this.rw[t.wFn](startOffset, val, this.endian);
    }

    hasBlendIndices() {
        return this.blendIndices.offset !== -1;
    }

    //////////////////////////////////////////////////////
    getBlendWeight(index) {
        let t = this.blendWeight;
        let startOffset = t.offset + index * this.stride;
        return this.rw[t.rFn](startOffset, this.endian);
    }

    setBlendWeight(index, val) {
        let t = this.blendWeight;
        let startOffset = t.offset + index * this.stride;
        this.rw[t.wFn](startOffset, val, this.endian);
    }

    hasBlendWeight() {
        return this.blendWeight.offset !== -1;
    }
}
