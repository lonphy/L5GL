/**
 * CullState - 裁剪状态
 *
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.CullState = function () {
    this.enabled = true;   // default: true
    this.CCWOrder = true;  // default: true
};

L5.nameFix (L5.CullState, 'CullState');