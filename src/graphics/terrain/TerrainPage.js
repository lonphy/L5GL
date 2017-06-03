/**
 * 地形分片
 *
 * @param format {L5.VertexFormat}
 * @param size {int}
 * @param heights {Uint16Array}
 * @param origin
 * @param minElevation {float}
 * @param maxElevation {float}
 * @param spacing {float}
 *
 * @class
 * @extends {L5.TriMesh}
 *
 * @author lonphy
 * @version 1.0
 */
L5.TerrainPage = function (format, size, heights, origin, minElevation, maxElevation, spacing) {
    this.size = size;
    this.sizeM1 = size - 1;
    this.heights = heights;
    this.origin = origin;
    this.minElevation = minElevation;
    this.maxElevation = maxElevation;
    this.spacing = spacing;

    // size = 2^p + 1, p <= 7
    L5.assert(
        size === 3 ||
        size === 5 ||
        size === 9 ||
        size === 17 ||
        size === 33 ||
        size === 65 ||
        size === 129, "Invalid page size");

    this.invSpacing = 1 / spacing;
    this.multiplier = (maxElevation - minElevation) / 65535;

    // Create a mesh for the page.
    var ext = spacing * this.sizeM1;
    var mesh = new L5.StandardMesh(format).rectangle(size, size, ext, ext);
    this.format = format;
    this.vertexBuffer = mesh.vertexBuffer;
    this.indexBuffer = mesh.indexBuffer;

    // Modify the vertices to use the terrain data.
    var vba = new L5.VertexBufferAccessor(format, this.vertexBuffer);
    var numVertices = this.vertexBuffer.numElements;
    for (var i = 0; i < numVertices; ++i) {
        var x = i % size;
        var y = i / size;
        vba.setPosition(i, [this.getX(x), this.getY(y), this.getHeightUseIndex(i)]);
    }

    this.updateModelSpace(L5.Visual.GU_NORMALS);
};
L5.nameFix(L5.TerrainPage, 'TerrainPage');
L5.extendFix(L5.TerrainPage, L5.TriMesh);

L5.TerrainPage.prototype.getX = function(x) {
    return this.origin[0] + this.spacing*x;
};

//----------------------------------------------------------------------------
L5.TerrainPage.prototype.getY = function(y) {
        return this.origin[1] + this.spacing*y;
};
//----------------------------------------------------------------------------
L5.TerrainPage.prototype.getHeightUseIndex = function(index) {
    return this.minElevation + this.multiplier*this.heights[index];
};

/**
 * @param x {float}
 * @param y {float}
 * @returns {float}
 */
L5.TerrainPage.prototype.getHeight = function (x, y) {
    const invSpacing = this.invSpacing;
    const sizeM1 = this.sizeM1;
    const minElevation = this.minElevation;
    const maxElevation = this.maxElevation;
    const multiplier = this.multiplier;
    const heights = this.heights;
    const size = this.size;

    var xGrid = (x - this.origin[0]) * invSpacing;
    if (xGrid < 0 || xGrid >= sizeM1) {
        // Location not in page.
        return L5.Math.MAX_REAL;
    }

    var yGrid = (y - this.origin[1]) * invSpacing;
    if (yGrid < 0 || yGrid >= sizeM1) {
        // Location not in page.
        return L5.Math.MAX_REAL;
    }

    var fCol = Math.floor(xGrid);
    var iCol = fCol;
    var fRow = Math.floor(yGrid);
    var iRow = fRow;

    var index = iCol + size * iRow;
    var dx = xGrid - fCol;
    var dy = yGrid - fRow;
    var h00, h10, h01, h11, height;

    if ((iCol & 1) == (iRow & 1)) {
        var diff = dx - dy;
        h00 = minElevation + multiplier * heights[index];
        h11 = minElevation + multiplier * heights[index + 1 + size];
        if (diff > 0) {
            h10 = minElevation + multiplier * heights[index + 1];
            height = (1 - diff - dy) * h00 + diff * h10 + dy * h11;
        }
        else {
            h01 = minElevation + multiplier * heights[index + size];
            height = (1 + diff - dx) * h00 - diff * h01 + dx * h11;
        }
    } else {
        var sum = dx + dy;
        h10 = minElevation + multiplier * heights[index + 1];
        h01 = minElevation + multiplier * heights[index + size];
        if (sum <= 1) {
            h00 = minElevation + multiplier * heights[index];
            height = (1 - sum) * h00 + dx * h10 + dy * h01;
        } else {
            h11 = minElevation + multiplier * heights[index + 1 + size];
            height = (sum - 1) * h11 + (1 - dy) * h10 + (1 - dx) * h01;
        }
    }

    return height;
};