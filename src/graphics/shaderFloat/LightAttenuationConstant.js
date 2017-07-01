import { ShaderFloat } from './ShaderFloat';
import { D3Object } from '../../core/D3Object';

class LightAttenuationConstant extends ShaderFloat {

    /**
     * @param {Light} light
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

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
}

D3Object.Register('LightAttenuationConstant', LightAttenuationConstant.factory);

export { LightAttenuationConstant };