import { D3Object } from '../../core/D3Object';

class ShaderFloat extends D3Object {
    /**
     * @param {number} numRegisters
     */
    constructor(numRegisters) {
        super();
        this.numElements = 0;
        this.data = null;
        this.allowUpdater = false;
        this.setNumRegisters(numRegisters);
    }

    /**
     * @param {number} numRegisters
     */
    setNumRegisters(numRegisters) {
        console.assert(numRegisters > 0, 'Number of registers must be positive');
        this.numElements = 4 * numRegisters;
        this.data = new Float32Array(this.numElements);
    }

    getNumRegisters() {
        return this.numElements / 4;
    }

    item(index, val) {
        console.assert(0 <= index && index < this.numElements, 'Invalid index');
        if (val === undefined) {
            return this.data[index];
        }
        this.data[index] = val;
    }

    /**
     * @param {number} i - location of elements
     * @param {Float32Array} data 4-tuple float
     */
    setOneRegister(i, data) {
        console.assert(0 <= i && i < this.numElements / 4, 'Invalid register');
        this.data.set(data.subarray(0, 4), 4 * i);
    }

    /**
     * @param {Float32Array} data
     */
    setRegister(data) {
        this.data.set(data.subarray(0, this.numElements));
    }

    /**
     * @param {number} i
     * @returns {Float32Array}
     */
    getOneRegister(i) {
        console.assert(0 <= i && i < this.numElements / 4, 'Invalid register');
        return new Float32Array(this.data.subarray(4 * i, 4 * i + 4));
    }

    getRegisters() {
        return new Float32Array(this.data.buffer);
    }

    /**
     * @param {Float32Array} data
     */
    copy(data) {
        this.data.set(data);
        return this;
    }

    /**
     * @param {Visual} visual
     * @param {Camera} camera
     * @abstract
     */
    update(visual, camera) { }

    /**
     * @param {Instream} inStream 
     */
    load(inStream) {
        super.load(inStream);
        this.data = new Float32Array(inStream.readFloatArray());
        this.numElements = this.data.length;
        this.allowUpdater = inStream.readBool();
    }
    
    save(outStream) {
        super.save(outStream);
        outStream.writeFloat32Array(this.numElements, this.data);
        outStream.writeBool(this.allowUpdater);
    }
}

export { ShaderFloat };