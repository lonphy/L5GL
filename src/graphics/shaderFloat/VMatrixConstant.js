/**
 * 视图坐标系矩阵
 */
import {ShaderFloat} from './ShaderFloat'
import {D3Object} from '../../core/D3Object'

export class VMatrixConstant extends ShaderFloat{

    constructor() {
        super(4);
        this.allowUpdater = true;
    }

    update(visual, camera) {
    }
}