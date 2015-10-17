/**
 * WireState - 网格状态
 *
 * @deprecated
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.WireState = function(){
    this.enabled = false;
};
L5.nameFix(L5.WireState, 'WireState');
L5.extendFix(L5.WireState, L5.D3Object);

L5.WireState.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);
    this.enabled = inStream.readBool();
};

L5.StencilState.prototype.save = function (outStream) {
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.WireState}
 */
L5.WireState.factory = function (inStream) {
    var obj = new L5.WireState();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.WireState', L5.WireState.factory);