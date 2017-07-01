import { Controller } from './Controller';
import { D3Object } from '../../core/D3Object';
import { Renderer } from '../renderer/Renderer';
import { VertexBufferAccessor } from '../resources/namespace';
import { Transform } from '../dataTypes/Transform';
import { Point } from '../../math/index';
import { Visual } from '../sceneTree/namespace';

class SkinController extends Controller {

    /**
     * The numbers of vertices and bones are fixed for the lifetime of the object.
     * @param {number} numVertices - numbers of vertices
     * @param {number} numBones - numbers of bones
     */
    constructor(numVertices = 0, numBones = 0) {
        super();
        this.numVertices = numVertices;
        this.numBones = numBones;
        this.__init();
    }

    /**
     * @private
     */
    __init() {
        const { numBones, numVertices } = this;
        if (numVertices > 0) {
            this.bones = new Array(numBones);         // bones[numBones]                -> Node
            this.weights = new Array(numVertices);    // weights[numVertices][numBones] -> number
            this.offsets = new Array(numVertices);    // offsets[numVertices][numBones] -> Point

            for(let i=0;i<numVertices;++i) {
                this.weights[i] = new Array(numBones);
                this.offsets[i] = new Array(numBones);
            }
        }
    }

    /**
     * @param {number} applicationTime - milliseconds
     * @returns {boolean}
     */
    update(applicationTime) {
        if (!super.update(applicationTime)) {
            return false;
        }

        let visual = this.object;
        console.assert(
            this.numVertices === visual.vertexBuffer.numElements,
            'SkinController must have the same number of vertices as the vertex buffer.'
        );

        let vba = VertexBufferAccessor.fromVisual(visual);

        // The skin vertices are calculated in the bone world coordinate system,
        // so the visual's world transform must be the identity.
        visual.worldTransform = Transform.IDENTITY;
        visual.worldTransformIsCurrent = true;

        // Compute the skin vertex locations.
        const { numBones, numVertices } = this;
        let i, j, weight, offset, worldOffset, position;
        for (i = 0; i < numVertices; ++i) {
            position = Point.ORIGIN;
            for (j = 0; j < numBones; ++j) {
                weight = this.weights[i][j];
                if (weight !== 0) {
                    offset = this.offsets[i][j];
                    worldOffset = this.bones[j].worldTransform.mulPoint(offset);  // bones[j].worldTransform * offset
                    position.copy(position.add(worldOffset.scalar(weight)));      // position += worldOffset * weight
                }
            }
            vba.setPosition(i, position);
        }

        visual.updateModelSpace(Visual.GU_NORMALS);
        Renderer.updateAll(visual.vertexBuffer);
        return true;
    }

    load(inStream) {
        super.load(inStream);
        let numVertices = inStream.readUint32();
        let numBones = inStream.readUint32();

        this.numVertices = numVertices;
        this.numBones = numBones;
        this.__init();
        let total = this.numVertices * this.numBones, i;
        let t = inStream.readArray(total);
        let t1 = inStream.readSizedPointArray(total);
        for (i = 0; i < numVertices; ++i) {
            this.weights[i] = t.slice(i * numBones, (i + 1) * numBones);
            this.offsets[i] = t1.slice(i * numBones, (i + 1) * numBones);
        }
        this.bones = inStream.readSizedPointerArray(numBones);
    }

    link(inStream) {
        super.link(inStream);
        inStream.resolveArrayLink(this.numBones, this.bones);
    }
}

D3Object.Register('SkinController', SkinController.factory.bind(SkinController));

export { SkinController };