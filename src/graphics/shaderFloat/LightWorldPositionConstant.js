/**
 * 灯光 - 世界坐标
 */
import {ShaderFloat} from './ShaderFloat'
import {D3Object} from '../../core/D3Object'

export class LightWorldPositionConstant extends ShaderFloat {

    /**
     * @param light {Light}
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

    /**
     * 更新光源世界坐标系的方向
     * @param visual {Visual}
     * @param camera {Camera}
     */
    update (visual, camera) {
        this.copy(this.light.position);
    }

    load(inStream) {
        super.load(inStream);
        this.light = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);
        this.light = inStream.resolveLink(this.light);
    }

    save(outStream) {
        super.save(outStream);
        outStream.writePointer(this.light);
    }
};

D3Object.Register('L5.LightWorldPositionConstant', LightWorldPositionConstant.factory);
