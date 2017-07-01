import { D3Object } from '../../core/D3Object';
import { DECLARE_ENUM } from '../../util/util';
import { SamplerState } from './SamplerState';

/**
 * Abstract base class. The class is the base for VertexShader and FragShader.
 * The class data defines the shader but does not contain instances of shader 
 * constants and shader textures.  Each instance of Shader may therefore be a 
 * singleton, identified by 'shaderName'.  The drawing of geometry involves a 
 * Shader (the abstraction) and a ShaderParameters (the instance of constants 
 * and textures).
 * 
 * The constructor arrays must be dynamically allocated.  Shader assumes
 * responsibility for deleting them.  The construction of a Shader is not
 * complete until all programs (for the letious profiles) are provided
 * via the setProgram function.
 */
class Shader extends D3Object {

    /**
     * @param {string} name - The name of Shader for identified
     * @param {number} numInputs - number of input attributers
     * @param {number} numConstants - number of input uniforms
     * @param {number} numSamplers - number of input samplers
     */
    constructor(name, numInputs = 0, numConstants = 0, numSamplers = 0) {
        super(name);

        if (numInputs > 0) {
            this.inputName = new Array(numInputs);
            this.inputType = new Array(numInputs);
            this.inputSemantic = new Array(numInputs);
        } else {
            this.inputName = null;
            this.inputType = null;
            this.inputSemantic = null;
        }

        this.numInputs = numInputs;
        let i, dim;
        this.numConstants = numConstants;
        if (numConstants > 0) {
            this.constantName = new Array(numConstants);
            this.constantType = new Array(numConstants);
            this.constantFuncName = new Array(numConstants);
            this.constantSize = new Array(numConstants);
        } else {
            this.constantName = null;
            this.constantType = null;
            this.constantFuncName = null;
            this.constantSize = null;
        }

        this.numSamplers = numSamplers;
        this.textureUnit = [];
        if (numSamplers > 0) {
            this.samplerName = new Array(numSamplers);
            this.samplerType = new Array(numSamplers);
            this.samplers = new Array(numSamplers);
            for (i = 0; i < numSamplers; ++i) {
                this.samplers[i] = null;
            }
            this.textureUnit = new Array(numSamplers);
        } else {
            this.samplerName = null;
            this.samplerType = null;
            this.samplers = null;
            this.textureUnit = null;
        }

        this.program = '';
    }

