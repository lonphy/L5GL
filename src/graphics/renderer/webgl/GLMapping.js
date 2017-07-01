let mapping = {};

/* ClearBufferMask */
mapping.DEPTH_BUFFER_BIT = 0x00000100;
mapping.STENCIL_BUFFER_BIT = 0x00000400;
mapping.COLOR_BUFFER_BIT = 0x00004000;

/* BeginMode */
mapping.POINTS = 0x0000;
mapping.LINES = 0x0001;
mapping.LINE_LOOP = 0x0002;
mapping.LINE_STRIP = 0x0003;
mapping.TRIANGLES = 0x0004;
mapping.TRIANGLE_STRIP = 0x0005;
mapping.TRIANGLE_FAN = 0x0006;

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
mapping.ZERO = 0;
mapping.ONE = 1;
mapping.SRC_COLOR = 0x0300;
mapping.ONE_MINUS_SRC_COLOR = 0x0301;
mapping.SRC_ALPHA = 0x0302;
mapping.ONE_MINUS_SRC_ALPHA = 0x0303;
mapping.DST_ALPHA = 0x0304;
mapping.ONE_MINUS_DST_ALPHA = 0x0305;

/* BlendingFactorSrc */
/*      ZERO */
/*      ONE */
mapping.DST_COLOR = 0x0306;
mapping.ONE_MINUS_DST_COLOR = 0x0307;
mapping.SRC_ALPHA_SATURATE = 0x0308;
/*      SRC_ALPHA */
/*      ONE_MINUS_SRC_ALPHA */
/*      DST_ALPHA */
/*      ONE_MINUS_DST_ALPHA */

/* BlendEquationSeparate */
mapping.FUNC_ADD = 0x8006;
mapping.BLEND_EQUATION = 0x8009;
mapping.BLEND_EQUATION_RGB = 0x8009;
/* same as BLEND_EQUATION */
mapping.BLEND_EQUATION_ALPHA = 0x883D;

/* BlendSubtract */
mapping.FUNC_SUBTRACT = 0x800A;
mapping.FUNC_REVERSE_SUBTRACT = 0x800B;

/* Separate Blend Functions */
mapping.BLEND_DST_RGB = 0x80C8;
mapping.BLEND_SRC_RGB = 0x80C9;
mapping.BLEND_DST_ALPHA = 0x80CA;
mapping.BLEND_SRC_ALPHA = 0x80CB;
mapping.CONSTANT_COLOR = 0x8001;
mapping.ONE_MINUS_CONSTANT_COLOR = 0x8002;
mapping.CONSTANT_ALPHA = 0x8003;
mapping.ONE_MINUS_CONSTANT_ALPHA = 0x8004;
mapping.BLEND_COLOR = 0x8005;

/* Buffer Objects */
mapping.ARRAY_BUFFER = 0x8892;
mapping.ELEMENT_ARRAY_BUFFER = 0x8893;
mapping.ARRAY_BUFFER_BINDING = 0x8894;
mapping.ELEMENT_ARRAY_BUFFER_BINDING = 0x8895;

mapping.STREAM_DRAW = 0x88E0;
mapping.STATIC_DRAW = 0x88E4;
mapping.DYNAMIC_DRAW = 0x88E8;

mapping.BUFFER_SIZE = 0x8764;
mapping.BUFFER_USAGE = 0x8765;

mapping.CURRENT_VERTEX_ATTRIB = 0x8626;

/* CullFaceMode */
mapping.FRONT = 0x0404;
mapping.BACK = 0x0405;
mapping.FRONT_AND_BACK = 0x0408;

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
mapping.CULL_FACE = 0x0B44;
mapping.BLEND = 0x0BE2;
mapping.DITHER = 0x0BD0;
mapping.STENCIL_TEST = 0x0B90;
mapping.DEPTH_TEST = 0x0B71;
mapping.SCISSOR_TEST = 0x0C11;
mapping.POLYGON_OFFSET_FILL = 0x8037;
mapping.SAMPLE_ALPHA_TO_COVERAGE = 0x809E;
mapping.SAMPLE_COVERAGE = 0x80A0;

/* ErrorCode */
mapping.NO_ERROR = 0;
mapping.INVALID_ENUM = 0x0500;
mapping.INVALID_VALUE = 0x0501;
mapping.INVALID_OPERATION = 0x0502;
mapping.OUT_OF_MEMORY = 0x0505;

/* FrontFaceDirection */
mapping.CW = 0x0900;
mapping.CCW = 0x0901;

