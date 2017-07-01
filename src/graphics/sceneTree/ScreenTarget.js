import { Camera } from './Camera';
import { TriMesh } from './TriMesh';
import { Point, Vector } from '../../math/index';
import { VertexFormat, VertexBuffer, VertexBufferAccessor, IndexBuffer } from '../resources/namespace';

class ScreenTarget {

	/** 
	 * Create a screen-space camera for use with render targets.
	 * @return {Camera}
	 */
	static createCamera() {
		// The screen camera maps (x,y,z) in [0,1]^3 to (x',y,'z') in
		// [-1,1]^2 x [0,1].
		let camera = new Camera(false);
		camera.setFrustum(0, 1, 0, 1, 0, 1);
		camera.setFrame(Point.ORIGIN, Vector.UNIT_Z, Vector.UNIT_Y);
		return camera;
	}

	/**
	 * Create a screen-space rectangle for a render target of the specified
	 * dimensions.  The vertex format must have 3-tuple positions and 2-tuple
	 * texture coordinates in unit 0.  These attributes are filled in by the
	 * function.  Any other attributes are not processed.  The rectangle
	 * [xmin,xmax]x[ymin,ymax] must be contained in [0,1]x[0,1].
	 * @param {VertexFromat} vformat
	 * @param {number} width
	 * @param {number} height
	 * @param {number} xmin
	 * @param {number} xmax
	 * @param {number} ymin
	 * @param {number} ymax
	 * @param {number} zValue
	 */
	static createRectangle(vformat, width, height, xmin, xmax, ymin, ymax, zValue) {
		if (ScreenTarget._validFormat(vformat) && ScreenTarget._validSizes(width, height)) {
			let vbuffer = new VertexBuffer(4, vformat.stride);
			let vba = new VertexBufferAccessor(vformat, vbuffer);
			vba.setPosition(0, [xmin, ymin, zValue]);
			vba.setPosition(1, [xmax, ymin, zValue]);
			vba.setPosition(2, [xmax, ymax, zValue]);
			vba.setPosition(3, [xmin, ymax, zValue]);

			vba.setTCoord(0, 0, [0, 0]);
			vba.setTCoord(0, 1, [1, 0]);
			vba.setTCoord(0, 2, [1, 1]);
			vba.setTCoord(0, 3, [0, 1]);

			// Create the index buffer for the square.
			let ibuffer = new IndexBuffer(6, Uint32Array.BYTES_PER_ELEMENT);
			let indices = new Uint32Array(ibuffer.getData().buffer);
			indices[0] = 0; indices[1] = 1; indices[2] = 2;
			indices[3] = 0; indices[4] = 2; indices[5] = 3;

			return new TriMesh(vformat, vbuffer, ibuffer);
		}

		return null;
	}

	/**
	 * Copy the screen-space rectangle positions to the input array.
	 * @param {number} width
	 * @param {number} height
	 * @param {number} xmin
	 * @param {number} xmax
	 * @param {number} ymin
	 * @param {number} ymax
	 * @param {number} zValue
	 * @param {Array<Point>} positions
	 */
	static createPositions(width, height, xmin, xmax, ymin, ymax, zValue, positions) {
		if (ScreenTarget._validSizes(width, height)) {
			xmin = 0;
			xmax = 1;
			ymin = 0;
			ymax = 1;
			positions[0].assign(xmin, ymin, zValue);
			positions[1].assign(xmax, ymin, zValue);
			positions[2].assign(xmax, ymax, zValue);
			positions[3].assign(xmin, ymax, zValue);
			return true;
		}

		return false;
	}

    /**
	 * Copy the screen-space rectangle texture coordinates to the input array.
	 */
	static createTCoords(tcoords) {
		tcoords[0] = [0, 0];
		tcoords[1] = [1, 0];
		tcoords[2] = [1, 1];
		tcoords[3] = [0, 1];
	}

	/**
	 * @param {number} width 
	 * @param {number} height
	 */
	static _validSizes(width, height) {
		if (width > 0 && height > 0) {
			return true;
		}

		console.assert(false, 'Invalid dimensions');
		return false;
	}

	/**
	 * @param {VertexFormat} vformat 
	 */
	static _validFormat(vformat) {
		let index = vformat.getIndex(VertexFormat.AU_POSITION, 0);
		if (index < 0) {
			console.assert(false, 'Format must have positions.');
			return false;
		}

		if (vformat.getAttributeType(index) != VertexFormat.AT_FLOAT3) {
			console.assert(false, 'Positions must be 3-tuples.');
			return false;
		}

		index = vformat.getIndex(VertexFormat.AU_TEXCOORD, 0);
		if (index < 0) {
			console.assert(false, 'Format must have texture coordinates in unit 0.');
			return false;
		}

		if (vformat.getAttributeType(index) !== VertexFormat.AT_FLOAT2) {
			console.assert(false, 'Texture coordinates in unit 0 must be 2-tuples.');
			return false;
		}

		return true;
	}
}

export { ScreenTarget };