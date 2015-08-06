L5.Webgl = {};
(function () {
    /* ClearBufferMask */
    L5.Webgl.DEPTH_BUFFER_BIT   = 0x00000100;
    L5.Webgl.STENCIL_BUFFER_BIT = 0x00000400;
    L5.Webgl.COLOR_BUFFER_BIT   = 0x00004000;

    /* BeginMode */
    L5.Webgl.POINTS         = 0x0000;
    L5.Webgl.LINES          = 0x0001;
    L5.Webgl.LINE_LOOP      = 0x0002;
    L5.Webgl.LINE_STRIP     = 0x0003;
    L5.Webgl.TRIANGLES      = 0x0004;
    L5.Webgl.TRIANGLE_STRIP = 0x0005;
    L5.Webgl.TRIANGLE_FAN   = 0x0006;

    /* AlphaFunction (not supported in ES20) */
    /*      NEVER */
    /*      LESS */
    /*      EQUAL */
    /*      LEQUAL */
    /*      GREATER */
    /*      NOTEQUAL */
    /*      GEQUAL */
    /*      ALWAYS */

    /* BlendingFactorDest */
    L5.Webgl.ZERO                = 0;
    L5.Webgl.ONE                 = 1;
    L5.Webgl.SRC_COLOR           = 0x0300;
    L5.Webgl.ONE_MINUS_SRC_COLOR = 0x0301;
    L5.Webgl.SRC_ALPHA           = 0x0302;
    L5.Webgl.ONE_MINUS_SRC_ALPHA = 0x0303;
    L5.Webgl.DST_ALPHA           = 0x0304;
    L5.Webgl.ONE_MINUS_DST_ALPHA = 0x0305;

    /* BlendingFactorSrc */
    /*      ZERO */
    /*      ONE */
    L5.Webgl.DST_COLOR           = 0x0306;
    L5.Webgl.ONE_MINUS_DST_COLOR = 0x0307;
    L5.Webgl.SRC_ALPHA_SATURATE  = 0x0308;
    /*      SRC_ALPHA */
    /*      ONE_MINUS_SRC_ALPHA */
    /*      DST_ALPHA */
    /*      ONE_MINUS_DST_ALPHA */

    /* BlendEquationSeparate */
    L5.Webgl.FUNC_ADD           = 0x8006;
    L5.Webgl.BLEND_EQUATION     = 0x8009;
    L5.Webgl.BLEND_EQUATION_RGB = 0x8009;
    /* same as BLEND_EQUATION */
    L5.Webgl.BLEND_EQUATION_ALPHA = 0x883D;

    /* BlendSubtract */
    L5.Webgl.FUNC_SUBTRACT         = 0x800A;
    L5.Webgl.FUNC_REVERSE_SUBTRACT = 0x800B;

    /* Separate Blend Functions */
    L5.Webgl.BLEND_DST_RGB            = 0x80C8;
    L5.Webgl.BLEND_SRC_RGB            = 0x80C9;
    L5.Webgl.BLEND_DST_ALPHA          = 0x80CA;
    L5.Webgl.BLEND_SRC_ALPHA          = 0x80CB;
    L5.Webgl.CONSTANT_COLOR           = 0x8001;
    L5.Webgl.ONE_MINUS_CONSTANT_COLOR = 0x8002;
    L5.Webgl.CONSTANT_ALPHA           = 0x8003;
    L5.Webgl.ONE_MINUS_CONSTANT_ALPHA = 0x8004;
    L5.Webgl.BLEND_COLOR              = 0x8005;

    /* Buffer Objects */
    L5.Webgl.ARRAY_BUFFER                 = 0x8892;
    L5.Webgl.ELEMENT_ARRAY_BUFFER         = 0x8893;
    L5.Webgl.ARRAY_BUFFER_BINDING         = 0x8894;
    L5.Webgl.ELEMENT_ARRAY_BUFFER_BINDING = 0x8895;

    L5.Webgl.STREAM_DRAW  = 0x88E0;
    L5.Webgl.STATIC_DRAW  = 0x88E4;
    L5.Webgl.DYNAMIC_DRAW = 0x88E8;

    L5.Webgl.BUFFER_SIZE  = 0x8764;
    L5.Webgl.BUFFER_USAGE = 0x8765;

    L5.Webgl.CURRENT_VERTEX_ATTRIB = 0x8626;

    /* CullFaceMode */
    L5.Webgl.FRONT          = 0x0404;
    L5.Webgl.BACK           = 0x0405;
    L5.Webgl.FRONT_AND_BACK = 0x0408;

    /* DepthFunction */
    /*      NEVER */
    /*      LESS */
    /*      EQUAL */
    /*      LEQUAL */
    /*      GREATER */
    /*      NOTEQUAL */
    /*      GEQUAL */
    /*      ALWAYS */

    /* EnableCap */
    /* TEXTURE_2D */
    L5.Webgl.CULL_FACE                = 0x0B44;
    L5.Webgl.BLEND                    = 0x0BE2;
    L5.Webgl.DITHER                   = 0x0BD0;
    L5.Webgl.STENCIL_TEST             = 0x0B90;
    L5.Webgl.DEPTH_TEST               = 0x0B71;
    L5.Webgl.SCISSOR_TEST             = 0x0C11;
    L5.Webgl.POLYGON_OFFSET_FILL      = 0x8037;
    L5.Webgl.SAMPLE_ALPHA_TO_COVERAGE = 0x809E;
    L5.Webgl.SAMPLE_COVERAGE          = 0x80A0;

    /* ErrorCode */
    L5.Webgl.NO_ERROR          = 0;
    L5.Webgl.INVALID_ENUM      = 0x0500;
    L5.Webgl.INVALID_VALUE     = 0x0501;
    L5.Webgl.INVALID_OPERATION = 0x0502;
    L5.Webgl.OUT_OF_MEMORY     = 0x0505;

    /* FrontFaceDirection */
    L5.Webgl.CW  = 0x0900;
    L5.Webgl.CCW = 0x0901;

    /* GetPName */
    L5.Webgl.LINE_WIDTH                   = 0x0B21;
    L5.Webgl.ALIASED_POINT_SIZE_RANGE     = 0x846D;
    L5.Webgl.ALIASED_LINE_WIDTH_RANGE     = 0x846E;
    L5.Webgl.CULL_FACE_MODE               = 0x0B45;
    L5.Webgl.FRONT_FACE                   = 0x0B46;
    L5.Webgl.DEPTH_RANGE                  = 0x0B70;
    L5.Webgl.DEPTH_WRITEMASK              = 0x0B72;
    L5.Webgl.DEPTH_CLEAR_VALUE            = 0x0B73;
    L5.Webgl.DEPTH_FUNC                   = 0x0B74;
    L5.Webgl.STENCIL_CLEAR_VALUE          = 0x0B91;
    L5.Webgl.STENCIL_FUNC                 = 0x0B92;
    L5.Webgl.STENCIL_FAIL                 = 0x0B94;
    L5.Webgl.STENCIL_PASS_DEPTH_FAIL      = 0x0B95;
    L5.Webgl.STENCIL_PASS_DEPTH_PASS      = 0x0B96;
    L5.Webgl.STENCIL_REF                  = 0x0B97;
    L5.Webgl.STENCIL_VALUE_MASK           = 0x0B93;
    L5.Webgl.STENCIL_WRITEMASK            = 0x0B98;
    L5.Webgl.STENCIL_BACK_FUNC            = 0x8800;
    L5.Webgl.STENCIL_BACK_FAIL            = 0x8801;
    L5.Webgl.STENCIL_BACK_PASS_DEPTH_FAIL = 0x8802;
    L5.Webgl.STENCIL_BACK_PASS_DEPTH_PASS = 0x8803;
    L5.Webgl.STENCIL_BACK_REF             = 0x8CA3;
    L5.Webgl.STENCIL_BACK_VALUE_MASK      = 0x8CA4;
    L5.Webgl.STENCIL_BACK_WRITEMASK       = 0x8CA5;
    L5.Webgl.VIEWPORT                     = 0x0BA2;
    L5.Webgl.SCISSOR_BOX                  = 0x0C10;
    /*      SCISSOR_TEST */
    L5.Webgl.COLOR_CLEAR_VALUE    = 0x0C22;
    L5.Webgl.COLOR_WRITEMASK      = 0x0C23;
    L5.Webgl.UNPACK_ALIGNMENT     = 0x0CF5;
    L5.Webgl.PACK_ALIGNMENT       = 0x0D05;
    L5.Webgl.MAX_TEXTURE_SIZE     = 0x0D33;
    L5.Webgl.MAX_VIEWPORT_DIMS    = 0x0D3A;
    L5.Webgl.SUBPIXEL_BITS        = 0x0D50;
    L5.Webgl.RED_BITS             = 0x0D52;
    L5.Webgl.GREEN_BITS           = 0x0D53;
    L5.Webgl.BLUE_BITS            = 0x0D54;
    L5.Webgl.ALPHA_BITS           = 0x0D55;
    L5.Webgl.DEPTH_BITS           = 0x0D56;
    L5.Webgl.STENCIL_BITS         = 0x0D57;
    L5.Webgl.POLYGON_OFFSET_UNITS = 0x2A00;
    /*      POLYGON_OFFSET_FILL */
    L5.Webgl.POLYGON_OFFSET_FACTOR  = 0x8038;
    L5.Webgl.TEXTURE_BINDING_2D     = 0x8069;
    L5.Webgl.SAMPLE_BUFFERS         = 0x80A8;
    L5.Webgl.SAMPLES                = 0x80A9;
    L5.Webgl.SAMPLE_COVERAGE_VALUE  = 0x80AA;
    L5.Webgl.SAMPLE_COVERAGE_INVERT = 0x80AB;

    /* GetTextureParameter */
    /*      TEXTURE_MAG_FILTER */
    /*      TEXTURE_MIN_FILTER */
    /*      TEXTURE_WRAP_S */
    /*      TEXTURE_WRAP_T */

    L5.Webgl.COMPRESSED_TEXTURE_FORMATS = 0x86A3;

    /* HintMode */
    L5.Webgl.DONT_CARE = 0x1100;
    L5.Webgl.FASTEST   = 0x1101;
    L5.Webgl.NICEST    = 0x1102;

    /* HintTarget */
    L5.Webgl.GENERATE_MIPMAP_HINT = 0x8192;

    /* DataType */
    L5.Webgl.BYTE           = 0x1400;
    L5.Webgl.UNSIGNED_BYTE  = 0x1401;
    L5.Webgl.SHORT          = 0x1402;
    L5.Webgl.UNSIGNED_SHORT = 0x1403;
    L5.Webgl.INT            = 0x1404;
    L5.Webgl.UNSIGNED_INT   = 0x1405;
    L5.Webgl.FLOAT          = 0x1406;

    /* PixelFormat */
    L5.Webgl.DEPTH_COMPONENT = 0x1902;
    L5.Webgl.ALPHA           = 0x1906;
    L5.Webgl.RGB             = 0x1907;
    L5.Webgl.RGBA            = 0x1908;
    L5.Webgl.LUMINANCE       = 0x1909;
    L5.Webgl.LUMINANCE_ALPHA = 0x190A;

    /* PixelType */
    /*      UNSIGNED_BYTE */
    L5.Webgl.UNSIGNED_SHORT_4_4_4_4 = 0x8033;
    L5.Webgl.UNSIGNED_SHORT_5_5_5_1 = 0x8034;
    L5.Webgl.UNSIGNED_SHORT_5_6_5   = 0x8363;

    /* Shaders */
    L5.Webgl.FRAGMENT_SHADER                  = 0x8B30;
    L5.Webgl.VERTEX_SHADER                    = 0x8B31;
    L5.Webgl.MAX_VERTEX_ATTRIBS               = 0x8869;
    L5.Webgl.MAX_VERTEX_UNIFORM_VECTORS       = 0x8DFB;
    L5.Webgl.MAX_VARYING_VECTORS              = 0x8DFC;
    L5.Webgl.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;
    L5.Webgl.MAX_VERTEX_TEXTURE_IMAGE_UNITS   = 0x8B4C;
    L5.Webgl.MAX_TEXTURE_IMAGE_UNITS          = 0x8872;
    L5.Webgl.MAX_FRAGMENT_UNIFORM_VECTORS     = 0x8DFD;
    L5.Webgl.SHADER_TYPE                      = 0x8B4F;
    L5.Webgl.DELETE_STATUS                    = 0x8B80;
    L5.Webgl.LINK_STATUS                      = 0x8B82;
    L5.Webgl.VALIDATE_STATUS                  = 0x8B83;
    L5.Webgl.ATTACHED_SHADERS                 = 0x8B85;
    L5.Webgl.ACTIVE_UNIFORMS                  = 0x8B86;
    L5.Webgl.ACTIVE_ATTRIBUTES                = 0x8B89;
    L5.Webgl.SHADING_LANGUAGE_VERSION         = 0x8B8C;
    L5.Webgl.CURRENT_PROGRAM                  = 0x8B8D;

    /* StencilFunction */
    L5.Webgl.NEVER    = 0x0200;
    L5.Webgl.LESS     = 0x0201;
    L5.Webgl.EQUAL    = 0x0202;
    L5.Webgl.LEQUAL   = 0x0203;
    L5.Webgl.GREATER  = 0x0204;
    L5.Webgl.NOTEQUAL = 0x0205;
    L5.Webgl.GEQUAL   = 0x0206;
    L5.Webgl.ALWAYS   = 0x0207;

    /* StencilOp */
    /*      ZERO */
    L5.Webgl.KEEP      = 0x1E00;
    L5.Webgl.REPLACE   = 0x1E01;
    L5.Webgl.INCR      = 0x1E02;
    L5.Webgl.DECR      = 0x1E03;
    L5.Webgl.INVERT    = 0x150A;
    L5.Webgl.INCR_WRAP = 0x8507;
    L5.Webgl.DECR_WRAP = 0x8508;

    /* StringName */
    L5.Webgl.VENDOR   = 0x1F00;
    L5.Webgl.RENDERER = 0x1F01;
    L5.Webgl.VERSION  = 0x1F02;

    /* TextureMagFilter */
    L5.Webgl.NEAREST = 0x2600;
    L5.Webgl.LINEAR  = 0x2601;

    /* TextureMinFilter */
    /*      NEAREST */
    /*      LINEAR */
    L5.Webgl.NEAREST_MIPMAP_NEAREST = 0x2700;
    L5.Webgl.LINEAR_MIPMAP_NEAREST  = 0x2701;
    L5.Webgl.NEAREST_MIPMAP_LINEAR  = 0x2702;
    L5.Webgl.LINEAR_MIPMAP_LINEAR   = 0x2703;

    /* TextureParameterName */
    L5.Webgl.TEXTURE_MAG_FILTER = 0x2800;
    L5.Webgl.TEXTURE_MIN_FILTER = 0x2801;
    L5.Webgl.TEXTURE_WRAP_S     = 0x2802;
    L5.Webgl.TEXTURE_WRAP_T     = 0x2803;

    /* TextureTarget */
    L5.Webgl.TEXTURE_2D                  = 0x0DE1;
    L5.Webgl.TEXTURE                     = 0x1702;
    L5.Webgl.TEXTURE_CUBE_MAP            = 0x8513;
    L5.Webgl.TEXTURE_BINDING_CUBE_MAP    = 0x8514;
    L5.Webgl.TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;
    L5.Webgl.TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;
    L5.Webgl.TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;
    L5.Webgl.TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;
    L5.Webgl.TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;
    L5.Webgl.TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;
    L5.Webgl.MAX_CUBE_MAP_TEXTURE_SIZE   = 0x851C;

    /* TextureUnit */
    L5.Webgl.TEXTURE0       = 0x84C0;
    L5.Webgl.TEXTURE1       = 0x84C1;
    L5.Webgl.TEXTURE2       = 0x84C2;
    L5.Webgl.TEXTURE3       = 0x84C3;
    L5.Webgl.TEXTURE4       = 0x84C4;
    L5.Webgl.TEXTURE5       = 0x84C5;
    L5.Webgl.TEXTURE6       = 0x84C6;
    L5.Webgl.TEXTURE7       = 0x84C7;
    L5.Webgl.TEXTURE8       = 0x84C8;
    L5.Webgl.TEXTURE9       = 0x84C9;
    L5.Webgl.TEXTURE10      = 0x84CA;
    L5.Webgl.TEXTURE11      = 0x84CB;
    L5.Webgl.TEXTURE12      = 0x84CC;
    L5.Webgl.TEXTURE13      = 0x84CD;
    L5.Webgl.TEXTURE14      = 0x84CE;
    L5.Webgl.TEXTURE15      = 0x84CF;
    L5.Webgl.TEXTURE16      = 0x84D0;
    L5.Webgl.TEXTURE17      = 0x84D1;
    L5.Webgl.TEXTURE18      = 0x84D2;
    L5.Webgl.TEXTURE19      = 0x84D3;
    L5.Webgl.TEXTURE20      = 0x84D4;
    L5.Webgl.TEXTURE21      = 0x84D5;
    L5.Webgl.TEXTURE22      = 0x84D6;
    L5.Webgl.TEXTURE23      = 0x84D7;
    L5.Webgl.TEXTURE24      = 0x84D8;
    L5.Webgl.TEXTURE25      = 0x84D9;
    L5.Webgl.TEXTURE26      = 0x84DA;
    L5.Webgl.TEXTURE27      = 0x84DB;
    L5.Webgl.TEXTURE28      = 0x84DC;
    L5.Webgl.TEXTURE29      = 0x84DD;
    L5.Webgl.TEXTURE30      = 0x84DE;
    L5.Webgl.TEXTURE31      = 0x84DF;
    L5.Webgl.ACTIVE_TEXTURE = 0x84E0;

    /* TextureWrapMode */
    L5.Webgl.REPEAT          = 0x2901;
    L5.Webgl.CLAMP_TO_EDGE   = 0x812F;
    L5.Webgl.MIRRORED_REPEAT = 0x8370;

    /* Uniform Types */
    L5.Webgl.FLOAT_VEC2   = 0x8B50;
    L5.Webgl.FLOAT_VEC3   = 0x8B51;
    L5.Webgl.FLOAT_VEC4   = 0x8B52;
    L5.Webgl.INT_VEC2     = 0x8B53;
    L5.Webgl.INT_VEC3     = 0x8B54;
    L5.Webgl.INT_VEC4     = 0x8B55;
    L5.Webgl.BOOL         = 0x8B56;
    L5.Webgl.BOOL_VEC2    = 0x8B57;
    L5.Webgl.BOOL_VEC3    = 0x8B58;
    L5.Webgl.BOOL_VEC4    = 0x8B59;
    L5.Webgl.FLOAT_MAT2   = 0x8B5A;
    L5.Webgl.FLOAT_MAT3   = 0x8B5B;
    L5.Webgl.FLOAT_MAT4   = 0x8B5C;
    L5.Webgl.SAMPLER_2D   = 0x8B5E;
    L5.Webgl.SAMPLER_CUBE = 0x8B60;

    /* Vertex Arrays */
    L5.Webgl.VERTEX_ATTRIB_ARRAY_ENABLED        = 0x8622;
    L5.Webgl.VERTEX_ATTRIB_ARRAY_SIZE           = 0x8623;
    L5.Webgl.VERTEX_ATTRIB_ARRAY_STRIDE         = 0x8624;
    L5.Webgl.VERTEX_ATTRIB_ARRAY_TYPE           = 0x8625;
    L5.Webgl.VERTEX_ATTRIB_ARRAY_NORMALIZED     = 0x886A;
    L5.Webgl.VERTEX_ATTRIB_ARRAY_POINTER        = 0x8645;
    L5.Webgl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;

    /* Read Format */
    L5.Webgl.IMPLEMENTATION_COLOR_READ_TYPE   = 0x8B9A;
    L5.Webgl.IMPLEMENTATION_COLOR_READ_FORMAT = 0x8B9B;

    /* Shader Source */
    L5.Webgl.COMPILE_STATUS = 0x8B81;

    /* Shader Precision-Specified Types */
    L5.Webgl.LOW_FLOAT    = 0x8DF0;
    L5.Webgl.MEDIUM_FLOAT = 0x8DF1;
    L5.Webgl.HIGH_FLOAT   = 0x8DF2;
    L5.Webgl.LOW_INT      = 0x8DF3;
    L5.Webgl.MEDIUM_INT   = 0x8DF4;
    L5.Webgl.HIGH_INT     = 0x8DF5;

    /* Framebuffer Object. */
    L5.Webgl.FRAMEBUFFER  = 0x8D40;
    L5.Webgl.RENDERBUFFER = 0x8D41;

    L5.Webgl.RGBA4             = 0x8056;
    L5.Webgl.RGB5_A1           = 0x8057;
    L5.Webgl.RGB565            = 0x8D62;
    L5.Webgl.DEPTH_COMPONENT16 = 0x81A5;
    L5.Webgl.STENCIL_INDEX     = 0x1901;
    L5.Webgl.STENCIL_INDEX8    = 0x8D48;
    L5.Webgl.DEPTH_STENCIL     = 0x84F9;

    L5.Webgl.RENDERBUFFER_WIDTH           = 0x8D42;
    L5.Webgl.RENDERBUFFER_HEIGHT          = 0x8D43;
    L5.Webgl.RENDERBUFFER_INTERNAL_FORMAT = 0x8D44;
    L5.Webgl.RENDERBUFFER_RED_SIZE        = 0x8D50;
    L5.Webgl.RENDERBUFFER_GREEN_SIZE      = 0x8D51;
    L5.Webgl.RENDERBUFFER_BLUE_SIZE       = 0x8D52;
    L5.Webgl.RENDERBUFFER_ALPHA_SIZE      = 0x8D53;
    L5.Webgl.RENDERBUFFER_DEPTH_SIZE      = 0x8D54;
    L5.Webgl.RENDERBUFFER_STENCIL_SIZE    = 0x8D55;

    L5.Webgl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE           = 0x8CD0;
    L5.Webgl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME           = 0x8CD1;
    L5.Webgl.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL         = 0x8CD2;
    L5.Webgl.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;

    L5.Webgl.COLOR_ATTACHMENT0        = 0x8CE0;
    L5.Webgl.DEPTH_ATTACHMENT         = 0x8D00;
    L5.Webgl.STENCIL_ATTACHMENT       = 0x8D20;
    L5.Webgl.DEPTH_STENCIL_ATTACHMENT = 0x821A;

    L5.Webgl.NONE = 0;

    L5.Webgl.FRAMEBUFFER_COMPLETE                      = 0x8CD5;
    L5.Webgl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT         = 0x8CD6;
    L5.Webgl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;
    L5.Webgl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS         = 0x8CD9;
    L5.Webgl.FRAMEBUFFER_UNSUPPORTED                   = 0x8CDD;
    L5.Webgl.FRAMEBUFFER_BINDING                       = 0x8CA6;
    L5.Webgl.RENDERBUFFER_BINDING                      = 0x8CA7;
    L5.Webgl.MAX_RENDERBUFFER_SIZE                     = 0x84E8;

    L5.Webgl.INVALID_FRAMEBUFFER_OPERATION = 0x0506;

    /* WebGL-specific enums */
    L5.Webgl.UNPACK_FLIP_Y_WEBGL                = 0x9240;
    L5.Webgl.UNPACK_PREMULTIPLY_ALPHA_WEBGL     = 0x9241;
    L5.Webgl.CONTEXT_LOST_WEBGL                 = 0x9242;
    L5.Webgl.UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
    L5.Webgl.BROWSER_DEFAULT_WEBGL              = 0x9244;

    var NS = L5.Webgl;

    // 属性数据类型
    L5.Webgl.AttributeType = [
        0,                          // AT_NONE (unsupported)
        NS.FLOAT,                   // AT_FLOAT1
        NS.FLOAT,                   // AT_FLOAT2
        NS.FLOAT,                   // AT_FLOAT3
        NS.FLOAT,                   // AT_FLOAT4
        NS.UNSIGNED_BYTE,           // AT_UBYTE4
        NS.SHORT,                   // AT_SHORT1
        NS.SHORT,                   // AT_SHORT2
        NS.SHORT                    // AT_SHORT4
    ];

    // 属性尺寸
    L5.Webgl.AttributeChannels = [
        0,  // AT_NONE (unsupported)
        1,  // AT_FLOAT1
        2,  // AT_FLOAT2
        3,  // AT_FLOAT3
        4,  // AT_FLOAT4
        4,  // AT_UBYTE4
        1,  // AT_SHORT1
        2,  // AT_SHORT2
        4   // AT_SHORT4
    ];

    // 缓冲使用方式
    L5.Webgl.BufferUsage = [
        NS.STATIC_DRAW,     // BU_STATIC
        NS.DYNAMIC_DRAW,    // BU_DYNAMIC
        NS.DYNAMIC_DRAW,    // BU_RENDERTARGET
        NS.DYNAMIC_DRAW,    // BU_DEPTHSTENCIL
        NS.DYNAMIC_DRAW     // BU_TEXTURE
    ];

    // 纹理目标
    L5.Webgl.TextureTarget = [
        0,                   // ST_NONE
        NS.TEXTURE_2D,       // ST_2D
        NS.TEXTURE_3D,       // ST_3D
        NS.TEXTURE_CUBE_MAP, // ST_CUBE
        NS.TEXTURE_2D_ARRAY  // ST_2D_ARRAY
    ];

    // 纹理包装方式
    L5.Webgl.WrapMode = [
        NS.CLAMP_TO_EDGE,   // SC_NONE
        NS.REPEAT,          // SC_REPEAT
        NS.MIRRORED_REPEAT, // SC_MIRRORED_REPEAT
        NS.CLAMP_TO_EDGE    // SC_CLAMP_EDGE
    ];

    // 透明通道混合
    L5.Webgl.AlphaBlend = [
        NS.ZERO,
        NS.ONE,
        NS.SRC_COLOR,
        NS.ONE_MINUS_SRC_COLOR,
        NS.DST_COLOR,
        NS.ONE_MINUS_DST_COLOR,
        NS.SRC_ALPHA,
        NS.ONE_MINUS_SRC_ALPHA,
        NS.DST_ALPHA,
        NS.ONE_MINUS_DST_ALPHA,
        NS.SRC_ALPHA_SATURATE,
        NS.CONSTANT_COLOR,
        NS.ONE_MINUS_CONSTANT_COLOR,
        NS.CONSTANT_ALPHA,
        NS.ONE_MINUS_CONSTANT_ALPHA
    ];

    L5.Webgl.TextureFilter = [
        0,                          // SF_NONE
        NS.NEAREST,                 // SF_NEAREST
        NS.LINEAR,                  // SF_LINEAR
        NS.NEAREST_MIPMAP_NEAREST,  // SF_NEAREST_NEAREST
        NS.NEAREST_MIPMAP_LINEAR,   // SF_NEAREST_LINEAR
        NS.LINEAR_MIPMAP_NEAREST,   // SF_LINEAR_NEAREST
        NS.LINEAR_MIPMAP_LINEAR     // SF_LINEAR_LINEAR
    ];

    L5.Webgl.TextureFormat = [
        0,                                  // TF_NONE
        NS.RGB,                             // TF_R5G6B5
        NS.RGBA,                            // TF_A1R5G5B5
        NS.RGBA,                            // TF_A4R4G4B4
        NS.ALPHA,                           // TF_A8
        NS.LUMINANCE,                       // TF_L8
        NS.LUMINANCE_ALPHA,                 // TF_A8L8
        NS.RGB,                             // TF_R8G8B8
        NS.RGBA,                            // TF_A8R8G8B8
        NS.RGBA,                            // TF_A8B8G8R8
        NS.LUMINANCE,                       // TF_L16
        0,                                  // TF_G16R16
        NS.RGBA,                            // TF_A16B16G16R16
        0,                                  // TF_R16F
        0,                                  // TF_G16R16F
        NS.RGBA,                            // TF_A16B16G16R16F
        0,                                  // TF_R32F
        0,                                  // TF_G32R32F
        NS.RGBA,                            // TF_A32B32G32R32F
        NS.COMPRESSED_RGBA_S3TC_DXT1_EXT,   // TF_DXT1
        NS.COMPRESSED_RGBA_S3TC_DXT3_EXT,   // TF_DXT3
        NS.COMPRESSED_RGBA_S3TC_DXT5_EXT,   // TF_DXT5
        NS.UNSIGNED_INT_24_8_WEBGL          // TF_D24S8
    ];

    L5.Webgl.TextureType =[
        0,                              // TF_NONE
        NS.UNSIGNED_SHORT_5_6_5,        // TF_R5G6B5
        NS.UNSIGNED_SHORT_1_5_5_5,      // TF_A1R5G5B5
        NS.UNSIGNED_SHORT_4_4_4_4,      // TF_A4R4G4B4
        NS.UNSIGNED_BYTE,               // TF_A8
        NS.UNSIGNED_BYTE,               // TF_L8
        NS.UNSIGNED_BYTE,               // TF_A8L8
        NS.UNSIGNED_BYTE,               // TF_R8G8B8
        NS.UNSIGNED_BYTE,               // TF_A8R8G8B8
        NS.UNSIGNED_BYTE,               // TF_A8B8G8R8
        NS.UNSIGNED_SHORT,              // TF_L16
        NS.UNSIGNED_SHORT,              // TF_G16R16
        NS.UNSIGNED_SHORT,              // TF_A16B16G16R16
        NS.HALF_FLOAT_OES,              // TF_R16F
        NS.HALF_FLOAT_OES,              // TF_G16R16F
        NS.HALF_FLOAT_OES,              // TF_A16B16G16R16F
        NS.FLOAT,                       // TF_R32F
        NS.FLOAT,                       // TF_G32R32F
        NS.FLOAT,                       // TF_A32B32G32R32F
        NS.NONE,                        // TF_DXT1 (not needed)
        NS.NONE,                        // TF_DXT3 (not needed)
        NS.NONE,                        // TF_DXT5 (not needed)
        NS.UNSIGNED_INT_24_8_WEBGL      // TF_D24S8
    ];

}) ();




