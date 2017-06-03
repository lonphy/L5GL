/**
 * 投影-相机-物体 最终矩阵 PVWMatrixConstant
 */
import {ShaderFloat} from './ShaderFloat'
import {D3Object} from '../../core/D3Object'

export class PVWMatrixConstant extends ShaderFloat {
    constructor() {
        super(4);
        this.allowUpdater = true;
    }

    update (visual, camera) {
        var projViewMatrix = camera.projectionViewMatrix;
        var worldMatrix = visual.worldTransform.toMatrix();
        var projViewWorldMatrix = projViewMatrix.mul(worldMatrix);
        this.copy(projViewWorldMatrix);
    }
}

D3Object.Register('L5.PVWMatrixConstant', PVWMatrixConstant.factory);
