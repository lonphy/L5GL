L5.GLExtensions = {_extensions: {}};

L5.GLExtensions.init = function (gl) {
    var exts = this._extensions;
    gl.getSupportedExtensions ().forEach (function (name) {
        if (name.match (/^(?:WEBKIT_)|(?:MOZ_)/)) {
            return;
        }
        exts[ name ] = gl.getExtension (name);
    });

    if (exts.ANGLE_instanced_arrays) {
        L5.Webgl.VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE = 0x88FE;
    }

    if (exts.EXT_blend_minmax) {
        L5.Webgl.MIN_EXT = 0x8007;
        L5.Webgl.MAX_EXT = 0x8008;
    }

    if (exts.EXT_sRGB) {
        L5.Webgl.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING_EXT = 0x8210;
        L5.Webgl.SRGB_EXT                                  = 0x8C40;
        L5.Webgl.SRGB_ALPHA_EXT                            = 0x8C42;
        L5.Webgl.SRGB8_ALPHA8_EXT                          = 0x8C43;
    }

    if (exts.EXT_texture_filter_anisotropic) {
        L5.Webgl.TEXTURE_MAX_ANISOTROPY_EXT     = 0x84FE;
        L5.Webgl.MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FF;
    }

    if (exts.OES_standard_derivatives) {
        L5.Webgl.FRAGMENT_SHADER_DERIVATIVE_HINT_OES = 0x8B8B;
    }

    if (exts.OES_texture_half_float) {
        L5.Webgl.HALF_FLOAT_OES = 0x8D61;
    }

    if (exts.OES_vertex_array_object) {
        L5.Webgl.VERTEX_ARRAY_BINDING_OES = 0x85B5;
    }

    if (exts.WEBGL_compressed_texture_s3tc) {
        L5.Webgl.COMPRESSED_RGB_S3TC_DXT1_EXT  = 0x83F0;
        L5.Webgl.COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
        L5.Webgl.COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
        L5.Webgl.COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;
    }

    if (exts.WEBGL_depth_texture) {
        L5.Webgl.UNSIGNED_INT_24_8_WEBGL = 0x84FA;
    }

    if (exts.WEBGL_draw_buffers) {
        L5.Webgl.MAX_COLOR_ATTACHMENTS_WEBGL = 0x8CDF;
        L5.Webgl.COLOR_ATTACHMENT0_WEBGL     = 0x8CE0;
        L5.Webgl.COLOR_ATTACHMENT1_WEBGL     = 0x8CE1;
        L5.Webgl.COLOR_ATTACHMENT2_WEBGL     = 0x8CE2;
        L5.Webgl.COLOR_ATTACHMENT3_WEBGL     = 0x8CE3;
        L5.Webgl.COLOR_ATTACHMENT4_WEBGL     = 0x8CE4;
        L5.Webgl.COLOR_ATTACHMENT5_WEBGL     = 0x8CE5;
        L5.Webgl.COLOR_ATTACHMENT6_WEBGL     = 0x8CE6;
        L5.Webgl.COLOR_ATTACHMENT7_WEBGL     = 0x8CE7;
        L5.Webgl.COLOR_ATTACHMENT8_WEBGL     = 0x8CE8;
        L5.Webgl.COLOR_ATTACHMENT9_WEBGL     = 0x8CE9;
        L5.Webgl.COLOR_ATTACHMENT10_WEBGL    = 0x8CEA;
        L5.Webgl.COLOR_ATTACHMENT11_WEBGL    = 0x8CEB;
        L5.Webgl.COLOR_ATTACHMENT12_WEBGL    = 0x8CEC;
        L5.Webgl.COLOR_ATTACHMENT13_WEBGL    = 0x8CED;
        L5.Webgl.COLOR_ATTACHMENT14_WEBGL    = 0x8CEF;
        L5.Webgl.COLOR_ATTACHMENT15_WEBGL    = 0x8CF0;
        L5.Webgl.MAX_DRAW_BUFFERS_WEBGL      = 0x8824;
        L5.Webgl.DRAW_BUFFER0_WEBGL          = 0x8825;
        L5.Webgl.DRAW_BUFFER1_WEBGL          = 0x8826;
        L5.Webgl.DRAW_BUFFER2_WEBGL          = 0x8827;
        L5.Webgl.DRAW_BUFFER3_WEBGL          = 0x8828;
        L5.Webgl.DRAW_BUFFER4_WEBGL          = 0x8829;
        L5.Webgl.DRAW_BUFFER5_WEBGL          = 0x882A;
        L5.Webgl.DRAW_BUFFER6_WEBGL          = 0x882B;
        L5.Webgl.DRAW_BUFFER7_WEBGL          = 0x882C;
        L5.Webgl.DRAW_BUFFER8_WEBGL          = 0x882D;
        L5.Webgl.DRAW_BUFFER9_WEBGL          = 0x882E;
        L5.Webgl.DRAW_BUFFER10_WEBGL         = 0x882F;
        L5.Webgl.DRAW_BUFFER11_WEBGL         = 0x8830;
        L5.Webgl.DRAW_BUFFER12_WEBGL         = 0x8831;
        L5.Webgl.DRAW_BUFFER13_WEBGL         = 0x8832;
        L5.Webgl.DRAW_BUFFER14_WEBGL         = 0x8833;
        L5.Webgl.DRAW_BUFFER15_WEBGL         = 0x8834;
    }
};