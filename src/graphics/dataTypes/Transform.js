import { Matrix, Point } from '../../math/index';

/**
 * 变换用公式 Y= M*X+T 表示:  
 * - M  3\*3 Matrix, 大部分情况下为
 *  - 旋转矩阵
 *  - 或者 `M = R*S`:
 *   - R = 旋转矩阵
 *   - S = 正缩放对角矩阵  
 *     为支持模型包,允许普通仿射变换  
 *      M可以是任意可逆3*3矩阵
 * - T 平移向量
 * - X 前方向为Y轴的向量  
 * 从Y翻转至X, 一般情况下记做: `X = M^{-1}*(Y-T)`
 *
 * 在 M = R*S 的特殊情况下:
 * `X = S^{-1}*R^t*(Y-T)`
 * - `S^{-1}` S的逆
 * - `R^t` R的转置矩阵
 *
 * 构造默认是个单位变换
 */
class Transform {
    constructor() {
        // The full 4x4 homogeneous matrix H = {{M,T},{0,1}} and its inverse
        // H^{-1} = {M^{-1},-M^{-1}*T},{0,1}}.  The inverse is computed only
        // on demand.

        // 变换矩阵
        this.__matrix = Matrix.IDENTITY;
        // 变换矩阵的逆矩阵
        this._invMatrix = Matrix.IDENTITY;

        this._matrix = Matrix.IDENTITY;     // M (general) or R (rotation)


        this._scale = new Point(1, 1, 1);        // S
        this._translate = Point.ORIGIN;          // T

        this._isIdentity = true;
        this._isRSMatrix = true;
        this._isUniformScale = true;
        this._inverseNeedsUpdate = false;
    }

    /**
     * depth copy a Transform
     * @param {Transform} transform 
     */
    copy(transform) {
        this.__matrix.copy(transform.__matrix);
        this._invMatrix.copy(transform._invMatrix);
        this._matrix.copy(transform._matrix);
        this._scale.copy(transform._scale);
        this._translate.copy(transform._translate);
        this._isIdentity = transform._isIdentity;
        this._isRSMatrix = transform._isRSMatrix;
        this._isUniformScale = transform._isUniformScale;
        this._inverseNeedsUpdate = transform._inverseNeedsUpdate;
    }

    /**
     * 置单位变换
     */
    makeIdentity() {
        this._matrix = Matrix.IDENTITY;
        this._translate.fill(0);
        this._scale.fill(1);
        this._isIdentity = true;
        this._isRSMatrix = true;
        this._isUniformScale = true;
        this._updateMatrix();
        return this;
    }

    /**
     * 缩放置1
     */
    makeUnitScale() {
        console.assert(this._isRSMatrix, 'Matrix is not a rotation');
        this._scale.fill(1);
        this._isUniformScale = true;
        this._updateMatrix();
        return this;
    }

    /**
     * @returns {boolean}
     */
    isIdentity() {
        return this._isIdentity;
    }

    /**
     * R*S
     * @returns {boolean}
     */
    isRSMatrix() {
        return this._isRSMatrix;
    }

    /**
     * R*S, S = c*I
     * @returns {boolean}
     */
    isUniformScale() {
        return this._isRSMatrix && this._isUniformScale;
    }


    // Member access.
    // (1) The Set* functions set the is-identity hint to false.
    // (2) The SetRotate function sets the is-rsmatrix hint to true.  If this
    //     hint is false,  GetRotate fires an "assert" in debug mode.
    // (3) The SetMatrix function sets the is-rsmatrix and is-uniform-scale
    //     hints to false.
    // (4) The SetScale function sets the is-uniform-scale hint to false.
    //     The SetUniformScale function sets the is-uniform-scale hint to
    //     true.  If this hint is false, GetUniformScale fires an "assert" in
    //     debug mode.
    // (5) All Set* functions set the inverse-needs-update to true.  When
    //     GetInverse is called, the inverse must be computed in this case and
    //     the inverse-needs-update is reset to false.
    /**
     * @param {Matrix} rotate
     */
    setRotate(rotate) {
        this._matrix.copy(rotate);
        this._isIdentity = false;
        this._isRSMatrix = true;
        this._updateMatrix();
        return this;
    }

