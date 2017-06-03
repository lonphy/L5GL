import { D3Object } from '../../core/D3Object'
import * as util from '../../util/util'

/**
 * 着色器基类  
 * 该类是顶点着色器和片元着色器的基类
 * >类成员定义了着色器, 但不持有任何uniform以及纹理实例,
 * 因此每一个着色器实例也许是单例方式存在, 通过name属性标识.
 * 一个需要渲染的几何体包含 Shader实例 和 ShaderParameters 实例(包含uniform, 采样器实例)
 */
export class Shader extends D3Object {

    /**
     * @param name {string} 着色器名称
     * @param numInputs {number} 输入属性数量
     * @param numConstants {number} uniform 数量
     * @param numSamplers {number} 采样器数量
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
        this.coordinate = new Array(3);
        this.textureUnit = [];
        if (numSamplers > 0) {
            this.samplerName = new Array(numSamplers);
            this.samplerType = new Array(numSamplers);

            this.filter = new Array(numSamplers);
            this.coordinate[0] = new Array(numSamplers);
            this.coordinate[1] = new Array(numSamplers);
            this.coordinate[2] = new Array(numSamplers);
            this.lodBias = new Float32Array(numSamplers);
            this.anisotropy = new Float32Array(numSamplers);
            this.borderColor = new Float32Array(numSamplers * 4);

            for (i = 0; i < numSamplers; ++i) {
                this.filter[i] = Shader.SF_NEAREST;
                this.coordinate[0][i] = Shader.SC_CLAMP_EDGE;
                this.coordinate[1][i] = Shader.SC_CLAMP_EDGE;
                this.coordinate[2][i] = Shader.SC_CLAMP_EDGE;
                this.lodBias[i] = 0;
                this.anisotropy[i] = 1;

                this.borderColor[i * 4] = 0;
                this.borderColor[i * 4 + 1] = 0;
                this.borderColor[i * 4 + 2] = 0;
                this.borderColor[i * 4 + 3] = 0;
            }
            this.textureUnit = new Array(numSamplers);
        } else {
            this.samplerName = null;
            this.samplerType = null;
            this.filter = null;
            for (dim = 0; dim < 3; ++dim) {
                this.coordinate[dim] = null;
            }
            this.lodBias = null;
            this.anisotropy = null;
            this.borderColor = null;
            this.textureUnit = null;
        }

        this.program = '';
    }
    /**
     * 着色器属性变量声明
     * @param i {number} 属性变量索引
     * @param name {string} 属性变量名称
     * @param type {number} Shader.VT_XXX 属性变量类型
     * @param semantic {number} Shader.VS_XXX 属性变量语义
     */
    setInput(i, name, type, semantic) {
        if (0 <= i && i < this.numInputs) {
            this.inputName[i] = name;
            this.inputType[i] = type;
            this.inputSemantic[i] = semantic;
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    /**
     * @param i {number}
     * @param name {string}
     * @param type {number} Shader.VT_XXX uniform类型
     */
    setConstant(i, name, type) {
        if (0 <= i && i < this.numConstants) {
            this.constantName[i] = name;
            this.constantType[i] = type;
            var f = '', s = 0;
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
     * @param i {number}
     * @param name {string} 采样器名称
     * @param type {number} Shader.ST_XXX 采样器类型
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
     * @param i {number}
     * @param filter {number} Shader.SF_XXX 过滤器类型
     */
    setFilter(i, filter) {
        if (0 <= i && i < this.numSamplers) {
            this.filter[i] = filter;
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    /**
     * @param i {number}
     * @param dim {number}
     * @param coordinate {number} Shader.SC_XXX
     */
    setCoordinate(i, dim, coordinate) {
        if (0 <= i && i < this.numSamplers) {
            if (0 <= dim && dim < 3) {
                this.coordinate[dim][i] = coordinate;
                return;
            }
            console.assert(false, 'Invalid dimension.');
        }
        console.assert(false, 'Invalid index.');
    }

    /**
     * @param i {number}
     * @param lodBias {number}
     */
    setLodBias(i, lodBias) {
        if (0 <= i && i < this.numSamplers) {
            this.lodBias[i] = lodBias;
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    /**
     * @param i {number}
     * @param anisotropy {number}
     */
    setAnisotropy(i, anisotropy) {
        if (0 <= i && i < this.numSamplers) {
            this.anisotropy[i] = anisotropy;
            return;
        }
        console.assert(false, 'Invalid index.');
    }

    /**
     *
     * @param i {number}
     * @param borderColor {Float32Array} 4 length
     */
    setBorderColor(i, borderColor) {
        if (0 <= i && i < this.numSamplers) {
            this.borderColor[i].set(borderColor.subarray(0, 4), 0);
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

    /**
     * 着色器源码赋值
     * @param program {string}
     */
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

    /**
     * 获取属性语义
     * @param i {number}
     * @returns {number} Shader.VS_XXX
     */
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

    getFilter(i) {
        if (0 <= i && i < this.numSamplers) {
            return this.filter[i];
        }

        console.assert(false, 'Invalid index.');
        return Shader.SF_NONE;
    }

    getCoordinate(i, dim) {
        if (0 <= i && i < this.numSamplers) {
            if (0 <= dim && dim < 3) {
                return this.coordinate[dim][i];
            }
            console.assert(false, 'Invalid dimension.');
            return Shader.SC_NONE;
        }

        console.assert(false, 'Invalid index.');
        return Shader.SC_NONE;
    }

    getLodBias(i) {
        if (0 <= i && i < this.numSamplers) {
            return this.lodBias[i];
        }

        console.assert(false, 'Invalid index.');
        return 0;
    }

    getAnisotropy(i) {
        if (0 <= i && i < this.numSamplers) {
            return this.anisotropy[i];
        }

        console.assert(false, 'Invalid index.');
        return 1;
    }

    getBorderColor(i) {
        if (0 <= i && i < this.numSamplers) {
            return this.borderColor[i];
        }

        console.assert(false, 'Invalid index.');
        return new Float32Array(4);
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
        this.filter = inStream.readSizedEnumArray(this.numSamplers);
        this.coordinate[0] = inStream.readSizedEnumArray(this.numSamplers);
        this.coordinate[1] = inStream.readSizedEnumArray(this.numSamplers);
        this.coordinate[2] = inStream.readSizedEnumArray(this.numSamplers);
        this.lodBias = inStream.readSizedInt32Array(this.numSamplers);
        this.anisotropy = inStream.readSizedInt32Array(this.numSamplers);
        this.borderColor = inStream.readSizedFFloatArray(this.numSamplers);
        var maxProfiles = inStream.readUint32();

        this.profileOwner = inStream.readBool();
    }

    static factory(inStream) {
        var obj = new this();
        obj.load(inStream);
        return obj;
    }
}

// Maximum value for anisotropic filtering.
util.DECLARE_ENUM(Shader, {
    MAX_ANISOTROPY: 16
}, false);

// Types for the input and output variables of the shader program.
util.DECLARE_ENUM(Shader, {
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

// Semantics for the input and output variables of the shader program.
util.DECLARE_ENUM(Shader, {
    VS_NONE: 0,
    VS_POSITION: 1,        // ATTR0
    VS_BLENDWEIGHT: 2,        // ATTR1
    VS_NORMAL: 3,        // ATTR2
    VS_COLOR0: 4,        // ATTR3 (and for render targets)
    VS_COLOR1: 5,        // ATTR4 (and for render targets)
    VS_FOGCOORD: 6,        // ATTR5
    VS_PSIZE: 7,        // ATTR6
    VS_BLENDINDICES: 8,        // ATTR7
    VS_TEXCOORD0: 9,        // ATTR8
    VS_TEXCOORD1: 10,       // ATTR9
    VS_TEXCOORD2: 11,       // ATTR10
    VS_TEXCOORD3: 12,       // ATTR11
    VS_TEXCOORD4: 13,       // ATTR12
    VS_TEXCOORD5: 14,       // ATTR13
    VS_TEXCOORD6: 15,       // ATTR14
    VS_TEXCOORD7: 16,       // ATTR15
    VS_FOG: 17,       // same as L5.Shader.VS_FOGCOORD (ATTR5)
    VS_TANGENT: 18,       // same as L5.Shader.VS_TEXCOORD6 (ATTR14)
    VS_BINORMAL: 19,       // same as L5.Shader.VS_TEXCOORD7 (ATTR15)
    VS_COLOR2: 20,       // support for multiple render targets
    VS_COLOR3: 21,       // support for multiple render targets
    VS_DEPTH0: 22,       // support for multiple render targets
    VS_QUANTITY: 23
}, false);

// The sampler type for interpreting the texture assigned to the sampler.
util.DECLARE_ENUM(Shader, {
    ST_NONE: 0,
    ST_2D: 1,
    ST_3D: 2,
    ST_CUBE: 3,
    ST_2D_ARRAY: 4
}, false);


// Texture coordinate modes for the samplers.
util.DECLARE_ENUM(Shader, {
    SC_NONE: 0,
    SC_REPEAT: 1,
    SC_MIRRORED_REPEAT: 2,
    SC_CLAMP_EDGE: 3
}, false);


// Filtering modes for the samplers.
util.DECLARE_ENUM(Shader, {
    SF_NONE: 0,
    SF_NEAREST: 1,
    SF_LINEAR: 2,
    SF_NEAREST_MIPMAP_NEAREST: 3,
    SF_NEAREST_MIPMAP_LINEAR: 4,
    SF_LINEAR_MIPMAP_NEAREST: 5,
    SF_LINEAR_MIPMAP_LINEAR: 6
});