/* GetPName */
mapping.LINE_WIDTH = 0x0B21;
mapping.ALIASED_POINT_SIZE_RANGE = 0x846D;
mapping.ALIASED_LINE_WIDTH_RANGE = 0x846E;
mapping.CULL_FACE_MODE = 0x0B45;
mapping.FRONT_FACE = 0x0B46;
mapping.DEPTH_RANGE = 0x0B70;
mapping.DEPTH_WRITEMASK = 0x0B72;
mapping.DEPTH_CLEAR_VALUE = 0x0B73;
mapping.DEPTH_FUNC = 0x0B74;
mapping.STENCIL_CLEAR_VALUE = 0x0B91;
mapping.STENCIL_FUNC = 0x0B92;
mapping.STENCIL_FAIL = 0x0B94;
mapping.STENCIL_PASS_DEPTH_FAIL = 0x0B95;
mapping.STENCIL_PASS_DEPTH_PASS = 0x0B96;
mapping.STENCIL_REF = 0x0B97;
mapping.STENCIL_VALUE_MASK = 0x0B93;
mapping.STENCIL_WRITEMASK = 0x0B98;
mapping.STENCIL_BACK_FUNC = 0x8800;
mapping.STENCIL_BACK_FAIL = 0x8801;
mapping.STENCIL_BACK_PASS_DEPTH_FAIL = 0x8802;
mapping.STENCIL_BACK_PASS_DEPTH_PASS = 0x8803;
mapping.STENCIL_BACK_REF = 0x8CA3;
mapping.STENCIL_BACK_VALUE_MASK = 0x8CA4;
mapping.STENCIL_BACK_WRITEMASK = 0x8CA5;
mapping.VIEWPORT = 0x0BA2;
mapping.SCISSOR_BOX = 0x0C10;
/*      SCISSOR_TEST */
mapping.COLOR_CLEAR_VALUE = 0x0C22;
mapping.COLOR_WRITEMASK = 0x0C23;
mapping.UNPACK_ALIGNMENT = 0x0CF5;
mapping.PACK_ALIGNMENT = 0x0D05;
mapping.MAX_TEXTURE_SIZE = 0x0D33;
mapping.MAX_VIEWPORT_DIMS = 0x0D3A;
mapping.SUBPIXEL_BITS = 0x0D50;
mapping.RED_BITS = 0x0D52;
mapping.GREEN_BITS = 0x0D53;
mapping.BLUE_BITS = 0x0D54;
mapping.ALPHA_BITS = 0x0D55;
mapping.DEPTH_BITS = 0x0D56;
mapping.STENCIL_BITS = 0x0D57;
mapping.POLYGON_OFFSET_UNITS = 0x2A00;
/*      POLYGON_OFFSET_FILL */
mapping.POLYGON_OFFSET_FACTOR = 0x8038;
mapping.TEXTURE_BINDING_2D = 0x8069;
mapping.SAMPLE_BUFFERS = 0x80A8;
mapping.SAMPLES = 0x80A9;
mapping.SAMPLE_COVERAGE_VALUE = 0x80AA;
mapping.SAMPLE_COVERAGE_INVERT = 0x80AB;

/* GetTextureParameter */
/*      TEXTURE_MAG_FILTER */
/*      TEXTURE_MIN_FILTER */
/*      TEXTURE_WRAP_S */
/*      TEXTURE_WRAP_T */

mapping.COMPRESSED_TEXTURE_FORMATS = 0x86A3;

/* HintMode */
mapping.DONT_CARE = 0x1100;
mapping.FASTEST = 0x1101;
mapping.NICEST = 0x1102;

/* HintTarget */
mapping.GENERATE_MIPMAP_HINT = 0x8192;

/* DataType */
mapping.BYTE = 0x1400;
mapping.UNSIGNED_BYTE = 0x1401;
mapping.SHORT = 0x1402;
mapping.UNSIGNED_SHORT = 0x1403;
mapping.INT = 0x1404;
mapping.UNSIGNED_INT = 0x1405;
mapping.FLOAT = 0x1406;

/* PixelFormat */
mapping.DEPTH_COMPONENT = 0x1902;
mapping.ALPHA = 0x1906;
mapping.RGB = 0x1907;
mapping.RGBA = 0x1908;
mapping.LUMINANCE = 0x1909;
mapping.LUMINANCE_ALPHA = 0x190A;

/* PixelType */
/*      UNSIGNED_BYTE */
mapping.UNSIGNED_SHORT_4_4_4_4 = 0x8033;
mapping.UNSIGNED_SHORT_5_5_5_1 = 0x8034;
mapping.UNSIGNED_SHORT_5_6_5 = 0x8363;

/* Shaders */
mapping.FRAGMENT_SHADER = 0x8B30;
mapping.VERTEX_SHADER = 0x8B31;
mapping.MAX_VERTEX_ATTRIBS = 0x8869;
mapping.MAX_VERTEX_UNIFORM_VECTORS = 0x8DFB;
mapping.MAX_VARYING_VECTORS = 0x8DFC;
mapping.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;
mapping.MAX_VERTEX_TEXTURE_IMAGE_UNITS = 0x8B4C;
mapping.MAX_TEXTURE_IMAGE_UNITS = 0x8872;
mapping.MAX_FRAGMENT_UNIFORM_VECTORS = 0x8DFD;
mapping.SHADER_TYPE = 0x8B4F;
mapping.DELETE_STATUS = 0x8B80;
mapping.LINK_STATUS = 0x8B82;
mapping.VALIDATE_STATUS = 0x8B83;
mapping.ATTACHED_SHADERS = 0x8B85;
mapping.ACTIVE_UNIFORMS = 0x8B86;
mapping.ACTIVE_ATTRIBUTES = 0x8B89;
mapping.SHADING_LANGUAGE_VERSION = 0x8B8C;
mapping.CURRENT_PROGRAM = 0x8B8D;

/* StencilFunction */
mapping.NEVER = 0x0200;
mapping.LESS = 0x0201;
mapping.EQUAL = 0x0202;
mapping.LEQUAL = 0x0203;
mapping.GREATER = 0x0204;
mapping.NOTEQUAL = 0x0205;
mapping.GEQUAL = 0x0206;
mapping.ALWAYS = 0x0207;

