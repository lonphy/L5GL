/**
 * 灯光 - 衰减系数
 *
 * @author lonphy
 * @version 2.0
 *
 * @type {L5.LightAttenuationConstant}
 * @extends {L5.ShaderFloat}
 */
import {ShaderFloat} from './ShaderFloat'
import {D3Object} from '../../core/D3Object'

export class LightAttenuationConstant extends ShaderFloat {

    /**
     * @param light {L5.Light} 灯光
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

    /**
     * 更新衰减系数
     * @param visual {L5.Visual}
     * @param camera {L5.Camera}
     */
    update(visual, camera) {
        this.data[0] = this.light.constant;
        this.data[1] = this.light.linear;
        this.data[2] = this.light.quadratic;
        this.data[3] = this.light.intensity;
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

D3Object.Register('L5.LightAttenuationConstant', LightAttenuationConstant.factory);
