/**
 * Camera - 摄像机构造
 *
 * @param isPerspective {boolean} 是否是透视相机, true-透视, false-正交
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.Camera = function (
    isPerspective /* default : false */
) {
    L5.D3Object.call(this);

    this.isPerspective = isPerspective;

    this.position  = L5.Point.ORIGIN;
    this.direction = L5.Vector.UNIT_Z.negative (); //-z
    this.up    = L5.Vector.UNIT_Y;
    this.right = L5.Vector.UNIT_X;

    // 摄像机视图矩阵
    this.viewMatrix = L5.Matrix.IDENTIRY;

    // 视截体存储结构, 存储顺序 NEAR-FAR-BOTTOM-TOP-LEFT-RIGHT
    this.frustum = new Float32Array (6);

    // 摄像机投影矩阵
    this.projectionMatrix = L5.Matrix.IDENTIRY;

    // 投影视图矩阵， 即投影矩阵和视图矩阵的乘积
    // 当视图前置/后置矩阵不为空时会包含它们
    this.projectionViewMatrix = L5.Matrix.IDENTIRY;

    // 视图前置矩阵，位置在模型矩阵之后，但在视图矩阵之前
    // 用于对物体的变换， 例如反射等，默认为单位矩阵
    this.preViewMatrix     = L5.Matrix.IDENTIRY;
    this.preViewIsIdentity = true;

    // 视图后置矩阵，用于屏幕空间转换，例如反射渲染后的图像等，默认为单位矩阵
    this.postProjectionMatrix     = L5.Matrix.IDENTIRY;
    this.postProjectionIsIdentity = true;

    // 初始化
    this.setFrame (this.position, this.direction, this.up, this.right);
    this.setPerspective (90, 1, 1, 10000);
    this.setPreViewMatrix (L5.Matrix.IDENTIRY);
    this.setPostProjectionMatrix (L5.Matrix.IDENTIRY);
};

L5.nameFix(L5.Camera, 'Camera');
L5.extendFix (L5.Camera, L5.D3Object);


////////////////////// const 视截体常量定义 //////////////////////
L5.VF_NEAR     = 0;
L5.VF_FAR      = 1;
L5.VF_BOTTOM   = 2;
L5.VF_TOP      = 3;
L5.VF_LEFT     = 4;
L5.VF_RIGHT    = 5;
L5.VF_QUANTITY = 6;

// method

/**
 * 摄像机的向量使用世界坐标系.
 *
 * @param position  {L5.Point } 位置 default (0, 0,  0; 1)
 * @param direction {L5.Vector} 观察方向 default (0, 0, -1; 0)
 * @param up        {L5.Vector} 上方向 default default (0, 1, 0; 0)
 * @param right     {L5.Vector} 右方向 default (1, 0,  0; 0)
 * @returns {void}
 */
L5.Camera.prototype.setFrame = function (
    position, direction, up, right
) {
    this.position = position;
    this.setAxes (direction, up, right);
};

/**
 * 设置摄像机位置
 * @param position {L5.Point}
 * @returns {void}
 */
L5.Camera.prototype.setPosition = function (
    position
) {
    this.position = position;
    this.onFrameChange ();
};

/**
 * 设置摄像机坐标系统的3个轴
 * @param direction {L5.Vector} 观察方向
 * @param up        {L5.Vector} 上方向
 * @param right     {L5.Vector} 右方向
 * @returns {void}
 */
L5.Camera.prototype.setAxes = function (
    direction, up, right
) {
    this.direction = direction;
    this.up        = up;
    this.right     = right;

    var epsilon = 0.001;
    var det     = direction.dot (up.cross (right));
    if (Math.abs (1 - det) > epsilon) {
        // The input vectors do not appear to form an orthonormal set.
        // Time to renormalize.
        L5.Vector.orthonormalize (this.direction, this.up, this.right);
    }
    this.onFrameChange ();
};

/**
 * 设置投影矩阵参数
 * @param fov         {number} 垂直视角
 * @param aspectRatio {number} 高宽比
 * @param near        {number} 近平面
 * @param far         {number} 远平面
 * @returns {void}
 */
L5.Camera.prototype.setPerspective = function (
    fov, aspectRatio, near, far
) {
    var halfAngleRadians = fov * L5.Math.PI / 360;

    this.frustum[ L5.VF_TOP ] = near * L5.Math.tan (halfAngleRadians);
    this.frustum[ L5.VF_BOTTOM ] = -this.frustum[ L5.VF_TOP ];
    this.frustum[ L5.VF_RIGHT ]  = aspectRatio * this.frustum[ L5.VF_TOP ];
    this.frustum[ L5.VF_LEFT ]   = -this.frustum[ L5.VF_RIGHT ];
    this.frustum[ L5.VF_NEAR ]   = near;
    this.frustum[ L5.VF_FAR ]    = far;

    this.onFrustumChange ();
};

/**
 * 返回透视图的4个参数
 * returns {Float32Array} [fov, aspect, near, far]
 */
