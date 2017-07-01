import { Visual } from './Visual';
import { VertexBufferAccessor } from '../resources/namespace';
import { Point, Vector } from '../../math/index';
import { Renderer } from '../renderer/Renderer';

class Triangles extends Visual {

    /**
     * @abstract
     */
    getNumTriangles() {
        throw new Error('Method:' + this.constructor.name + '.getNumTriangles not defined.');
    }

    /**
     * @param {number} index
     * @param {Array<number>} output
     * @return {boolean}
     * @abstract
     */
    getTriangle(index, output) {
        throw new Error('Method:' + this.constructor.name + '.getTriangle not defined.');
    }

    /**
     * @return {number}
     */
    getNumVertices() {
        return this.vertexBuffer.numElements;
    }

    /**
     * 获取物体坐标系的三角形顶点数组
     * @param {number} i
     * @param {Array<Point>} modelTriangle
     */
    getModelTriangle(i, modelTriangle) {
        let v = new Array(3);
        if (this.getTriangle(i, v)) {
            let vba = new VertexBufferAccessor(this.format, this.vertexBuffer);
            let p = vba.getPosition(v[0]);
            modelTriangle[0] = new Point(p[0], p[1], p[2]);

            p = vba.getPosition(v[1]);
            modelTriangle[1] = new Point(p[0], p[1], p[2]);

            p = vba.getPosition(v[2]);
            modelTriangle[2] = new Point(p[0], p[1], p[2]);
            return true;
        }
        return false;
    }

    /**
     * 获取世界坐标系的三角形顶点数组
     * @param {number} i
     * @param {Point} worldTriangle
     */
    getWorldTriangle(i, worldTriangle) {
        let pos = new Array(3);
        if (this.getModelTriangle(i, pos)) {
            worldTriangle[0] = this.worldTransform.mulPoint(pos[0]);
            worldTriangle[1] = this.worldTransform.mulPoint(pos[1]);
            worldTriangle[2] = this.worldTransform.mulPoint(pos[2]);
            return true;
        }
        return false;
    }

    /**
     * @param {number} v
     * @returns {Point}
     */
    getPosition(v) {
        let index = this.format.getIndex(VertexFormat.AU_POSITION);
        if (index >= 0) {
            let offset = this.format.getOffset(index);
            let stride = this.format.stride;
            let start = offset + v * stride;
            return new Point(
                new Float32Array(this.vertexBuffer.getData(), start, 3)
            );
        }

        console.assert(false, 'GetPosition failed.');
        return new Point(0, 0, 0);
    }

    updateModelSpace(type) {
        this.updateModelBound();
        if (type === Visual.GU_MODEL_BOUND_ONLY) {
            return;
        }

        let vba = VertexBufferAccessor.fromVisual(this);
        if (vba.hasNormal()) {
            this.updateModelNormals(vba);
        }

        if (type !== Visual.GU_NORMALS) {
            if (vba.hasTangent() || vba.hasBinormal()) {
                if (type === Visual.GU_USE_GEOMETRY) {
                    this.updateModelTangentsUseGeometry(vba);
                }
                else {
                    this.updateModelTangentsUseTCoords(vba);
                }
            }
        }

        Renderer.updateAll(this.vertexBuffer, this.format);
    }

