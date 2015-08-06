/**
 * Triangles
 *
 * @param type {number}
 * @param format {L5.VertexFormat}
 * @param vertexBuffer {L5.VertexBuffer}
 * @param indexBuffer {L5.IndexBuffer}
 * @class
 * @extends {L5.Visual}
 *
 * @author lonphy
 * @version 1.0
 */
L5.Triangles = function (
    type, format, vertexBuffer, indexBuffer
) {
    L5.Visual.call (this, type, format, vertexBuffer, indexBuffer);
};

L5.nameFix (L5.Triangles, 'Triangles');
L5.extendFix (L5.Triangles, L5.Visual);

L5.Triangles.prototype.getNumTriangles = function () {
    throw new Error ('Method:' + this.constructor.name + '.getNumTriangles not defined.');
};
L5.Triangles.prototype.getTriangle     = function (index, output) {
    throw new Error ('Method:' + this.constructor.name + '.getTriangle not defined.');
};

L5.Triangles.prototype.getNumVertices   = function () {
    return this.vertexBuffer.numElements;
};
/**
 * 获取物体坐标系的三角形顶点数组
 * @param i {number}
 * @param modelTriangle {Array<L5.Point>}
 */
L5.Triangles.prototype.getModelTriangle = function (
    i, modelTriangle
) {
    var v = new Array (3);
    if (this.getTriangle (i, v)) {
        var vba            = new L5.VertexBufferAccessor (this.format, this.vertexBuffer);
        var p              = vba.getPosition (v[ 0 ]);
        modelTriangle[ 0 ] = new L5.Point (p[ 0 ], p[ 1 ], p[ 2 ]);

        p                  = vba.getPosition (v[ 1 ]);
        modelTriangle[ 1 ] = new L5.Point (p[ 0 ], p[ 1 ], p[ 2 ]);

        p                  = vba.getPosition (v[ 2 ]);
        modelTriangle[ 2 ] = new L5.Point (p[ 0 ], p[ 1 ], p[ 2 ]);
        return true;
    }
    return false;
};

/**
 * 获取世界坐标系的三角形顶点数组
 * @param i {number}
 * @param worldTriangle {L5.Point}
 */
L5.Triangles.prototype.getWorldTriangle = function (
    i, worldTriangle
) {
    var pos = new Array (3);
    if (this.getModelTriangle (i, pos)) {
        worldTriangle[ 0 ] = this.worldTransform.xPoint (pos[ 0 ]);
        worldTriangle[ 1 ] = this.worldTransform.xPoint (pos[ 1 ]);
        worldTriangle[ 2 ] = this.worldTransform.xPoint (pos[ 2 ]);
        return true;
    }
    return false;
};

/**
 *
 * @param v {number}
 * @returns {L5.Point}
 */
L5.Triangles.prototype.getPosition = function (
    v
) {
    var index = this.format.getIndex (L5.VertexFormat.AU_POSITION);
    if (index >= 0) {
        var offset = this.format.getOffset (index);
        var stride = this.format.stride;
        var start  = offset + v * stride;
        return new L5.Point (
            new Float32Array (this.vertexBuffer.getData (), start, 3)
        );
    }

    L5.assert (false, 'GetPosition failed.');
    return new L5.Point (0, 0, 0);
};

L5.Triangles.prototype.updateModelSpace   = function (
    type
) {
    this.updateModelBound ();
    if (type === L5.Visual.GU_MODEL_BOUND_ONLY) {
        return;
    }

    var vba = L5.VertexBufferAccessor.fromVisual (this);
    if (vba.hasNormal ()) {
        this.updateModelNormals (vba);
    }

    if (type !== L5.Visual.GU_NORMALS) {
        if (vba.hasTangent () || vba.hasBinormal ()) {
            if (type === L5.Visual.GU_USE_GEOMETRY) {
                this.updateModelTangentsUseGeometry (vba);
            }
            else {
                this.updateModelTangentsUseTCoords (vba);
            }
        }
    }

    L5.Renderer.updateAll (this.vertexBuffer);
};
/**
 * 更新物体模型空间法线
 * @param vba {L5.VertexBufferAccessor}
 */
