/**
 * VertexFormat 顶点格式
 * @author lonphy
 * @version 1.0
 *
 * @param numAttributes {number} 属性数量
 * @class
 * @extends {L5.D3Object}
 */
L5.VertexFormat = function (numAttributes) {
    L5.assert(numAttributes >= 0, 'Number of attributes must be positive');
    L5.D3Object.call(this);

    const MAX_ATTRIBUTES = L5.VertexFormat.MAX_ATTRIBUTES;

    this.numAttributes = numAttributes;
    this.stride = 0;

    this.elements = new Array(MAX_ATTRIBUTES);
    for (var i = 0; i < MAX_ATTRIBUTES; ++i) {
        this.elements[i] = new L5.VertexFormat.Element(0, 0, L5.VertexFormat.AT_NONE, L5.VertexFormat.AU_NONE, 0);
    }
};

L5.nameFix(L5.VertexFormat, 'VertexFormat');
L5.extendFix(L5.VertexFormat, L5.D3Object);

// 顶点各种属性最大个数
L5.VertexFormat.MAX_ATTRIBUTES = 16;
L5.VertexFormat.MAX_TCOORD_UNITS = 8;
L5.VertexFormat.MAX_COLOR_UNITS = 2;

// 属性类型
L5.VertexFormat.AT_NONE = 0;
L5.VertexFormat.AT_FLOAT1 = 1;
L5.VertexFormat.AT_FLOAT2 = 2;
L5.VertexFormat.AT_FLOAT3 = 3;
L5.VertexFormat.AT_FLOAT4 = 4;
L5.VertexFormat.AT_UBYTE4 = 5;
L5.VertexFormat.AT_SHORT1 = 6;
L5.VertexFormat.AT_SHORT2 = 7;
L5.VertexFormat.AT_SHORT4 = 8;

// 属性用途
L5.VertexFormat.AU_NONE = 0;
L5.VertexFormat.AU_POSITION = 1;   // 顶点
L5.VertexFormat.AU_NORMAL = 2;   // 法线
L5.VertexFormat.AU_TANGENT = 3;   // 切线
L5.VertexFormat.AU_BINORMAL = 4;   // 双切线
L5.VertexFormat.AU_TEXCOORD = 5;   // 纹理坐标
L5.VertexFormat.AU_COLOR = 6;   // 颜色
L5.VertexFormat.AU_BLENDINDICES = 7;   // 混合索引
L5.VertexFormat.AU_BLENDWEIGHT = 8;   // 混合权重
L5.VertexFormat.AU_FOGCOORD = 9;   // 雾坐标
L5.VertexFormat.AU_PSIZE = 10;  // 点大小


// 属性类型的尺寸 字节
L5.VertexFormat.TYPE_SIZE = [
    0,  // AT_NONE
    4,  // AT_FLOAT1
    8,  // AT_FLOAT2
    12, // AT_FLOAT3
    16, // AT_FLOAT4
    4,  // AT_UBYTE4
    2,  // AT_SHORT1
    4,  // AT_SHORT2
    8   // AT_SHORT4
];
L5.VertexFormat.COMPONENTS_SIZE = [
    0,  // AT_NONE
    4,  // AT_FLOAT1
    4,  // AT_FLOAT2
    4,  // AT_FLOAT3
    4,  // AT_FLOAT4
    1,  // AT_UBYTE4
    2,  // AT_SHORT1
    2,  // AT_SHORT2
    2   // AT_SHORT4
];
L5.VertexFormat.NUM_COMPONENTS = [
    0,  // AT_NONE
    1,  // AT_FLOAT1
    2,  // AT_FLOAT2
    3,  // AT_FLOAT3
    4,  // AT_FLOAT4
    4,  // AT_UBYTE4
    1,  // AT_SHORT1
    2,  // AT_SHORT2
    4   // AT_SHORT4
];


/**
 * 创建顶点格式快捷函数
 * @param numAttributes {number} 顶点元素数量
 *
 * @returns {L5.VertexFormat}
 */