    /**
     * @param {VertexBufferAccessor} vba
     */
    updateModelNormals(vba) {
        const numTriangles = this.getNumTriangles();

        let i, t, pos0, pos1, pos2, tv0, tv1, tNormal,
            v = new Uint32Array(3);

        for (i = 0; i < numTriangles; ++i) {
            // Get the vertex indices for the triangle.
            if (!this.getTriangle(i, v)) {
                continue;
            }
            pos0 = new Point(vba.getPosition(v[0]));
            pos1 = new Point(vba.getPosition(v[1]));
            pos2 = new Point(vba.getPosition(v[2]));

            tv0 = pos1.subAsVector(pos0); // pos1 - pos0
            tv1 = pos2.subAsVector(pos0); // pos2 - pos0
            tNormal = tv0.cross(tv1);
            vba.setNormal(v[0], tNormal.add(vba.getNormal(v[0])));
            vba.setNormal(v[1], tNormal.add(vba.getNormal(v[1])));
            vba.setNormal(v[2], tNormal.add(vba.getNormal(v[2])));
        }

        const numVertices = this.getNumVertices();
        tNormal = Vector.ZERO;
        for (i = 0; i < numVertices; ++i) {
            tNormal.copy(vba.getNormal(i)).normalize();
            vba.setNormal(i, tNormal);
        }
    }

    /**
     * 更新物体模型空间切线
     * @param {VertexBufferAccessor} vba
     */
    updateModelTangentsUseGeometry(vba) {
        // Compute the matrix of normal derivatives.
        const numVertices = vba.getNumVertices();
        let dNormal = new Array(numVertices);
        let wwTrn = new Array(numVertices);
        let dwTrn = new Array(numVertices);
        let i, j, row, col;

        for (i = 0; i < numTriangles; ++i) {
            wwTrn[i] = new Matrix().zero();
            dwTrn[i] = new Matrix().zero();
            dNormal[i] = new Matrix().zero();

            // 获取三角形的3个顶点索引.
            let v = new Array(3);
            if (!this.getTriangle(i, v)) {
                continue;
            }

            for (j = 0; j < 3; j++) {
                // 获取顶点坐标和法线.
                let v0 = v[j];
                let v1 = v[(j + 1) % 3];
                let v2 = v[(j + 2) % 3];
                let pos0 = new Point(vba.getPosition(v0));
                let pos1 = new Point(vba.getPosition(v1));
                let pos2 = new Point(vba.getPosition(v2));
                let nor0 = new Vector(vba.getNormal(v0));
                let nor1 = new Vector(vba.getNormal(v1));
                let nor2 = new Vector(vba.getNormal(v2));

                // 计算从pos0到pos1的边,使其射向顶点切面，然后计算相邻法线的差
                let edge = pos1.subAsVector(pos0);
                let proj = edge.sub(nor0.scalar(edge.dot(nor0)));
                let diff = nor1.sub(nor0);
                for (row = 0; row < 3; ++row) {
                    for (col = 0; col < 3; ++col) {
                        wwTrn[v0].setItem(row, col, wwTrn.item(row, col) + proj[row] * proj[col]);
                        dwTrn[v0].setItem(row, col, dwTrn.item(row, col) + diff[row] * proj[col]);
                    }
                }

                // 计算从pos0到pos2的边,使其射向顶点切面，然后计算相邻法线的差
                edge = pos2.subAsVector(pos0);
                proj = edge.sub(nor0.scalar(edge.dot(nor0)));
                diff = nor2.sub(nor0);
                for (row = 0; row < 3; ++row) {
                    for (col = 0; col < 3; ++col) {
                        wwTrn[v0].setItem(row, col, wwTrn.item(row, col) + proj[row] * proj[col]);
                        dwTrn[v0].setItem(row, col, dwTrn.item(row, col) + diff[row] * proj[col]);
                    }
                }
            }
        }

        // Add N*N^T to W*W^T for numerical stability.  In theory 0*0^T is added
        // to D*W^T, but of course no update is needed in the implementation.
        // Compute the matrix of normal derivatives.
        for (i = 0; i < numVertices; ++i) {
            let nor = vba.getNormal(i);
            for (row = 0; row < 3; ++row) {
                for (col = 0; col < 3; ++col) {
                    wwTrn[i].setItem(row, col, 0.5 * wwTrn[i].item(row, col) + nor[row] * nor[col]);
                    dwTrn[i].setItem(row, col, dwTrn[i].item(row, col) * 0.5);
                }
            }

            wwTrn[i].setColumn(3, Point.ORIGIN);
            dNormal[i] = dwTrn[i].mul(wwTrn[i]).inverse();
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
            let norvec = new Vector(vba.getNormal(i));
            let uvec = new Vector(),
                vvec = new Vector();

            Vector.generateComplementBasis(uvec, vvec, norvec);

            // Compute S = J^T * dN/dX * J.  In theory S is symmetric, but
            // because we have estimated dN/dX, we must slightly adjust our
            // calculations to make sure S is symmetric.
            let s01 = uvec.dot(dNormal[i].mulPoint(vvec));
            let s10 = vvec.dot(dNormal[i].mulPoint(uvec));
            let sAvr = 0.5 * (s01 + s10);
            let smat = [
                [uvec.dot(dNormal[i].mulPoint(uvec)), sAvr],
                [sAvr, vvec.dot(dNormal[i].mulPoint(vvec))]
            ];

            // Compute the eigenvalues of S (min and max curvatures).
            let trace = smat[0][0] + smat[1][1];
            let det = smat[0][0] * smat[1][1] - smat[0][1] * smat[1][0];
            let discr = trace * trace - 4.0 * det;
            let rootDiscr = Math.sqrt(Math.abs(discr));
            let minCurvature = 0.5 * (trace - rootDiscr);
            // float maxCurvature = 0.5f*(trace + rootDiscr);

            // Compute the eigenvectors of S.
            let evec0 = new Vector(smat[0][1], minCurvature - smat[0][0], 0);
            let evec1 = new Vector(minCurvature - smat[1][1], smat[1][0], 0);

            let tanvec, binvec;
            if (evec0.squaredLength() >= evec1.squaredLength()) {
                evec0.normalize();
                tanvec = uvec.scalar(evec0.x).add(vvec.scalar(evec0.y));
                binvec = norvec.cross(tanvec);
            }
            else {
                evec1.normalize();
                tanvec = uvec.scalar(evec1.x).add(vvec.scalar(evec1.y));
                binvec = norvec.cross(tanvec);
            }

            if (vba.hasTangent()) {
                let t = vba.getTangent(i);
                t[0] = tanvec.x;
                t[1] = tanvec.y;
                t[2] = tanvec.z;
            }

            if (vba.hasBinormal()) {
                let b = vba.getBinormal(i);
                b[0] = binvec.x;
                b[1] = binvec.y;
                b[2] = binvec.z;
            }
        }
        dNormal = null;
    }

