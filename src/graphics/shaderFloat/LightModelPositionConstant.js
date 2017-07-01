import { ShaderFloat } from './ShaderFloat';
import { D3Object } from '../../core/D3Object';

class LightModelPositionConstant extends ShaderFloat {

    /**
     * @param {Light} light
     */
    constructor(light) {
        super(1);
        this.allowUpdater = true;
        this.light = light;
    }

    update(visual, camera) {
        const worldInvMatrix = visual.worldTransform.inverse();
        this.copy(worldInvMatrix.mulPoint(this.light.position));
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

D3Object.Register('LightModelPositionConstant', LightModelPositionConstant.factory);

export { LightModelPositionConstant };
