/**
 * 灯光 - 高光分量
 */
import {ShaderFloat} from './ShaderFloat'
import {D3Object} from '../../core/D3Object'

export class LightSpecularConstant extends ShaderFloat {

    /**
     * @param light {Light}
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

    /**
     * 更新高光分量
     * @param visual {Visual}
     * @param camera {Camera}
     */
    update(visual, camera) {
        this.copy(this.light.specular);
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

D3Object.Register('L5.LightSpecularConstant', LightSpecularConstant.factory);
