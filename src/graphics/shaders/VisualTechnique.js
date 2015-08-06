/**
 * VisualTechnique
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.VisualTechnique = function () {
    L5.D3Object.call (this);
    this.passes = [];
};

L5.nameFix (L5.VisualTechnique, 'VisualTechnique');
L5.extendFix (L5.VisualTechnique, L5.D3Object);

/**
 *
 * @param pass {L5.VisualPass}
 */
L5.VisualTechnique.prototype.insertPass = function (
    pass
) {
    if (pass) {
        this.passes.push (pass);
    }
    else {
        L5.assert (false, 'Input to insertPass must be nonnull.');
    }
};
/**
 *
 * @returns {number}
 */
L5.VisualTechnique.prototype.getNumPass = function () {
    return this.passes.length;
};
/**
 *
 * @returns {number}
 */
L5.VisualTechnique.prototype.getPass    = function (
    passIndex
) {
    if (0 <= passIndex && passIndex < this.passes.length) {
        return this.passes[ passIndex ];
    }
    L5.assert (false, "Invalid index in GetPass.\n");
    return null;
};

/**
 * @param passIndex {number}
 * @returns {L5.VertexShader}
 */
L5.VisualTechnique.prototype.getVertexShader = function (
    passIndex
) {
    if (0 <= passIndex && passIndex < this.passes.length)
    {
        return this.passes[passIndex ].vertexShader;
    }

    L5.assert(false, 'Invalid index in getVertexShader.');
    return null;
};
/**
 * @param passIndex {number}
 * @returns {L5.FragShader}
 */
L5.VisualTechnique.prototype.getFragShader   = function (
    passIndex
) {
    if (0 <= passIndex && passIndex < this.passes.length)
    {
        return this.passes[passIndex ].fragShader;
    }

    L5.assert(false, 'Invalid index in getFragShader.');
    return null;
};

/**
 * @param passIndex {number}
 * @returns {L5.AlphaState}
 */
L5.VisualTechnique.prototype.getAlphaState   = function (
    passIndex
) {
    if (0 <= passIndex && passIndex < this.passes.length)
    {
        return this.passes[passIndex ].alphaState;
    }

    L5.assert(false, 'Invalid index in getAlphaState.');
    return null;
};
/**
 * @param passIndex {number}
 * @returns {L5.CullState}
 */
L5.VisualTechnique.prototype.getCullState    = function (
    passIndex
) {
    if (0 <= passIndex && passIndex < this.passes.length)
    {
        return this.passes[passIndex ].cullState;
    }

    L5.assert(false, 'Invalid index in getCullState.');
    return null;
};
/**
 * @param passIndex {number}
 * @returns {L5.DepthState}
 */
L5.VisualTechnique.prototype.getDepthState   = function (
    passIndex
) {
    if (0 <= passIndex && passIndex < this.passes.length)
    {
        return this.passes[passIndex ].depthState;
    }

    L5.assert(false, 'Invalid index in getDepthState.');
    return null;
};
/**
 * @param passIndex {number}
 * @returns {L5.OffsetState}
 */
L5.VisualTechnique.prototype.getOffsetState  = function (
    passIndex
) {
    if (0 <= passIndex && passIndex < this.passes.length)
    {
        return this.passes[passIndex ].offsetState;
    }

    L5.assert(false, 'Invalid index in getOffsetState.');
    return null;
};
/**
 * @param passIndex {number}
 * @returns {L5.StencilState}
 */
L5.VisualTechnique.prototype.getStencilState = function (
    passIndex
) {
    if (0 <= passIndex && passIndex < this.passes.length)
    {
        return this.passes[passIndex ].stencilState;
    }

    L5.assert(false, 'Invalid index in getStencilState.');
    return null;
};
/**
 * @param passIndex {number}
 * @returns {L5.WireState}
 */
L5.VisualTechnique.prototype.getWireState    = function (
    passIndex
) {
    if (0 <= passIndex && passIndex < this.passes.length)
    {
        return this.passes[passIndex ].wireState;
    }

    L5.assert(false, 'Invalid index in getWireState.');
    return null;
};