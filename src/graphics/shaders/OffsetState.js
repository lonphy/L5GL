/**
 * OffsetState - 偏移状态
 *
 * @class
 *
 * @author lonphy
 * @version 1.0
 */

L5.OffsetState = function(){
    // Set whether offset should be enabled for the various polygon drawing
    // modes (fill, line, point).
    this.fillEnabled = false;
    this.lineEnabled = false;
    this.pointEnabled = false;

    // The offset is Scale*dZ + Bias*r where dZ is the change in depth
    // relative to the screen space area of the poly, and r is the smallest
    // resolvable depth difference.  Negative values move polygons closer to
    // the eye.
    this.scale = 0;
    this.bias = 0;
};

L5.nameFix (L5.OffsetState, 'OffsetState');