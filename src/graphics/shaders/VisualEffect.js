import { D3Object } from '../../core/D3Object';

class VisualEffect extends D3Object {

    constructor() {
        super('VisualEffect');
        this.techniques = [];
    }

    /**
     * @param {VisualTechnique} technique
     */
    insertTechnique(technique) {
        if (technique) {
            this.techniques.push(technique);
        }
        else {
            console.warn('Input to insertTechnique must be nonnull.');
        }
    }

    /**
     * @returns {number}
     */
    getNumTechniques() {
        return this.techniques.length;
    }

    /**
     * @param {number} techniqueIndex
     * @returns {number}
     */
    getNumPasses(techniqueIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getNumPass();
        }
        console.warn('Invalid index in getNumPasses.');
        return 0;
    }

    /**
     * @param {number} techniqueIndex
     * @returns {VisualTechnique}
     */
    getTechnique(techniqueIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex];
        }
        console.warn('Invalid index in getTechnique.');
        return null;
    }

    /**
     * @param {number} techniqueIndex
     * @param {number} passIndex
     * @returns {VisualPass}
     */
    getPass(techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getPass(passIndex);
        }
        console.warn('Invalid index in GetPass.');
        return null;
    }

    /**
     * @param {number} techniqueIndex
     * @param {number} passIndex
     * @returns {VertexShader}
     */
    getVertexShader(techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getVertexShader(passIndex);
        }

        console.warn('Invalid index in getVertexShader.');
        return null;
    }

    /**
     * @param {number} techniqueIndex
     * @param {number} passIndex
     * @returns {FragShader}
     */
    getFragShader(techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getFragShader(passIndex);
        }

        console.warn('Invalid index in getFragShader.');
        return null;
    }

    /**
     * @param {number} techniqueIndex
     * @param {number} passIndex
     * @returns {AlphaState}
     */
    getAlphaState(techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getAlphaState(passIndex);
        }

        console.warn('Invalid index in getAlphaState.');
        return null;
    }

    /**
     * @param {number} techniqueIndex
     * @param {number} passIndex
     * @returns {CullState}
     */
    getCullState(techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getCullState(passIndex);
        }

        console.warn('Invalid index in getCullState.');
        return null;
    }

    /**
     * @param {number} techniqueIndex
     * @param {number} passIndex
     * @returns {DepthState}
     */
    getDepthState(techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getDepthState(passIndex);
        }

        console.warn('Invalid index in getDepthState.');
        return null;
    }

    /**
     * @param {number} techniqueIndex
     * @param {number} passIndex
     * @returns {OffsetState}
     */
    getOffsetState(techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getOffsetState(passIndex);
        }

        console.warn('Invalid index in getOffsetState.');
        return null;
    }

    /**
     * @param {number} techniqueIndex
     * @param {number} passIndex
     * @returns {StencilState}
     */
    getStencilState(techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getStencilState(passIndex);
        }

        console.warn('Invalid index in getStencilState.');
        return null;
    }

    load(inStream) {
        super.load(inStream);

        var numTechniques = inStream.readUint32();
        this.techniques.length = numTechniques;
        this.techniques = inStream.readSizedPointerArray(numTechniques);
    }

    link(inStream) {
        super.link(inStream);
        this.techniques.forEach(function (t, i) {
            this.techniques[i] = inStream.resolveLink(t);
        }, this);
    }
}

export { VisualEffect };