    /**
     * @param {Matrix} matrix
     */
    setMatrix(matrix) {
        this._matrix.copy(matrix);
        this._isIdentity = false;
        this._isRSMatrix = false;
        this._isUniformScale = false;
        this._inverseNeedsUpdate = true;
        this._translate.copy([matrix[12], matrix[13], matrix[14]]);
        this.__matrix.copy(matrix);
        return this;
    }

    /**
     * @param {Point} translate
     */
    setTranslate(translate) {
        this._translate.copy(translate);
        this._isIdentity = false;
        this._updateMatrix();
        return this;
    }

    /**
     * @param {Point} scale
     */
    setScale(scale) {
        console.assert(this._isRSMatrix, 'Matrix is not a rotation');
        console.assert(!this._scale.equals(Point.ORIGIN), 'Scales must be nonzero');
        this._scale.copy(scale);
        this._isIdentity = false;
        this._isUniformScale = false;
        this._updateMatrix();
        return this;
    }

    /**
     * @param {number} scale
     */
    setUniformScale(scale) {
        console.assert(this._isRSMatrix, 'Matrix is not a rotation');
        console.assert(scale !== 0, 'Scale must be nonzero');

        this._scale.fill(scale);
        this._isIdentity = false;
        this._isUniformScale = true;
        this._updateMatrix();
        return this;
    }

    /**
     * @returns {Matrix}
     */
    getRotate() {
        console.assert(this._isRSMatrix, 'Matrix is not a rotation');
        return this._matrix;
    }

    /**
     * @returns {Matrix}
     */
    getMatrix() {
        return this._matrix;
    }

    /**
     * @returns {Point}
     */
    getTranslate() {
        return this._translate;
    }

    /**
     * @returns {Point}
     */
    getScale() {
        console.assert(this._isRSMatrix, 'Matrix is not a rotation-scale');
        return this._scale;
    }

    /**
     * @returns {number}
     */
    getUniformScale() {
        console.assert(this._isRSMatrix, 'Matrix is not a rotation-scale');
        console.assert(this._isUniformScale, 'Matrix is not uniform scale');
        return this._scale[0];
    }


    /**
     * For M = R*S, the largest value of S in absolute value is returned.
     * For general M, the max-row-sum norm is returned, which is a reasonable
     * measure of maximum scale of the transformation.
     * @returns {number}
     */
    getNorm() {
        const abs = Math.abs;
        if (this._isRSMatrix) {
            let maxValue = abs(this._scale[0]);
            if (abs(this._scale[1]) > maxValue) {
                maxValue = abs(this._scale[1]);
            }
            if (abs(this._scale[2]) > maxValue) {
                maxValue = abs(this._scale[2]);
            }
            return maxValue;
        }

        // A general matrix.  Use the max-row-sum matrix norm.  The spectral
        // norm (the maximum absolute value of the eigenvalues) is smaller or
        // equal to this norm.  Therefore, this function returns an approximation
        // to the maximum scale.
        let m = this._matrix;
        let maxRowSum = abs(m[0]) + abs(m[4]) + abs(m[8]);
        let rowSum = abs(m[1]) + abs(m[5]) + abs(m[9]);

        if (rowSum > maxRowSum) {
            maxRowSum = rowSum;
        }
        rowSum = abs(m[2]) + abs(m[6]) + abs(m[10]);
        if (rowSum > maxRowSum) {
            maxRowSum = rowSum;
        }

        return maxRowSum;
    }

    /**
     * @param {Point|Vector} p
     * Matrix-point/vector 乘法, M*p.
     */
    mulPoint(p) {
        return this.__matrix.mulPoint(p);
    }

