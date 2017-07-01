import { ShaderFloat } from './ShaderFloat';
import { D3Object } from '../../core/D3Object';

class LightDiffuseConstant extends ShaderFloat {

    /**
     * @param {Light} light
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

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
}

D3Object.Register('LightDiffuseConstant', LightDiffuseConstant.factory);

export { LightDiffuseConstant };
