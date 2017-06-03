/**
 * 灯光 - 漫反射分量
 */
import {ShaderFloat} from './ShaderFloat'
import {D3Object} from '../../core/D3Object'

export class LightDiffuseConstant extends ShaderFloat {

    /**
     * @param light {L5.Light}
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

    /**
     * 更新漫反射分量
     * @param visual {L5.Visual}
     * @param camera {L5.Camera}
     */
    update(visual, camera) {
        this.copy(this.light.diffuse);
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

D3Object.Register('L5.LightDiffuseConstant', LightDiffuseConstant.factory);
