import { default as webgl } from './GLMapping';

class GLExtensions {
    static init(gl) {
        gl.getSupportedExtensions().forEach(function (name) {
            if (name.match(/^(?:WEBKIT_)|(?:MOZ_)/)) {
                return;
            }
            gl.getExtension(name);
        });
    }
}

export { GLExtensions };