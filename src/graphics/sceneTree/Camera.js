/**
 * Camera - 摄像机
 *
 * @param isPerspective {boolean} 是否是透视相机, true-透视, false-正交
 * @extends {L5.D3Object}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.Camera = function (isPerspective /* default : false */) {
    L5.D3Object.call(this, 'L5.Camera');

    this.isPerspective = isPerspective || false;

    this.position = L5.Point.ORIGIN;
    this.direction = L5.Vector.UNIT_Z.negative(); //-z
    this.up = L5.Vector.UNIT_Y;
    this.right = L5.Vector.UNIT_X;

    // 摄像机视图矩阵
    this.viewMatrix = L5.Matrix.IDENTITY;

    // 视截体存储结构, 存储顺序 NEAR-FAR-BOTTOM-TOP-LEFT-RIGHT
    this.frustum = new Float32Array(6);

    // 摄像机投影矩阵
    this.projectionMatrix = L5.Matrix.IDENTITY;

    // 投影视图矩阵， 即投影矩阵和视图矩阵的乘积
    // 当视图前置/后置矩阵不为空时会包含它们
    this.projectionViewMatrix = L5.Matrix.IDENTITY;

    // 视图前置矩阵，位置在模型矩阵之后，但在视图矩阵之前
    // 用于对物体的变换， 例如反射等，默认为单位矩阵
    this.preViewMatrix = L5.Matrix.IDENTITY;
    this.preViewIsIdentity = true;

    // 视图后置矩阵，用于屏幕空间转换，例如反射渲染后的图像等，默认为单位矩阵
    this.postProjectionMatrix = L5.Matrix.IDENTITY;
    this.postProjectionIsIdentity = true;

    // 初始化
    this.setFrame(this.position, this.direction, this.up, this.right);
    this.setPerspective(90, 1, 1, 1000);
};

L5.nameFix(L5.Camera, 'Camera');
L5.extendFix(L5.Camera, L5.D3Object);


////////////////////// const 视截体常量定义 //////////////////////
L5.Camera.VF_NEAR = 0;
L5.Camera.VF_FAR = 1;
L5.Camera.VF_BOTTOM = 2;
L5.Camera.VF_TOP = 3;
L5.Camera.VF_LEFT = 4;
L5.Camera.VF_RIGHT = 5;
L5.Camera.VF_QUANTITY = 6;

/**
 *
 * @param eye {L5.Point} 眼睛位置
 * @param center {L5.Point} 场景中心
 * @param up {L5.Vector} 观察者上方向
 */
L5.Camera.prototype.lookAt = function (eye, center, up) {

    if (eye.equals(center)) {
        this.position.copy(L5.Point.ORIGIN);
        this.up.copy(up);
        this.direction.copy(L5.Vector.UNIT_Z.negative());
        this.right.copy(L5.Vector.UNIT_X);
        return;
    }

    this.position.copy(eye);

    // 这里可直接计算正-Z方向, 上面已经做过判断
    var z = eye.subP(center);
    z.normalize();

    // 计算右方向
    var x = up.cross(z);
    x.normalize();

    // 计算右方向
    var y = z.cross(x);
    y.normalize();

    this.direction.copy(z);
    this.up.copy(y);
    this.right.copy(x);

    this.onFrameChange();
};

/**
 * 摄像机的向量使用世界坐标系.
 *
 * @param position  {L5.Point } 位置 default (0, 0,  0; 1)
 * @param direction {L5.Vector} 观察方向 default (0, 0, -1; 0)
 * @param up        {L5.Vector} 上方向 default default (0, 1, 0; 0)
 * @returns {void}
 */
L5.Camera.prototype.setFrame = function (position, direction, up) {
    this.position.copy(position);
    var right = direction.cross(up);
    this.setAxes(direction, up, right);
};

/**
 * 设置摄像机位置
 * @param position {L5.Point}
 * @returns {void}
 */
L5.Camera.prototype.setPosition = function (position) {
    this.position.copy(position);
    this.onFrameChange();
};

/**
 * 设置摄像机坐标系的3个轴
 *
 * @param direction {L5.Vector} 观察方向
 * @param up        {L5.Vector} 上方向
 * @param right     {L5.Vector} 右方向
 * @returns {void}
 */
L5.Camera.prototype.setAxes = function (direction, up, right) {
    this.direction.copy(direction);
    this.up.copy(up);
    this.right.copy(right);

    // 判断3个轴是否正交, 否则需要校正
    var det = direction.dot(up.cross(right));
    if (Math.abs(1 - det) > 0.00001) {
        L5.Vector.orthoNormalize(this.direction, this.up, this.right);
    }
    this.onFrameChange();
};

