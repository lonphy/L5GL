/**
 * 剔除表面 状态
 *
 * @extends {L5.D3Object}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.CullState = function () {
    L5.D3Object.call(this);
    this.enabled = true;
    this.CCWOrder = true;
};

L5.nameFix(L5.CullState, 'CullState');
L5.extendFix(L5.CullState, L5.D3Object);

L5.CullState.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    this.enabled = inStream.readBool();
    this.CCWOrder = inStream.readBool();
};

L5.CullState.prototype.save = function (outStream) {
    L5.D3Object.prototype.save.call(this, outStream);
    outStream.writeBool(this.enabled);
    outStream.writeBool(this.CCWOrder);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.CullState}
 */
L5.CullState.factory = function (inStream) {
    var obj = new L5.CullState();
    obj.enabled = false;
    obj.CCWOrder = false;
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.CullState', L5.CullState.factory);