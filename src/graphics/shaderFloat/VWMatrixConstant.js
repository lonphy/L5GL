/**
 * 视图-世界坐标系矩
 */
import {ShaderFloat} from './ShaderFloat'
import {D3Object} from '../../core/D3Object'

export class VWMatrixConstant extends ShaderFloat{

    constructor() {
        super(4);
        this.allowUpdater = true;
    }

    update(visual, camera) {
    }
}