L5.Triangles.prototype.updateModelNormals = function (
    vba
) {
    var i, t, pos0, pos1, pos2, tv0, tv1, tNormal,
        v              = new Array (3);
    const numTriangles = this.getNumTriangles ();
    for (i = 0; i < numTriangles; ++i) {
        // 获取三角形3个顶点对应的索引.
        if (!this.getTriangle (i, v)) {
            continue;
        }

        // 获取顶点坐标.
        pos0 = new L5.Point (vba.getPosition (v0));
        pos1 = new L5.Point (vba.getPosition (v1));
        pos2 = new L5.Point (vba.getPosition (v2));

        // 计算三角形法线.
        tv0     = pos1.subP (pos0);
        tv1     = pos2.subP (pos0);
        tNormal = tv0.cross (tv1).normalize ();

        // 更新对应3个顶点的法线
        t      = vba.getNormal (v[ 0 ]);
        t[ 0 ] = tNormal.x;
        t[ 1 ] = tNormal.y;
        t[ 2 ] = tNormal.z;

        t      = vba.getNormal (v[ 1 ]);
        t[ 0 ] = tNormal.x;
        t[ 1 ] = tNormal.y;
        t[ 2 ] = tNormal.z;

        t      = vba.getNormal (v[ 2 ]);
        t[ 0 ] = tNormal.x;
        t[ 1 ] = tNormal.y;
        t[ 2 ] = tNormal.z;
    }
};

/**
 * 更新物体模型空间切线
 * @param vba {L5.VertexBufferAccessor}
 */
L5.Triangles.prototype.updateModelTangentsUseGeometry = function (
    vba
) {
    // Compute the matrix of normal derivatives.
    const numVertices = vba.getNumVertices ();
    var dNormal       = new Array (numVertices);
    var wwTrn         = new Array (numVertices);
    var dwTrn         = new Array (numVertices);
    var i, j, row, col;

    for (i = 0; i < numTriangles; ++i) {
        wwTrn[ i ]   = new L5.Matrix ().zero ();
        dwTrn[ i ]   = new L5.Matrix ().zero ();
        dNormal[ i ] = new L5.Matrix ().zero ();

        // 获取三角形的3个顶点索引.
        var v = new Array (3);
        if (!this.getTriangle (i, v)) {
            continue;
        }

        for (j = 0; j < 3; j++) {
            // 获取顶点坐标和法线.
            var v0   = v[ j ];
            var v1   = v[ (j + 1) % 3 ];
            var v2   = v[ (j + 2) % 3 ];
            var pos0 = new L5.Point (vba.getPosition (v0));
            var pos1 = new L5.Point (vba.getPosition (v1));
            var pos2 = new L5.Point (vba.getPosition (v2));
            var nor0 = new L5.Vector (vba.getNormal (v0));
            var nor1 = new L5.Vector (vba.getNormal (v1));
            var nor2 = new L5.Vector (vba.getNormal (v2));

            // 计算从pos0到pos1的边,使其射向顶点切面，然后计算相邻法线的差
            var edge = pos1.subP (pos0);
            var proj = edge.sub (nor0.scalar (edge.dot (nor0)));
            var diff = nor1.sub (nor0);
            for (row = 0; row < 3; ++row) {
                for (col = 0; col < 3; ++col) {
                    wwTrn[ v0 ].setItem (row, col, wwTrn.item (row, col) + proj[ row ] * proj[ col ]);
                    dwTrn[ v0 ].setItem (row, col, dwTrn.item (row, col) + diff[ row ] * proj[ col ]);
                }
            }

            // 计算从pos0到pos2的边,使其射向顶点切面，然后计算相邻法线的差
            edge = pos2.subP (pos0);
            proj = edge.sub (nor0.scalar (edge.dot (nor0)));
            diff = nor2.sub (nor0);
            for (row = 0; row < 3; ++row) {
                for (col = 0; col < 3; ++col) {
                    wwTrn[ v0 ].setItem (row, col, wwTrn.item (row, col) + proj[ row ] * proj[ col ]);
                    dwTrn[ v0 ].setItem (row, col, dwTrn.item (row, col) + diff[ row ] * proj[ col ]);
                }
            }
        }
    }

    // Add N*N^T to W*W^T for numerical stability.  In theory 0*0^T is added
    // to D*W^T, but of course no update is needed in the implementation.
    // Compute the matrix of normal derivatives.
    for (i = 0; i < numVertices; ++i) {
        var nor = vba.getNormal (i);
        for (row = 0; row < 3; ++row) {
            for (col = 0; col < 3; ++col) {
                wwTrn[ i ].setItem (row, col, 0.5 * wwTrn[ i ].item (row, col) + nor[ row ] * nor[ col ]);
                dwTrn[ i ].setItem (row, col, dwTrn[ i ].item (row, col) * 0.5);
            }
        }

        wwTrn[ i ].setColumn (3, L5.Point.ORIGIN);
        dNormal[ i ] = dwTrn[ i ].xMatrix (wwTrn[ i ]).inverse ();
    }

    // gc?
    wwTrn = null;
    dwTrn = null;

    // If N is a unit-length normal at a vertex, let U and V be unit-length
    // tangents so that {U, V, N} is an orthonormal set.  Define the matrix
    // J = [U | V], a 3-by-2 matrix whose columns are U and V.  Define J^T
    // to be the transpose of J, a 2-by-3 matrix.  Let dN/dX denote the
    // matrix of first-order derivatives of the normal vector field.  The
    // shape matrix is
    //   S = (J^T * J)^{-1} * J^T * dN/dX * J = J^T * dN/dX * J
    // where the superscript of -1 denotes the inverse.  (The formula allows
    // for J built from non-perpendicular vectors.) The matrix S is 2-by-2.
    // The principal curvatures are the eigenvalues of S.  If k is a principal
    // curvature and W is the 2-by-1 eigenvector corresponding to it, then
    // S*W = k*W (by definition).  The corresponding 3-by-1 tangent vector at
    // the vertex is called the principal direction for k, and is J*W.  The
    // principal direction for the minimum principal curvature is stored as
    // the mesh tangent.  The principal direction for the maximum principal
    // curvature is stored as the mesh bitangent.
    for (i = 0; i < numVertices; ++i) {
        // Compute U and V given N.
        var norvec = new L5.Vector (vba.getNormal (i));
        var uvec   = new L5.Vector (),
            vvec   = new L5.Vector ();

        L5.Vector.generateComplementBasis (uvec, vvec, norvec);

        // Compute S = J^T * dN/dX * J.  In theory S is symmetric, but
        // because we have estimated dN/dX, we must slightly adjust our
        // calculations to make sure S is symmetric.
        var s01  = uvec.dot (dNormal[ i ].xPoint (vvec));
        var s10  = vvec.dot (dNormal[ i ].xPoint (uvec));
        var sAvr = 0.5 * (s01 + s10);
        var smat = [
            [ uvec.dot (dNormal[ i ].xPoint (uvec)), sAvr ],
            [ sAvr, vvec.dot (dNormal[ i ].xPoint (vvec)) ]
        ];

        // Compute the eigenvalues of S (min and max curvatures).
        var trace        = smat[ 0 ][ 0 ] + smat[ 1 ][ 1 ];
        var det          = smat[ 0 ][ 0 ] * smat[ 1 ][ 1 ] - smat[ 0 ][ 1 ] * smat[ 1 ][ 0 ];
        var discr        = trace * trace - 4.0 * det;
        var rootDiscr    = L5.Math.sqrt (L5.Math.abs (discr));
        var minCurvature = 0.5 * (trace - rootDiscr);
        // float maxCurvature = 0.5f*(trace + rootDiscr);

        // Compute the eigenvectors of S.
        var evec0 = new L5.Vector (smat[ 0 ][ 1 ], minCurvature - smat[ 0 ][ 0 ], 0);
        var evec1 = new L5.Vector (minCurvature - smat[ 1 ][ 1 ], smat[ 1 ][ 0 ], 0);

        var tanvec, binvec;
        if (evec0.squaredLength () >= evec1.squaredLength ()) {
            evec0.normalize ();
            tanvec = uvec.scalar (evec0.x).add (vvec.scalar (evec0.y));
            binvec = norvec.cross (tanvec);
        }
        else {
            evec1.normalize ();
            tanvec = uvec.scalar (evec1.x).add (vvec.scalar (evec1.y));
            binvec = norvec.cross (tanvec);
        }

        if (vba.hasTangent ()) {
            var t  = vba.getTangent (i);
            t[ 0 ] = tanvec.x;
            t[ 1 ] = tanvec.y;
            t[ 2 ] = tanvec.z;
        }

        if (vba.hasBinormal ()) {
            var b  = vba.getBinormal (i);
            b[ 0 ] = binvec.x;
            b[ 1 ] = binvec.y;
            b[ 2 ] = binvec.z;
        }
    }
    dNormal = null;
};