/* StencilOp */
/*      ZERO */
mapping.KEEP = 0x1E00;
mapping.REPLACE = 0x1E01;
mapping.INCR = 0x1E02;
mapping.DECR = 0x1E03;
mapping.INVERT = 0x150A;
mapping.INCR_WRAP = 0x8507;
mapping.DECR_WRAP = 0x8508;

/* StringName */
mapping.VENDOR = 0x1F00;
mapping.RENDERER = 0x1F01;
mapping.VERSION = 0x1F02;

/* TextureMagFilter */
mapping.NEAREST = 0x2600;
mapping.LINEAR = 0x2601;

/* TextureMinFilter */
/*      NEAREST */
/*      LINEAR */
mapping.NEAREST_MIPMAP_NEAREST = 0x2700;
mapping.LINEAR_MIPMAP_NEAREST = 0x2701;
mapping.NEAREST_MIPMAP_LINEAR = 0x2702;
mapping.LINEAR_MIPMAP_LINEAR = 0x2703;

/* TextureParameterName */
mapping.TEXTURE_MAG_FILTER = 0x2800;
mapping.TEXTURE_MIN_FILTER = 0x2801;
mapping.TEXTURE_WRAP_S = 0x2802;
mapping.TEXTURE_WRAP_T = 0x2803;

/* TextureTarget */
mapping.TEXTURE_2D = 0x0DE1;
mapping.TEXTURE = 0x1702;
mapping.TEXTURE_CUBE_MAP = 0x8513;
mapping.TEXTURE_BINDING_CUBE_MAP = 0x8514;
mapping.TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;
mapping.TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;
mapping.TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;
mapping.TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;
mapping.TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;
mapping.TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;
mapping.MAX_CUBE_MAP_TEXTURE_SIZE = 0x851C;

/* TextureUnit */
mapping.TEXTURE0 = 0x84C0;
mapping.TEXTURE1 = 0x84C1;
mapping.TEXTURE2 = 0x84C2;
mapping.TEXTURE3 = 0x84C3;
mapping.TEXTURE4 = 0x84C4;
mapping.TEXTURE5 = 0x84C5;
mapping.TEXTURE6 = 0x84C6;
mapping.TEXTURE7 = 0x84C7;
mapping.TEXTURE8 = 0x84C8;
mapping.TEXTURE9 = 0x84C9;
mapping.TEXTURE10 = 0x84CA;
mapping.TEXTURE11 = 0x84CB;
mapping.TEXTURE12 = 0x84CC;
mapping.TEXTURE13 = 0x84CD;
mapping.TEXTURE14 = 0x84CE;
mapping.TEXTURE15 = 0x84CF;
mapping.TEXTURE16 = 0x84D0;
mapping.TEXTURE17 = 0x84D1;
mapping.TEXTURE18 = 0x84D2;
mapping.TEXTURE19 = 0x84D3;
mapping.TEXTURE20 = 0x84D4;
mapping.TEXTURE21 = 0x84D5;
mapping.TEXTURE22 = 0x84D6;
mapping.TEXTURE23 = 0x84D7;
mapping.TEXTURE24 = 0x84D8;
mapping.TEXTURE25 = 0x84D9;
mapping.TEXTURE26 = 0x84DA;
mapping.TEXTURE27 = 0x84DB;
mapping.TEXTURE28 = 0x84DC;
mapping.TEXTURE29 = 0x84DD;
mapping.TEXTURE30 = 0x84DE;
mapping.TEXTURE31 = 0x84DF;
mapping.ACTIVE_TEXTURE = 0x84E0;

/* TextureWrapMode */
mapping.REPEAT = 0x2901;
mapping.CLAMP_TO_EDGE = 0x812F;
mapping.MIRRORED_REPEAT = 0x8370;

/* Uniform Types */
mapping.FLOAT_VEC2 = 0x8B50;
mapping.FLOAT_VEC3 = 0x8B51;
mapping.FLOAT_VEC4 = 0x8B52;
mapping.INT_VEC2 = 0x8B53;
mapping.INT_VEC3 = 0x8B54;
mapping.INT_VEC4 = 0x8B55;
mapping.BOOL = 0x8B56;
mapping.BOOL_VEC2 = 0x8B57;
mapping.BOOL_VEC3 = 0x8B58;
mapping.BOOL_VEC4 = 0x8B59;
mapping.FLOAT_MAT2 = 0x8B5A;
mapping.FLOAT_MAT3 = 0x8B5B;
mapping.FLOAT_MAT4 = 0x8B5C;
mapping.SAMPLER_2D = 0x8B5E;
mapping.SAMPLER_CUBE = 0x8B60;

/* Vertex Arrays */
mapping.VERTEX_ATTRIB_ARRAY_ENABLED = 0x8622;
mapping.VERTEX_ATTRIB_ARRAY_SIZE = 0x8623;
mapping.VERTEX_ATTRIB_ARRAY_STRIDE = 0x8624;
mapping.VERTEX_ATTRIB_ARRAY_TYPE = 0x8625;
mapping.VERTEX_ATTRIB_ARRAY_NORMALIZED = 0x886A;
mapping.VERTEX_ATTRIB_ARRAY_POINTER = 0x8645;
mapping.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;

/* Read Format */
mapping.IMPLEMENTATION_COLOR_READ_TYPE = 0x8B9A;
mapping.IMPLEMENTATION_COLOR_READ_FORMAT = 0x8B9B;

/* Shader Source */
mapping.COMPILE_STATUS = 0x8B81;