L5.VertexFormat.create = function (numAttributes    /*, usage1, type1, usageIndex1, usage2,...*/) {
    var vf = new L5.VertexFormat(numAttributes);

    var args = Array.prototype.slice.call(arguments, 1);
    var offset = 0;
    var start = 0;
    const TYPE_SIZE = L5.VertexFormat.TYPE_SIZE;

    for (var i = 0; i < numAttributes; ++i, start += 3) {
        var usage = args[start];
        var type = args[start + 1];
        var usageIndex = args[start + 2];
        vf.setAttribute(i, 0, offset, type, usage, usageIndex);

        offset += TYPE_SIZE[type];
    }
    vf.setStride(offset);

    return vf;
};

/**
 * 设置指定位置顶点元素
 * @param attribute {number}
 * @param streamIndex {number}
 * @param offset {number}
 * @param type {number} AttributeType
 * @param usage {number} AttributeUsage
 * @param usageIndex {number}
 */
L5.VertexFormat.prototype.setAttribute = function (attribute, streamIndex, offset, type, usage, usageIndex) {
    L5.assert(0 <= attribute && attribute < this.numAttributes, 'Invalid index in SetAttribute');

    var element = this.elements[attribute];
    element.streamIndex = streamIndex;
    element.offset = offset;
    element.type = type;
    element.usage = usage;
    element.usageIndex = usageIndex;
};

/**
 * 获取指定位置顶点元素
 * @param attribute {number} 顶点元素索引
 * @returns {L5.VertexFormat.Element}
 */
L5.VertexFormat.prototype.getAttribute = function (attribute) {
    L5.assert(0 <= attribute && attribute < this.numAttributes, 'Invalid index in GetAttribute');
    return this.elements[attribute].clone();
};
/**
 * 获取指定位置顶点元素
 * @param stride {number} 顶点步幅
 */
L5.VertexFormat.prototype.setStride = function (stride) {
    L5.assert(0 < stride, 'Stride must be positive');
    this.stride = stride;
};

/**
 * 根据用途获取顶点元素位置
 * @param usage {number} 用途，参考L5.VertexFormat.AU_XXX
 * @param usageIndex {number}
 * @returns {number}
 */
L5.VertexFormat.prototype.getIndex = function (usage, usageIndex) {
    usageIndex = usageIndex || 0;

    for (var i = 0; i < this.numAttributes; ++i) {
        if (this.elements[i].usage === usage &&
            this.elements[i].usageIndex === usageIndex
        ) {
            return i;
        }
    }

    return -1;
};
/**
 * @param attribute {number}
 * @returns {number}
 */
L5.VertexFormat.prototype.getStreamIndex = function (attribute) {
    if (0 <= attribute && attribute < this.numAttributes) {
        return this.elements[attribute].streamIndex;
    }
    L5.assert(false, 'Invalid index in getStreamIndex');
    return 0;
};
/**
 * 获取顶点元素偏移
 * @param attribute {number} 用途，参考L5.VertexFormat.AU_XXX
 * @returns {number}
 */
L5.VertexFormat.prototype.getOffset = function (attribute) {
    if (0 <= attribute && attribute < this.numAttributes) {
        return this.elements[attribute].offset;
    }
    L5.assert(false, 'Invalid index in getOffset');
    return 0;
};
/**
 * 获取顶点元素数据类型
 * @param attribute {number} 顶点索引
 * @returns {number} L5.VertexFormat.AT_XXX
 */
L5.VertexFormat.prototype.getAttributeType = function (attribute) {
    if (0 <= attribute && attribute < this.numAttributes) {
        return this.elements[attribute].type;
    }
    L5.assert(false, 'Invalid index in GetAttributeType');
    return L5.VertexFormat.AT_NONE;
};

L5.VertexFormat.prototype.getAttributeUsage = function (attribute) {
    if (0 <= attribute && attribute < this.numAttributes) {
        return this.elements[attribute].usage;
    }
    L5.assert(false, 'Invalid index in GetAttributeUsage');
    return L5.VertexFormat.AU_NONE;
};
L5.VertexFormat.prototype.getUsageIndex = function (attribute) {
    if (0 <= attribute && attribute < this.numAttributes) {
        return this.elements[attribute].usageIndex;
    }
    L5.assert(false, 'Invalid index in getUsageIndex');
    return 0;
};