/**
 * @param vba {L5.VertexBufferAccessor}
 */
L5.Triangles.prototype.updateModelTangentsUseTCoords = function (
    vba
) {
    // Each vertex can be visited multiple times, so compute the tangent
    // space only on the first visit.  Use the zero vector as a flag for the
    // tangent vector not being computed.
    const numVertices = vba.getNumVertices ();
    var hasTangent    = vba.hasTangent ();
    var zero          = L5.Vector.ZERO;
    var i, t;
    if (hasTangent) {
        for (i = 0; i < numVertices; ++i) {
            t      = vba.getTangent (i);
            t[ 0 ] = 0;
            t[ 1 ] = 0;
            t[ 2 ] = 0;
        }
    } else {
        for (i = 0; i < numVertices; ++i) {
            t      = vba.getBinormal (i);
            t[ 0 ] = 0;
            t[ 1 ] = 0;
            t[ 2 ] = 0;
        }
    }

    const numTriangles = this.getNumTriangles ();
    for (i = 0; i < numTriangles; i++) {
        // Get the triangle vertices' positions, normals, tangents, and
        // texture coordinates.
        var v = [ 0, 0, 0 ];
        if (!this.getTriangle (i, v)) {
            continue;
        }

        var locPosition = new Array (3);
        var locNormal   = new Array (3);
        var locTangent  = new Array (3);
        var locTCoord   = new Array (2);
        var curr, k;
        for (curr = 0; curr < 3; ++curr) {
            k                   = v[ curr ];
            locPosition[ curr ] = new L5.Point( vba.getPosition (k) );
            locNormal[ curr ]   = new L5.Vector( vba.getNormal (k) );
            locTangent[ curr ]  = new L5.Vector( (hasTangent ? vba.getTangent (k) : vba.getBinormal (k)) );
            locTCoord[ curr ]   = vba.getTCoord (0, k);
        }

        for (curr = 0; curr < 3; ++curr) {
            var currLocTangent = locTangent[ curr ];
            if (!currLocTangent.equals(zero)) {
                // 该顶点已被计算过
                continue;
            }

            // 计算顶点切线空间
            var norvec = locNormal[ curr ];
            var prev   = ((curr + 2) % 3);
            var next   = ((curr + 1) % 3);
            var tanvec = L5.Triangles.computeTangent (
                locPosition[ curr ], locTCoord[ curr ],
                locPosition[ next ], locTCoord[ next ],
                locPosition[ prev ], locTCoord[ prev ]
            );

            // Project T into the tangent plane by projecting out the surface
            // normal N, and then making it unit length.
            tanvec -= norvec.dot (tanvec) * norvec;
            tanvec.normalize ();

            // Compute the bitangent B, another tangent perpendicular to T.
            var binvec = norvec.unitCross (tanvec);

            k = v[ curr ];
            if (hasTangent) {
                locTangent[ k ] = tanvec;
                if (vba.hasBinormal ()) {
                    t      = vba.getBinormal (k);
                    t[ 0 ] = binvec.x;
                    t[ 1 ] = binvec.y;
                    t[ 2 ] = binvec.z;
                }
            }
            else {
                t      = vba.getBinormal (k);
                t[ 0 ] = tanvec.x;
                t[ 1 ] = tanvec.y;
                t[ 2 ] = tanvec.z;
            }
        }
    }
};
/**
 * 计算切线
 *
 * @param position0 {L5.Point}
 * @param tcoord0 {Array}
 * @param position1 {L5.Point}
 * @param tcoord1 {Array}
 * @param position2 {L5.Point}
 * @param tcoord2 {Array}
 * @returns {L5.Vector}
 */