L5.Camera.prototype.getPerspective = function () {
    var ret = new Float32Array (4);

    if (
        this.frustum[ L5.VF_LEFT ] == -this.frustum[ L5.VF_RIGHT ] &&
        this.frustum[ L5.VF_BOTTOM ] == -this.frustum[ L5.VF_TOP ]
    ) {
        var tmp  = this.frustum[ L5.VF_TOP ] / this.frustum[ L5.VF_NEAR ];
        ret[ 0 ] = L5.Math.atan (tmp) * 360 / L5.Math.PI;
        ret[ 1 ] = this.frustum[ L5.VF_RIGHT ] / this.frustum[ L5.VF_TOP ];
        ret[ 2 ] = this.frustum[ L5.VF_NEAR ];
        ret[ 3 ] = this.frustum[ L5.VF_FAR ];
    }
    return ret;
};

/**
 * 通过6个面的参数设置视截体
 * @param near   {number} 近平面
 * @param far    {number} 远平面
 * @param bottom {number} 底面
 * @param top    {number} 顶面
 * @param left   {number} 左面
 * @param right  {number} 右面
 * @returns {void}
 */
L5.Camera.prototype.setFrustum = function (
    near, far, bottom, top, left, right
) {
    this.frustum[ L5.VF_NEAR ]   = near;
    this.frustum[ L5.VF_FAR ]    = far;
    this.frustum[ L5.VF_BOTTOM ] = bottom;
    this.frustum[ L5.VF_TOP ]    = top;
    this.frustum[ L5.VF_LEFT ]   = left;
    this.frustum[ L5.VF_RIGHT ]  = right;

    this.onFrustumChange ();
};

/**
 * p00 {L5.Point}
 * p10 {L5.Point}
 * p11 {L5.Point}
 * p01 {L5.Point}
 * nearExtrude {number}
 * farExtrude {number}
 *
 */
L5.Camera.prototype.setProjectionMatrix = function (
    p00, p10, p11, p01,
    nearExtrude, farExtrude
) {

    var // 计算近平面
        q000 = p00.scalar (nearExtrude),
        q100 = p01.scalar (nearExtrude),
        q110 = p11.scalar (nearExtrude),
        q010 = p01.scalar (nearExtrude),

        // 计算远平面
        q001 = p00.scalar (farExtrude),
        q101 = p10.scalar (farExtrude),
        q111 = p11.scalar (farExtrude),
        q011 = p01.scalar (farExtrude);

    // Compute the representation of q111.
    var u0 = q100.sub (q000),
        u1 = q010.sub (q000),
        u2 = q001.sub (q000);

    var m    = L5.Matrix.IPMake (u0, u1, u2, q000);
    var invM = m.inverse (0.001);
    var a    = invM.xPoint (q111);

    // Compute the coeffients in the fractional linear transformation.
    //   y[i] = n[i]*x[i]/(d[0]*x[0] + d[1]*x[1] + d[2]*x[2] + d[3])
    var n0 = 2 * a.x;
    var n1 = 2 * a.y;
    var n2 = 2 * a.z;
    var d0 = +a.x - a.y - a.z + 1;
    var d1 = -a.x + a.y - a.z + 1;
    var d2 = -a.x - a.y + a.z + 1;
    var d3 = +a.x + a.y + a.z - 1;

    // 从规范正方体[-1,1]^2 x [0,1]计算透视投影
    var n20     = n2 / n0,
        n21     = n2 / n1,
        n20d0   = n20 * d0,
        n21d1   = n21 * d1,
        d32     = 2 * d3,
        project = new L5.Matrix (
            n20 * d32 + n20d0, n21d1, d2, -n2,
            n20d0, n21 * d32 + n21d1, d2, -n2,
            n20d0, n21d1, d2, -n2,
            -n20d0, -n21d1, -d2, n2
        );

    this.postProjectionMatrix     = project.xMatrix (invM);
    this.postProjectionIsIdentity = L5.Matrix.isIdentity (this.postProjectionMatrix);
    this.updatePVMatrix ();
};

/**
 * 设置视图前置矩阵
 *
 * @param mat {L5.Matrix}
 * @returns {void}
 */
L5.Camera.prototype.setPreViewMatrix = function (
    mat
) {
    this.preViewMatrix     = mat;
    this.preViewIsIdentity = L5.Matrix.isIdentity(mat);
    this.updatePVMatrix ();
};

/**
 * 设置视图后置矩阵
 *
 * @param mat {L5.Matrix}
 * @returns {void}
 */
L5.Camera.prototype.setPostProjectionMatrix = function (
    mat
) {
    this.postProjectionMatrix     = mat;
    this.postProjectionIsIdentity = L5.Matrix.isIdentity (mat);
    this.updatePVMatrix ();
};

/**
 * 在归一化后的显示空间[-1,1]x[-1,1]计算物体轴对齐包围盒
 *
 * @param numVertices  {number}       顶点数量
 * @param vertices     {Float32Array} 顶点数组
 * @param stride       {number}       步幅
 * @param worldMatrix  {L5.Matrix}   物体变换矩阵
 * @returns {object}
 */
