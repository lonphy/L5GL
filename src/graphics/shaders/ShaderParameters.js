import { D3Object } from '../../core/D3Object';

class ShaderParameters extends D3Object {

    /**
     * @param {Shader} shader
     * @param {boolean} [__privateCreate] 
     */
    constructor(shader, __privateCreate = false) {
        super();
        if (!__privateCreate) {
            console.assert(shader !== null, 'Shader must be specified.');

            /**
             * @type {L5.Shader}
             */
            this.shader = shader;

            let nc = shader.numConstants;
            this.numConstants = nc;

            if (nc > 0) {
                /**
                 * @type {Array<ShaderFloat>}
                 */
                this.constants = new Array(nc);
            } else {
                this.constants = null;
            }

            let ns = shader.numSamplers;
            this.numTextures = ns;
            if (ns > 0) {
                this.textures = new Array(ns);
            } else {
                this.textures = null;
            }
        }
        else {
            this.shader = null;
            this.numConstants = 0;
            this.constants = null;
            this.numTextures = 0;
            this.textures = null;
        }
    }



    // These functions set the constants/textures.  If successful, the return
    // value is nonnegative and is the index into the appropriate array.  This
    // index may passed to the Set* functions that have the paremeter
    // 'handle'.  The mechanism allows you to set directly by index and avoid
    // the name comparisons that occur with the Set* functions that have the
    // parameter 'const std::string& name'.
    /**
     * @param {string} name
     * @param {Array} sfloat
     * @return {number}
     */
    setConstantByName(name, sfloat) {
        let i, m = this.numConstants, shader = this.shader;

        for (i = 0; i < m; ++i) {
            if (shader.getConstantName(i) === name) {
                this.constants[i] = sfloat;
                return i;
            }
        }

        console.assert(false, 'Cannot find constant.');
        return -1;
    }

    /**
     * @param {number} handle
     * @param {Array} sfloat
     * @return {number}
     */
    setConstant(handle, sfloat) {
        if (0 <= handle && handle < this.numConstants) {
            this.constants[handle] = sfloat;
            return handle;
        }
        console.assert(false, 'Invalid constant handle.');
        return -1;
    }

    /**
     * @param {string} name
     * @param {Texture} texture
     * @returns {number}
     */
    setTextureByName(name, texture) {
        let i, m = this.numTextures, shader = this.shader;

        for (i = 0; i < m; ++i) {
            if (shader.getSamplerName(i) === name) {
                this.textures[i] = texture;
                return i;
            }
        }

        console.assert(false, 'Cannot find texture.');
        return -1;
    }

    /**
     * @param {number} handle
     * @param {Texture} texture
     * @returns {number}
     */
    setTexture(handle, texture) {
        if (0 <= handle && handle < this.numTextures) {
            this.textures[handle] = texture;
            return handle;
        }
        console.assert(false, 'Invalid texture handle.');
        return -1;
    }

    /**
     * @param {string} name
     * @returns {ArrayBuffer}
     */
    getConstantByName(name) {
        let i, m = this.numConstants, shader = this.shader;
        for (i = 0; i < m; ++i) {
            if (shader.getConstantName(i) === name) {
                return this.constants[i];
            }
        }

        console.assert(false, 'Cannot find constant.');
        return null;
    }

    /**
     * @param {string} name
     * @returns {Texture}
     */
    getTextureByName(name) {
        let i, m = this.numTextures, shader = this.shader;
        for (i = 0; i < m; ++i) {
            if (shader.getSamplerName(i) === name) {
                return this.textures[i];
            }
        }

        console.assert(false, 'Cannot find texture.');
        return null;
    }

    /**
     * @param {number} index
     * @returns {ArrayBuffer}
     */
    getConstant(index) {
        if (0 <= index && index < this.numConstants) {
            return this.constants[index];
        }

        console.assert(false, 'Invalid constant handle.');
        return null;
    }

    /**
     * @param {number} index
     * @returns {Texture}
     */
    getTexture(index) {
        if (0 <= index && index < this.numTextures) {
            return this.textures[index];
        }

        console.assert(false, 'Invalid texture handle.');
        return null;
    }

    /**
     * @param {Visual} visual
     * @param {Camera} camera
     */
    updateConstants(visual, camera) {
        let constants = this.constants,
            i, m = this.numConstants;
        for (i = 0; i < m; ++i) {
            let constant = constants[i];
            if (constant.allowUpdater) {
                constant.update(visual, camera);
            }
        }
    }

    load(inStream) {
        super.load(inStream);
        this.shader = inStream.readPointer();
        this.constants = inStream.readPointerArray();
        this.numConstants = this.constants.length;
        this.textures = inStream.readPointerArray();
        this.numTextures = this.textures.length;
    }

    link(inStream) {
        super.link(inStream);
        this.shader = inStream.resolveLink(this.shader);
        this.constants = inStream.resolveArrayLink(this.numConstants, this.constants);
        this.textures = inStream.resolveArrayLink(this.numTextures, this.textures);
    }

    save(outStream) {
        super.save(outStream);
        outStream.writePointer(this.shader);
        outStream.writePointerArray(this.numConstants, this.constants);
        outStream.writePointerArray(this.numTextures, this.textures);
    }

    static factory(inStream) {
        let obj = new ShaderParameters(null, true);
        obj.load(inStream);
        return obj;
    }
}

D3Object.Register('ShaderParameters', ShaderParameters.factory.bind(ShaderParameters));

export { ShaderParameters };