/**
 * 获取顶点元素类型单位字节
 * @param type {number} 参考L5.AT_XXX
 * @returns {number}
 */
L5.VertexFormat.prototype.getComponentSize = function (type) {
    return L5.VertexFormat.COMPONENTS_SIZE[type];
};
/**
 * 获取顶点元素类型单位个数
 * @param type {number} 参考L5.AT_XXX
 * @returns {number}
 */
L5.VertexFormat.prototype.getNumComponents = function (type) {
    return L5.VertexFormat.NUM_COMPONENTS[type];
};
/**
 * 获取顶点元素类型所占字节
 * @param type {number} 参考L5.AT_XXX
 * @returns {number}
 */
L5.VertexFormat.prototype.getTypeSize = function (type) {
    return L5.VertexFormat.TYPE_SIZE[type];
};

////////////////////////////////////////////////////////////////////////
/**
 * 顶点元素构造
 * @class
 *
 * @param streamIndex
 * @param offset
 * @param type
 * @param usage
 * @param usageIndex
 * @constructor
 */
L5.VertexFormat.Element = function (streamIndex, offset, type, usage, usageIndex) {
    this.streamIndex = streamIndex || 0;
    this.offset = offset || 0;
    this.type = type || L5.VertexFormat.AT_NONE;
    this.usage = usage || L5.VertexFormat.AU_NONE;
    this.usageIndex = usageIndex || 0;
};

L5.VertexFormat.Element.prototype.clone = function () {
    return new L5.VertexFormat.Element
    (
        this.streamIndex,
        this.offset,
        this.type,
        this.usage,
        this.usageIndex
    );
};

L5.VertexFormat.getUsageString = function (u) {
    return ['未使用', '顶点坐标', '法线', '切线', '双切线', '纹理坐标', '颜色', '混合索引', '混合权重', '雾坐标', '点尺寸'][(u >= 0 && u <= 10) ? u : 0];
};
L5.VertexFormat.getTypeString = function (t) {
    return ['NONE', 'FLOAT1', 'FLOAT2', 'FLOAT3', 'FLOAT4', 'UBYTE4', 'SHORT1', 'SHORT2', 'SHORT4'][(t >= 0 && t <= 8) ? t : 0];
};

L5.VertexFormat.prototype.debug = function () {
    console.log("================ VertexFormat 类型 ===============");
    console.log("  属性个数:", this.numAttributes, "步幅:", this.stride, "字节");
    for (var i = 0, l = this.numAttributes; i < l; ++i) {
        this.elements[i].debug();
    }
    console.log("================ VertexFormat 类型 ===============");
};

L5.VertexFormat.Element.prototype.debug = function () {
    console.log("------------ VertexFormat.Element 偏移:", this.offset, "字节 ---------------");
    console.log("  用途:", L5.VertexFormat.getUsageString(this.usage));
    console.log("  类型:", L5.VertexFormat.getTypeString(this.type));
};

/**
 *
 * @param inStream {L5.InStream}
 */
L5.VertexFormat.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    this.numAttributes = inStream.readUint32();
    const MAX_ATTRIBUTES = L5.VertexFormat.MAX_ATTRIBUTES;

    for (var i = 0; i < MAX_ATTRIBUTES; ++i) {
        this.elements[i].streamIndex = inStream.readUint32();
        this.elements[i].offset = inStream.readUint32();
        this.elements[i].type = inStream.readEnum();
        this.elements[i].usage = inStream.readEnum();
        this.elements[i].usageIndex = inStream.readUint32();
    }

    this.stride = inStream.readUint32();
};
/**
 * 文件解析工厂方法
 * @param inStream {L5.inStream}
 * @returns {L5.VertexFormat}
 */
L5.VertexFormat.factory = function (inStream) {
    var obj = new L5.VertexFormat(0);
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.VertexFormat', L5.VertexFormat.factory);