    /**
     * Matrix-matrix multiplication.
     * @param {Transform} transform
     * @returns {Transform}
     */
    mul(transform) {
        if (this._isIdentity) {
            return transform;
        }

        if (transform.isIdentity()) {
            return this;
        }
        const IsRS = this._isRSMatrix;
        let product = new Transform();

        if (IsRS && transform.isRSMatrix()) {
            if (this._isUniformScale) {
                let scale0 = this._scale[0];
                product.setRotate(this._matrix.mul(transform.getMatrix()));

                product.setTranslate(
                    this._matrix.mulPoint(transform.getTranslate())
                        .scalar(scale0)
                        .add(this._translate)
                );

                if (transform.isUniformScale()) {
                    product.setUniformScale(scale0 * transform.getUniformScale());
                } else {
                    product.setScale(transform.getScale().scalar(scale0));
                }

                return product;
            }
        }

        // In all remaining cases, the matrix cannot be written as R*S*X+T.
        let matMA = (IsRS ? this._matrix.timesDiagonal(this._scale) : this._matrix);
        let matMB = (
            transform.isRSMatrix() ?
                transform.getMatrix().timesDiagonal(transform.getScale()) :
                transform.getMatrix()
        );

        product.setMatrix(matMA.mul(matMB));
        product.setTranslate(matMA.mulPoint(transform.getTranslate()).add(this._translate));
        return product;
    }

    /**
     * Get the homogeneous matrix.
     */
    toMatrix() {
        return this.__matrix;
    }


    /**
     * Get the inverse homogeneous matrix, recomputing it when necessary.
     * If H = {{M,T},{0,1}}, then H^{-1} = {{M^{-1},-M^{-1}*T},{0,1}}.
     * @returns {Matrix}
     */
    inverse() {
        if (!this._inverseNeedsUpdate) {
            return this._invMatrix;
        }
        if (this._isIdentity) {
            this._invMatrix.copy(Matrix.IDENTITY);
            this._inverseNeedsUpdate = false;
            return this._invMatrix;
        }

        let im = this._invMatrix,
            m = this._matrix;

        if (this._isRSMatrix) {
            let [s0, s1, s2] = this._scale;
            if (this._isUniformScale) {
                let invScale = 1 / s0;
                im[0] = invScale * m[0];
                im[4] = invScale * m[1];
                im[8] = invScale * m[2];
                im[1] = invScale * m[4];
                im[5] = invScale * m[5];
                im[9] = invScale * m[6];
                im[2] = invScale * m[8];
                im[6] = invScale * m[9];
                im[10] = invScale * m[10];
            } else {
                // Replace 3 reciprocals by 6 multiplies and 1 reciprocal.
                let s01 = s0 * s1;
                let s02 = s0 * s2;
                let s12 = s1 * s2;
                let invs012 = 1 / (s01 * s2);
                let invS0 = s12 * invs012;
                let invS1 = s02 * invs012;
                let invS2 = s01 * invs012;
                im[0] = invS0 * m[0];
                im[4] = invS0 * m[1];
                im[8] = invS0 * m[2];
                im[1] = invS1 * m[4];
                im[5] = invS1 * m[5];
                im[9] = invS1 * m[6];
                im[2] = invS2 * m[8];
                im[6] = invS2 * m[9];
                im[10] = invS2 * m[10];
            }
        } else {
            Transform.invert3x3(this.__matrix, im);
        }

        let [t0, t1, t2] = this._translate;
        im[12] = -(im[0] * t0 + im[4] * t1 + im[8] * t2);
        im[13] = -(im[1] * t0 + im[5] * t1 + im[9] * t2);
        im[14] = -(im[2] * t0 + im[6] * t1 + im[10] * t2);

        this._inverseNeedsUpdate = false;
        return this._invMatrix;
    }


