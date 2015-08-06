/**
 * Visual
 *
 * @version 1.0
 * @author lonphy
 */


/**
 * @param type {number} primitiveType
 * @param format {L5.VertexFormat}
 * @param vertexBuffer {L5.VertexBuffer}
 * @param indexBuffer {L5.IndexBuffer}
 * @class
 */
L5.Visual = function (
    type, format, vertexBuffer, indexBuffer
) {
    L5.Spatial.call (this);

    this.primitiveType = type || L5.Spatial.PT_NONE;

    /**
     * @type {L5.VertexFormat}
     */
    this.format = format;

    /**
     * @type {L5.VertexBuffer}
     */
    this.vertexBuffer = vertexBuffer;

    /**
     * @type {L5.IndexBuffer}
     */
    this.indexBuffer = indexBuffer;
    /**
     * @type {L5.Bound}
     */
    this._modelBound = null;

    /**
     * Shader effect used to draw the Visual.
     * @type {L5.VisualEffectInstance}
     * @private
     */
    this._effect = null;

    if (format && vertexBuffer && indexBuffer) {
        this.updateModelSpace (L5.Spatial.GU_MODEL_BOUND_ONLY);
    }
};

L5.nameFix (L5.Visual, 'Visual');
L5.extendFix (L5.Visual, L5.Spatial);

L5.Visual.prototype.updateModelSpace = function (type) {
    this.updateModelBound ();
};

L5.Visual.prototype.updateWorldBound = function () {
    this._modelBound.transformBy (this.worldTransform, this.worldBound);
};
L5.Visual.prototype.updateModelBound = function () {
    var numVertices = this.vertexBuffer.numElements;
    const format = this.format;
    var stride      = format.stride;

    var posIndex = format.getIndex (L5.VertexFormat.AU_POSITION);
    if (posIndex == -1) {
        L5.assert (false, 'Update requires vertex positions');
        return;
    }

    var posType = format.getAttributeType (posIndex);
    if (posType != L5.VertexFormat.AT_FLOAT3 &&
        posType != L5.VertexFormat.AT_FLOAT4
    ) {
        L5.assert (false, 'Positions must be 3-tuples or 4-tuples');
        return;
    }

    var data      = this.vertexBuffer.getData();
    var posOffset = format.getOffset (posIndex);
    this._modelBound.computeFromData (numVertices, stride, data.slice (posOffset));
};

/**
 * Support for hierarchical culling.
 * @param culler {L5.Culler}
 * @param noCull {boolean}
 */
L5.Visual.prototype.getVisibleSet = function (
    culler, noCull
) {
    culler.insert (this);
};

/////////////////// 绘制类型 //////////////////////////////
L5.Visual.PT_NONE                    = 0;  // 默认
L5.Visual.PT_POLYPOINT               = 1;
L5.Visual.PT_POLYSEGMENTS_DISJOINT   = 2;
L5.Visual.PT_POLYSEGMENTS_CONTIGUOUS = 3;
L5.Visual.PT_TRIANGLES               = 4;  // abstract
L5.Visual.PT_TRIMESH                 = 5;
L5.Visual.PT_TRISTRIP                = 6;
L5.Visual.PT_TRIFAN                  = 7;
L5.Visual.PT_MAX_QUANTITY            = 8;

// Geometric updates.  If the positions in the vertex buffer have been
// modified, you might want to update the surface frames (normals,
// tangents, and bitangents) for indexed-triangle primitives.  It is
// assumed that the positions have been updated and the vertex buffer is
// unlocked.  The argument of UpdateModelSpace specifies the update
// algorithm:
//
//   GU_MODEL_BOUND_ONLY:
//      Update only the model-space bound of the new positions.
//
// For the other options, the model-space bound is always recomputed,
// regardless of type of primitive.  For the surface frames to be updated,
// the Visual must represent an indexed-triangle primitive and must have
// the relevant channels (normal, tangents, bitangents).  If the primitive
// is not indexed triangles, the update call does nothing to the frames.
// An update occurs only for those channels present in the vertex buffer.
// For example, if the vertex buffer has no normals, GU_NORMALS will
// have no effect on the vertex buffer.  As another example, if you
// specify GU_USE_GEOMETRY and the vertex buffer has normals and tangents
// but not bitangents, only normals and tangents are updated (i.e. the
// vertex buffer is not regenerated to have bitangents).
//
//   GU_NORMALS:
//      Update the normals.
//
//   GU_USE_GEOMETRY:
//      Use the mesh topology to determine the surface frames.  The
//      algorithm uses a least-squares method, which is expensive.
//
//   GU_USE_TCOORD_CHANNEL + nonnegative_integer:
//      The standard way to generate surface frames is to use a texture
//      coordinate unit from the vertex buffer.
//
// To reduce video memory usage by the vertex buffers, if your vertex
// shaders use normals, tangents, and bitangents, consider passing in
// normals and tangents, and then have the shader compute the bitangent as
//    bitangent = Cross(normal, tangent)
L5.Visual.GU_MODEL_BOUND_ONLY   = -3;
L5.Visual.GU_NORMALS            = -2;
L5.Visual.GU_USE_GEOMETRY       = -1;
L5.Visual.GU_USE_TCOORD_CHANNEL = 0;