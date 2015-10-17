/**
 * Transform
 *
 * 变换用公式 Y= M*X+T 表示:
 *    M - 3*3矩阵, 大部分情况下为旋转矩阵,
 *        或者 M = R*S:
 *        R = 旋转矩阵, S = 正缩放对角矩阵
 *        为支持模型包,允许普通仿射变换, M可以是任意可逆3*3矩阵
 *
 *    T - 平移向量
 *
 *    X - 前方向为Y轴的向量
 *        从Y翻转至X, 一般情况下记做: X = M^{-1}*(Y-T)
 *
 * 在 M = R*S 的特殊情况下, X = S^{-1}*R^t*(Y-T),
 *    S^{-1}   -  S的逆
 *    R^t      -  R的转置矩阵
 *
 * 构造默认是个单位变换
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.Transform = function () {
    // The full 4x4 homogeneous matrix H = {{M,T},{0,1}} and its inverse
    // H^{-1} = {M^{-1},-M^{-1}*T},{0,1}}.  The inverse is computed only
    // on demand.

    // 变换矩阵
    this.__matrix = L5.Matrix.IDENTITY;
    // 变换矩阵的逆矩阵
    this._invMatrix = L5.Matrix.IDENTITY;

    this._matrix = L5.Matrix.IDENTITY;     // M (general) or R (rotation)


    this._scale = new L5.Point(1, 1, 1);        // S
    this._translate = new L5.Point(0, 0, 0);    // T

    this._isIdentity = true;
    this._isRSMatrix = true;
    this._isUniformScale = true;
    this._inverseNeedsUpdate = false;
};
L5.nameFix(L5.Transform, 'Transform');

/**
 * 置单位变换
 */
L5.Transform.prototype.makeIdentity = function () {
    this._matrix = L5.Matrix.IDENTITY;
    this._translate.assign(0);
    this._scale.assign(1);
    this._isIdentity = true;
    this._isRSMatrix = true;
    this._isUniformScale = true;
    this._updateMatrix();
    return this;
};
/**
 * 缩放置1
 */
L5.Transform.prototype.makeUnitScale = function () {
    L5.assert(this._isRSMatrix, 'Matrix is not a rotation');
    this._scale.assign(1);
    this._isUniformScale = true;
    this._updateMatrix();
    return this;
};

/**
 * I
 * @returns {boolean}
 */
L5.Transform.prototype.isIdentity = function () {
    return this._isIdentity;
};
/**
 * R*S
 * @returns {boolean}
 */
L5.Transform.prototype.isRSMatrix = function () {
    return this._isRSMatrix;
};
/**
 * R*S, S = c*I
 * @returns {boolean}
 */
L5.Transform.prototype.isUniformScale = function () {
    return this._isRSMatrix && this._isUniformScale;
};


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
 * @param rotate {L5.Matrix}
 */
L5.Transform.prototype.setRotate = function (rotate) {
    this._matrix = rotate;
    this._isIdentity = false;
    this._isRSMatrix = true;
    this._updateMatrix();
    return this;
};
/**
 * @param matrix {L5.Matrix}
 */
L5.Transform.prototype.setMatrix = function (matrix) {
    this._matrix = matrix;
    this._isIdentity = false;
    this._isRSMatrix = false;
    this._isUniformScale = false;
    this._updateMatrix();
    return this;
};

/**
 * @param translate {L5.Point}
 */
L5.Transform.prototype.setTranslate = function (translate) {
    this._translate = translate;
    this._isIdentity = false;
    this._updateMatrix();
    return this;
};
/**
 * @param scale {L5.Point}
 */
L5.Transform.prototype.setScale = function (scale) {
    L5.assert(this._isRSMatrix, 'Matrix is not a rotation');
    L5.assert(!this._scale.equals(L5.Point.ORIGIN), 'Scales must be nonzero');
    this._scale.copy(scale);
    this._isIdentity = false;
    this._isUniformScale = false;
    this._updateMatrix();
    return this;
};
/**
 * @param scale {number}
 */
L5.Transform.prototype.setUniformScale = function (scale) {
    L5.assert(this._isRSMatrix, 'Matrix is not a rotation');
    L5.assert(scale !== 0, 'Scale must be nonzero');

    this._scale.assign(scale);
    this._isIdentity = false;
    this._isUniformScale = true;
    this._updateMatrix();
    return this;
};
/**
 * @returns {L5.Matrix}
 */
