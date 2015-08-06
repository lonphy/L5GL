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
L5.Shader = function (
    programName, numInputs, numOutputs, numConstants, numSamplers, profileOwner
) {
    L5.assert (numOutputs > 0, 'Shader must have at least one output.');
    L5.D3Object.call (this, programName);

    this.profileOwner = profileOwner;

    if (numInputs > 0) {
        this.inputName     = new Array (numInputs);
        this.inputType     = new Array (numInputs);
        this.inputSemantic = new Array (numInputs);
    }
    else {
        this.inputName     = null;
        this.inputType     = null;
        this.inputSemantic = null;
    }
    this.numInputs = numInputs;

    this.numOutputs     = numOutputs;
    this.outputName     = new Array (numOutputs);
    this.outputType     = new Array (numOutputs);
    this.outputSemantic = new Array (numOutputs);

    var i, dim;
    const MAX_PROFILES = L5.Shader.MAX_PROFILES;
    this.baseRegister  = new Array (MAX_PROFILES);

    this.numConstants = numConstants;
    if (numConstants > 0) {
        this.constantName     = new Array (numConstants);
        this.numRegistersUsed = new Array (numConstants);
        if (profileOwner) {
            for (i = 0; i < MAX_PROFILES; ++i) {
                this.baseRegister[ i ] = new Array (numConstants);
            }
        } else {
            for (i = 0; i < MAX_PROFILES; ++i) {
                this.baseRegister[ i ] = null;
            }
        }
    } else {
        this.constantName     = null;
        this.numRegistersUsed = null;
        for (i = 0; i < MAX_PROFILES; ++i) {
            this.baseRegister[ i ] = null;
        }
    }

    this.numSamplers = numSamplers;
    this.coordinate  = new Array (3);
    this.textureUnit = new Array (MAX_PROFILES);
    if (numSamplers > 0) {
        this.samplerName = new Array (numSamplers);
        this.samplerType = new Array (numSamplers);

        this.filter          = new Array (numSamplers);
        this.coordinate[ 0 ] = new Array (numSamplers);
        this.coordinate[ 1 ] = new Array (numSamplers);
        this.coordinate[ 2 ] = new Array (numSamplers);
        this.lodBias         = new Float32Array (numSamplers);
        this.anisotropy      = new Float32Array (numSamplers);
        this.borderColor     = new Float32Array (numSamplers * 4);

        for (i = 0; i < numSamplers; ++i) {
            this.filter[ i ]          = L5.Shader.SF_NEAREST;
            this.coordinate[ 0 ][ i ] = L5.Shader.SC_CLAMP_EDGE;
            this.coordinate[ 1 ][ i ] = L5.Shader.SC_CLAMP_EDGE;
            this.coordinate[ 2 ][ i ] = L5.Shader.SC_CLAMP_EDGE;
            this.lodBias[ i ]         = 0;
            this.anisotropy[ i ]      = 1;

            this.borderColor[ i * 4 ]     = 0;
            this.borderColor[ i * 4 + 1 ] = 0;
            this.borderColor[ i * 4 + 2 ] = 0;
            this.borderColor[ i * 4 + 3 ] = 0;
        }

        if (profileOwner) {
            for (i = 0; i < MAX_PROFILES; ++i) {
                this.textureUnit[ i ] = new Array (numSamplers);
            }
        } else {
            for (i = 0; i < MAX_PROFILES; ++i) {
                this.textureUnit[ i ] = null;
            }
        }
    } else {
        this.samplerName = null;
        this.samplerType = null;
        this.filter      = null;
        for (dim = 0; dim < 3; ++dim) {
            this.coordinate[ dim ] = null;
        }
        this.lodBias     = null;
        this.anisotropy  = null;
        this.borderColor = null;
        for (i = 0; i < MAX_PROFILES; ++i) {
            this.textureUnit[ i ] = null;
        }
    }
    this.program = new Array (MAX_PROFILES);
    if (profileOwner) {
        for (i = 0; i < MAX_PROFILES; ++i) {
            this.program[ i ] = '';
        }
    } else {
        for (i = 0; i < MAX_PROFILES; ++i) {
            this.program[ i ] = null;
        }
    }
};

L5.nameFix (L5.Shader, 'Shader');
L5.extendFix (L5.Shader, L5.D3Object);

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