/**
 * 设置透视矩阵参数
 * @param fov {float} 垂直视角, 单位: 度
 * @param aspect {float} 高宽比
 * @param near {float} 近平面
 * @param far {float} 远平面
 */
L5.Camera.prototype.setPerspective = function (fov, aspect, near, far) {
    var top = near * Math.tan(fov * L5.Math.PI / 360);
    var right = top * aspect;

    this.frustum[L5.Camera.VF_TOP] = top;
    this.frustum[L5.Camera.VF_BOTTOM] = -top;
    this.frustum[L5.Camera.VF_RIGHT] = right;
    this.frustum[L5.Camera.VF_LEFT] = -right;
    this.frustum[L5.Camera.VF_NEAR] = near;
    this.frustum[L5.Camera.VF_FAR] = far;

    this.onFrustumChange();
};

/**
 * 返回透视图的4个参数
 * returns {Float32Array} [fov, aspect, near, far]
 */
L5.Camera.prototype.getPerspective = function () {
    var ret = new Float32Array(4);

    if (
        this.frustum[L5.Camera.VF_LEFT] == -this.frustum[L5.Camera.VF_RIGHT] &&
        this.frustum[L5.Camera.VF_BOTTOM] == -this.frustum[L5.Camera.VF_TOP]
    ) {
        var tmp = this.frustum[L5.Camera.VF_TOP] / this.frustum[L5.Camera.VF_NEAR];
        ret[0] = L5.Math.atan(tmp) * 360 / L5.Math.PI;
        ret[1] = this.frustum[L5.Camera.VF_RIGHT] / this.frustum[L5.Camera.VF_TOP];
        ret[2] = this.frustum[L5.Camera.VF_NEAR];
        ret[3] = this.frustum[L5.Camera.VF_FAR];
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
L5.Camera.prototype.setFrustum = function (near, far, bottom, top, left, right) {
    this.frustum[L5.Camera.VF_NEAR] = near;
    this.frustum[L5.Camera.VF_FAR] = far;
    this.frustum[L5.Camera.VF_BOTTOM] = bottom;
    this.frustum[L5.Camera.VF_TOP] = top;
    this.frustum[L5.Camera.VF_LEFT] = left;
    this.frustum[L5.Camera.VF_RIGHT] = right;

    this.onFrustumChange();
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
L5.Camera.prototype.setProjectionMatrix = function (p00, p10, p11, p01,
                                                    nearExtrude, farExtrude) {

    var // 计算近平面
        q000 = p00.scalar(nearExtrude),
        q100 = p01.scalar(nearExtrude),
        q110 = p11.scalar(nearExtrude),
        q010 = p01.scalar(nearExtrude),

    // 计算远平面
        q001 = p00.scalar(farExtrude),
        q101 = p10.scalar(farExtrude),
        q111 = p11.scalar(farExtrude),
        q011 = p01.scalar(farExtrude);

    // Compute the representation of q111.
    var u0 = q100.sub(q000),
        u1 = q010.sub(q000),
        u2 = q001.sub(q000);

    var m = L5.Matrix.IPMake(u0, u1, u2, q000);
    var invM = m.inverse(0.001);
    var a = invM.mulPoint(q111);

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
    var n20 = n2 / n0,
        n21 = n2 / n1,
        n20d0 = n20 * d0,
        n21d1 = n21 * d1,
        d32 = 2 * d3,
        project = new L5.Matrix(
            n20 * d32 + n20d0, n21d1, d2, -n2,
            n20d0, n21 * d32 + n21d1, d2, -n2,
            n20d0, n21d1, d2, -n2,
            -n20d0, -n21d1, -d2, n2
        );

    this.postProjectionMatrix.copy(project.mul(invM));
    this.postProjectionIsIdentity = L5.Matrix.isIdentity(this.postProjectionMatrix);
    this.updatePVMatrix();
};

/**
 * 设置视图前置矩阵
 *
 * @param mat {L5.Matrix}
 * @returns {void}
 */
L5.Camera.prototype.setPreViewMatrix = function (mat) {
    this.preViewMatrix.copy(mat);
    this.preViewIsIdentity = L5.Matrix.isIdentity(mat);
    this.updatePVMatrix();
};

/**
 * 设置视图后置矩阵
 *
 * @param mat {L5.Matrix}
 * @returns {void}
 */
L5.Camera.prototype.setPostProjectionMatrix = function (mat) {
    this.postProjectionMatrix.copy(mat);
    this.postProjectionIsIdentity = L5.Matrix.isIdentity(mat);
    this.updatePVMatrix();
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
L5.Camera.prototype.computeBoundingAABB = function (numVertices,
                                                    vertices,
                                                    stride,
                                                    worldMatrix) {
    // 计算当前物体，世界视图投影矩阵.
    var vpMatrix = this.projectionMatrix.mul(this.viewMatrix);
    if (!this.postProjectionIsIdentity) {
        vpMatrix.copy(this.postProjectionMatrix.mul(vpMatrix));
    }
    var wvpMatrix = vpMatrix.mul(worldMatrix);
    var xmin, xmax, ymin, ymax;
    // 计算规范化后的显示坐标包围盒
    xmin = ymin = Infinity;
    xmax = ymax = -Infinity;

    for (var i = 0; i < numVertices; ++i) {
        var pos = new L5.Point(vertices[i + stride], vertices[i + stride + 1], vertices[i + stride + 2]);
        var hpos = wvpMatrix.mulPoint(pos);
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
    var nPos = this.position;
    var x = this.right, y = this.up, z = this.direction;

    this.viewMatrix.content[0] = x[0];
    this.viewMatrix.content[1] = y[0];
    this.viewMatrix.content[2] = z[0];
    this.viewMatrix.content[3] = 0;

    this.viewMatrix.content[4] = x[1];
    this.viewMatrix.content[5] = y[1];
    this.viewMatrix.content[6] = z[1];
    this.viewMatrix.content[7] = 0;

    this.viewMatrix.content[8] = x[2];
    this.viewMatrix.content[9] = y[2];
    this.viewMatrix.content[10] = z[2];
    this.viewMatrix.content[11] = 0;

    this.viewMatrix.content[12] = -nPos.dot(x);
    this.viewMatrix.content[13] = -nPos.dot(y);
    this.viewMatrix.content[14] = -nPos.dot(z);
    this.viewMatrix.content[15] = 1;

    this.updatePVMatrix();
};

/**
 * 视截体变化后计算投影矩阵
 * @returns {void}
 */
L5.Camera.prototype.onFrustumChange = function () {
    var f = this.frustum;
    var near = f[L5.Camera.VF_NEAR],
        far = f[L5.Camera.VF_FAR],
        bottom = f[L5.Camera.VF_BOTTOM],
        top = f[L5.Camera.VF_TOP],
        left = f[L5.Camera.VF_LEFT],
        right = f[L5.Camera.VF_RIGHT],

        rl = right - left,
        tb = top - bottom,
        fn = far - near;

    this.projectionMatrix.zero();

    if (this.isPerspective) {
        var near2 = 2 * near;
        this.projectionMatrix.content[0] = near2 / rl;
        this.projectionMatrix.content[5] = near2 / tb;
        this.projectionMatrix.content[8] = (right + left) / rl;
        this.projectionMatrix.content[9] = (top + bottom) / tb;
        this.projectionMatrix.content[10] = -(far + near) / fn;
        this.projectionMatrix.content[11] = -1;
        this.projectionMatrix.content[14] = -(far * near2) / fn;
    }
    else {
        this.projectionMatrix.content[0] = 2 / rl;
        this.projectionMatrix.content[5] = 2 / tb;
        this.projectionMatrix.content[10] = -2 / fn;
        this.projectionMatrix.content[12] = -(left + right) / rl;
        this.projectionMatrix.content[13] = -(top + bottom) / tb;
        this.projectionMatrix.content[14] = -(far + near) / fn;
        this.projectionMatrix.content[15] = 1;
    }

    this.updatePVMatrix();
};

/**
 * 计算postproj-proj-view-preview的乘积
 * @returns {void}
 */
L5.Camera.prototype.updatePVMatrix = function () {

    this.projectionViewMatrix.copy(this.projectionMatrix.mul(this.viewMatrix));


    if (!this.postProjectionIsIdentity) {
        this.projectionViewMatrix.copy(this.postProjectionMatrix.mul(this.projectionViewMatrix));
    }

    if (!this.preViewIsIdentity) {
        this.projectionViewMatrix.copy(this.projectionViewMatrix.mul(this.preViewMatrix));
    }
};

L5.Camera.prototype.debug = function () {
    if (!this.output) {
        this.output = document.createElement('div');
        this.output.style.position = 'absolute';
        this.output.style.right = 0;
        this.output.style.top = 0;
        this.output.style.textAlign = 'right';
        this.output.style.color = 'green';
        document.body.appendChild(this.output);
    }
    var info = '';
    info += '位置:[' +
        Array.from(this.position._content.slice(0, 3))
            .map(function (i) {
                return i.toFixed(4);
            })
            .join(',') + ']<br/>';
    info += '观察方向:[' +
        Array.from(this.direction._content.slice(0, 3))
            .map(function (i) {
                return i.toFixed(4);
            }).join(',') + ']';
    this.output.innerHTML = info;
};