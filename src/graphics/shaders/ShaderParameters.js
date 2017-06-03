/**
 * ShaderParameters 着色器参数
 *
 * @author lonphy
 * @version 2.0
 */
import {D3Object} from '../../core/D3Object'

export class ShaderParameters extends D3Object{

    /**
     * @param shader {Shader}
     * @param [__privateCreate] {boolean}
     */
    constructor(shader, __privateCreate=false) {
        super();
        if (!__privateCreate) {
            console.assert(shader !== null, 'Shader must be specified.');

            /**
             * @type {L5.Shader}
             */
            this.shader = shader;

            var nc = shader.numConstants;
            this.numConstants = nc;

            if (nc > 0) {
                /**
                 * @type {Array<ShaderFloat>}
                 */
                this.constants = new Array(nc);
            } else {
                this.constants = null;
            }

            var ns = shader.numSamplers;
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
     * @param name {string}
     * @param sfloat {Array}
     * @return {number}
     */
    setConstantByName(name, sfloat) {
        var i, m = this.numConstants, shader = this.shader;

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
     * @param handle {number}
     * @param sfloat {Array}
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
     * @param name {string}
     * @param texture {Texture}
     * @returns {number}
     */
    setTextureByName(name, texture) {
        var i, m = this.numTextures, shader = this.shader;

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
     * @param handle {number}
     * @param texture {L5.Texture}
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
     * @param name {string}
     * @returns {ArrayBuffer}
     */
    getConstantByName(name) {
        var i, m = this.numConstants, shader = this.shader;
        for (i = 0; i < m; ++i) {
            if (shader.getConstantName(i) === name) {
                return this.constants[i];
            }
        }

        console.assert(false, 'Cannot find constant.');
        return null;
    }

    /**
     * @param name {string}
     * @returns {Texture}
     */
    getTextureByName(name) {
        var i, m = this.numTextures, shader = this.shader;
        for (i = 0; i < m; ++i) {
            if (shader.getSamplerName(i) === name) {
                return this.textures[i];
            }
        }

        console.assert(false, 'Cannot find texture.');
        return null;
    }

    /**
     * @param index {number}
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
     * @param index {number}
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
     * @param visual {Visual}
     * @param camera {Camera}
     */
    updateConstants(visual, camera) {
        var constants = this.constants,
            i, m = this.numConstants;
        for (i = 0; i < m; ++i) {
            var constant = constants[i];
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

    /**
     * 文件解析工厂方法
     * @param inStream {InStream}
     * @returns {ShaderParameters}
     */
    static factory(inStream) {
        var obj = new ShaderParameters(null, true);
        obj.load(inStream);
        return obj;
    }
}

D3Object.Register('L5.ShaderParameters', ShaderParameters.factory);
