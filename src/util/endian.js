let buf = new Uint32Array(1);
let dv = new DataView(buf.buffer);
dv.setUint32(0, 0x12345678, true); // little endian

export const BigEndian = (buf[0] === 0x12345678);
