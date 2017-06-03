/**
 *
 * @param mesh {L5.Mesh}
 * @param maxTrisPerLeaf {int}
 * @param storeInteriorTris {Boolean}
 * @constructor
 */
L5.BoundTree = function(mesh, maxTrisPerLeaf=1, storeInteriorTris=false){

};
L5.nameFix(L5.BoundTree, 'BoundTree');

/**
 *
 * @returns {L5.BoundTree}
 */
L5.BoundTree.prototype.GetLChild = function(){};

/**
 *
 * @returns {L5.BoundTree}
 */
L5.BoundTree.prototype.GetRChild = function(){};

/**
 *
 * @returns {Boolean}
 */
L5.BoundTree.prototype.IsInteriorNode = function(){};

/**
 *
 * @returns {Boolean}
 */
L5.BoundTree.prototype.IsLeafNode = function(){};

/**
 *
 * @returns {L5.Mesh}
 */
L5.BoundTree.prototype.GetMesh = function(){};

/**
 *
 * @returns {L5.Bound}
 */
L5.BoundTree.prototype.GetWorldBound = function(){};

/**
 *
 * @returns {int}
 */
L5.BoundTree.prototype.GetNumTriangles= function(){};

/**
 *
 * @param i {int}
 * @returns {int}
 */
L5.BoundTree.prototype.GetTriangle= function(i){};

/**
 * @returns {int}
 */
L5.BoundTree.prototype.GetTriangles= function(){};

/**
 The Mesh world transform is assumed to change dynamically.
  */
L5.BoundTree.prototype.UpdateWorldBound = function () {};

/**
 *
 * @param maxTrisPerLeaf {int}
 * @param storeInteriorTris {Boolean}
 * @param centroids {L5.Point}
 * @param i0 {int}
 * @param i1 {int}
 * @param inSplit {int}
 * @param outSplit {int}
 */
L5.BoundTree.prototype.BuildTree = function(maxTrisPerLeaf, storeInteriorTris, centroids, i0, i1, inSplit, outSplit){};

/**
 * Compute the model bound for the subset of triangles.  Return a
 * line used for splitting the projections of the triangle centroids.
 * @param i0 {int}
 * @param i1 {int}
 * @param inSplit {int}
 * @param origin {L5.Point}
 * @param direction {L5.Vector}
 */
L5.BoundTree.prototype.CreateModelBound = function( i0, i1, inSplit, origin, direction) {};

/**
 *
 * @param centroids {L5.Point}
 * @param i0 {int}
 * @param i1 {int}
 * @param inSplit {int}
 * @param j0 {int}
 * @param j1 {int}
 * @param outSplit {int}
 * @param origin {L5.Point}
 * @param direction {L5.Vector}
 */
L5.BoundTree.SplitTriangles = function(centroids, i0, i1, inSplit, j0, j1, outSplit, origin, direction) {};