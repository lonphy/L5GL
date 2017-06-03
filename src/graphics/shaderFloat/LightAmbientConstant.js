import { ShaderFloat } from './ShaderFloat'
import { D3Object } from '../../core/D3Object'

/**
 * 着色器常量 - 灯光环境光
 */
class LightAmbientConstant extends ShaderFloat {
    /**
     * @param {Light} light - 灯光实例
     */
    constructor(light) {
        super(1);

        /** @type {Light} */
        this.light = light;
        this.allowUpdater = true;
    }
    /**
     * 更新环境光分量
     * @param {Visual} visual - 可视体
     * @param {Camera} camera - 相机
     */
    update(visual, camera) {
        this.copy(this.light.ambient);
    }

    /**
     * @param {InStream} inStream 
     */
    load(inStream) {
        super.load(inStream);
        this.light = inStream.readPointer();
    }
    /**
     * @param {InStream} inStream 
     */
    link(inStream) {
        super.link(inStream);
        this.light = inStream.resolveLink(this.light);
    }
    /**
     * @param {OutStream} outStream 
     */
    save(outStream) {
        super.save(outStream);
        outStream.writePointer(this.light);
    }
}

D3Object.Register('LightAmbientConstant', LightAmbientConstant.factory);

export { LightAmbientConstant }