    /**
     * @param {VertexBufferAccessor} vba
     */
    updateModelTangentsUseTCoords(vba) {
        // Each vertex can be visited multiple times, so compute the tangent
        // space only on the first visit.  Use the zero vector as a flag for the
        // tangent vector not being computed.
        const numVertices = vba.getNumVertices();
        let hasTangent = vba.hasTangent();
        let zero = Vector.ZERO;
        let i, t;
        if (hasTangent) {
            for (i = 0; i < numVertices; ++i) {
                t = vba.getTangent(i);
                t[0] = 0;
                t[1] = 0;
                t[2] = 0;
            }
        } else {
            for (i = 0; i < numVertices; ++i) {
                t = vba.getBinormal(i);
                t[0] = 0;
                t[1] = 0;
                t[2] = 0;
            }
        }

        const numTriangles = this.getNumTriangles();
        for (i = 0; i < numTriangles; i++) {
            // Get the triangle vertices' positions, normals, tangents, and
            // texture coordinates.
            let v = [0, 0, 0];
            if (!this.getTriangle(i, v)) {
                continue;
            }

            let locPosition = new Array(3);
            let locNormal = new Array(3);
            let locTangent = new Array(3);
            let locTCoord = new Array(2);
            let curr, k;
            for (curr = 0; curr < 3; ++curr) {
                k = v[curr];
                locPosition[curr] = new Point(vba.getPosition(k));
                locNormal[curr] = new Vector(vba.getNormal(k));
                locTangent[curr] = new Vector((hasTangent ? vba.getTangent(k) : vba.getBinormal(k)));
                locTCoord[curr] = vba.getTCoord(0, k);
            }

            for (curr = 0; curr < 3; ++curr) {
                let currLocTangent = locTangent[curr];
                if (!currLocTangent.equals(zero)) {
                    // 该顶点已被计算过
                    continue;
                }

                // 计算顶点切线空间
                let norvec = locNormal[curr];
                let prev = ((curr + 2) % 3);
                let next = ((curr + 1) % 3);
                let tanvec = Triangles.computeTangent(
                    locPosition[curr], locTCoord[curr],
                    locPosition[next], locTCoord[next],
                    locPosition[prev], locTCoord[prev]
                );

                // Project T into the tangent plane by projecting out the surface
                // normal N, and then making it unit length.
                tanvec -= norvec.dot(tanvec) * norvec;
                tanvec.normalize();

                // Compute the bitangent B, another tangent perpendicular to T.
                let binvec = norvec.unitCross(tanvec);

                k = v[curr];
                if (hasTangent) {
                    locTangent[k] = tanvec;
                    if (vba.hasBinormal()) {
                        t = vba.getBinormal(k);
                        t[0] = binvec.x;
                        t[1] = binvec.y;
                        t[2] = binvec.z;
                    }
                }
                else {
                    t = vba.getBinormal(k);
                    t[0] = tanvec.x;
                    t[1] = tanvec.y;
                    t[2] = tanvec.z;
                }
            }
        }
    }

