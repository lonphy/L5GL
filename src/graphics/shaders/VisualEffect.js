/**
 * VisualEffect
 *
 * @author lonphy
 * @version 2.0
 */
import {D3Object} from '../../core/D3Object'

export class VisualEffect extends D3Object{

    constructor() {
        super('VisualEffect');
        this.techniques = [];
    }

    /**
     * @param technique {VisualTechnique}
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
     * @param techniqueIndex {number}
     * @returns {number}
     */
    getNumPasses(techniqueIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getNumPass();
        }
        console.warn("Invalid index in getNumPasses.\n");
        return 0;
    }

    /**
     * @param techniqueIndex {number}
     * @returns {L5.VisualTechnique}
     */
    getTechnique(techniqueIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex];
        }
        console.warn("Invalid index in getTechnique.\n");
        return null;
    }

    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.VisualPass}
     */
    getPass(techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getPass(passIndex);
        }
        console.warn("Invalid index in GetPass.\n");
        return null;
    }

    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.VertexShader}
     */
    getVertexShader(techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getVertexShader(passIndex);
        }

        console.warn('Invalid index in getVertexShader.');
        return null;
    }

    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.FragShader}
     */
    getFragShader(techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getFragShader(passIndex);
        }

        console.warn('Invalid index in getFragShader.');
        return null;
    }

    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.AlphaState}
     */
    getAlphaState(techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getAlphaState(passIndex);
        }

        console.warn('Invalid index in getAlphaState.');
        return null;
    }
    
    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.CullState}
     */
    getCullState (techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getCullState(passIndex);
        }

        console.warn('Invalid index in getCullState.');
        return null;
    }
    
    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.DepthState}
     */
    getDepthState (techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getDepthState(passIndex);
        }

        console.warn('Invalid index in getDepthState.');
        return null;
    }

    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.OffsetState}
     */
    getOffsetState (techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getOffsetState(passIndex);
        }

        console.warn('Invalid index in getOffsetState.');
        return null;
    }

    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.StencilState}
     */
    getStencilState  (techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getStencilState(passIndex);
        }

        console.warn('Invalid index in getStencilState.');
        return null;
    }

    /**
     * @param techniqueIndex {number}
     * @param passIndex {number}
     * @returns {L5.WireState}
     */
    getWireState (techniqueIndex, passIndex) {
        if (0 <= techniqueIndex && techniqueIndex < this.techniques.length) {
            return this.techniques[techniqueIndex].getWireState(passIndex);
        }

        console.warn('Invalid index in getWireState.');
        return null;
    }

    load (inStream) {
        super.load(inStream);

        var numTechniques = inStream.readUint32();
        this.techniques.length = numTechniques;
        this.techniques = inStream.readSizedPointerArray(numTechniques);
    }

    link (inStream) {
        super.link(inStream);
        this.techniques.forEach(function (t, i) {
            this.techniques[i] = inStream.resolveLink(t);
        }, this);
    }
}
