/**
 * StencilState - 模板状态
 *
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.StencilState = function () {
    L5.D3Object.call(this);
    this.mask = 0xffffffff;       // default: unsigned int max
    this.writeMask = 0xffffffff;  // default: unsigned int max
    this.onFail = L5.StencilState.OPERAETION_TYPE_KEEP;
    this.onZFail = L5.StencilState.OPERAETION_TYPE_KEEP;
    this.onZPass = L5.StencilState.OPERAETION_TYPE_KEEP;

    this.enabled = false;
    this.compare = L5.StencilState.COMPARE_MODE_NEVER;
    this.reference = 0;     // [0,1]
};

L5.nameFix(L5.StencilState, 'StencilState');
L5.extendFix(L5.StencilState, L5.D3Object);

// 操作类型
L5.StencilState.OPERAETION_TYPE_KEEP = 0;
L5.StencilState.OPERAETION_TYPE_ZERO = 1;
L5.StencilState.OPERAETION_TYPE_REPLACE = 2;
L5.StencilState.OPERAETION_TYPE_INCREMENT = 3;
L5.StencilState.OPERAETION_TYPE_DECREMENT = 4;
L5.StencilState.OPERAETION_TYPE_INVERT = 5;


// 比较模式
L5.StencilState.COMPARE_MODE_NEVER = 0;
L5.StencilState.COMPARE_MODE_LESS = 1;
L5.StencilState.COMPARE_MODE_EQUAL = 2;
L5.StencilState.COMPARE_MODE_LEQUAL = 3;
L5.StencilState.COMPARE_MODE_GREATER = 4;
L5.StencilState.COMPARE_MODE_NOTEQUAL = 5;
L5.StencilState.COMPARE_MODE_GEQUAL = 6;
L5.StencilState.COMPARE_MODE_ALWAYS = 7;

L5.StencilState.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);
    this.enabled = inStream.readBool();
    this.compare = inStream.readEnum();
    this.reference = inStream.readUint32();
    this.mask = inStream.readUint32();
    this.writeMask = inStream.readUint32();
    this.onFail = inStream.readEnum();
    this.onZFail = inStream.readEnum();
    this.onZPass = inStream.readEnum();
};

L5.StencilState.prototype.save = function (outStream) {
    L5.D3Object.prototype.save.call(this, outStream);
    outStream.writeBool(this.enabled);
    outStream.writeEnum(this.compare);
    outStream.writeUint32(this.reference);
    outStream.writeUint32(this.mask);
    outStream.writeUint32(this.writeMask);
    outStream.writeEnum(this.onFail);
    outStream.writeEnum(this.onZFail);
    outStream.writeEnum(this.onZPass);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.StencilState}
 */
L5.StencilState.factory = function (inStream) {
    var obj = new L5.StencilState();
    obj.mask = 0;
    obj.writeMask = 0;
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.StencilState', L5.StencilState.factory);