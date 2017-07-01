import { D3Object } from '../../core/D3Object';
import { ShaderParameters } from './ShaderParameters';

class VisualEffectInstance extends D3Object {
    /**
     * @param {VisualEffect} effect
     * @param {number} techniqueIndex
     * @param {boolean} _privateCreate
     */
    constructor(effect, techniqueIndex, _privateCreate = false) {
        super();
        if (!_privateCreate) {
            console.assert(effect !== null, 'effect must be specified.');
            console.assert(0 <= techniqueIndex && techniqueIndex < effect.getNumTechniques(),
                'Invalid technique index.');

            /**
             * @type {VisualEffect}
             */
            this.effect = effect;
            this.techniqueIndex = techniqueIndex;

            let technique = effect.getTechnique(techniqueIndex);
            let numPasses = technique.getNumPasses();

            this.numPasses = numPasses;
            this.vertexParameters = new Array(numPasses);
            this.fragParameters = new Array(numPasses);

            for (let p = 0; p < numPasses; ++p) {
                let pass = technique.getPass(p);
                this.vertexParameters[p] = new ShaderParameters(pass.getVertexShader());
                this.fragParameters[p] = new ShaderParameters(pass.getFragShader());
            }
        }
        else {
            this.effect = null;
            this.techniqueIndex = 0;
            this.numPasses = 0;
            this.vertexParameters = null;
            this.fragParameters = null;
        }
    }

    getNumPasses() {
        return this.effect.getTechnique(this.techniqueIndex).getNumPasses();
    }

    /**
     * @param {number} pass
     * @returns {VisualPass}
     */
    getPass(pass) {
        if (0 <= pass && pass < this.numPasses) {
            return this.effect.getTechnique(this.techniqueIndex).getPass(pass);
        }

        console.assert(false, 'Invalid pass index.');
        return null;
    }

    /**
     * @param {number} pass
     * @returns {ShaderParameters}
     */
    getVertexParameters(pass) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass];
        }
        console.assert(false, 'Invalid pass index.');
        return null;
    }

    /**
     * @param {number} pass
     * @returns {ShaderParameters}
     */
    getFragParameters(pass) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass];
        }
        console.assert(false, 'Invalid pass index.');
        return null;
    }

    /**
     * @param {number} pass
     * @param {string} name
     * @param {ShaderFloat} sfloat
     * @returns {number}
     */
    setVertexConstantByName(pass, name, sfloat) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass].setConstantByName(name, sfloat);
        }
        console.assert(false, 'Invalid pass index.');
        return -1;
    }

    /**
     * @param {number} pass
     * @param {string} name
     * @param {ShaderFloat} sfloat
     * @returns {number}
     */
    setFragConstantByName(pass, name, sfloat) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass].setConstantByName(name, sfloat);
        }

        console.assert(false, 'Invalid pass index.');
        return -1;
    }

    /**
     * @param {number} pass
     * @param {string} name
     * @param {Texture} texture
     * @returns {number}
     */
    setVertexTextureByName(pass, name, texture) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass].setTextureByName(name, texture);
        }
        console.assert(false, 'Invalid pass index.');
        return -1;
    }

    /**
     * @param {number} pass
     * @param {string} name
     * @param {Texture} texture
     * @returns {number}
     */
    setFragTextureByName(pass, name, texture) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass].setTextureByName(name, texture);
        }
        console.assert(false, 'Invalid pass index.');
        return -1;
    }

    /**
     * @param {number} pass
     * @param {number} handle
     * @param {ShaderFloat} sfloat
     */
    setVertexConstant(pass, handle, sfloat) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass].setConstant(handle, sfloat);
        }
        console.assert(false, 'Invalid pass index.');
    }

    /**
     * @param {number} pass
     * @param {number} handle
     * @param {ShaderFloat} sfloat
     */
    setFragConstant(pass, handle, sfloat) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass].setConstant(handle, sfloat);
        }
        console.assert(false, 'Invalid pass index.');
    }

    /**
     * @param {number} pass
     * @param {number} handle
     * @param {Texture} texture
     */
    setVertexTexture(pass, handle, texture) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass].setTexture(handle, texture);
        }
        console.assert(false, 'Invalid pass index.');
    }

    /**
     * @param {number} pass
     * @param {number} handle
     * @param {Texture} texture
     */
    setFragTexture(pass, handle, texture) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass].setTexture(handle, texture);
        }
        console.assert(false, 'Invalid pass index.');
    }

    /**
     * @param {number} pass
     * @param {string} name
     * @returns {ShaderFloat}
     */
    getVertexConstantByName(pass, name) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass].getConstantByName(name);
        }
        console.assert(false, 'Invalid pass index.');
        return null;
    }

    /**
     * @param {number} pass
     * @param {string} name
     * @returns {ShaderFloat}
     */
    getFragConstantByName(pass, name) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass].getConstantByName(name);
        }
        console.assert(false, 'Invalid pass index.');
        return 0;
    }

    /**
     * @param {number} pass
     * @param {string} name
     * @returns {Texture}
     */
    getVertexTextureByName(pass, name) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass].getTextureByName(name);
        }

        console.assert(false, 'Invalid pass index.');
        return 0;
    }

    /**
     * @param {number} pass
     * @param {string} name
     * @returns {Texture}
     */
    getFragTextureByName(pass, name) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass].getTextureByName(name);
        }

        console.assert(false, 'Invalid pass index.');
        return 0;
    }

    /**
     * @param {number} pass
     * @param {number} handle
     * @returns {ShaderFloat}
     */
    getVertexConstant(pass, handle) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass].getConstant(handle);
        }
        console.assert(false, 'Invalid pass index.');
        return 0;
    }

    /**
     * @param {number} pass
     * @param {number} handle
     * @returns {ShaderFloat}
     */
    getFragConstant(pass, handle) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass].getConstant(handle);
        }
        console.assert(false, 'Invalid pass index.');
        return 0;
    }

    /**
     * @param {number} pass
     * @param {number} handle
     * @returns {Texture}
     */
    getVertexTexture(pass, handle) {
        if (0 <= pass && pass < this.numPasses) {
            return this.vertexParameters[pass].getTexture(handle);
        }
        console.assert(false, 'Invalid pass index.');
        return 0;
    }

    /**
     * @param {number} pass
     * @param {number} handle
     * @returns {Texture}
     */
    getFragTexture(pass, handle) {
        if (0 <= pass && pass < this.numPasses) {
            return this.fragParameters[pass].getTexture(handle);
        }

        console.assert(false, 'Invalid pass index.');
        return 0;
    }

    load(inStream) {
        super.load(inStream);
        this.techniqueIndex = inStream.readUint32();
        this.effect = inStream.readPointer();
        this.vertexParameters = inStream.readPointerArray();
        this.numPasses = this.vertexParameters.length;
        this.fragParameters = inStream.readSizedPointerArray(this.numPasses);
    }
    link(inStream) {
        super.link(inStream);
        this.effect = inStream.resolveLink(this.effect);
        this.vertexParameters = inStream.resolveArrayLink(this.numPasses, this.vertexParameters);
        this.fragParameters = inStream.resolveArrayLink(this.numPasses, this.fragParameters);
    }

    save(inStream) {
        super.save(inStream);
        // todo: implement
    }

    static factory(inStream) {
        let obj = new VisualEffectInstance(0, 0, true);
        obj.load(inStream);
        return obj;
    }
};

D3Object.Register('VisualEffectInstance', VisualEffectInstance.factory);

export { VisualEffectInstance };