import { ShaderFloat } from './ShaderFloat';
import { D3Object } from '../../core/D3Object';

class PVMatrixConstant extends ShaderFloat {

    constructor() {
        super(4);
        this.allowUpdater = true;
    }

    update(visual, camera) {
        const projViewMatrix = camera.projectionViewMatrix;
        this.copy(projViewMatrix);
    }
}

export { PVMatrixConstant };