L5.Camera.prototype.computeBoundingAABB = function (
    numVertices,
    vertices,
    stride,
    worldMatrix
) {
    // 计算当前物体，世界视图投影矩阵.
    var vpMatrix = this.projectionMatrix.xMatrix (this.viewMatrix);
    if (!this.postProjectionIsIdentity) {
        vpMatrix = this.postProjectionMatrix.xMatrix (vpMatrix);
    }
    var wvpMatrix = vpMatrix.xMatrix (worldMatrix);
    var xmin, xmax, ymin, ymax;
    // 计算规范化后的显示坐标包围盒
    xmin = ymin = Infinity;
    xmax = ymax = -Infinity;

    for (var i = 0; i < numVertices; ++i) {
        var pos  = new L5.Point (vertices[ i + stride ], vertices[ i + stride + 1 ], vertices[ i + stride + 2 ]);
        var hpos = wvpMatrix.xIPoint (pos);
        var invW = 1 / hpos.w;
        var xNDC = hpos.x * invW;
        var yNDC = hpos.y * invW;
        if (xNDC < xmin) {
            xmin = xNDC;
        }
        if (xNDC > xmax) {
            xmax = xNDC;
        }
        if (yNDC < ymin) {
            ymin = yNDC;
        }
        if (yNDC > ymax) {
            ymax = yNDC;
        }
    }
    return {xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax};
};

/**
 * 计算变更后的视图矩阵
 * @returns {void}
 */
L5.Camera.prototype.onFrameChange = function () {
    var nPos = this.position.negative ();

    this.viewMatrix.content[ 0 ] = this.right.x;
    this.viewMatrix.content[ 1 ] = this.right.y;
    this.viewMatrix.content[ 2 ] = this.right.z;
    this.viewMatrix.content[ 3 ] = nPos.dot (this.right);

    this.viewMatrix.content[ 4 ] = this.up.x;
    this.viewMatrix.content[ 5 ] = this.up.y;
    this.viewMatrix.content[ 6 ] = this.up.z;
    this.viewMatrix.content[ 7 ] = nPos.dot (this.up);

    this.viewMatrix.content[ 8 ]  = this.direction.x;
    this.viewMatrix.content[ 9 ]  = this.direction.y;
    this.viewMatrix.content[ 10 ] = this.direction.z;
    this.viewMatrix.content[ 11 ] = nPos.dot (this.direction);

    this.viewMatrix.content[ 12 ] = 0;
    this.viewMatrix.content[ 13 ] = 0;
    this.viewMatrix.content[ 14 ] = 0;
    this.viewMatrix.content[ 15 ] = 1;

    this.updatePVMatrix ();
};

/**
 * frustum变化后计算投影矩阵
 * @returns {void}
 */
L5.Camera.prototype.onFrustumChange = function () {
    var near   = this.frustum[ L5.VF_NEAR ],
        far    = this.frustum[ L5.VF_FAR ],
        bottom = this.frustum[ L5.VF_BOTTOM ],
        top    = this.frustum[ L5.VF_TOP ],
        left   = this.frustum[ L5.VF_LEFT ],
        right  = this.frustum[ L5.VF_RIGHT ],

        r2l    = 1 / (right - left),
        t2b    = 1 / (top - bottom),
        f2n    = 1 / (far - near),

        srl    = (left + right) * r2l,
        stb    = (bottom + top) * t2b,
        sfn    = (near + far) * f2n;

    this.projectionMatrix.zero ();

    if (this.isPerspective) {
        var near2                           = 2 * near;
        this.projectionMatrix.content[ 0 ]  = near2 * r2l;
        this.projectionMatrix.content[ 2 ]  = -srl;
        this.projectionMatrix.content[ 5 ]  = near2 * t2b;
        this.projectionMatrix.content[ 6 ]  = -stb;
        this.projectionMatrix.content[ 10 ] = sfn;
        this.projectionMatrix.content[ 11 ] = -near2 * far * f2n;
        this.projectionMatrix.content[ 14 ] = 1;
    }
    else {
        this.projectionMatrix.content[ 0 ]  = 2 * r2l;
        this.projectionMatrix.content[ 3 ]  = -srl;
        this.projectionMatrix.content[ 5 ]  = 2 * t2b;
        this.projectionMatrix.content[ 7 ]  = -stb;
        this.projectionMatrix.content[ 10 ] = 2 * f2n;
        this.projectionMatrix.content[ 11 ] = -sfn;
        this.projectionMatrix.content[ 15 ] = 1;
    }

    this.updatePVMatrix ();
};

/**
 * 计算postproj-proj-view-preview的乘积
 * @returns {void}
 */
L5.Camera.prototype.updatePVMatrix = function () {

    this.projectionViewMatrix = this.projectionMatrix.xMatrix (this.viewMatrix);

    if (!this.postProjectionIsIdentity) {
        this.projectionViewMatrix = this.postProjectionMatrix.xMatrix (this.projectionViewMatrix);
    }

    if (!this.preViewIsIdentity) {
        this.projectionViewMatrix = this.projectionViewMatrix.xMatrix (this.preViewMatrix);
    }
};