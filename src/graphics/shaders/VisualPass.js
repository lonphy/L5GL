import { D3Object } from '../../core/D3Object';
import { Program } from './Program';

class VisualPass extends D3Object {
    constructor() {
        super('VisualPass');
        /**
         * @type {Program}
         */
        this.program = null;
        /**
         * @type {AlphaState}
         */
        this.alphaState = null;
        /**
         * @type {CullState}
         */
        this.cullState = null;
        /**
         * @type {DepthState}
         */
        this.depthState = null;
        /**
         * @type {OffsetState}
         */
        this.offsetState = null;
        /**
         * @type {StencilState}
         */
        this.stencilState = null;
    }

    /**
     * @returns {FragShader}
     */
    getFragShader() {
        return this.program.fragShader;
    }

    /**
     * @returns {VertexShader}
     */
    getVertexShader() {
        return this.program.vertexShader;
    }


    load(inStream) {
        super.load(inStream);
        let vertexShader = inStream.readPointer();
        let fragShader = inStream.readPointer();
        this.program = new Program('Program', vertexShader, fragShader);
        this.alphaState = inStream.readPointer();
        this.cullState = inStream.readPointer();
        this.depthState = inStream.readPointer();
        this.offsetState = inStream.readPointer();
        this.stencilState = inStream.readPointer();
        this.wireState = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);

        this.program.vertexShader = inStream.resolveLink(this.program.vertexShader);
        this.program.fragShader = inStream.resolveLink(this.program.fragShader);

        this.alphaState = inStream.resolveLink(this.alphaState);
        this.cullState = inStream.resolveLink(this.cullState);
        this.depthState = inStream.resolveLink(this.depthState);
        this.offsetState = inStream.resolveLink(this.offsetState);
        this.stencilState = inStream.resolveLink(this.stencilState);
        this.wireState = inStream.resolveLink(this.wireState);
    }

    save(inStream) {
        super.save(inStream);
        // todo: implement
    }

    static factory(inStream) {
        let obj = new VisualPass();
        obj.load(inStream);
        return obj;
    }
};

D3Object.Register('VisualPass', VisualPass.factory);

export { VisualPass };
