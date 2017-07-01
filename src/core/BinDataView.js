class BinDataView {

    /**
     * @param {ArrayBuffer} buf
     * @param {number} offset
     * @param {number} size
     */
    constructor(buf, offset = 0, size = 0) {
        if (size === 0) {
            size = buf.byteLength - offset;
        }
        this.dv = new DataView(buf, offset, size);
        this.offset = 0;
    }

    int8() {
        return this.dv.getInt8(this.offset++);
    }
    setInt8(val) {
        this.dv.setInt8(this.offset++, val);
    }

    uint8() {
        return this.dv.getUint8(this.offset++);
    }
    setUint8(val) {
        this.dv.setUint8(this.offset++, val);
    }

    uint16() {
        let val = this.dv.getUint16(this.offset, true);
        this.offset += 2;
        return val;
    }

    setUint16(val) {
        this.dv.setUint16(this.offset, val, true);
        this.offset += 2;
    }

    int16() {
        let val = this.dv.getInt16(this.offset, true);
        this.offset += 2;
        return val;
    }
    setInt16(val) {
        this.dv.setInt16(this.offset, val, true);
        this.offset += 2;
    }

    int32() {
        let val = this.dv.getInt32(this.offset, true);
        this.offset += 4;
        return val;
    }
    setInt32(val) {
        this.dv.setInt32(this.offset, val, true);
        this.offset += 4;
    }

    uint32() {
        let val = this.dv.getUint32(this.offset, true);
        this.offset += 4;
        return val;
    }

    setUint32(val) {
        this.dv.setUint32(this.offset, val, true);
        this.offset += 4;
    }

    float32() {
        let val = this.dv.getFloat32(this.offset, true);
        this.offset += 4;
        return val;
    }

    setFloat32(val) {
        this.dv.setFloat32(this.offset, val, true);
        this.offset += 4;
    }

    float64() {
        let val = this.dv.getFloat64(this.offset, true);
        this.offset += 8;
        return val;
    }

    setFloat64(val) {
        this.dv.setFloat64(this.offset, val, true);
        this.offset += 8;
    }

    string() {
        let size = this.uint16(), ret = '';
        for (let i = 0; i < size; ++i) {
            ret += String.fromCharCode(this.uint8());
        }
        return ret;
    }
    setString(val) {
        let size = val.length;
        this.setUint16(size);
        for (let i = 0; i < size; ++i) {
            this.setUint8(val[i].charCodeAt(i));
        }
        this.offset += size;
    }

    bytes(size) {
        let val = this.dv.buffer.slice(this.offset, size);
        this.offset += size;
        return new Uint8Array(val);
    }

    setBytes(val) {
        (new Uint8Array(this.dv.buffer, this.offset)).set(val);
        this.offset += val.byteLength;
    }
}

export { BinDataView };
