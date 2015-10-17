/**
 * OffsetState - 偏移状态
 *
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */

L5.OffsetState = function(){
    L5.D3Object.call(this);
    // Set whether offset should be enabled for the various polygon drawing
    // modes (fill, line, point).
    this.fillEnabled = false;

    // The offset is Scale*dZ + Bias*r where dZ is the change in depth
    // relative to the screen space area of the poly, and r is the smallest
    // resolvable depth difference.  Negative values move polygons closer to
    // the eye.
    this.scale = 0;
    this.bias = 0;
};

L5.nameFix (L5.OffsetState, 'OffsetState');
L5.extendFix(L5.OffsetState, L5.D3Object);

L5.OffsetState.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    this.fillEnabled = inStream.readBool();
    var lineEnabled = inStream.readBool();
    var pointEnabled = inStream.readBool();

    this.scale = inStream.readFloat32();
    this.bias = inStream.readFloat32();
};

L5.OffsetState.prototype.save = function (outStream) {
    L5.D3Object.prototype.save.call(this, outStream);
    outStream.writeBool(this.fillEnabled);
    outStream.writeFloat32(this.scale);
    outStream.writeFloat32(this.bias);
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.OffsetState}
 */
L5.OffsetState.factory = function (inStream) {
    var obj = new L5.OffsetState();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.OffsetState', L5.OffsetState.factory);