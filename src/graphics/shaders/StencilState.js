/**
 * StencilState - 模板状态
 *
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.StencilState = function () {
    this.mask = 0xffffffff;       // default: UINT_MAX
    this.writeMask = 0xffffffff;  // default: UINT_MAX
    this.onFail  = L5.StencilState.OPERAETION_TYPE_KEEP;
    this.onZFail = L5.StencilState.OPERAETION_TYPE_KEEP;
    this.onZPass = L5.StencilState.OPERAETION_TYPE_KEEP;

    this.enabled   = false;
    this.compare   = L5.StencilState.COMPARE_MODE_NEVER;
    this.reference = 0;     // [0,1]
};

L5.nameFix (L5.StencilState, 'StencilState');

// 操作类型
L5.StencilState.OPERAETION_TYPE_KEEP      = 0;
L5.StencilState.OPERAETION_TYPE_ZERO      = 1;
L5.StencilState.OPERAETION_TYPE_REPLACE   = 2;
L5.StencilState.OPERAETION_TYPE_INCREMENT = 3;
L5.StencilState.OPERAETION_TYPE_DECREMENT = 4;
L5.StencilState.OPERAETION_TYPE_INVERT    = 5;
L5.StencilState.OPERAETION_TYPE_QUANTITY  = 6;


// 比较模式
L5.StencilState.COMPARE_MODE_NEVER    = 0;
L5.StencilState.COMPARE_MODE_LESS     = 1;
L5.StencilState.COMPARE_MODE_EQUAL    = 2;
L5.StencilState.COMPARE_MODE_LEQUAL   = 3;
L5.StencilState.COMPARE_MODE_GREATER  = 4;
L5.StencilState.COMPARE_MODE_NOTEQUAL = 5;
L5.StencilState.COMPARE_MODE_GEQUAL   = 6;
L5.StencilState.COMPARE_MODE_ALWAYS   = 7;
L5.StencilState.COMPARE_MODE_QUANTITY = 8;