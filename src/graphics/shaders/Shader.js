/**
 * 着色器基类
 * 该类是顶点着色器和片元着色器的基类
 * The class data defines the shader but does not contain instances
 * of shader constants and shader textures.  Each instance of Shader
 * may therefore be a singleton,identified by 'shaderName'.
 * The drawing of geometry involves a Shader (the abstraction) and a
 * ShaderParameters (the instance of constants and textures).
 *
 * The constructor arrays must be dynamically allocated.  Shader assumes
 * responsibility for deleting them.  The construction of a Shader is not
 * complete until all programs (for the various profiles) are provided
 * via the SetProgram function.
 *
 * @param programName {string}
 * @param numInputs {number}
 * @param numOutputs {number}
 * @param numConstants {number}
 * @param numSamplers {number}
 * @param profileOwner {boolean}
 *
 * @author lonphy
 * @version 1.0
 * @class
 * @extends {L5.D3Object}
 */
L5.Shader = function (programName, numInputs, numOutputs, numConstants, numSamplers) {
    L5.D3Object.call(this, programName);

    if (numInputs > 0) {
        this.inputName = new Array(numInputs);
        this.inputType = new Array(numInputs);
        this.inputSemantic = new Array(numInputs);
    }
    else {
        this.inputName = null;
        this.inputType = null;
        this.inputSemantic = null;
    }
    this.numInputs = numInputs;

    this.numOutputs = numOutputs;
    this.outputName = new Array(numOutputs);
    this.outputType = new Array(numOutputs);
    this.outputSemantic = new Array(numOutputs);

    var i, dim;

    this.numConstants = numConstants;
    if (numConstants > 0) {
        this.constantName = new Array(numConstants);
        this.constantType = new Array(numConstants);
        this.constantFuncName = new Array(numConstants);
    } else {
        this.constantName = null;
        this.constantType = null;
        this.constantFuncName = null;
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
            this.filter[i] = L5.Shader.SF_NEAREST;
            this.coordinate[0][i] = L5.Shader.SC_CLAMP_EDGE;
            this.coordinate[1][i] = L5.Shader.SC_CLAMP_EDGE;
            this.coordinate[2][i] = L5.Shader.SC_CLAMP_EDGE;
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
};

L5.nameFix(L5.Shader, 'Shader');
L5.extendFix(L5.Shader, L5.D3Object);

// Maximum number of profiles.  The derived classes VertexShader and
// PixelShader each have this number of profiles.  If you add a new
// profile, change this constant and modify the enums in the derived
// classes.
L5.Shader.MAX_PROFILES = 5;

// Maximum value for anisotropic filtering.
L5.Shader.MAX_ANISOTROPY = 16;

// Types for the input and output variables of the shader program.
//------------------------------------------------------------------------
L5.Shader.VT_NONE = 0;

L5.Shader.VT_BOOL = 1;
L5.Shader.VT_BVEC2 = 2;
L5.Shader.VT_BVEC3 = 3;
L5.Shader.VT_BVEC4 = 4;

L5.Shader.VT_FLOAT = 5;

L5.Shader.VT_VEC2 = 6;
L5.Shader.VT_VEC3 = 7;
L5.Shader.VT_VEC4 = 8;

L5.Shader.VT_MAT2 = 9;
L5.Shader.VT_MAT3 = 10;
L5.Shader.VT_MAT4 = 11;

L5.Shader.VT_INT = 12;
L5.Shader.VT_IVEC2 = 13;
L5.Shader.VT_IVEC3 = 14;
L5.Shader.VT_IVEC4 = 15;

//------------------------------------------------------------------------

// Semantics for the input and output variables of the shader program.
L5.Shader.VS_NONE = 0;
L5.Shader.VS_POSITION = 1;        // ATTR0
L5.Shader.VS_BLENDWEIGHT = 2;     // ATTR1
L5.Shader.VS_NORMAL = 3;          // ATTR2
L5.Shader.VS_COLOR0 = 4;          // ATTR3 (and for render targets)
L5.Shader.VS_COLOR1 = 5;          // ATTR4 (and for render targets)
L5.Shader.VS_FOGCOORD = 6;        // ATTR5
L5.Shader.VS_PSIZE = 7;           // ATTR6
L5.Shader.VS_BLENDINDICES = 8;    // ATTR7
L5.Shader.VS_TEXCOORD0 = 9;       // ATTR8
L5.Shader.VS_TEXCOORD1 = 10;       // ATTR9
L5.Shader.VS_TEXCOORD2 = 11;       // ATTR10
L5.Shader.VS_TEXCOORD3 = 12;       // ATTR11
L5.Shader.VS_TEXCOORD4 = 13;       // ATTR12
L5.Shader.VS_TEXCOORD5 = 14;       // ATTR13
L5.Shader.VS_TEXCOORD6 = 15;       // ATTR14
L5.Shader.VS_TEXCOORD7 = 16;       // ATTR15
L5.Shader.VS_FOG = 17;             // same as L5.Shader.VS_FOGCOORD (ATTR5)
L5.Shader.VS_TANGENT = 18;         // same as L5.Shader.VS_TEXCOORD6 (ATTR14)
L5.Shader.VS_BINORMAL = 19;        // same as L5.Shader.VS_TEXCOORD7 (ATTR15)
L5.Shader.VS_COLOR2 = 20;          // support for multiple render targets
L5.Shader.VS_COLOR3 = 21;          // support for multiple render targets
L5.Shader.VS_DEPTH0 = 22;          // support for multiple render targets
L5.Shader.VS_QUANTITY = 23;

// The sampler type for interpreting the texture assigned to the sampler.
L5.Shader.ST_NONE = 0;
L5.Shader.ST_2D = 1;
L5.Shader.ST_3D = 2;
L5.Shader.ST_CUBE = 3;
L5.Shader.ST_2D_ARRAY = 4;

// Texture coordinate modes for the samplers.
L5.Shader.SC_NONE = 0;
L5.Shader.SC_REPEAT = 1;
L5.Shader.SC_MIRRORED_REPEAT = 2;
L5.Shader.SC_CLAMP_EDGE = 3;

// Filtering modes for the samplers.
L5.Shader.SF_NONE = 0;
L5.Shader.SF_NEAREST = 1;
L5.Shader.SF_LINEAR = 2;
L5.Shader.SF_NEAREST_NEAREST = 3;
L5.Shader.SF_NEAREST_LINEAR = 4;
L5.Shader.SF_LINEAR_NEAREST = 5;
L5.Shader.SF_LINEAR_LINEAR = 6;


/**
 * 着色器属性变量声明
 * @param i {number} 属性变量索引
 * @param name {string} 属性变量名称
 * @param type {number} L5.Shader.VT_XXX 属性变量类型
 * @param semantic {number} L5.Shader.VS_XXX 属性变量语义
 */
L5.Shader.prototype.setInput = function (i, name, type, semantic) {
    if (0 <= i && i < this.numInputs) {
        this.inputName[i] = name;
        this.inputType[i] = type;
        this.inputSemantic[i] = semantic;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * 着色器输出变量声明
 * @param i {number}
 * @param name {string} 输出变量名称
 * @param type {number} L5.Shader.VT_XXX 输出变量类型
 * @param semantic {number} L5.Shader.VS_XXX
 */
L5.Shader.prototype.setOutput = function (i, name, type, semantic) {
    if (0 <= i && i < this.numOutputs) {
        this.outputName[i] = name;
        this.outputType[i] = type;
        this.outputSemantic[i] = semantic;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param name {string}
 * @param type {number} L5.Shader.VT_XXX uniform类型
 */
L5.Shader.prototype.setConstant = function (i, name, type) {
    if (0 <= i && i < this.numConstants) {
        this.constantName[i] = name;
        this.constantType[i] = type;
        var f = '';
        switch (type) {
            case L5.Shader.VT_MAT4:
                f = 'uniformMatrix4fv';
                break;
            case L5.Shader.VT_BOOL:
            case L5.Shader.VT_INT:
                f = 'uniform1i';
                break;
            case L5.Shader.VT_BVEC2:
            case L5.Shader.VT_IVEC2:
                f = 'uniform2iv';
                break;
            case L5.Shader.VT_BVEC3:
            case L5.Shader.VT_IVEC3:
                f = 'uniform3iv';
                break;
            case L5.Shader.VT_BVEC4:
            case L5.Shader.VT_IVEC4:
                f = 'uniform4iv';
                break;
            case L5.Shader.VT_FLOAT:
                f = 'uniform1f';
                break;
            case L5.Shader.VT_VEC2:
                f = 'uniform2fv';
                break;
            case L5.Shader.VT_VEC3:
                f = 'uniform3fv';
                break;
            case L5.Shader.VT_VEC4:
                f = 'uniform4fv';
                break;
            case L5.Shader.VT_MAT2:
                f = 'uniformMatrix2fv';
                break;
            case L5.Shader.VT_MAT3:
                f = 'uniformMatrix3fv';
                break;
        }
        this.constantFuncName[i] = f;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param name {string} 采样器名称
 * @param type {number} L5.Shader.ST_XXX 采样器类型
 */
L5.Shader.prototype.setSampler = function (i, name, type) {
    if (0 <= i && i < this.numSamplers) {
        this.samplerName[i] = name;
        this.samplerType[i] = type;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param filter {number} L5.Shader.SF_XXX 过滤器类型
 */
L5.Shader.prototype.setFilter = function (i, filter) {
    if (0 <= i && i < this.numSamplers) {
        this.filter[i] = filter;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param dim {number}
 * @param coordinate {number} L5.Shader.SC_XXX
 */
L5.Shader.prototype.setCoordinate = function (i, dim, coordinate) {
    if (0 <= i && i < this.numSamplers) {
        if (0 <= dim && dim < 3) {
            this.coordinate[dim][i] = coordinate;
            return;
        }
        L5.assert(false, 'Invalid dimension.');
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param lodBias {number}
 */
L5.Shader.prototype.setLodBias = function (i, lodBias) {
    if (0 <= i && i < this.numSamplers) {
        this.lodBias[i] = lodBias;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param anisotropy {number}
 */
L5.Shader.prototype.setAnisotropy = function (i, anisotropy) {
    if (0 <= i && i < this.numSamplers) {
        this.anisotropy[i] = anisotropy;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 *
 * @param i {number}
 * @param borderColor {Float32Array} 4 length
 */
L5.Shader.prototype.setBorderColor = function (i, borderColor) {
    if (0 <= i && i < this.numSamplers) {
        this.borderColor[i].set(borderColor.subarray(0, 4), 0);
        return;
    }
    L5.assert(false, 'Invalid index.');
};

L5.Shader.prototype.setTextureUnit = function (i, textureUnit) {
    if (0 <= i && i < this.numSamplers) {
        this.textureUnit[i] = textureUnit;
        return;
    }
    L5.assert(false, 'Invalid index.');
};
/**
 * 着色器源码赋值
 * @param program {string}
 */
L5.Shader.prototype.setProgram = function (program) {
    this.program = program;
};

L5.Shader.prototype.setTextureUnits = function (textureUnits) {
    this.textureUnit = textureUnits.slice();
};

L5.Shader.prototype.getInputName = function (i) {
    if (0 <= i && i < this.numInputs) {
        return this.inputName[i];
    }

    L5.assert(false, 'Invalid index.');
    return '';
};
L5.Shader.prototype.getInputType = function (i) {
    if (0 <= i && i < this.numInputs) {
        return this.inputType[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.VT_NONE;
};
/**
 * 获取属性语义
 * @param i {number}
 * @returns {number} L5.Shader.VS_XXX
 */
L5.Shader.prototype.getInputSemantic = function (i) {
    if (0 <= i && i < this.numInputs) {
        return this.inputSemantic[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.VS_NONE;
};

L5.Shader.prototype.getOutputName = function (i) {
    if (0 <= i && i < this.numOutputs) {
        return this.outputName[i];
    }

    L5.assert(false, 'Invalid index.');
    return '';
};
L5.Shader.prototype.getOutputType = function (i) {
    if (0 <= i && i < this.numOutputs) {
        return this.outputType[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.VT_NONE;
};
L5.Shader.prototype.getOutputSemantic = function (i) {
    if (0 <= i && i < this.numOutputs) {
        return this.outputSemantic[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.VS_NONE;
};

L5.Shader.prototype.getConstantFuncName = function (i) {
    if (0 <= i && i < this.numConstants) {
        return this.constantFuncName[i];
    }

    L5.assert(false, 'Invalid index.');
    return '';
};

L5.Shader.prototype.getConstantName = function (i) {
    if (0 <= i && i < this.numConstants) {
        return this.constantName[i];
    }

    L5.assert(false, 'Invalid index.');
    return '';
};
L5.Shader.prototype.getConstantType = function (i) {
    if (0 <= i && i < this.numConstants) {
        return this.constantType[i];
    }

    L5.assert(false, 'Invalid index.');
    return 0;
};

L5.Shader.prototype.getSamplerName = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.samplerName[i];
    }

    L5.assert(false, 'Invalid index.');
    return '';
};
L5.Shader.prototype.getSamplerType = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.samplerType[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.ST_NONE;
};
L5.Shader.prototype.getFilter = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.filter[i];
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.SF_NONE;
};
L5.Shader.prototype.getCoordinate = function (i, dim) {
    if (0 <= i && i < this.numSamplers) {
        if (0 <= dim && dim < 3) {
            return this.coordinate[dim][i];
        }
        L5.assert(false, 'Invalid dimension.');
        return L5.Shader.SC_NONE;
    }

    L5.assert(false, 'Invalid index.');
    return L5.Shader.SC_NONE;
};
L5.Shader.prototype.getLodBias = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.lodBias[i];
    }

    L5.assert(false, 'Invalid index.');
    return 0;
};
L5.Shader.prototype.getAnisotropy = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.anisotropy[i];
    }

    L5.assert(false, 'Invalid index.');
    return 1;
};
L5.Shader.prototype.getBorderColor = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.borderColor[i];
    }

    L5.assert(false, 'Invalid index.');
    return new Float32Array(4);
};

L5.Shader.prototype.getTextureUnit = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.textureUnit[i];
    }
    L5.assert(false, 'Invalid index.');
    return 0;
};

L5.Shader.prototype.getProgram = function () {
    return this.program;
};

L5.Shader.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    this.inputName = inStream.readStringArray();
    this.numInputs = this.inputName.length;
    this.inputType = inStream.readSizedEnumArray(this.numInputs);
    this.inputSemantic = inStream.readSizedEnumArray(this.numInputs);

    this.outputName = inStream.readStringArray();
    this.numOutputs = this.outputName.length;
    this.outputType = inStream.readSizedEnumArray(this.numOutputs);
    this.outputSemantic = inStream.readSizedEnumArray(this.numOutputs);

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
};