/* Shader Precision-Specified Types */
mapping.LOW_FLOAT = 0x8DF0;
mapping.MEDIUM_FLOAT = 0x8DF1;
mapping.HIGH_FLOAT = 0x8DF2;
mapping.LOW_INT = 0x8DF3;
mapping.MEDIUM_INT = 0x8DF4;
mapping.HIGH_INT = 0x8DF5;

/* Framebuffer Object. */
mapping.FRAMEBUFFER = 0x8D40;
mapping.RENDERBUFFER = 0x8D41;

mapping.RGBA4 = 0x8056;
mapping.RGB5_A1 = 0x8057;
mapping.RGB565 = 0x8D62;
mapping.DEPTH_COMPONENT16 = 0x81A5;
mapping.STENCIL_INDEX = 0x1901;
mapping.STENCIL_INDEX8 = 0x8D48;
mapping.DEPTH_STENCIL = 0x84F9;

mapping.RENDERBUFFER_WIDTH = 0x8D42;
mapping.RENDERBUFFER_HEIGHT = 0x8D43;
mapping.RENDERBUFFER_INTERNAL_FORMAT = 0x8D44;
mapping.RENDERBUFFER_RED_SIZE = 0x8D50;
mapping.RENDERBUFFER_GREEN_SIZE = 0x8D51;
mapping.RENDERBUFFER_BLUE_SIZE = 0x8D52;
mapping.RENDERBUFFER_ALPHA_SIZE = 0x8D53;
mapping.RENDERBUFFER_DEPTH_SIZE = 0x8D54;
mapping.RENDERBUFFER_STENCIL_SIZE = 0x8D55;

mapping.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = 0x8CD0;
mapping.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = 0x8CD1;
mapping.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = 0x8CD2;
mapping.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;

mapping.COLOR_ATTACHMENT0 = 0x8CE0;
mapping.DEPTH_ATTACHMENT = 0x8D00;
mapping.STENCIL_ATTACHMENT = 0x8D20;
mapping.DEPTH_STENCIL_ATTACHMENT = 0x821A;

mapping.NONE = 0;

mapping.FRAMEBUFFER_COMPLETE = 0x8CD5;
mapping.FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 0x8CD6;
mapping.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;
mapping.FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 0x8CD9;
mapping.FRAMEBUFFER_UNSUPPORTED = 0x8CDD;
mapping.FRAMEBUFFER_BINDING = 0x8CA6;
mapping.RENDERBUFFER_BINDING = 0x8CA7;
mapping.MAX_RENDERBUFFER_SIZE = 0x84E8;

mapping.INVALID_FRAMEBUFFER_OPERATION = 0x0506;

/* WebGL-specific enums */
mapping.UNPACK_FLIP_Y_WEBGL = 0x9240;
mapping.UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
mapping.CONTEXT_LOST_WEBGL = 0x9242;
mapping.UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
mapping.BROWSER_DEFAULT_WEBGL = 0x9244;

