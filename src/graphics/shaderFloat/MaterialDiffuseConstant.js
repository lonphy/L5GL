import { ShaderFloat } from './ShaderFloat';
import { D3Object } from '../../core/D3Object';

class MaterialDiffuseConstant extends ShaderFloat {

    /**
     * @param material {Material} 材质
     */
    constructor(material) {
        super(1);
        this.allowUpdater = true;
        this.material = material;
    }

    update(visual, camera) {
        this.copy(this.material.diffuse);
    }

    load(inStream) {
        super.load(inStream);
        this.material = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);
        this.material = inStream.resolveLink(this.material);
    }

    save(outStream) {
        super.save(outStream);
        outStream.writePointer(this.material);
    }
};

D3Object.Register('MaterialDiffuseConstant', MaterialDiffuseConstant.factory);

export { MaterialDiffuseConstant };