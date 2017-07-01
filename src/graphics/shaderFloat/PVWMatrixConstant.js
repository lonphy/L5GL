import { ShaderFloat } from './ShaderFloat';
import { D3Object } from '../../core/D3Object';

class PVWMatrixConstant extends ShaderFloat {
    constructor() {
        super(4);
        this.allowUpdater = true;
    }

    update(visual, camera) {
        const projViewMatrix = camera.projectionViewMatrix;
        const worldMatrix = visual.worldTransform.toMatrix();
        this.copy(projViewMatrix.mul(worldMatrix));
    }
}

D3Object.Register('PVWMatrixConstant', PVWMatrixConstant.factory);

export { PVWMatrixConstant };
