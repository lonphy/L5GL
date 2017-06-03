import { TriMesh } from './TriMesh'
import { Visual } from './Visual'
import { VertexBufferAccessor, IndexBuffer } from '../resources/namespace'
import { Renderer } from '../renderer/Renderer'
import { Point } from '../../math/index'

/**
 * The VertexFormat object must have 3-tuple positions. 
 * It must also have 2-tuple texture coordinates in channel zero;
 * these are set to the standard ones (unit square per quadrilateral).
 * The number of elements of vbuffer must be a multiple of 4.
 * The number of elements of particles is 1/4 of the number of elements of vbuffer.
 * The index buffer is automatically generated.
 * The 'positionSizes' contain position in the first three components and size in the fourth component.
 */
export class Particles extends TriMesh {

    /**
     * @param {VertexFormat} vformat
     * @param {VertexBuffer} vbuffer
     * @param {number} indexSize 
     * @param {Float32Array} positionSizes
     * @param {number} sizeAdjust 
     */
    constructor(vformat, vbuffer, indexSize, positionSizes, sizeAdjust) {
        super(vformat, vbuffer, null);
        console.assert(indexSize === 2 || indexSize === 4, 'Invalid index size.');

        this.positionSizes = positionSizes;
        let numVertices = this.vertexBuffer.numElements;
        console.assert((numVertices % 4) == 0, 'Number of vertices must be a multiple of 4');

        this.numParticles = numVertices / 4;
        this._numActive = this.numParticles;

        this.sizeAdjust = sizeAdjust;

        // Get access to the texture coordinates.
        let vba = new VertexBufferAccessor(vformat, this.vertexBuffer);
        console.assert(vba.hasTCoord(0), 'Texture coordinates must exist and use channel 0');

        // Set the texture coordinates to the standard ones.
        let i, j;
        for (i = 0, j = 0; i < this.numParticles; ++i) {
            vba.setTCoord(0, j++, [0, 0]);
            vba.setTCoord(0, j++, [1, 0]);
            vba.setTCoord(0, j++, [1, 1]);
            vba.setTCoord(0, j++, [0, 1]);
        }

        // Generate the indices for the quadrilaterals.
        this.indexBuffer = new IndexBuffer(6 * this.numParticles, indexSize);

        let iFI = 0, iFIp1 = 0, iFIp2 = 0, iFIp3 = 0;

        if (indexSize === 2) {
            let indices = new Uint16Array(this.indexBuffer.getData().buffer);
            for (i = 0; i < this.numParticles; ++i) {
                iFI = 4 * i;
                iFIp1 = iFI + 1;
                iFIp2 = iFI + 2;
                iFIp3 = iFI + 3;
                indices[i * 6] = iFI;
                indices[i * 6 + 1] = iFIp1;
                indices[i * 6 + 2] = iFIp2;
                indices[i * 6 + 3] = iFI;
                indices[i * 6 + 4] = iFIp2;
                indices[i * 6 + 5] = iFIp3;
            }
        } else {
            // indexSize == 4
            let indices = new Uint32Array(this.indexBuffer.getData().buffer);
            for (i = 0; i < this.numParticles; ++i) {
                iFI = 4 * i;
                iFIp1 = iFI + 1;
                iFIp2 = iFI + 2;
                iFIp3 = iFI + 3;
                indices[i * 6] = iFI;
                indices[i * 6 + 1] = iFIp1;
                indices[i * 6 + 2] = iFIp2;
                indices[i * 6 + 3] = iFI;
                indices[i * 6 + 4] = iFIp2;
                indices[i * 6 + 5] = iFIp3;
            }
        }

        // Compute a bounding sphere based only on the particle locations.
        this.modelBound.computeFromData(this.numParticles, 16/* sizeof(float*4) */, positionSizes.buffer);
    }

    set sizeAdjust(sizeAdjust) {
        if (sizeAdjust > 0) {
            this._sizeAdjust = sizeAdjust;
        } else {
            console.assert(false, 'Invalid size-adjust parameter');
            this._sizeAdjust = 1;
        }
    }
    get sizeAdjust() { return this._sizeAdjust; }

    set numActive(numActive) {
        if (0 <= numActive && numActive <= this.numParticles) {
            this._numActive = numActive;
        }
        else {
            this._numActive = this.numParticles;
        }

        this.indexBuffer.numElements = 6 * this._numActive;
        this.vertexBuffer.numElements = 4 * this._numActive;
    }
    get numActive() { return this._numActive; }


    /**
     * The particles are billboards that always face the camera.
     * @param {Camera} camera
     */
    generateParticles(camera) {
        // Get access to the positions.
        let vba = new VertexBufferAccessor(this.format, this.vertexBuffer);
        console.assert(vba.hasPosition(), 'Positions must exist');

        // Get camera axis directions in model space of particles.
        let UpR = this.worldTransform.inverse().mulPoint(camera.up.add(camera.right));
        let UmR = this.worldTransform.inverse().mulPoint(camera.up.sub(camera.right));
        let posSize = this.positionSizes;

        let offset, position, trueSize, scaledUpR, scaledUmR;
        // Generate quadrilaterals as pairs of triangles.
        for (let i = 0, j = 0; i < this._numActive; ++i) {
            offset = i * 4;
            position = new Point(posSize[offset], posSize[offset + 1], posSize[offset + 2]);
            trueSize = this._sizeAdjust * posSize[offset + 3];
            scaledUpR = UpR.scalar(trueSize);
            scaledUmR = UmR.scalar(trueSize);
            vba.setPosition(j++, position.sub(scaledUpR));
            vba.setPosition(j++, position.sub(scaledUmR));
            vba.setPosition(j++, position.add(scaledUpR));
            vba.setPosition(j++, position.add(scaledUmR));
        }
        this.updateModelSpace(Visual.GU_NORMALS);
        Renderer.updateAll(this.vertexBuffer);
    }

    /**
     * Support for hierarchical culling.
     * @param {Culler} culler  
     * @param {boolean} noCull
     */
    getVisibleSet(culler, noCull) {
        this.generateParticles(culler.camera);
        super.getVisibleSet(culler, noCull);
    }
}