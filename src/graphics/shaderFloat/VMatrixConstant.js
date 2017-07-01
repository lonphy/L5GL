import { ShaderFloat } from './ShaderFloat';
import { D3Object } from '../../core/D3Object';

class VMatrixConstant extends ShaderFloat {

    constructor() {
        super(4);
        this.allowUpdater = true;
    }

    update(visual, camera) {
        const viewMatrix = camera.viewMatrix;
        this.copy(viewMatrix);
    }
}

export { VMatrixConstant };
