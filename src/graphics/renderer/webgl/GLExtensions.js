/**
 * WebGL 扩展处理
 * @author lonphy
 * @version 2.0
 */
import {default as webgl} from './GLMapping'

let extensions = [];

export class GLExtensions {
    static init(gl) {
        let exts = extensions;
        gl.getSupportedExtensions().forEach(function (name) {
            if (name.match(/^(?:WEBKIT_)|(?:MOZ_)/)) {
                return;
            }
            exts[name] = gl.getExtension(name);
        });

        if (exts.ANGLE_instanced_arrays) {
            webgl.VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE = 0x88FE;
        }

        if (exts.EXT_blend_minmax) {
            webgl.MIN_EXT = 0x8007;
            webgl.MAX_EXT = 0x8008;
        }

        if (exts.EXT_sRGB) {
            webgl.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING_EXT = 0x8210;
            webgl.SRGB_EXT = 0x8C40;
            webgl.SRGB_ALPHA_EXT = 0x8C42;
            webgl.SRGB8_ALPHA8_EXT = 0x8C43;
        }

        if (exts.EXT_texture_filter_anisotropic) {
            webgl.TEXTURE_MAX_ANISOTROPY_EXT = 0x84FE;
            webgl.MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FF;
        }

        if (exts.OES_standard_derivatives) {
            webgl.FRAGMENT_SHADER_DERIVATIVE_HINT_OES = 0x8B8B;
        }

        if (exts.OES_texture_half_float) {
            webgl.HALF_FLOAT_OES = 0x8D61;
        }

        if (exts.OES_vertex_array_object) {
            webgl.VERTEX_ARRAY_BINDING_OES = 0x85B5;
        }

        if (exts.WEBGL_compressed_texture_s3tc) {
            webgl.COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
            webgl.COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
            webgl.COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
            webgl.COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;
        }

        if (exts.WEBGL_depth_texture) {
            webgl.UNSIGNED_INT_24_8_WEBGL = 0x84FA;
        }

        if (exts.WEBGL_draw_buffers) {
            webgl.MAX_COLOR_ATTACHMENTS_WEBGL = 0x8CDF;
            webgl.COLOR_ATTACHMENT0_WEBGL = 0x8CE0;
            webgl.COLOR_ATTACHMENT1_WEBGL = 0x8CE1;
            webgl.COLOR_ATTACHMENT2_WEBGL = 0x8CE2;
            webgl.COLOR_ATTACHMENT3_WEBGL = 0x8CE3;
            webgl.COLOR_ATTACHMENT4_WEBGL = 0x8CE4;
            webgl.COLOR_ATTACHMENT5_WEBGL = 0x8CE5;
            webgl.COLOR_ATTACHMENT6_WEBGL = 0x8CE6;
            webgl.COLOR_ATTACHMENT7_WEBGL = 0x8CE7;
            webgl.COLOR_ATTACHMENT8_WEBGL = 0x8CE8;
            webgl.COLOR_ATTACHMENT9_WEBGL = 0x8CE9;
            webgl.COLOR_ATTACHMENT10_WEBGL = 0x8CEA;
            webgl.COLOR_ATTACHMENT11_WEBGL = 0x8CEB;
            webgl.COLOR_ATTACHMENT12_WEBGL = 0x8CEC;
            webgl.COLOR_ATTACHMENT13_WEBGL = 0x8CED;
            webgl.COLOR_ATTACHMENT14_WEBGL = 0x8CEF;
            webgl.COLOR_ATTACHMENT15_WEBGL = 0x8CF0;
            webgl.MAX_DRAW_BUFFERS_WEBGL = 0x8824;
            webgl.DRAW_BUFFER0_WEBGL = 0x8825;
            webgl.DRAW_BUFFER1_WEBGL = 0x8826;
            webgl.DRAW_BUFFER2_WEBGL = 0x8827;
            webgl.DRAW_BUFFER3_WEBGL = 0x8828;
            webgl.DRAW_BUFFER4_WEBGL = 0x8829;
            webgl.DRAW_BUFFER5_WEBGL = 0x882A;
            webgl.DRAW_BUFFER6_WEBGL = 0x882B;
            webgl.DRAW_BUFFER7_WEBGL = 0x882C;
            webgl.DRAW_BUFFER8_WEBGL = 0x882D;
            webgl.DRAW_BUFFER9_WEBGL = 0x882E;
            webgl.DRAW_BUFFER10_WEBGL = 0x882F;
            webgl.DRAW_BUFFER11_WEBGL = 0x8830;
            webgl.DRAW_BUFFER12_WEBGL = 0x8831;
            webgl.DRAW_BUFFER13_WEBGL = 0x8832;
            webgl.DRAW_BUFFER14_WEBGL = 0x8833;
            webgl.DRAW_BUFFER15_WEBGL = 0x8834;
        }
    }
}