    /**
     * Get the inversion transform.  No test is performed to determine whether
     * the caller transform is invertible.
     * @returns {Transform}
     */
    inverseTransform() {
        if (this._isIdentity) {
            return Transform.IDENTITY;
        }

        let inverse = new Transform();
        let invTrn = Point.ORIGIN;

        if (this._isRSMatrix) {
            let invRot = this._matrix.transpose();
            let invScale;
            inverse.setRotate(invRot);
            if (this._isUniformScale) {
                invScale = 1 / this._scale[0];
                inverse.setUniformScale(invScale);
                invTrn.copy(invRot.mulPoint(this._translate).scalar(-invScale));
            }
            else {
                invScale = new Point(1 / this._scale[0], 1 / this._scale[1], 1 / this._scale[2]);
                inverse.setScale(invScale);
                invTrn = invRot.mulPoint(this._translate);
                invTrn[0] *= -invScale[0];
                invTrn[1] *= -invScale[1];
                invTrn[2] *= -invScale[2];
            }
        }
        else {
            let invMat = new Matrix();
            Transform.invert3x3(this._matrix, invMat);
            inverse.setMatrix(invMat);
            invTrn.copy(invMat.mulPoint(this._translate).negative());
        }
        inverse.setTranslate(invTrn);

        return inverse;
    }

    /**
     * Fill in the entries of mm whenever one of the components
     * m, mTranslate, or mScale changes.
     * @private
     */
    _updateMatrix() {
        if (this._isIdentity) {
            this.__matrix.identity();
        } else {
            let mm = this.__matrix;
            const m = this._matrix;
            if (this._isRSMatrix) {
                let [s0, s1, s2] = this._scale;
                mm[0] = m[0] * s0;
                mm[4] = m[4] * s1;
                mm[8] = m[8] * s2;
                mm[1] = m[1] * s0;
                mm[5] = m[5] * s1;
                mm[9] = m[9] * s2;
                mm[2] = m[2] * s0;
                mm[6] = m[6] * s1;
                mm[10] = m[10] * s2;
            }
            else {
                mm[0] = m[0];
                mm[1] = m[1];
                mm[2] = m[2];
                mm[4] = m[4];
                mm[5] = m[5];
                mm[6] = m[6];
                mm[8] = m[8];
                mm[9] = m[9];
                mm[10] = m[10];
            }
            [mm[12], mm[13], mm[14]] = this._translate;

            // The last row of mm is always (0,0,0,1) for an affine
            // transformation, so it is set once in the constructor.  It is not
            // necessary to reset it here.
        }

        this._inverseNeedsUpdate = true;
    }

    /**
     * Invert the 3x3 upper-left block of the input matrix.
     * @param {Matrix} mat
     * @param {Matrix} invMat
     * @private
     */
    static invert3x3(mat, invMat) {
        // Compute the adjoint of M (3x3).
        invMat[0] = mat[5] * mat[10] - mat[9] * mat[6];
        invMat[4] = mat[8] * mat[6] - mat[4] * mat[10];
        invMat[8] = mat[4] * mat[9] - mat[8] * mat[5];
        invMat[1] = mat[9] * mat[2] - mat[1] * mat[10];
        invMat[5] = mat[0] * mat[10] - mat[8] * mat[2];
        invMat[9] = mat[8] * mat[1] - mat[0] * mat[9];
        invMat[2] = mat[1] * mat[6] - mat[5] * mat[2];
        invMat[6] = mat[4] * mat[2] - mat[0] * mat[6];
        invMat[10] = mat[0] * mat[5] - mat[4] * mat[1];

        // Compute the reciprocal of the determinant of M.
        let invDet = 1 / (mat[0] * invMat[0] + mat[4] * invMat[1] + mat[8] * invMat[2]);

        // inverse(M) = adjoint(M)/determinant(M).
        invMat[0] = invMat[0] * invDet;
        invMat[4] = invMat[4] * invDet;
        invMat[8] = invMat[8] * invDet;
        invMat[1] = invMat[1] * invDet;
        invMat[5] = invMat[5] * invDet;
        invMat[9] = invMat[9] * invDet;
        invMat[2] = invMat[2] * invDet;
        invMat[6] = invMat[6] * invDet;
        invMat[10] = invMat[10] * invDet;
    }

    static get IDENTITY() {
        return new Transform().makeIdentity();
    }
}

export { Transform };
