/**
 * 灯光 - 光源位置
 */
import {ShaderFloat} from './ShaderFloat'
import {D3Object} from '../../core/D3Object'

export class LightModelPositionConstant extends ShaderFloat {

    /**
     * @param light {Light} 灯光
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

    /**
     * 更新材质环境光系数
     * @param visual {Visual}
     * @param camera {Camera}
     */
    update(visual, camera) {
        var worldInvMatrix = visual.worldTransform.inverse();
        var modelPosition = worldInvMatrix.mulPoint(this.light.position);
        this.copy(modelPosition);
    }

    load(inStream) {
        super.load(inStream);
        this.light = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);
        this.light = inStream.resolveLink(this.light);
    }

    save(outStream) {
        super.save(outStream);
        outStream.writePointer(this.light);
    }
};

D3Object.Register('L5.LightModelPositionConstant', LightModelPositionConstant.factory);