/* webgl2 add */
mapping.READ_BUFFER = 0x0C02;
mapping.UNPACK_ROW_LENGTH = 0x0CF2;
mapping.UNPACK_SKIP_ROWS = 0x0CF3;
mapping.UNPACK_SKIP_PIXELS = 0x0CF4;
mapping.PACK_ROW_LENGTH = 0x0D02;
mapping.PACK_SKIP_ROWS = 0x0D03;
mapping.PACK_SKIP_PIXELS = 0x0D04;
mapping.COLOR = 0x1800;
mapping.DEPTH = 0x1801;
mapping.STENCIL = 0x1802;
mapping.RED = 0x1903;
mapping.RGB8 = 0x8051;
mapping.RGBA8 = 0x8058;
mapping.RGB10_A2 = 0x8059;
mapping.TEXTURE_BINDING_3D = 0x806A;
mapping.UNPACK_SKIP_IMAGES = 0x806D;
mapping.UNPACK_IMAGE_HEIGHT = 0x806E;
mapping.TEXTURE_3D = 0x806F;
mapping.TEXTURE_WRAP_R = 0x8072;
mapping.MAX_3D_TEXTURE_SIZE = 0x8073;
mapping.UNSIGNED_INT_2_10_10_10_REV = 0x8368;
mapping.MAX_ELEMENTS_VERTICES = 0x80E8;
mapping.MAX_ELEMENTS_INDICES = 0x80E9;
mapping.TEXTURE_MIN_LOD = 0x813A;
mapping.TEXTURE_MAX_LOD = 0x813B;
mapping.TEXTURE_BASE_LEVEL = 0x813C;
mapping.TEXTURE_MAX_LEVEL = 0x813D;
mapping.MIN = 0x8007;
mapping.MAX = 0x8008;
mapping.DEPTH_COMPONENT24 = 0x81A6;
mapping.MAX_TEXTURE_LOD_BIAS = 0x84FD;
mapping.TEXTURE_COMPARE_MODE = 0x884C;
mapping.TEXTURE_COMPARE_FUNC = 0x884D;
mapping.CURRENT_QUERY = 0x8865;
mapping.QUERY_RESULT = 0x8866;
mapping.QUERY_RESULT_AVAILABLE = 0x8867;
mapping.STREAM_READ = 0x88E1;
mapping.STREAM_COPY = 0x88E2;
mapping.STATIC_READ = 0x88E5;
mapping.STATIC_COPY = 0x88E6;
mapping.DYNAMIC_READ = 0x88E9;
mapping.DYNAMIC_COPY = 0x88EA;
mapping.MAX_DRAW_BUFFERS = 0x8824;
mapping.DRAW_BUFFER0 = 0x8825;
mapping.DRAW_BUFFER1 = 0x8826;
mapping.DRAW_BUFFER2 = 0x8827;
mapping.DRAW_BUFFER3 = 0x8828;
mapping.DRAW_BUFFER4 = 0x8829;
mapping.DRAW_BUFFER5 = 0x882A;
mapping.DRAW_BUFFER6 = 0x882B;
mapping.DRAW_BUFFER7 = 0x882C;
mapping.DRAW_BUFFER8 = 0x882D;
mapping.DRAW_BUFFER9 = 0x882E;
mapping.DRAW_BUFFER10 = 0x882F;
mapping.DRAW_BUFFER11 = 0x8830;
mapping.DRAW_BUFFER12 = 0x8831;
mapping.DRAW_BUFFER13 = 0x8832;
mapping.DRAW_BUFFER14 = 0x8833;
mapping.DRAW_BUFFER15 = 0x8834;
mapping.MAX_FRAGMENT_UNIFORM_COMPONENTS = 0x8B49;
mapping.MAX_VERTEX_UNIFORM_COMPONENTS = 0x8B4A;
mapping.SAMPLER_3D = 0x8B5F;
mapping.SAMPLER_2D_SHADOW = 0x8B62;
mapping.FRAGMENT_SHADER_DERIVATIVE_HINT = 0x8B8B;
mapping.PIXEL_PACK_BUFFER = 0x88EB;
mapping.PIXEL_UNPACK_BUFFER = 0x88EC;
mapping.PIXEL_PACK_BUFFER_BINDING = 0x88ED;
mapping.PIXEL_UNPACK_BUFFER_BINDING = 0x88EF;
mapping.FLOAT_MAT2x3 = 0x8B65;
mapping.FLOAT_MAT2x4 = 0x8B66;
mapping.FLOAT_MAT3x2 = 0x8B67;
mapping.FLOAT_MAT3x4 = 0x8B68;
mapping.FLOAT_MAT4x2 = 0x8B69;
mapping.FLOAT_MAT4x3 = 0x8B6A;
mapping.SRGB = 0x8C40;
mapping.SRGB8 = 0x8C41;
mapping.SRGB8_ALPHA8 = 0x8C43;
mapping.COMPARE_REF_TO_TEXTURE = 0x884E;
mapping.RGBA32F = 0x8814;
mapping.RGB32F = 0x8815;
mapping.RGBA16F = 0x881A;
mapping.RGB16F = 0x881B;
mapping.VERTEX_ATTRIB_ARRAY_INTEGER = 0x88FD;
mapping.MAX_ARRAY_TEXTURE_LAYERS = 0x88FF;
mapping.MIN_PROGRAM_TEXEL_OFFSET = 0x8904;
mapping.MAX_PROGRAM_TEXEL_OFFSET = 0x8905;
mapping.MAX_VARYING_COMPONENTS = 0x8B4B;
mapping.TEXTURE_2D_ARRAY = 0x8C1A;
mapping.TEXTURE_BINDING_2D_ARRAY = 0x8C1D;
mapping.R11F_G11F_B10F = 0x8C3A;
mapping.UNSIGNED_INT_10F_11F_11F_REV = 0x8C3B;
mapping.RGB9_E5 = 0x8C3D;
mapping.UNSIGNED_INT_5_9_9_9_REV = 0x8C3E;
mapping.TRANSFORM_FEEDBACK_BUFFER_MODE = 0x8C7F;
mapping.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS = 0x8C80;
mapping.TRANSFORM_FEEDBACK_VARYINGS = 0x8C83;
mapping.TRANSFORM_FEEDBACK_BUFFER_START = 0x8C84;
mapping.TRANSFORM_FEEDBACK_BUFFER_SIZE = 0x8C85;
mapping.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN = 0x8C88;
mapping.RASTERIZER_DISCARD = 0x8C89;
mapping.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS = 0x8C8A;
mapping.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS = 0x8C8B;
mapping.INTERLEAVED_ATTRIBS = 0x8C8C;
mapping.SEPARATE_ATTRIBS = 0x8C8D;
mapping.TRANSFORM_FEEDBACK_BUFFER = 0x8C8E;
mapping.TRANSFORM_FEEDBACK_BUFFER_BINDING = 0x8C8F;
mapping.RGBA32UI = 0x8D70;
mapping.RGB32UI = 0x8D71;
mapping.RGBA16UI = 0x8D76;
mapping.RGB16UI = 0x8D77;
mapping.RGBA8UI = 0x8D7C;
mapping.RGB8UI = 0x8D7D;
mapping.RGBA32I = 0x8D82;
mapping.RGB32I = 0x8D83;
mapping.RGBA16I = 0x8D88;
mapping.RGB16I = 0x8D89;
mapping.RGBA8I = 0x8D8E;
mapping.RGB8I = 0x8D8F;
mapping.RED_INTEGER = 0x8D94;
mapping.RGB_INTEGER = 0x8D98;
mapping.RGBA_INTEGER = 0x8D99;
mapping.SAMPLER_2D_ARRAY = 0x8DC1;
mapping.SAMPLER_2D_ARRAY_SHADOW = 0x8DC4;
mapping.SAMPLER_CUBE_SHADOW = 0x8DC5;
mapping.UNSIGNED_INT_VEC2 = 0x8DC6;
mapping.UNSIGNED_INT_VEC3 = 0x8DC7;
mapping.UNSIGNED_INT_VEC4 = 0x8DC8;
mapping.INT_SAMPLER_2D = 0x8DCA;
mapping.INT_SAMPLER_3D = 0x8DCB;
mapping.INT_SAMPLER_CUBE = 0x8DCC;
mapping.INT_SAMPLER_2D_ARRAY = 0x8DCF;
mapping.UNSIGNED_INT_SAMPLER_2D = 0x8DD2;
mapping.UNSIGNED_INT_SAMPLER_3D = 0x8DD3;
mapping.UNSIGNED_INT_SAMPLER_CUBE = 0x8DD4;
mapping.UNSIGNED_INT_SAMPLER_2D_ARRAY = 0x8DD7;
mapping.DEPTH_COMPONENT32F = 0x8CAC;
mapping.DEPTH32F_STENCIL8 = 0x8CAD;
mapping.FLOAT_32_UNSIGNED_INT_24_8_REV = 0x8DAD;
mapping.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING = 0x8210;
mapping.FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE = 0x8211;
mapping.FRAMEBUFFER_ATTACHMENT_RED_SIZE = 0x8212;
mapping.FRAMEBUFFER_ATTACHMENT_GREEN_SIZE = 0x8213;
mapping.FRAMEBUFFER_ATTACHMENT_BLUE_SIZE = 0x8214;
mapping.FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE = 0x8215;
mapping.FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE = 0x8216;
mapping.FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE = 0x8217;
mapping.FRAMEBUFFER_DEFAULT = 0x8218;
mapping.DEPTH_STENCIL_ATTACHMENT = 0x821A;
mapping.DEPTH_STENCIL = 0x84F9;
mapping.UNSIGNED_INT_24_8 = 0x84FA;
mapping.DEPTH24_STENCIL8 = 0x88F0;

