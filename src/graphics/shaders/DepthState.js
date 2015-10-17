/**
 * DepthState - 深度测试状态
 *
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.DepthState = function () {
    L5.D3Object.call(this);
    this.enabled = true;
    this.writable = true;
    this.compare = L5.DepthState.COMPARE_MODE_LESS;
};

L5.nameFix (L5.DepthState, 'DepthState');
L5.extendFix(L5.DepthState, L5.D3Object);

// 比较模式
L5.DepthState.COMPARE_MODE_NEVER    = 0;
L5.DepthState.COMPARE_MODE_LESS     = 1;
L5.DepthState.COMPARE_MODE_EQUAL    = 2;
L5.DepthState.COMPARE_MODE_LEQUAL   = 3;
L5.DepthState.COMPARE_MODE_GREATER  = 4;
L5.DepthState.COMPARE_MODE_NOTEQUAL = 5;
L5.DepthState.COMPARE_MODE_GEQUAL   = 6;
L5.DepthState.COMPARE_MODE_ALWAYS   = 7;

L5.DepthState.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    this.enabled = inStream.readBool();
    this.writable = inStream.readBool();
    this.compare = inStream.readEnum();
};

L5.DepthState.prototype.save = function (outStream) {
    L5.D3Object.prototype.save.call(this, outStream);
    outStream.writeBool(this.enabled);
    outStream.writeBool(this.writable);
    outStream.writeEnum(this.compare);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.DepthState}
 */
L5.DepthState.factory = function (inStream) {
    var obj = new L5.DepthState();
    obj.enabled = false;
    obj.writable = false;
    obj.compare = L5.DepthState.COMPARE_MODE_NEVER;
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.DepthState', L5.DepthState.factory);