L5.Shader.VT_FLOAT    = 1;
L5.Shader.VT_FLOAT1   = 2;
L5.Shader.VT_FLOAT2   = 3;
L5.Shader.VT_FLOAT3   = 4;
L5.Shader.VT_FLOAT4   = 5;
L5.Shader.VT_FLOAT1X1 = 6;
L5.Shader.VT_FLOAT1X2 = 7;
L5.Shader.VT_FLOAT1X3 = 8;
L5.Shader.VT_FLOAT1X4 = 9;
L5.Shader.VT_FLOAT2X1 = 10;
L5.Shader.VT_FLOAT2X2 = 11;
L5.Shader.VT_FLOAT2X3 = 12;
L5.Shader.VT_FLOAT2X4 = 13;
L5.Shader.VT_FLOAT3X1 = 14;
L5.Shader.VT_FLOAT3X2 = 15;
L5.Shader.VT_FLOAT3X3 = 16;
L5.Shader.VT_FLOAT3X4 = 17;
L5.Shader.VT_FLOAT4X1 = 18;
L5.Shader.VT_FLOAT4X2 = 19;
L5.Shader.VT_FLOAT4X3 = 20;
L5.Shader.VT_FLOAT4X4 = 21;

L5.Shader.VT_HALF    = 22;
L5.Shader.VT_HALF1   = 23;
L5.Shader.VT_HALF2   = 24;
L5.Shader.VT_HALF3   = 25;
L5.Shader.VT_HALF4   = 26;
L5.Shader.VT_HALF1X1 = 27;
L5.Shader.VT_HALF1X2 = 28;
L5.Shader.VT_HALF1X3 = 29;
L5.Shader.VT_HALF1X4 = 30;
L5.Shader.VT_HALF2X1 = 31;
L5.Shader.VT_HALF2X2 = 32;
L5.Shader.VT_HALF2X3 = 33;
L5.Shader.VT_HALF2X4 = 34;
L5.Shader.VT_HALF3X1 = 35;
L5.Shader.VT_HALF3X2 = 36;
L5.Shader.VT_HALF3X3 = 37;
L5.Shader.VT_HALF3X4 = 38;
L5.Shader.VT_HALF4X1 = 39;
L5.Shader.VT_HALF4X2 = 40;
L5.Shader.VT_HALF4X3 = 41;
L5.Shader.VT_HALF4X4 = 42;

L5.Shader.VT_INT    = 43;
L5.Shader.VT_INT1   = 44;
L5.Shader.VT_INT2   = 45;
L5.Shader.VT_INT3   = 46;
L5.Shader.VT_INT4   = 47;
L5.Shader.VT_INT1X1 = 48;
L5.Shader.VT_INT1X2 = 49;
L5.Shader.VT_INT1X3 = 50;
L5.Shader.VT_INT1X4 = 51;
L5.Shader.VT_INT2X1 = 52;
L5.Shader.VT_INT2X2 = 53;
L5.Shader.VT_INT2X3 = 54;
L5.Shader.VT_INT2X4 = 55;
L5.Shader.VT_INT3X1 = 56;
L5.Shader.VT_INT3X2 = 57;
L5.Shader.VT_INT3X3 = 58;
L5.Shader.VT_INT3X4 = 59;
L5.Shader.VT_INT4X1 = 60;
L5.Shader.VT_INT4X2 = 61;
L5.Shader.VT_INT4X3 = 62;
L5.Shader.VT_INT4X4 = 63;

L5.Shader.VT_FIXED    = 64;
L5.Shader.VT_FIXED1   = 65;
L5.Shader.VT_FIXED2   = 66;
L5.Shader.VT_FIXED3   = 67;
L5.Shader.VT_FIXED4   = 68;
L5.Shader.VT_FIXED1X1 = 69;
L5.Shader.VT_FIXED1X2 = 70;
L5.Shader.VT_FIXED1X3 = 71;
L5.Shader.VT_FIXED1X4 = 72;
L5.Shader.VT_FIXED2X1 = 73;
L5.Shader.VT_FIXED2X2 = 74;
L5.Shader.VT_FIXED2X3 = 75;
L5.Shader.VT_FIXED2X4 = 76;
L5.Shader.VT_FIXED3X1 = 77;
L5.Shader.VT_FIXED3X2 = 78;
L5.Shader.VT_FIXED3X3 = 79;
L5.Shader.VT_FIXED3X4 = 80;
L5.Shader.VT_FIXED4X1 = 81;
L5.Shader.VT_FIXED4X2 = 82;
L5.Shader.VT_FIXED4X3 = 83;
L5.Shader.VT_FIXED4X4 = 84;

