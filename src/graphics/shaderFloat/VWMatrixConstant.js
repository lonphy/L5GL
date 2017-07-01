import { ShaderFloat } from './ShaderFloat';
import { D3Object } from '../../core/D3Object';

class VWMatrixConstant extends ShaderFloat {

    constructor() {
        super(4);
        this.allowUpdater = true;
    }

    update(visual, camera) {
        const view = camera.viewMatrix;
        const worldMatrix = visual.worldTransform.toMatrix();
        this.copy(view.mul(worldMatrix));
    }
}

export { VWMatrixConstant };