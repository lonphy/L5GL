import { D3Object } from '../../core/D3Object';
import { DECLARE_ENUM } from '../../util/util';

class VertexFormat extends D3Object {

    /**
     * @param {number} numAttributes
     */
    constructor(numAttributes) {
        console.assert(numAttributes >= 0, 'Number of attributes must be positive');
        super();

        const MAX_ATTRIBUTES = VertexFormat.MAX_ATTRIBUTES;

        this.numAttributes = numAttributes;
        this.stride = 0;

        this.elements = new Array(MAX_ATTRIBUTES);
        for (let i = 0; i < MAX_ATTRIBUTES; ++i) {
            this.elements[i] = new VertexFormat.Element(0, 0, VertexFormat.AT_NONE, VertexFormat.AU_NONE, 0);
        }
    }


    /**
     * 创建顶点格式快捷函数
     * @param {number} numAttributes - 顶点元素数量
     * @param {Array} args
     *
     * @returns {VertexFormat}
     */
    static create(numAttributes, ...args/*, usage1, type1, usageIndex1, usage2,...*/) {
        let vf = new VertexFormat(numAttributes);

        let offset = 0;
        let start = 0;
        const TYPE_SIZE = VertexFormat.TYPE_SIZE;

        for (let i = 0; i < numAttributes; ++i, start += 3) {
            let usage = args[start];
            let type = args[start + 1];
            let usageIndex = args[start + 2];
            vf.setAttribute(i, 0, offset, type, usage, usageIndex);

            offset += TYPE_SIZE[type];
        }
        vf.setStride(offset);

        return vf;
    }

    /**
     * 设置指定位置顶点元素
     * @param {number} attribute
     * @param {number} streamIndex
     * @param {number} offset
     * @param {number} type - AttributeType
     * @param {number} usage - AttributeUsage
     * @param {number} usageIndex
     */
    setAttribute(attribute, streamIndex, offset, type, usage, usageIndex) {
        console.assert(0 <= attribute && attribute < this.numAttributes, 'Invalid index in SetAttribute');

        let element = this.elements[attribute];
        element.streamIndex = streamIndex;
        element.offset = offset;
        element.type = type;
        element.usage = usage;
        element.usageIndex = usageIndex;
    }

    /**
     * 获取指定位置顶点元素
     * @param {number} attribute - 顶点元素索引
     * @returns {VertexFormat.Element}
     */
    getAttribute(attribute) {
        console.assert(0 <= attribute && attribute < this.numAttributes, 'Invalid index in GetAttribute');
        return this.elements[attribute].clone();
    }

    /**
     * 获取指定位置顶点元素
     * @param {number} stride
     */
    setStride(stride) {
        console.assert(0 < stride, 'Stride must be positive');
        this.stride = stride;
    }

    /**
     * 根据用途获取顶点元素位置
     * @param {number} usage - 用途，参考VertexFormat.AU_XXX
     * @param {number} usageIndex
     * @returns {number}
     */
    getIndex(usage, usageIndex = 0) {
        usageIndex = usageIndex || 0;

        for (let i = 0; i < this.numAttributes; ++i) {
            if (this.elements[i].usage === usage &&
                this.elements[i].usageIndex === usageIndex
            ) {
                return i;
            }
        }

        return -1;
    }

    /**
     * @param {number} attribute
     * @returns {number}
     */
    getStreamIndex(attribute) {
        if (0 <= attribute && attribute < this.numAttributes) {
            return this.elements[attribute].streamIndex;
        }
        console.assert(false, 'Invalid index in getStreamIndex');
        return 0;
    }

    /**
     * 获取顶点元素偏移
     * @param {number} attribute - 用途，参考VertexFormat.AU_XXX
     * @returns {number}
     */
    getOffset(attribute) {
        if (0 <= attribute && attribute < this.numAttributes) {
            return this.elements[attribute].offset;
        }
        console.assert(false, 'Invalid index in getOffset');
        return 0;
    }