L5.Shader.VT_BOOL    = 85;
L5.Shader.VT_BOOL1   = 86;
L5.Shader.VT_BOOL2   = 87;
L5.Shader.VT_BOOL3   = 88;
L5.Shader.VT_BOOL4   = 89;
L5.Shader.VT_BOOL1X1 = 90;
L5.Shader.VT_BOOL1X2 = 91;
L5.Shader.VT_BOOL1X3 = 92;
L5.Shader.VT_BOOL1X4 = 93;
L5.Shader.VT_BOOL2X1 = 94;
L5.Shader.VT_BOOL2X2 = 95;
L5.Shader.VT_BOOL2X3 = 96;
L5.Shader.VT_BOOL2X4 = 97;
L5.Shader.VT_BOOL3X1 = 98;
L5.Shader.VT_BOOL3X2 = 99;
L5.Shader.VT_BOOL3X3 = 100;
L5.Shader.VT_BOOL3X4 = 101;
L5.Shader.VT_BOOL4X1 = 102;
L5.Shader.VT_BOOL4X2 = 103;
L5.Shader.VT_BOOL4X3 = 104;
L5.Shader.VT_BOOL4X4 = 105;

L5.Shader.VT_QUANTITY = 106;

//------------------------------------------------------------------------

// Semantics for the input and output variables of the shader program.
L5.Shader.VS_NONE     = 0;
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
L5.Shader.ST_NONE     = 0;
L5.Shader.ST_2D       = 1;
L5.Shader.ST_3D       = 2;
L5.Shader.ST_CUBE     = 3;
L5.Shader.ST_2D_ARRAY = 4;

// Texture coordinate modes for the samplers.
L5.Shader.SC_NONE            = 0;
L5.Shader.SC_REPEAT          = 1;
L5.Shader.SC_MIRRORED_REPEAT = 2;
L5.Shader.SC_CLAMP_EDGE      = 3;

// Filtering modes for the samplers.
L5.Shader.SF_NONE            = 0;
L5.Shader.SF_NEAREST         = 1;
L5.Shader.SF_LINEAR          = 2;
L5.Shader.SF_NEAREST_NEAREST = 3;
L5.Shader.SF_NEAREST_LINEAR  = 4;
L5.Shader.SF_LINEAR_NEAREST  = 5;
L5.Shader.SF_LINEAR_LINEAR   = 6;


// Support for deferred construction.
/**
 * @param i {number} 输入变量位置
 * @param name {string} 输入变量名称
 * @param type {number} L5.Shader.VT_XXX 输入变量类型
 * @param semantic {number} L5.Shader.VS_XXX
 */
