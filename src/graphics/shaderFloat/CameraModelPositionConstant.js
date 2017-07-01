import { ShaderFloat } from './ShaderFloat';
import { D3Object } from '../../core/D3Object';

class CameraModelPositionConstant extends ShaderFloat {
    constructor() {
        super(1);
        this.allowUpdater = true;
    }

    update(visual, camera) {
        const worldPosition = camera.position;
        const worldInvMatrix = visual.worldTransform.inverse();
        this.copy(worldInvMatrix.mulPoint(worldPosition));
    }
}

D3Object.Register('CameraModelPositionConstant', CameraModelPositionConstant.factory);

export { CameraModelPositionConstant };
