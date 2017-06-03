/**
 * 灯光 - 聚光灯参数
 */
import {ShaderFloat} from './ShaderFloat'
import {D3Object} from '../../core/D3Object'

export class LightSpotConstant extends ShaderFloat {

    /**
     * @param light {Light}
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

    /**
     * 更新材质环境光系数
     * @param visual {Visual}
     * @param camera {Camera}
     */
    update (visual, camera) {
        this.data[0] = this.light.angle;
        this.data[1] = this.light.cosAngle;
        this.data[2] = this.light.sinAngle;
        this.data[3] = this.light.exponent;
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

D3Object.Register('L5.LightSpotConstant', LightSpotConstant.factory);
