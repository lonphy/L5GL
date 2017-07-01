import { D3Object } from '../../core/D3Object';

class CullState extends D3Object {

    constructor() {
        super();
        this.enabled = true;
        this.CCWOrder = true;
    }

    load(inStream) {
        super.load(inStream);
        this.enabled = inStream.readBool();
        this.CCWOrder = inStream.readBool();
    }

    save(outStream) {
        super.save(outStream);
        outStream.writeBool(this.enabled);
        outStream.writeBool(this.CCWOrder);
    }

    static factory(inStream) {
        let obj = new CullState();
        obj.enabled = false;
        obj.CCWOrder = false;
        obj.load(inStream);
        return obj;
    }
}

D3Object.Register('CullState', CullState.factory);

export { CullState };
