/**
 * VisualPass
 *
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.VisualPass = function () {
    L5.D3Object.call (this);
    /**
     * @type {L5.VertexShader}
     */
    this.vertexShader = null;
    /**
     * @type {L5.FragShader}
     */
    this.fragShader   = null;
    /**
     * @type {L5.AlphaState}
     */
    this.alphaState   = null;
    /**
     * @type {L5.CullState}
     */
    this.cullState    = null;
    /**
     * @type {L5.DepthState}
     */
    this.depthState   = null;
    /**
     * @type {L5.OffsetState}
     */
    this.offsetState  = null;
    /**
     * @type {L5.StencilState}
     */
    this.stencilState = null;
    /**
     * @type {L5.WireState}
     */
    this.wireState    = null;
};
L5.nameFix (L5.VisualPass, 'VisualPass');
L5.extendFix (L5.VisualPass, L5.D3Object);