mapping.UNSIGNED_NORMALIZED = 0x8C17;
mapping.DRAW_FRAMEBUFFER_BINDING = 0x8CA6; /* Same as FRAMEBUFFER_BINDING */
mapping.READ_FRAMEBUFFER = 0x8CA8;
mapping.DRAW_FRAMEBUFFER = 0x8CA9;
mapping.READ_FRAMEBUFFER_BINDING = 0x8CAA;
mapping.RENDERBUFFER_SAMPLES = 0x8CAB;
mapping.FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER = 0x8CD4;
mapping.MAX_COLOR_ATTACHMENTS = 0x8CDF;
mapping.COLOR_ATTACHMENT1 = 0x8CE1;
mapping.COLOR_ATTACHMENT2 = 0x8CE2;
mapping.COLOR_ATTACHMENT3 = 0x8CE3;
mapping.COLOR_ATTACHMENT4 = 0x8CE4;
mapping.COLOR_ATTACHMENT5 = 0x8CE5;
mapping.COLOR_ATTACHMENT6 = 0x8CE6;
mapping.COLOR_ATTACHMENT7 = 0x8CE7;
mapping.COLOR_ATTACHMENT8 = 0x8CE8;
mapping.COLOR_ATTACHMENT9 = 0x8CE9;
mapping.COLOR_ATTACHMENT10 = 0x8CEA;
mapping.COLOR_ATTACHMENT11 = 0x8CEB;
mapping.COLOR_ATTACHMENT12 = 0x8CEC;
mapping.COLOR_ATTACHMENT13 = 0x8CED;
mapping.COLOR_ATTACHMENT14 = 0x8CEE;
mapping.COLOR_ATTACHMENT15 = 0x8CEF;
mapping.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE = 0x8D56;
mapping.MAX_SAMPLES = 0x8D57;
mapping.HALF_FLOAT = 0x140B;
mapping.RG = 0x8227;
mapping.RG_INTEGER = 0x8228;
mapping.R8 = 0x8229;
mapping.RG8 = 0x822B;
mapping.R16F = 0x822D;
mapping.R32F = 0x822E;
mapping.RG16F = 0x822F;
mapping.RG32F = 0x8230;
mapping.R8I = 0x8231;
mapping.R8UI = 0x8232;
mapping.R16I = 0x8233;
mapping.R16UI = 0x8234;
mapping.R32I = 0x8235;
mapping.R32UI = 0x8236;
mapping.RG8I = 0x8237;
mapping.RG8UI = 0x8238;
mapping.RG16I = 0x8239;
mapping.RG16UI = 0x823A;
mapping.RG32I = 0x823B;
mapping.RG32UI = 0x823C;
mapping.VERTEX_ARRAY_BINDING = 0x85B5;
mapping.R8_SNORM = 0x8F94;
mapping.RG8_SNORM = 0x8F95;
mapping.RGB8_SNORM = 0x8F96;
mapping.RGBA8_SNORM = 0x8F97;
mapping.SIGNED_NORMALIZED = 0x8F9C;
mapping.COPY_READ_BUFFER = 0x8F36;
mapping.COPY_WRITE_BUFFER = 0x8F37;
mapping.COPY_READ_BUFFER_BINDING = 0x8F36; /* Same as COPY_READ_BUFFER */
mapping.COPY_WRITE_BUFFER_BINDING = 0x8F37; /* Same as COPY_WRITE_BUFFER */
mapping.UNIFORM_BUFFER = 0x8A11;
mapping.UNIFORM_BUFFER_BINDING = 0x8A28;
mapping.UNIFORM_BUFFER_START = 0x8A29;
mapping.UNIFORM_BUFFER_SIZE = 0x8A2A;
mapping.MAX_VERTEX_UNIFORM_BLOCKS = 0x8A2B;
mapping.MAX_FRAGMENT_UNIFORM_BLOCKS = 0x8A2D;
mapping.MAX_COMBINED_UNIFORM_BLOCKS = 0x8A2E;
mapping.MAX_UNIFORM_BUFFER_BINDINGS = 0x8A2F;
mapping.MAX_UNIFORM_BLOCK_SIZE = 0x8A30;
mapping.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS = 0x8A31;
mapping.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS = 0x8A33;
mapping.UNIFORM_BUFFER_OFFSET_ALIGNMENT = 0x8A34;
mapping.ACTIVE_UNIFORM_BLOCKS = 0x8A36;
mapping.UNIFORM_TYPE = 0x8A37;
mapping.UNIFORM_SIZE = 0x8A38;
mapping.UNIFORM_BLOCK_INDEX = 0x8A3A;
mapping.UNIFORM_OFFSET = 0x8A3B;
mapping.UNIFORM_ARRAY_STRIDE = 0x8A3C;
mapping.UNIFORM_MATRIX_STRIDE = 0x8A3D;
mapping.UNIFORM_IS_ROW_MAJOR = 0x8A3E;
mapping.UNIFORM_BLOCK_BINDING = 0x8A3F;
mapping.UNIFORM_BLOCK_DATA_SIZE = 0x8A40;
mapping.UNIFORM_BLOCK_ACTIVE_UNIFORMS = 0x8A42;
mapping.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES = 0x8A43;
mapping.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER = 0x8A44;
mapping.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER = 0x8A46;
mapping.INVALID_INDEX = 0xFFFFFFFF;
mapping.MAX_VERTEX_OUTPUT_COMPONENTS = 0x9122;
mapping.MAX_FRAGMENT_INPUT_COMPONENTS = 0x9125;
mapping.MAX_SERVER_WAIT_TIMEOUT = 0x9111;
mapping.OBJECT_TYPE = 0x9112;
mapping.SYNC_CONDITION = 0x9113;
mapping.SYNC_STATUS = 0x9114;
mapping.SYNC_FLAGS = 0x9115;
mapping.SYNC_FENCE = 0x9116;
mapping.SYNC_GPU_COMMANDS_COMPLETE = 0x9117;
mapping.UNSIGNALED = 0x9118;
mapping.SIGNALED = 0x9119;
mapping.ALREADY_SIGNALED = 0x911A;
mapping.TIMEOUT_EXPIRED = 0x911B;
mapping.CONDITION_SATISFIED = 0x911C;
mapping.WAIT_FAILED = 0x911D;
mapping.SYNC_FLUSH_COMMANDS_BIT = 0x00000001;
mapping.VERTEX_ATTRIB_ARRAY_DIVISOR = 0x88FE;
mapping.ANY_SAMPLES_PASSED = 0x8C2F;
mapping.ANY_SAMPLES_PASSED_CONSERVATIVE = 0x8D6A;
mapping.SAMPLER_BINDING = 0x8919;
mapping.RGB10_A2UI = 0x906F;
mapping.INT_2_10_10_10_REV = 0x8D9F;
mapping.TRANSFORM_FEEDBACK = 0x8E22;
mapping.TRANSFORM_FEEDBACK_PAUSED = 0x8E23;
mapping.TRANSFORM_FEEDBACK_ACTIVE = 0x8E24;
mapping.TRANSFORM_FEEDBACK_BINDING = 0x8E25;
mapping.TEXTURE_IMMUTABLE_FORMAT = 0x912F;
mapping.MAX_ELEMENT_INDEX = 0x8D6B;
mapping.TEXTURE_IMMUTABLE_LEVELS = 0x82DF;
mapping.TIMEOUT_IGNORED = -1;
mapping.MAX_CLIENT_WAIT_TIMEOUT_WEBGL = 0x9247;