    /**
     * 获取顶点元素数据类型
     * @param {number} attribute 顶点索引
     * @returns {number} VertexFormat.AT_XXX
     */
    getAttributeType(attribute) {
        if (0 <= attribute && attribute < this.numAttributes) {
            return this.elements[attribute].type;
        }
        console.assert(false, 'Invalid index in GetAttributeType');
        return VertexFormat.AT_NONE;
    }

    /**
     * 填充VBA 属性
     * @param {number} usage - 用途, 参考 VertexFormat.AU_XXX
     * @param {VBAAttr} attr
     * @param {number} usageIndex
     */
    fillVBAttr(usage, attr, usageIndex = 0) {
        let index = this.getIndex(usage);
        if (index >= 0) {
            let type = this.getAttributeType(index, usageIndex);
            attr.offset = this.getOffset(index);
            attr.eType = VertexFormat.TYPE_CST[type];
            attr.eNum = VertexFormat.NUM_COMPONENTS[type];
            attr.cSize = VertexFormat.TYPE_SIZE[type];
            attr.wFn = 'set' + attr.eType.name.replace('Array', '');
            attr.rFn = 'get' + attr.eType.name.replace('Array', '');
        }
    }

    getAttributeUsage(attribute) {
        if (0 <= attribute && attribute < this.numAttributes) {
            return this.elements[attribute].usage;
        }
        console.assert(false, 'Invalid index in GetAttributeUsage');
        return VertexFormat.AU_NONE;
    }

    getUsageIndex(attribute) {
        if (0 <= attribute && attribute < this.numAttributes) {
            return this.elements[attribute].usageIndex;
        }
        console.assert(false, 'Invalid index in getUsageIndex');
        return 0;
    }

    /**
     * 获取顶点元素类型单位字节
     * @param {number} type - 参考AT_XXX
     * @returns {number}
     */
    static getComponentSize(type) {
        return VertexFormat.COMPONENTS_SIZE[type];
    }

    /**
     * 获取顶点元素类型单位个数
     * @param {number} type - 参考AT_XXX
     * @returns {number}
     */
    static getNumComponents(type) {
        return VertexFormat.NUM_COMPONENTS[type];
    }

    /**
     * 获取顶点元素类型所占字节
     * @param {number} type - 参考AT_XXX
     * @returns {number}
     */
    static getTypeSize(type) {
        return VertexFormat.TYPE_SIZE[type];
    }

    static getUsageString(u) {
        return ['未使用', '顶点坐标', '法线', '切线', '双切线', '纹理坐标', '颜色', '混合索引', '混合权重', '雾坐标', '点尺寸'][(u >= 0 && u <= 10) ? u : 0];
    }

    static getTypeString(t) {
        return ['NONE', 'FLOAT1', 'FLOAT2', 'FLOAT3', 'FLOAT4', 'UBYTE4', 'SHORT1', 'SHORT2', 'SHORT4'][(t >= 0 && t <= 8) ? t : 0];
    }

    debug() {
        console.log('================ VertexFormat 类型 ===============');
        console.log('  属性个数:', this.numAttributes, '步幅:', this.stride, '字节');
        for (let i = 0, l = this.numAttributes; i < l; ++i) {
            this.elements[i].debug();
        }
        console.log('================ VertexFormat 类型 ===============');
    }

    /**
     * @param {InStream} inStream
     */
    load(inStream) {
        super.load(inStream);

        this.numAttributes = inStream.readUint32();
        const MAX_ATTRIBUTES = VertexFormat.MAX_ATTRIBUTES;

        for (let i = 0; i < MAX_ATTRIBUTES; ++i) {
            this.elements[i].streamIndex = inStream.readUint32();
            this.elements[i].offset = inStream.readUint32();
            this.elements[i].type = inStream.readEnum();
            this.elements[i].usage = inStream.readEnum();
            this.elements[i].usageIndex = inStream.readUint32();
        }

        this.stride = inStream.readUint32();
    }

    /**
     * 文件解析工厂方法
     * @param {InStream} inStream
     * @returns {VertexFormat}
     */
    static factory(inStream) {
        let obj = new VertexFormat(0);
        obj.load(inStream);
        return obj;
    }
}


