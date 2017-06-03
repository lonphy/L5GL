import { Controller } from './Controller'
import { D3Object } from '../../core/D3Object'
import { Renderer } from '../renderer/Renderer'

export class SkinController extends Controller {

    /**
     * @param {number} numVertices
     * @param {number} numBones
     */
    constructor(numVertices = 0, numBones = 0) {
        super();
        this.numVertices = numVertices;
        this.numBones = numBones;
        this.__init();
    }

    __init() {
        let numBones = this.numBones,
            numVertices = this.numVertices;
        if (numVertices > 0) {
            /**
             * @let {Array<Node>}
             */
            this.bones = new Array(numBones);

            /**
             * @type {Array< Array<number> >}
             */
            this.weights = new Array(numVertices);
            /**
             * @type {Array< Array<Point> >}
             */
            this.offsets = new Array(numVertices);

            for (let i = 0; i < numVertices; ++i) {
                this.weights[i] = new Array(numBones);
                this.offsets[i] = new Array(numBones);
            }
        }
    }

    /**
     * 动画更新
     * @param {number} applicationTime 毫秒
     * @returns {boolean}
     */
    update(applicationTime) {
        if (!super.update(applicationTime)) {
            return false;
        }

        let visual = this.object;
        console.assert(
            this.numVertices === visual.vertexBuffer.numElements,
            'Controller must have the same number of vertices as the buffer'
        );

        let vba = VertexBufferAccessor.fromVisual(visual);

        // 在骨骼的世界坐标系计算蒙皮顶点, 所以visual的worldTransform必须是单位Transform
        visual.worldTransform = Transform.IDENTITY;
        visual.worldTransformIsCurrent = true;

        // 计算蒙皮顶点位置
        let nv = this.numVertices,
            nb = this.numBones,
            vertex, bone, weight, offset, worldOffset, position;
        for (vertex = 0; vertex < nv; ++vertex) {
            position = Point.ORIGIN;

            for (bone = 0; bone < nb; ++bone) {
                weight = this.weights[vertex][bone];
                if (weight !== 0) {
                    offset = this.offsets[vertex][bone];
                    worldOffset = this.bones[bone].worldTransform.mulPoint(offset);
                    position = position.add(worldOffset.scalar(weight));
                }
            }
            vba.setPosition(vertex, position);
        }

        visual.updateModelSpace(Visual.GU_NORMALS);
        Renderer.updateAll(visual.vertexBuffer());
        return true;
    }

    /**
     * 文件载入支持
     * @param {InStream} inStream
     */
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

    /**
     * 文件载入支持
     * @param {InStream} inStream
     */
    link(inStream) {
        super.link(inStream);
        inStream.resolveArrayLink(this.numBones, this.bones);
    }
}

D3Object.Register('L5.SkinController', SkinController.factory.bind(SkinController));