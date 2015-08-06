/**
 * StandardMesh
 *
 * @param format {L5.VertexFormat}
 * @param isStatic {boolean} default true
 * @param inside {boolean} default false
 * @param transform {L5.Transform} default null
 */
L5.StandardMesh = function(
    format, isStatic , inside, transform

){
    isStatic = isStatic === undefined ? true: isStatic;
    inside = !!inside;
    this.format = format;
    this.transform = transform;
    this.isStatic = true;
    this.inside = true;
    this.hasNormals = false;
    this.hasTCoords = new Array(L5.StandardMesh.MAX_UNITS);
    this.usage = 0;
};
L5.nameFix(L5.StandardMesh, 'StandardMesh');

/**
 *
 * @param xSamples {number}
 * @param ySamples {number}
 * @param xExtent {number}
 * @param yExtent {number}
 * @returns {L5.TriMesh}
 */
L5.StandardMesh.prototype.rectangle = function(
    xSamples, ySamples, xExtent, yExtent
) {

};

/**
 *
 * @param shellSamples {number}
 * @param radialSamples {number}
 * @param radius {number}
 * @returns {L5.TriMesh}
 */
L5.StandardMesh.prototype.disk = function(
    shellSamples, radialSamples, radius
) {

};

// The box has center (0,0,0); unit-length axes (1,0,0), (0,1,0), and
// (0,0,1); and extents (half-lengths) 'xExtent', 'yExtent', and
// 'zExtent'.  The mesh has 8 vertices and 12 triangles.  For example,
// the box corner in the first octant is (xExtent, yExtent, zExtent).
/**
 *
 * @param xExtent {number}
 * @param yExtent {number}
 * @param zExtent {number}
 * @returns {L5.TriMesh}
 */
L5.StandardMesh.prototype.box = function(
    xExtent, yExtent, zExtent
){

};

// The cylinder has center (0,0,0), the specified 'radius', and the
// specified 'height'.  The cylinder axis is a line segment of the
// form (0,0,0) + t*(0,0,1) for |t| <= height/2.  The cylinder wall
// is implicitly defined by x^2+y^2 = radius^2.  If 'open' is 'true',
// the cylinder end-disks are omitted; you have an open tube.  If
// 'open' is 'false', the end-disks are included.  Each end-disk is
// a regular polygon that is tessellated by including a vertex at
// the center of the polygon and decomposing the polygon into triangles
// that all share the center vertex and each triangle containing an
// edge of the polygon.
L5.StandardMesh.prototype.cylinder = function(
    axisSamples, radialSamples, radius, height, open
){};

// The sphere has center (0,0,0) and the specified 'radius'.  The north
// pole is at (0,0,radius) and the south pole is at (0,0,-radius).  The
// mesh has the topology of an open cylinder (which is also the topology
// of a rectangle with wrap-around for one pair of parallel edges) and
// is then stitched to the north and south poles.  The triangles are
// unevenly distributed.  If you want a more even distribution, create
// an icosahedron and subdivide it.
L5.StandardMesh.prototype.sphere = function(
    zSamples, radialSamples, radius
){};

// The torus has center (0,0,0).  If you observe the torus along the
// line with direction (0,0,1), you will see an annulus.  The circle
// that is the center of the annulus has radius 'outerRadius'.  The
// distance from this circle to the boundaries of the annulus is the
// 'inner radius'.
L5.StandardMesh.prototype.torus = function(
    circleSamples, radialSamples, outerRadius, innerRadius
){

};

// Platonic solids, all inscribed in a unit sphere centered at (0,0,0).
L5.StandardMesh.prototype.tetrahedron = function(){};
L5.StandardMesh.prototype.hexahedron = function(){};
L5.StandardMesh.prototype.octahedron = function(){};
L5.StandardMesh.prototype.dodecahedron = function(){};
L5.StandardMesh.prototype.icosahedron = function(){};

/**
 *
 * @param vba {L5.VertexBufferAccessor}
 */
L5.StandardMesh.prototype.transformData = function(vba){};
L5.StandardMesh.prototype.reverseTriangleOrder = function(numTriangles, indices){};
/**
 *
 * @param vba {L5.VertexBufferAccessor}
 */
L5.StandardMesh.prototype.createPlatonicNormals = function(vba){};
/**
 *
 * @param vba {L5.VertexBufferAccessor}
 */
L5.StandardMesh.prototype.createPlatonicUVs = function(vba){};

L5.StandardMesh.MAX_UNITS = L5.VertexFormat.AM_MAX_TCOORD_UNITS;