L5.Transform.prototype.getRotate = function () {
    L5.assert(this._isRSMatrix, 'Matrix is not a rotation');
    return this._matrix;
};
/**
 * @returns {L5.Matrix}
 */
L5.Transform.prototype.getMatrix = function () {
    return this._matrix;
};
/**
 * @returns {L5.Point}
 */
L5.Transform.prototype.getTranslate = function () {
    return this._translate;
};
/**
 * @returns {L5.Point}
 */
L5.Transform.prototype.getScale = function () {
    L5.assert(this._isRSMatrix, 'Matrix is not a rotation-scale');
    return this._scale;
};
/**
 * @returns {number}
 */
L5.Transform.prototype.getUniformScale = function () {
    L5.assert(this._isRSMatrix, 'Matrix is not a rotation-scale');
    L5.assert(this._isUniformScale, 'Matrix is not uniform scale');
    return this._scale[0];
};

// For M = R*S, the largest value of S in absolute value is returned.
// For general M, the max-row-sum norm is returned, which is a reasonable
// measure of maximum scale of the transformation.
/**
 *
 * @returns {number}
 */
L5.Transform.prototype.getNorm = function () {
    const abs = L5.Math.abs;
    if (this._isRSMatrix) {
        var maxValue = abs(this._scale[0]);
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
    var m = this._matrix;
    var maxRowSum = abs(m.item(0, 0)) + abs(m.item(0, 1)) + abs(m.item(0, 2));
    var rowSum = abs(m.item(1, 0)) + abs(m.item(1, 1)) + abs(m.item(1, 2));

    if (rowSum > maxRowSum) {
        maxRowSum = rowSum;
    }
    rowSum = abs(m.item(2, 0)) + abs(m.item(2, 1)) + abs(m.item(2, 2));
    if (rowSum > maxRowSum) {
        maxRowSum = rowSum;
    }

    return maxRowSum;
};

/**
 * @param p {L5.Point|L5.Vector}
 * Matrix-point/vector 乘法, M*p.
 */
L5.Transform.prototype.mulPoint = function (p) {
    return this.__matrix.mulPoint(p);
};

/**
 * Matrix-matrix multiplication.
 * @param transform {L5.Transform}
 * @returns {L5.Transform}
 */
L5.Transform.prototype.mul = function (transform) {
    if (this._isIdentity) {
        return transform;
    }

    if (transform.isIdentity()) {
        return this;
    }
    const IsRS = this._isRSMatrix;
    var product = new L5.Transform();

    if (IsRS && transform.isRSMatrix()) {
        if (this._isUniformScale) {
            var scale0 = this._scale[0];
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
    var matMA = (IsRS ? this._matrix.timesDiagonal(this._scale) : this._matrix);
    var matMB = (
        transform.isRSMatrix() ?
            transform.getMatrix().timesDiagonal(transform.getScale()) :
            transform.getMatrix()
    );

    product.setMatrix(matMA.mul(matMB));
    product.setTranslate(matMA.mulPoint(transform.getTranslate()).add(this._translate));
    return product;
};
/**
 * Get the homogeneous matrix.
 */
L5.Transform.prototype.toMatrix = function () {
    return this.__matrix;
};

/**
 * Get the inverse homogeneous matrix, recomputing it when necessary.
 * If H = {{M,T},{0,1}}, then H^{-1} = {{M^{-1},-M^{-1}*T},{0,1}}.
 * @returns {L5.Matrix}
 */
L5.Transform.prototype.inverse = function () {
    if (!this._inverseNeedsUpdate) {
        return this._invMatrix;
    }
    if (this._isIdentity) {
        this._invMatrix = L5.Matrix.IDENTITY;
        this._inverseNeedsUpdate = false;
        return this._invMatrix;
    }

    var im = this._invMatrix,
        m = this._matrix;

    if (this._isRSMatrix) {
        var s0 = this._scale[0],
            s1 = this._scale[1],
            s2 = this._scale[2];

        if (this._isUniformScale) {
            var invScale = 1 / s0;
            im.setItem(0, 0, invScale * m.item(0, 0));
            im.setItem(0, 1, invScale * m.item(1, 0));
            im.setItem(0, 2, invScale * m.item(2, 0));
            im.setItem(1, 0, invScale * m.item(0, 1));
            im.setItem(1, 1, invScale * m.item(1, 1));
            im.setItem(1, 2, invScale * m.item(2, 1));
            im.setItem(2, 0, invScale * m.item(0, 2));
            im.setItem(2, 1, invScale * m.item(1, 2));
            im.setItem(2, 2, invScale * m.item(2, 2));
        } else {
            // Replace 3 reciprocals by 6 multiplies and 1 reciprocal.
            var s01 = s0 * s1;
            var s02 = s0 * s2;
            var s12 = s1 * s2;
            var invs012 = 1 / (s01 * s2);
            var invS0 = s12 * invs012;
            var invS1 = s02 * invs012;
            var invS2 = s01 * invs012;
            im.setItem(0, 0, invS0 * m.item(0, 0));
            im.setItem(0, 1, invS0 * m.item(1, 0));
            im.setItem(0, 2, invS0 * m.item(2, 0));
            im.setItem(1, 0, invS1 * m.item(0, 1));
            im.setItem(1, 1, invS1 * m.item(1, 1));
            im.setItem(1, 2, invS1 * m.item(2, 1));
            im.setItem(2, 0, invS2 * m.item(0, 2));
            im.setItem(2, 1, invS2 * m.item(1, 2));
            im.setItem(2, 2, invS2 * m.item(2, 2));
        }
    } else {
        L5.Transform.invert3x3(this.__matrix, im);
    }

    var t0 = this._translate[0],
        t1 = this._translate[1],
        t2 = this._translate[2];
    im.setItem(0, 3, -(im.item(0, 0) * t0 + im.item(0, 1) * t1 + im.item(0, 2) * t2));
    im.setItem(1, 3, -(im.item(1, 0) * t0 + im.item(1, 1) * t1 + im.item(1, 2) * t2));
    im.setItem(2, 3, -(im.item(2, 0) * t0 + im.item(2, 1) * t1 + im.item(2, 2) * t2));

    this._inverseNeedsUpdate = false;
    return this._invMatrix;
};

/**
 * Get the inversion transform.  No test is performed to determine whether
 * the caller transform is invertible.
 * @returns {L5.Transform}
 */
L5.Transform.prototype.inverseTransform = function () {
    if (this._isIdentity) {
        return L5.Transform.IDENTIRY;
    }

    var inverse = new L5.Transform();
    var invTrn = new L5.Point();

    if (this._isRSMatrix) {
        var invRot = this._matrix.transpose();
        var invScale;
        inverse.setRotate(invRot);
        if (this._isUniformScale) {
            invScale = 1 / this._scale[0];
            inverse.setUniformScale(invScale);
            invTrn = invRot.mulPoint(this._translate).scalar(-invScale);
        }
        else {
            invScale = new L5.Point(1 / this._scale[0], 1 / this._scale[1], 1 / this._scale[2]);
            inverse.setScale();
            invTrn = invRot.mulPoint(this._translate);
            invTrn[0] *= -invScale[0];
            invTrn[1] *= -invScale[1];
            invTrn[2] *= -invScale[2];
        }
    }
    else {
        var invMat = new L5.Matrix();
        L5.Transform.invert3x3(this._matrix, invMat);
        inverse.setMatrix(invMat);
        invTrn = invMat.mulPoint(this._translate).negative();
    }
    inverse.setTranslate(invTrn);

    return inverse;
};

/**
 * Fill in the entries of mm whenever one of the components
 * m, mTranslate, or mScale changes.
 * @private
 */
L5.Transform.prototype._updateMatrix = function () {
    if (this._isIdentity) {
        this.__matrix = L5.Matrix.IDENTITY;
    }
    else {
        var mm = this.__matrix;
        var m = this._matrix;

        if (this._isRSMatrix) {
            var s0 = this._scale[0],
                s1 = this._scale[1],
                s2 = this._scale[2];

            mm.setItem(0, 0, m.item(0, 0) * s0);
            mm.setItem(0, 1, m.item(0, 1) * s1);
            mm.setItem(0, 2, m.item(0, 2) * s2);
            mm.setItem(1, 0, m.item(1, 0) * s0);
            mm.setItem(1, 1, m.item(1, 1) * s1);
            mm.setItem(1, 2, m.item(1, 2) * s2);
            mm.setItem(2, 0, m.item(2, 0) * s0);
            mm.setItem(2, 1, m.item(2, 1) * s1);
            mm.setItem(2, 2, m.item(2, 2) * s2);
        }
        else {
            mm.setItem(0, 0, m.item(0, 0));
            mm.setItem(0, 1, m.item(0, 1));
            mm.setItem(0, 2, m.item(0, 2));
            mm.setItem(1, 0, m.item(1, 0));
            mm.setItem(1, 1, m.item(1, 1));
            mm.setItem(1, 2, m.item(1, 2));
            mm.setItem(2, 0, m.item(2, 0));
            mm.setItem(2, 1, m.item(2, 1));
            mm.setItem(2, 2, m.item(2, 2));
        }

        mm.setItem(0, 3, this._translate[0]);
        mm.setItem(1, 3, this._translate[1]);
        mm.setItem(2, 3, this._translate[2]);

        // The last row of mm is always (0,0,0,1) for an affine
        // transformation, so it is set once in the constructor.  It is not
        // necessary to reset it here.
    }

    this._inverseNeedsUpdate = true;
};

/**
 * Invert the 3x3 upper-left block of the input matrix.
 * @param mat {L5.Matrix}
 * @param invMat {L5.Matrix}
 * @private
 */
L5.Transform.invert3x3 = function (mat, invMat) {
    // Compute the adjoint of M (3x3).
    invMat.setItem(0, 0, mat.item(1, 1) * mat.item(2, 2) - mat.item(1, 2) * mat.item(2, 1));
    invMat.setItem(0, 1, mat.item(0, 2) * mat.item(2, 1) - mat.item(0, 1) * mat.item(2, 2));
    invMat.setItem(0, 2, mat.item(0, 1) * mat.item(1, 2) - mat.item(0, 2) * mat.item(1, 1));
    invMat.setItem(1, 0, mat.item(1, 2) * mat.item(2, 0) - mat.item(1, 0) * mat.item(2, 2));
    invMat.setItem(1, 1, mat.item(0, 0) * mat.item(2, 2) - mat.item(0, 2) * mat.item(2, 0));
    invMat.setItem(1, 2, mat.item(0, 2) * mat.item(1, 0) - mat.item(0, 0) * mat.item(1, 2));
    invMat.setItem(2, 0, mat.item(1, 0) * mat.item(2, 1) - mat.item(1, 1) * mat.item(2, 0));
    invMat.setItem(2, 1, mat.item(0, 1) * mat.item(2, 0) - mat.item(0, 0) * mat.item(2, 1));
    invMat.setItem(2, 2, mat.item(0, 0) * mat.item(1, 1) - mat.item(0, 1) * mat.item(1, 0));

    // Compute the reciprocal of the determinant of M.
    var invDet = 1 / (
            mat.item(0, 0) * invMat.item(0, 0) +
            mat.item(0, 1) * invMat.item(1, 0) +
            mat.item(0, 2) * invMat.item(2, 0)
        );

    // inverse(M) = adjoint(M)/determinant(M).
    invMat.setItem(0, 0, invMat.item(0, 0) * invDet);
    invMat.setItem(0, 1, invMat.item(0, 1) * invDet);
    invMat.setItem(0, 2, invMat.item(0, 2) * invDet);
    invMat.setItem(1, 0, invMat.item(1, 0) * invDet);
    invMat.setItem(1, 1, invMat.item(1, 1) * invDet);
    invMat.setItem(1, 2, invMat.item(1, 2) * invDet);
    invMat.setItem(2, 0, invMat.item(2, 0) * invDet);
    invMat.setItem(2, 1, invMat.item(2, 1) * invDet);
    invMat.setItem(2, 2, invMat.item(2, 2) * invDet);
};
Object.defineProperty(
    L5.Transform,
    'IDENTIRY',
    {
        get: function () {
            return new L5.Transform().makeIdentity();
        }
    }
);