L5.Shader.prototype.setInput       = function (i, name, type, semantic) {
    if (0 <= i && i < this.numInputs) {
        this.inputName[ i ]     = name;
        this.inputType[ i ]     = type;
        this.inputSemantic[ i ] = semantic;
        return;
    }
    L5.assert (false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param name {string} 输出变量名称
 * @param type {number} L5.Shader.VT_XXX 输出变量类型
 * @param semantic {number} L5.Shader.VS_XXX
 */
L5.Shader.prototype.setOutput      = function (i, name, type, semantic) {
    if (0 <= i && i < this.numOutputs) {
        this.outputName[ i ]     = name;
        this.outputType[ i ]     = type;
        this.outputSemantic[ i ] = semantic;
        return;
    }
    L5.assert (false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param name {string}
 * @param numRegistersUsed {number}
 */
L5.Shader.prototype.setConstant    = function (i, name, numRegistersUsed) {
    if (0 <= i && i < this.numConstants) {
        this.constantName[ i ]     = name;
        this.numRegistersUsed[ i ] = numRegistersUsed;
        return;
    }
    L5.assert (false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param name {string} 采样器名称
 * @param type {number} L5.Shader.ST_XXX 采样器类型
 */
L5.Shader.prototype.setSampler     = function (i, name, type) {
    if (0 <= i && i < this.numSamplers) {
        this.samplerName[ i ] = name;
        this.samplerType[ i ] = type;
        return;
    }
    L5.assert (false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param filter {number} L5.Shader.SF_XXX 过滤器类型
 */
L5.Shader.prototype.setFilter      = function (i, filter) {
    if (0 <= i && i < this.numSamplers) {
        this.filter[ i ] = filter;
        return;
    }
    L5.assert (false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param dim {number}
 * @param coordinate {number} L5.Shader.SC_XXX
 */
L5.Shader.prototype.setCoordinate  = function (i, dim, coordinate) {
    if (0 <= i && i < this.numSamplers) {
        if (0 <= dim && dim < 3) {
            this.coordinate[ dim ][ i ] = coordinate;
            return;
        }
        L5.assert (false, 'Invalid dimension.');
    }
    L5.assert (false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param lodBias {number}
 */
L5.Shader.prototype.setLodBias     = function (i, lodBias) {
    if (0 <= i && i < this.numSamplers) {
        this.lodBias[ i ] = lodBias;
        return;
    }
    L5.assert (false, 'Invalid index.');
};
/**
 * @param i {number}
 * @param anisotropy {number}
 */
L5.Shader.prototype.setAnisotropy  = function (i, anisotropy) {
    if (0 <= i && i < this.numSamplers) {
        this.anisotropy[ i ] = anisotropy;
        return;
    }
    L5.assert (false, 'Invalid index.');
};
/**
 *
 * @param i {number}
 * @param borderColor {Float32Array} 4 length
 */
L5.Shader.prototype.setBorderColor = function (i, borderColor) {
    if (0 <= i && i < this.numSamplers) {
        this.borderColor[ i ].set (borderColor.subarray (0, 4), 0);
        return;
    }
    L5.assert (false, 'Invalid index.');
};

// Use these when 'profileOwner' is 'true'.  The storage for the items
// has been dynamically allocated and the class assumes responsibility
// for deleting it during destruction.
L5.Shader.prototype.setBaseRegister = function (profile, i, baseRegister) {
    if (this.profileOwner) {
        if (0 <= profile && profile < L5.Shader.MAX_PROFILES) {
            if (0 <= i && i < this.numConstants) {
                this.baseRegister[ profile ][ i ] = baseRegister;
                return;
            }
            L5.assert (false, 'Invalid index.');
        }
        L5.assert (false, 'Invalid profile.');
    }
    L5.assert (false, 'You may not set profile data you do not own.');
};
L5.Shader.prototype.setTextureUnit  = function (profile, i, textureUnit) {
    if (this.profileOwner) {
        if (0 <= profile && profile < L5.Shader.MAX_PROFILES) {
            if (0 <= i && i < this.numSamplers) {
                this.textureUnit[ profile ][ i ] = textureUnit;
                return;
            }
            L5.assert (false, 'Invalid index.');
        }
        L5.assert (false, 'Invalid profile.');
    }
    L5.assert (false, 'You may not set profile data you do not own.');
};
L5.Shader.prototype.setProgram      = function (profile, program) {
    if (this.profileOwner) {
        if (0 <= profile && profile < L5.Shader.MAX_PROFILES) {
            this.program[ profile ] = program;
            return;
        }
        L5.assert (false, 'Invalid profile.');
    }
    L5.assert (false, 'You may not set profile data you do not own.');
};

// Use these when 'profileOwner' is 'false'.  This allows you to store the
// profile-specific information as global data arrays embedded in the
// executable or libraries.  The class will not attempt to delete these
// during destruction.
L5.Shader.prototype.setBaseRegisters = function (baseRegisters) {
    if (!this.profileOwner) {
        for (var i = 0, m = L5.Shader.MAX_PROFILES; i < m; ++i) {
            this.baseRegister[ i ] = baseRegisters[ i ];
        }
        return;
    }
    L5.assert (false, 'You already own the profile data.');
};
L5.Shader.prototype.setTextureUnits  = function (textureUnits) {
    if (!this.profileOwner) {
        for (var i = 0, m = L5.Shader.MAX_PROFILES; i < m; ++i) {
            this.textureUnit[ i ] = textureUnits[ i ];
        }
        return;
    }
    L5.assert (false, 'You already own the profile data.');
};
L5.Shader.prototype.setPrograms      = function (programs) {
    if (!this.profileOwner) {
        for (var i = 0, m = L5.Shader.MAX_PROFILES; i < m; ++i) {
            this.program[ i ] = programs[ i ];
        }
        return;
    }
    L5.assert (false, 'You already own the profile data.');
};

// Member access.

// Profile-independent data.
L5.Shader.prototype.getInputName     = function (i) {
    if (0 <= i && i < this.numInputs) {
        return this.inputName[ i ];
    }

    L5.assert (false, 'Invalid index.');
    return '';
};
L5.Shader.prototype.getInputType     = function (i) {
    if (0 <= i && i < this.numInputs) {
        return this.inputType[ i ];
    }

    L5.assert (false, 'Invalid index.');
    return L5.Shader.VT_NONE;
};
L5.Shader.prototype.getInputSemantic = function (i) {
    if (0 <= i && i < this.numInputs) {
        return this.inputSemantic[ i ];
    }

    L5.assert (false, 'Invalid index.');
    return L5.Shader.VS_NONE;
};

L5.Shader.prototype.getOutputName     = function (i) {
    if (0 <= i && i < this.numOutputs) {
        return this.outputName[ i ];
    }

    L5.assert (false, 'Invalid index.');
    return '';
};
L5.Shader.prototype.getOutputType     = function (i) {
    if (0 <= i && i < this.numOutputs) {
        return this.outputType[ i ];
    }

    L5.assert (false, 'Invalid index.');
    return L5.Shader.VT_NONE;
};
L5.Shader.prototype.getOutputSemantic = function (i) {
    if (0 <= i && i < this.numOutputs) {
        return this.outputSemantic[ i ];
    }

    L5.assert (false, 'Invalid index.');
    return L5.Shader.VS_NONE;
};

L5.Shader.prototype.getConstantName     = function (i) {
    if (0 <= i && i < this.numConstants) {
        return this.constantName[ i ];
    }

    L5.assert (false, 'Invalid index.');
    return '';
};
L5.Shader.prototype.getNumRegistersUsed = function (i) {
    if (0 <= i && i < this.numConstants) {
        return this.numRegistersUsed[ i ];
    }

    L5.assert (false, 'Invalid index.');
    return 0;
};

L5.Shader.prototype.getSamplerName = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.samplerName[ i ];
    }

    L5.assert (false, 'Invalid index.');
    return '';
};
L5.Shader.prototype.getSamplerType = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.samplerType[ i ];
    }

    L5.assert (false, 'Invalid index.');
    return L5.Shader.ST_NONE;
};
L5.Shader.prototype.getFilter      = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.filter[ i ];
    }

    L5.assert (false, 'Invalid index.');
    return L5.Shader.SF_NONE;
};
L5.Shader.prototype.getCoordinate  = function (i, dim) {
    if (0 <= i && i < this.numSamplers) {
        if (0 <= dim && dim < 3) {
            return this.coordinate[ dim ][ i ];
        }
        L5.assert (false, 'Invalid dimension.');
        return L5.Shader.SC_NONE;
    }

    L5.assert (false, 'Invalid index.');
    return L5.Shader.SC_NONE;
};
L5.Shader.prototype.getLodBias     = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.lodBias[ i ];
    }

    L5.assert (false, 'Invalid index.');
    return 0;
};
L5.Shader.prototype.getAnisotropy  = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.anisotropy[ i ];
    }

    L5.assert (false, 'Invalid index.');
    return 1;
};
L5.Shader.prototype.getBorderColor = function (i) {
    if (0 <= i && i < this.numSamplers) {
        return this.borderColor[ i ];
    }

    L5.assert (false, 'Invalid index.');
    return new Float32Array (4);
};

// Profile-dependent data.
L5.Shader.prototype.getBaseRegister = function (profile, i) {
    if (0 <= profile && profile < L5.Shader.MAX_PROFILES) {
        if (0 <= i && i < this.numConstants) {
            return this.baseRegister[ profile ][ i ];
        }
        L5.assert (false, 'Invalid index.');
        return 0;
    }

    L5.assert (false, 'Invalid profile.');
    return 0;
};
L5.Shader.prototype.getTextureUnit  = function (profile, i) {
    if (0 <= profile && profile < L5.Shader.MAX_PROFILES) {
        if (0 <= i && i < this.numSamplers) {
            return this.textureUnit[ profile ][ i ];
        }
        L5.assert (false, 'Invalid index.');
        return 0;
    }

    L5.assert (false, 'Invalid profile.');
    return 0;
};
L5.Shader.prototype.getProgram      = function (profile) {
    if (0 <= profile && profile < L5.Shader.MAX_PROFILES) {
        return this.program[ profile ];
    }

    L5.assert (false, 'Invalid profile.');
    return null;
};