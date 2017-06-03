/**
 * 相机位置
 */
import {ShaderFloat} from './ShaderFloat'
import {D3Object} from '../../core/D3Object'

export class CameraModelPositionConstant extends ShaderFloat{
    constructor() {
        super(1);
        this.allowUpdater = true;
    }

    /**
     * 更新
     * @param visual {L5.Visual}
     * @param camera {L5.Camera}
     */
    update(visual, camera) {
        let worldPosition = camera.position;
        let worldInvMatrix = visual.worldTransform.inverse();
        let modelPosition = worldInvMatrix.mulPoint(worldPosition);
        this.copy(modelPosition);
    }
};

D3Object.Register('L5.CameraModelPositionConstant', CameraModelPositionConstant.factory);
