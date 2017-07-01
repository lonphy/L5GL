import { ShaderFloat } from './ShaderFloat';
import { D3Object } from '../../core/D3Object';

class LightAmbientConstant extends ShaderFloat {
    /**
     * @param {Light} light
     */
    constructor(light) {
        super(1);

        this.light = light;
        this.allowUpdater = true;
    }

    update(visual, camera) {
        this.copy(this.light.ambient);
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

D3Object.Register('LightAmbientConstant', LightAmbientConstant.factory);

export { LightAmbientConstant };