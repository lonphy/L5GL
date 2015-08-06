/**
 * AlphaState - 透明状态
 *
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.AlphaState = function () {
    this.blendEnabled = false;
    this.srcBlend = L5.AlphaState.BM_SRC_ALPHA;
    this.dstBlend = L5.AlphaState.BM_ONE_MINUS_SRC_ALPHA;
    this.constantColor = new Float32Array ([ 0, 0, 0, 0 ]);
};

L5.nameFix (L5.AlphaState, 'AlphaState');


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