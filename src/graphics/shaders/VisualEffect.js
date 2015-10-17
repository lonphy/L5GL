/**
 * VisualEffect
 *
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */

L5.VisualEffect = function () {
    this.techniques = [];
};

L5.nameFix(L5.VisualEffect, 'VisualEffect');
L5.extendFix(L5.VisualEffect, L5.D3Object);

/**
 * @param technique {L5.VisualTechnique}
 */
L5.VisualEffect.prototype.insertTechnique = function (technique) {
    if (technique) {
        this.techniques.push(technique);
    }
    else {
        L5.assert(false, 'Input to insertTechnique must be nonnull.');
    }
};
/**
 * @returns {number}
 */
L5.VisualEffect.prototype.getNumTechniques = function () {
    return this.techniques.length;
};

/**
 * @param techniqueIndex {number}
 * @returns {number}
 */
L5.VisualEffect.prototype.getNumPasses = function (techniqueIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getNumPass();
    }
    L5.assert(false, "Invalid index in getNumPasses.\n");
    return 0;
};
/**
 * @param techniqueIndex {number}
 * @returns {L5.VisualTechnique}
 */
L5.VisualEffect.prototype.getTechnique = function (techniqueIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex];
    }
    L5.assert(false, "Invalid index in getTechnique.\n");
    return null;
};

/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.VisualPass}
 */
L5.VisualEffect.prototype.getPass = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getPass(passIndex);
    }
    L5.assert(false, "Invalid index in GetPass.\n");
    return null;
};

/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.VertexShader}
 */
L5.VisualEffect.prototype.getVertexShader = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getVertexShader(passIndex);
    }

    L5.assert(false, 'Invalid index in getVertexShader.');
    return null;
};
/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.FragShader}
 */
L5.VisualEffect.prototype.getFragShader = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getFragShader(passIndex);
    }

    L5.assert(false, 'Invalid index in getFragShader.');
    return null;
};

/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.AlphaState}
 */
L5.VisualEffect.prototype.getAlphaState = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getAlphaState(passIndex);
    }

    L5.assert(false, 'Invalid index in getAlphaState.');
    return null;
};
/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.CullState}
 */
L5.VisualEffect.prototype.getCullState = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getCullState(passIndex);
    }

    L5.assert(false, 'Invalid index in getCullState.');
    return null;
};
/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.DepthState}
 */
L5.VisualEffect.prototype.getDepthState = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getDepthState(passIndex);
    }

    L5.assert(false, 'Invalid index in getDepthState.');
    return null;
};
/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.OffsetState}
 */
L5.VisualEffect.prototype.getOffsetState = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getOffsetState(passIndex);
    }

    L5.assert(false, 'Invalid index in getOffsetState.');
    return null;
};
/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.StencilState}
 */
L5.VisualEffect.prototype.getStencilState = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getStencilState(passIndex);
    }

    L5.assert(false, 'Invalid index in getStencilState.');
    return null;
};
/**
 * @param techniqueIndex {number}
 * @param passIndex {number}
 * @returns {L5.WireState}
 */
L5.VisualEffect.prototype.getWireState = function (techniqueIndex, passIndex) {
    if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
        return this.techniques[techniqueIndex].getWireState(passIndex);
    }

    L5.assert(false, 'Invalid index in getWireState.');
    return null;
};

L5.VisualEffect.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    var numTechniques = inStream.readUint32();
    this.techniques.length = numTechniques;
    this.techniques = inStream.readSizedPointerArray(numTechniques);
};

L5.VisualEffect.prototype.link = function (inStream) {
    L5.D3Object.prototype.link.call(this, inStream);
    this.techniques.forEach(function (t, i) {
        this.techniques[i] = inStream.resolveLink(t);
    }, this);
};