// ext ENUM for WEBGL_compressed_texture_s3tc
mapping.COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
mapping.COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
mapping.COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
mapping.COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;

// ext ENUM for WEBGL_compressed_texture_s3tc_srgb
mapping.COMPRESSED_SRGB_S3TC_DXT1_EXT = 0x8C4C;
mapping.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT = 0x8C4D;
mapping.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT = 0x8C4E;
mapping.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT = 0x8C4F;

// ext ENUM for EXT_texture_filter_anisotropic
mapping.TEXTURE_MAX_ANISOTROPY_EXT = 0x84FE;
mapping.MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FF;

let NS = mapping;

// 属性数据类型
mapping.AttributeType = [
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
mapping.AttributeChannels = [
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
mapping.BufferUsage = [
    NS.STATIC_DRAW,     // BU_STATIC
    NS.DYNAMIC_DRAW,    // BU_DYNAMIC
    NS.DYNAMIC_DRAW,    // BU_RENDERTARGET
    NS.DYNAMIC_DRAW,    // BU_DEPTHSTENCIL
    NS.DYNAMIC_DRAW     // BU_TEXTURE
];

// 纹理目标
mapping.TextureTarget = [
    0,                   // ST_NONE
    NS.TEXTURE_2D,       // ST_2D
    NS.TEXTURE_3D,       // ST_3D
    NS.TEXTURE_CUBE_MAP, // ST_CUBE
    NS.TEXTURE_2D_ARRAY  // ST_2D_ARRAY
];

// 纹理包装方式
mapping.SamplerWrapMode = [
    NS.REPEAT,          // SamplerState.REPEAT
    NS.MIRRORED_REPEAT, // SamplerState.MIRRORED_REPEAT
    NS.CLAMP_TO_EDGE    // SamplerState.CLAMP_EDGE
];

mapping.DepthCompare = [
    NS.NEVER,       // CM_NEVER
    NS.LESS,        // CM_LESS
    NS.EQUAL,       // CM_EQUAL
    NS.LEQUAL,      // CM_LEQUAL
    NS.GREATER,     // CM_GREATER
    NS.NOTEQUAL,    // CM_NOTEQUAL
    NS.GEQUAL,      // CM_GEQUAL
    NS.ALWAYS       // CM_ALWAYS
];

mapping.StencilCompare = [
    NS.NEVER,       // CM_NEVER
    NS.LESS,        // CM_LESS
    NS.EQUAL,       // CM_EQUAL
    NS.LEQUAL,      // CM_LEQUAL
    NS.GREATER,     // CM_GREATER
    NS.NOTEQUAL,    // CM_NOTEQUAL
    NS.GEQUAL,      // CM_GEQUAL
    NS.ALWAYS       // CM_ALWAYS
];

mapping.StencilOperation = [
    NS.KEEP,    // OT_KEEP
    NS.ZERO,    // OT_ZERO
    NS.REPLACE, // OT_REPLACE
    NS.INCR,    // OT_INCREMENT
    NS.DECR,    // OT_DECREMENT
    NS.INVERT   // OT_INVERT
];

// 透明通道混合
mapping.AlphaBlend = [
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

mapping.SamplerFilter = [
    NS.NEAREST,                 // SamplerState.NEAREST
    NS.LINEAR,                  // SamplerState.LINEAR
    NS.NEAREST_MIPMAP_NEAREST,  // SamplerState.NEAREST_MIPMAP_NEAREST
    NS.NEAREST_MIPMAP_LINEAR,   // SamplerState.NEAREST_MIPMAP_LINEAR
    NS.LINEAR_MIPMAP_NEAREST,   // SamplerState.LINEAR_MIPMAP_NEAREST
    NS.LINEAR_MIPMAP_LINEAR     // SamplerState.LINEAR_MIPMAP_LINEAR
];

mapping.TextureInternalFormat = [
    0,                                  // TF_NONE
    NS.RGB,                             // TF_R5G6B5
    NS.RGB5_A1,                         // TF_A1R5G5B5
    NS.RGBA4,                           // TF_A4R4G4B4
    NS.ALPHA,                           // TF_A8
    NS.LUMINANCE,                      // TF_L8
    NS.LUMINANCE_ALPHA,                 // TF_A8L8
    NS.RGB8,                            // TF_R8G8B8
    NS.RGBA,                            // TF_A8R8G8B8
    NS.RGBA,                            // TF_A8B8G8R8
    NS.LUMINANCE,                       // TF_L16
    NS.RG16I,                           // TF_G16R16
    NS.RGBA,                            // TF_A16B16G16R16
    NS.R16F,                            // TF_R16F
    NS.RG16F,                           // TF_G16R16F
    NS.RGBA16F_ARB,                     // TF_A16B16G16R16F
    NS.R32F,                            // TF_R32F
    NS.RG32F,                           // TF_G32R32F
    NS.RGBA32F_ARB,                     // TF_A32B32G32R32F
    NS.COMPRESSED_RGBA_S3TC_DXT1_EXT,   // TF_DXT1
    NS.COMPRESSED_RGBA_S3TC_DXT3_EXT,   // TF_DXT3
    NS.COMPRESSED_RGBA_S3TC_DXT5_EXT,   // TF_DXT5
    NS.DEPTH24_STENCIL8                 // TF_D24S8
];

mapping.TextureFormat = [
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
    NS.RG,                              // TF_G16R16
    NS.RGBA,                            // TF_A16B16G16R16
    NS.RED,                             // TF_R16F
    NS.RG,                              // TF_G16R16F
    NS.RGBA,                            // TF_A16B16G16R16F
    NS.RED,                             // TF_R32F
    NS.RG,                              // TF_G32R32F
    NS.RGBA,                            // TF_A32B32G32R32F
    NS.COMPRESSED_RGBA_S3TC_DXT1_EXT,   // TF_DXT1
    NS.COMPRESSED_RGBA_S3TC_DXT3_EXT,   // TF_DXT3
    NS.COMPRESSED_RGBA_S3TC_DXT5_EXT,   // TF_DXT5
    NS.UNSIGNED_INT_24_8_WEBGL          // TF_D24S8
];

mapping.TextureType = [
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

mapping.PrimitiveType = [
    0,                  // PT_NONE (not used)
    NS.POINTS,          // PT_POLYPOINT
    NS.LINES,           // PT_POLYSEGMENTS_DISJOINT
    NS.LINE_STRIP,      // PT_POLYSEGMENTS_CONTIGUOUS
    0,                  // PT_TRIANGLES (not used)
    NS.TRIANGLES,       // PT_TRIMESH
    NS.TRIANGLE_STRIP,  // PT_TRISTRIP
    NS.TRIANGLE_FAN     // PT_TRIFAN
];

export default mapping;
