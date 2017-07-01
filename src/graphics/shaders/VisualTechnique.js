import { D3Object } from '../../core/D3Object';

class VisualTechnique extends D3Object {

    constructor() {
        super();

        /**
         * @type {Array<VisualPass>}
         */
        this.passes = [];
    }

    /**
     * @param {VisualPass} pass
     */
    insertPass(pass) {
        if (pass) {
            this.passes.push(pass);
        } else {
            console.assert(false, 'Input to insertPass must be nonnull.');
        }
    }

    /**
     * @returns {number}
     */
    getNumPasses() {
        return this.passes.length;
    }

    /**
     * @returns {number|null}
     */
    getPass(passIndex) {
        if (0 <= passIndex && passIndex < this.passes.length) {
            return this.passes[passIndex];
        }
        console.warn("Invalid index in GetPass.");
        return null;
    }

    /**
     * @param {number} passIndex
     * @returns {VertexShader}
     */
    getVertexShader(passIndex) {
        if (0 <= passIndex && passIndex < this.passes.length) {
            return this.passes[passIndex].getVertexShader();
        }
        console.warn('Invalid index in getVertexShader.');
        return null;
    }

    /**
     * @param {number} passIndex
     * @returns {FragShader}
     */
    getFragShader(passIndex) {
        if (0 <= passIndex && passIndex < this.passes.length) {
            return this.passes[passIndex].getFragShader();
        }
        console.warn('Invalid index in getFragShader.');
        return null;
    }

    /**
     * @param {number} passIndex
     * @returns {AlphaState}
     */
    getAlphaState(passIndex) {
        if (0 <= passIndex && passIndex < this.passes.length) {
            return this.passes[passIndex].alphaState;
        }
        console.warn('Invalid index in getAlphaState.');
        return null;
    }

    /**
     * @param {number} passIndex
     * @returns {CullState}
     */
    getCullState(passIndex) {
        if (0 <= passIndex && passIndex < this.passes.length) {
            return this.passes[passIndex].cullState;
        }
        console.warn('Invalid index in getCullState.');
        return null;
    }

    /**
     * @param {number} passIndex
     * @returns {DepthState}
     */
    getDepthState(passIndex) {
        if (0 <= passIndex && passIndex < this.passes.length) {
            return this.passes[passIndex].depthState;
        }
        console.warn('Invalid index in getDepthState.');
        return null;
    }

    /**
     * @param {number} passIndex
     * @returns {OffsetState}
     */
    getOffsetState(passIndex) {
        if (0 <= passIndex && passIndex < this.passes.length) {
            return this.passes[passIndex].offsetState;
        }
        console.warn('Invalid index in getOffsetState.');
        return null;
    }

    /**
     * @param {number} passIndex
     * @returns {StencilState}
     */
    getStencilState(passIndex) {
        if (0 <= passIndex && passIndex < this.passes.length) {
            return this.passes[passIndex].stencilState;
        }
        console.warn('Invalid index in getStencilState.');
        return null;
    }

    load(inStream) {
        super.load(inStream);
        var numPasses = inStream.readUint32();
        this.passes.length = numPasses;
        this.passes = inStream.readSizedPointerArray(numPasses);
    }

    link(inStream) {
        super.link(inStream);
        this.passes.forEach(function (p, i) {
            this.passes[i] = inStream.resolveLink(p);
        }, this);
    }

    save(inStream) {
        super.save(inStream);
        // todo: implement
    }
}

D3Object.Register('VisualTechnique', VisualTechnique.factory.bind(VisualTechnique));

export { VisualTechnique };