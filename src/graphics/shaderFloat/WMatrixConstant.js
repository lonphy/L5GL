/**
 * 世界坐标系矩
 */
import { ShaderFloat } from './ShaderFloat'
import { D3Object } from '../../core/D3Object'

export class WMatrixConstant extends ShaderFloat {

    constructor() {
        super(4);
        this.allowUpdater = true;
    }

    update(visual, camera) {
        this.copy(visual.worldTransform.toMatrix());
    }
}
D3Object.Register('L5.WMatrixContant', WMatrixConstant.factory.bind(WMatrixConstant));