    /**
     * Declear a attribute at position i
     * @param {number} i index
     * @param {string} name
     * @param {number} type - Shader.VT_XXX
     * @param {number} semantic - Shader.VS_XXX
     */
    setInput(index, name, type, semantic) {
        if (0 <= index && index < this.numInputs) {
            this.inputName[index] = name;
            this.inputType[index] = type;
            this.inputSemantic[index] = semantic;
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    /**
     * @param {number} i
     * @param {string} name
     * @param {number} type - Shader.VT_XXX(uniform)
     */
    setConstant(i, name, type) {
        if (0 <= i && i < this.numConstants) {
            this.constantName[i] = name;
            this.constantType[i] = type;
            let f = '', s = 0;
            switch (type) {
                case Shader.VT_MAT4:
                    f = 'uniformMatrix4fv';
                    s = 16;
                    break;
                case Shader.VT_BOOL:
                case Shader.VT_INT:
                    f = 'uniform1i';
                    s = 1;
                    break;
                case Shader.VT_BVEC2:
                case Shader.VT_IVEC2:
                    f = 'uniform2iv';
                    s = 2;
                    break;
                case Shader.VT_BVEC3:
                case Shader.VT_IVEC3:
                    f = 'uniform3iv';
                    s = 3;
                    break;
                case Shader.VT_BVEC4:
                case Shader.VT_IVEC4:
                    f = 'uniform4iv';
                    s = 4;
                    break;
                case Shader.VT_FLOAT:
                    f = 'uniform1f';
                    s = 1;
                    break;
                case Shader.VT_VEC2:
                    f = 'uniform2fv';
                    s = 2;
                    break;
                case Shader.VT_VEC3:
                    f = 'uniform3fv';
                    s = 3;
                    break;
                case Shader.VT_VEC4:
                    f = 'uniform4fv';
                    s = 4;
                    break;
                case Shader.VT_MAT2:
                    f = 'uniformMatrix2fv';
                    s = 4;
                    break;
                case Shader.VT_MAT3:
                    f = 'uniformMatrix3fv';
                    s = 9;
                    break;
            }
            this.constantSize[i] = s;
            this.constantFuncName[i] = f;
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    /**
     * @param {number} i
     * @param {string} name
     * @param {number} type - Shader.ST_XXX(sampler)
     */
    setSampler(i, name, type) {
        if (0 <= i && i < this.numSamplers) {
            this.samplerName[i] = name;
            this.samplerType[i] = type;
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    /**
     * @param {number} i 
     * @param {SamplerState} sampler 
     */
    setSamplerState(i, sampler) {
        if (0 <= i && i < this.numSamplers) {
            this.samplers[i] = sampler;
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    setTextureUnit(i, textureUnit) {
        if (0 <= i && i < this.numSamplers) {
            this.textureUnit[i] = textureUnit;
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    setProgram(program) {
        this.program = program;
    }

    setTextureUnits(textureUnits) {
        this.textureUnit = textureUnits.slice();
    }

    getInputName(i) {
        if (0 <= i && i < this.numInputs) {
            return this.inputName[i];
        }

        console.assert(false, 'Invalid index.');
        return '';
    }

    getInputType(i) {
        if (0 <= i && i < this.numInputs) {
            return this.inputType[i];
        }

        console.assert(false, 'Invalid index.');
        return Shader.VT_NONE;
    }

    getInputSemantic(i) {
        if (0 <= i && i < this.numInputs) {
            return this.inputSemantic[i];
        }

        console.assert(false, 'Invalid index.');
        return Shader.VS_NONE;
    }

    getConstantFuncName(i) {
        if (0 <= i && i < this.numConstants) {
            return this.constantFuncName[i];
        }

        console.assert(false, 'Invalid index.');
        return '';
    }

    getConstantName(i) {
        if (0 <= i && i < this.numConstants) {
            return this.constantName[i];
        }

        console.assert(false, 'Invalid index.');
        return '';
    }

    getConstantType(i) {
        if (0 <= i && i < this.numConstants) {
            return this.constantType[i];
        }

        console.assert(false, 'Invalid index.');
        return 0;
    }

    getConstantSize(i) {
        if (0 <= i && i < this.numConstants) {
            return this.constantSize[i];
        }

        console.assert(false, 'Invalid index.');
        return 0;
    }

    getSamplerName(i) {
        if (0 <= i && i < this.numSamplers) {
            return this.samplerName[i];
        }

        console.assert(false, 'Invalid index.');
        return '';
    }

    getSamplerType(i) {
        if (0 <= i && i < this.numSamplers) {
            return this.samplerType[i];
        }

        console.assert(false, 'Invalid index.');
        return Shader.ST_NONE;
    }

    getSamplerState(i) {
        if (0 <= i && i < this.numSamplers) {
            return this.samplers[i];
        }
        console.assert(false, 'Invalid index.');
        return 0;
    }

    getTextureUnit(i) {
        if (0 <= i && i < this.numSamplers) {
            return this.textureUnit[i];
        }
        console.assert(false, 'Invalid index.');
        return 0;
    }

    getProgram() {
        return this.program;
    }

    load(inStream) {
        super.load(inStream);

        this.inputName = inStream.readStringArray();
        this.numInputs = this.inputName.length;
        this.inputType = inStream.readSizedEnumArray(this.numInputs);
        this.inputSemantic = inStream.readSizedEnumArray(this.numInputs);
        this.constantName = inStream.readStringArray();
        this.numConstants = this.constantName.length;
        this.numRegistersUsed = inStream.readSizedInt32Array(this.numConstants);

        this.samplerName = inStream.readStringArray();
        this.numSamplers = this.samplerName.length;
        this.samplerType = inStream.readSizedEnumArray(this.numSamplers);
        let maxProfiles = inStream.readUint32();

        this.profileOwner = inStream.readBool();
    }

    static factory(inStream) {
        let obj = new this();
        obj.load(inStream);
        return obj;
    }
}

// Maximum value for anisotropic filtering.
DECLARE_ENUM(Shader, { MAX_ANISOTROPY: 16 }, false);

// Types for the input and output variables of the shader program.
DECLARE_ENUM(Shader, {
    VT_NONE: 0,
    VT_BOOL: 1,
    VT_BVEC2: 2,
    VT_BVEC3: 3,
    VT_BVEC4: 4,
    VT_FLOAT: 5,
    VT_VEC2: 6,
    VT_VEC3: 7,
    VT_VEC4: 8,
    VT_MAT2: 9,
    VT_MAT3: 10,
    VT_MAT4: 11,
    VT_INT: 12,
    VT_IVEC2: 13,
    VT_IVEC3: 14,
    VT_IVEC4: 15
}, false);

// Semantics for the input letiables of the shader program.
DECLARE_ENUM(Shader, {
    VS_NONE: 0,
    VS_POSITION: 1,       // ATTR0
    VS_BLENDWEIGHT: 2,    // ATTR1
    VS_NORMAL: 3,         // ATTR2
    VS_COLOR0: 4,         // ATTR3 (and for render targets)
    VS_COLOR1: 5,         // ATTR4 (and for render targets)
    VS_FOGCOORD: 6,       // ATTR5
    VS_PSIZE: 7,          // ATTR6
    VS_BLENDINDICES: 8,   // ATTR7
    VS_TEXCOORD0: 9,      // ATTR8
    VS_TEXCOORD1: 10,     // ATTR9
    VS_TEXCOORD2: 11,     // ATTR10
    VS_TEXCOORD3: 12,     // ATTR11
    VS_TEXCOORD4: 13,     // ATTR12
    VS_TEXCOORD5: 14,     // ATTR13
    VS_TEXCOORD6: 15,     // ATTR14
    VS_TEXCOORD7: 16,     // ATTR15
    VS_FOG: 17,           // same as L5.Shader.VS_FOGCOORD (ATTR5)
    VS_TANGENT: 18,       // same as L5.Shader.VS_TEXCOORD6 (ATTR14)
    VS_BINORMAL: 19,      // same as L5.Shader.VS_TEXCOORD7 (ATTR15)
    VS_COLOR2: 20,        // support for multiple render targets
    VS_COLOR3: 21,        // support for multiple render targets
    VS_DEPTH0: 22        // support for multiple render targets
}, false);

// The sampler type for interpreting the texture assigned to the sampler.
DECLARE_ENUM(Shader, {
    ST_NONE: 0,
    ST_2D: 1,
    ST_3D: 2,
    ST_CUBE: 3,
    ST_2D_ARRAY: 4
}, false);

export { Shader };