D3Object.Register('VertexFormat', VertexFormat.factory);

/**
 * 顶点元素构造
 */
class Element {
    constructor(streamIndex, offset, type, usage, usageIndex) {
        this.streamIndex = streamIndex || 0;
        this.offset = offset || 0;
        this.type = type || VertexFormat.AT_NONE;
        this.usage = usage || VertexFormat.AU_NONE;
        this.usageIndex = usageIndex || 0;
    }

    clone() {
        return new Element
            (
            this.streamIndex,
            this.offset,
            this.type,
            this.usage,
            this.usageIndex
            );
    }

    debug() {
        console.log('------------ VertexFormat.Element 偏移:', this.offset, '字节 ---------------');
        console.log('  用途:', VertexFormat.getUsageString(this.usage));
        console.log('  类型:', VertexFormat.getTypeString(this.type));
    }
}
VertexFormat.Element = Element;

// 顶点属性最大个数
DECLARE_ENUM(VertexFormat, {
    MAX_ATTRIBUTES: 16,
    MAX_TCOORD_UNITS: 8,
    MAX_COLOR_UNITS: 2
}, false);

// 顶点属性数据类型
DECLARE_ENUM(VertexFormat, {
    AT_NONE: 0x00,
    AT_FLOAT1: 0x01,
    AT_FLOAT2: 0x02,
    AT_FLOAT3: 0x03,
    AT_FLOAT4: 0x04,
    AT_HALF1: 0x05,
    AT_HALF2: 0x06,
    AT_HALF3: 0x07,
    AT_HALF4: 0x08,
    AT_UBYTE4: 0x09,
    AT_SHORT1: 0x0a,
    AT_SHORT2: 0x0b,
    AT_SHORT4: 0x0c
}, false);

// 属性用途
DECLARE_ENUM(VertexFormat, {
    AU_NONE: 0,
    AU_POSITION: 1,   // 顶点     -> shader location 0
    AU_NORMAL: 2,   // 法线     -> shader location 2
    AU_TANGENT: 3,   // 切线     -> shader location 14
    AU_BINORMAL: 4,   // 双切线   -> shader location 15
    AU_TEXCOORD: 5,   // 纹理坐标  -> shader location 8-15
    AU_COLOR: 6,   // 颜色     -> shader location 3-4
    AU_BLENDINDICES: 7,   // 混合索引  -> shader location 7
    AU_BLENDWEIGHT: 8,   // 混合权重  -> shader location 1
    AU_FOGCOORD: 9,   // 雾坐标    -> shader location 5
    AU_PSIZE: 10   // 点大小    -> shader location 6
}, false);

// 属性类型的 构造, 尺寸 字节
DECLARE_ENUM(VertexFormat, {
    TYPE_CST: [
        null,          // AT_NONE
        Float32Array,  // AT_FLOAT1
        Float32Array,  // AT_FLOAT2
        Float32Array,  // AT_FLOAT3
        Float32Array,  // AT_FLOAT4
        Uint8Array,    // AT_UBYTE4
        Uint16Array,   // AT_SHORT1
        Uint16Array,   // AT_SHORT2
        Uint16Array    // AT_SHORT4
    ],
    TYPE_SIZE: [
        0,  // AT_NONE
        4,  // AT_FLOAT1
        8,  // AT_FLOAT2
        12, // AT_FLOAT3
        16, // AT_FLOAT4
        4,  // AT_UBYTE4
        2,  // AT_SHORT1
        4,  // AT_SHORT2
        8   // AT_SHORT4
    ],
    NUM_COMPONENTS: [
        0,  // AT_NONE
        1,  // AT_FLOAT1
        2,  // AT_FLOAT2
        3,  // AT_FLOAT3
        4,  // AT_FLOAT4
        4,  // AT_UBYTE4
        1,  // AT_SHORT1
        2,  // AT_SHORT2
        4   // AT_SHORT4
    ]
});

export { VertexFormat };
