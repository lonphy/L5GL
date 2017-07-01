import { D3Object } from '../../core/D3Object';

class OffsetState extends D3Object {

    constructor() {
        super();
        this.fillEnabled = false;
        // The offset is Scale*dZ + Bias*r where dZ is the change in depth
        // relative to the screen space area of the poly, and r is the smallest
        // resolvable depth difference.  Negative values move polygons closer to
        // the eye.
        this.scale = 0;
        this.bias = 0;
    }

    load(inStream) {
        super.load(inStream);

        this.fillEnabled = inStream.readBool();
        this.scale = inStream.readFloat32();
        this.bias = inStream.readFloat32();
    }

    save(outStream) {
        super.save(outStream);
        outStream.writeBool(this.fillEnabled);
        outStream.writeFloat32(this.scale);
        outStream.writeFloat32(this.bias);
    }

    static factory(inStream) {
        let obj = new OffsetState();
        obj.load(inStream);
        return obj;
    }

}

D3Object.Register('OffsetState', OffsetState.factory);

export { OffsetState };
