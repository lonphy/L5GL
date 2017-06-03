/**
 * 灯光 - 入射方向向量
 *
 */
import {ShaderFloat} from './ShaderFloat'
import {D3Object} from '../../core/D3Object'

export class LightModelDirectionConstant extends ShaderFloat {

    /**
     * @param light {Light}
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
        var modelDir = worldInvMatrix.mulPoint(this.light.direction);
        this.copy(modelDir);
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

D3Object.Register('L5.LightModelDirectionConstant', LightModelDirectionConstant.factory);