L5.Triangles.computeTangent                          = function (
    position0, tcoord0,
    position1, tcoord1,
    position2, tcoord2
) {
    // Compute the change in positions at the vertex P0.
    var v10 = position1.subP (position0);
    var v20 = position2.subP (position0);

    const ZERO_TOLERANCE = L5.Math.ZERO_TOLERANCE;
    const abs            = L5.Math.abs;

    if (abs (v10.length ()) < ZERO_TOLERANCE ||
        abs (v20.length ()) < ZERO_TOLERANCE) {
        // The triangle is very small, call it degenerate.
        return L5.Vector.ZERO;
    }

    // Compute the change in texture coordinates at the vertex P0 in the
    // direction of edge P1-P0.
    var d1 = tcoord1[ 0 ] - tcoord0[ 0 ];
    var d2 = tcoord1[ 1 ] - tcoord0[ 1 ];
    if (abs (d2) < ZERO_TOLERANCE) {
        // The triangle effectively has no variation in the v texture
        // coordinate.
        if (abs (d1) < ZERO_TOLERANCE) {
            // The triangle effectively has no variation in the u coordinate.
            // Since the texture coordinates do not vary on this triangle,
            // treat it as a degenerate parametric surface.
            return L5.Vector.ZERO;
        }

        // The variation is effectively all in u, so set the tangent vector
        // to be T = dP/du.
        return v10.div (d1);
    }

    // Compute the change in texture coordinates at the vertex P0 in the
    // direction of edge P2-P0.
    var d3  = tcoord2[ 0 ] - tcoord0[ 0 ];
    var d4  = tcoord2[ 1 ] - tcoord0[ 1 ];
    var det = d2 * d3 - d4 * d1;
    if (abs (det) < ZERO_TOLERANCE) {
        // The triangle vertices are collinear in parameter space, so treat
        // this as a degenerate parametric surface.
        return L5.Vector.ZERO;
    }

    // The triangle vertices are not collinear in parameter space, so choose
    // the tangent to be dP/du = (dv1*dP2-dv2*dP1)/(dv1*du2-dv2*du1)
    return v20.scalar (d2).sub (v10.scalar (d4)).div (det);
};