    /**
     * 计算切线
     *
     * @param {Point} position0
     * @param {Array<number>} tcoord0
     * @param {Point} position1
     * @param {Array<number>} tcoord1
     * @param {Point} position2
     * @param {Array<number>} tcoord2
     * @returns {Vector}
     */
    static computeTangent(position0, tcoord0,
        position1, tcoord1,
        position2, tcoord2) {
        // Compute the change in positions at the vertex P0.
        let v10 = position1.subAsVector(position0);
        let v20 = position2.subAsVector(position0);

        const ZERO_TOLERANCE = Math.ZERO_TOLERANCE;
        const abs = Math.abs;

        if (abs(v10.length()) < ZERO_TOLERANCE ||
            abs(v20.length()) < ZERO_TOLERANCE) {
            // The triangle is very small, call it degenerate.
            return Vector.ZERO;
        }

        // Compute the change in texture coordinates at the vertex P0 in the
        // direction of edge P1-P0.
        let d1 = tcoord1[0] - tcoord0[0];
        let d2 = tcoord1[1] - tcoord0[1];
        if (abs(d2) < ZERO_TOLERANCE) {
            // The triangle effectively has no letiation in the v texture
            // coordinate.
            if (abs(d1) < ZERO_TOLERANCE) {
                // The triangle effectively has no letiation in the u coordinate.
                // Since the texture coordinates do not lety on this triangle,
                // treat it as a degenerate parametric surface.
                return Vector.ZERO;
            }

            // The letiation is effectively all in u, so set the tangent vector
            // to be T = dP/du.
            return v10.div(d1);
        }

        // Compute the change in texture coordinates at the vertex P0 in the
        // direction of edge P2-P0.
        let d3 = tcoord2[0] - tcoord0[0];
        let d4 = tcoord2[1] - tcoord0[1];
        let det = d2 * d3 - d4 * d1;
        if (abs(det) < ZERO_TOLERANCE) {
            // The triangle vertices are collinear in parameter space, so treat
            // this as a degenerate parametric surface.
            return Vector.ZERO;
        }

        // The triangle vertices are not collinear in parameter space, so choose
        // the tangent to be dP/du = (dv1*dP2-dv2*dP1)/(dv1*du2-dv2*du1)
        return v20.scalar(d2).sub(v10.scalar(d4)).div(det);
    }
}

export { Triangles };