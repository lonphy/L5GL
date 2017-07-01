import { default as webgl } from './GLMapping';

class GLTexture3D {
	constructor(gl, texture) { }
	update(gl, textureUnit, data) {
	}
	enable(gl, textureUnit) {
		gl.activeTexture(gl.TEXTURE0 + textureUnit);
		gl.bindTexture(gl.TEXTURE_3D, this.texture);
	}

	disable(gl, textureUnit) {
		// gl.activeTexture(gl.TEXTURE0 + textureUnit);
		// gl.bindTexture(gl.TEXTURE_2D, null);
	}
}

export { GLTexture3D };