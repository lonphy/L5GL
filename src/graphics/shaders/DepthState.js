/**
 * DepthState - 深度测试状态
 *
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.DepthState = function () {
    this.enabled = true;
    this.writable = true;
    this.compare = L5.DepthState.COMPARE_MODE_LEQUAL;
};

L5.nameFix (L5.DepthState, 'DepthState');

// 比较模式
L5.DepthState.COMPARE_MODE_NEVER    = 0;
L5.DepthState.COMPARE_MODE_LESS     = 1;
L5.DepthState.COMPARE_MODE_EQUAL    = 2;
L5.DepthState.COMPARE_MODE_LEQUAL   = 3;
L5.DepthState.COMPARE_MODE_GREATER  = 4;
L5.DepthState.COMPARE_MODE_NOTEQUAL = 5;
L5.DepthState.COMPARE_MODE_GEQUAL   = 6;
L5.DepthState.COMPARE_MODE_ALWAYS   = 7;
L5.DepthState.COMPARE_MODE_QUANTITY = 8;