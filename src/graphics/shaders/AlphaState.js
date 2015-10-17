/**
 * AlphaState - 透明状态
 *
 * @class
 *
 * @extends {L5.D3Object}
 * @author lonphy
 * @version 1.0
 */
L5.AlphaState = function () {
    L5.D3Object.call(this);
    this.blendEnabled = false;
    this.srcBlend = L5.AlphaState.BM_SRC_ALPHA;
    this.dstBlend = L5.AlphaState.BM_ONE_MINUS_SRC_ALPHA;
    this.constantColor = new Float32Array ([ 0, 0, 0, 0 ]);
};

L5.nameFix (L5.AlphaState, 'AlphaState');
L5.extendFix(L5.AlphaState, L5.D3Object);


/////////////////////////// 混合模式  ////////////////
L5.AlphaState.BM_ZERO                     = 0;
L5.AlphaState.BM_ONE                      = 1;
L5.AlphaState.BM_SRC_COLOR                = 2;
L5.AlphaState.BM_ONE_MINUS_SRC_COLOR      = 3;
L5.AlphaState.BM_DST_COLOR                = 4;
L5.AlphaState.BM_ONE_MINUS_DST_COLOR      = 5;
L5.AlphaState.BM_SRC_ALPHA                = 6;
L5.AlphaState.BM_ONE_MINUS_SRC_ALPHA      = 7;
L5.AlphaState.BM_DST_ALPHA                = 8;
L5.AlphaState.BM_ONE_MINUS_DST_ALPHA      = 9;
L5.AlphaState.BM_SRC_ALPHA_SATURATE       = 10;
L5.AlphaState.BM_CONSTANT_COLOR           = 11;
L5.AlphaState.BM_ONE_MINUS_CONSTANT_COLOR = 12;
L5.AlphaState.BM_CONSTANT_ALPHA           = 13;
L5.AlphaState.BM_ONE_MINUS_CONSTANT_ALPHA = 14;


L5.AlphaState.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    this.blendEnabled = inStream.readBool();
    this.srcBlend = inStream.readEnum();
    // todo: remove unused code.
    if (this.srcBlend > 1) {
        this.srcBlend += 2;
    }

    this.dstBlend = inStream.readEnum();
    // todo: remove unused code.
    if (this.dstBlend >= 8) {
        this.dstBlend += 3;
    }
    else if (this.dstBlend >= 4) {
        this.dstBlend += 2;
    }

    // todo : remove unused code.
    var compareEnabled = inStream.readBool();
    var compare = inStream.readEnum();
    var reference = inStream.readFloat32();

    this.constantColor = new Float32Array(inStream.readFloat32Range(4));
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.AlphaState}
 */
L5.AlphaState.factory = function (inStream) {
    var obj = new L5.AlphaState();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.AlphaState', L5.AlphaState.factory);