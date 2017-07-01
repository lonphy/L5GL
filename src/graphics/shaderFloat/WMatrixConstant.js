import { ShaderFloat } from './ShaderFloat';
import { D3Object } from '../../core/D3Object';

class WMatrixConstant extends ShaderFloat {

    constructor() {
        super(4);
        this.allowUpdater = true;
    }

    update(visual, camera) {
        const worldMatrix = visual.worldTransform.toMatrix();
        this.copy(worldMatrix);
    }
}

D3Object.Register('WMatrixContant', WMatrixConstant.factory.bind(WMatrixConstant));

export { WMatrixConstant };