/**
 * Camera - 摄像机
 *
 * @param isPerspective {boolean} 是否是透视相机, true-透视, false-正交
 * @author lonphy
 * @version 2.0
 */
import { D3Object } from '../../core/D3Object'
import { _Math, Point, Vector, Matrix } from '../../math/index'
import * as util from '../../util/util'

export class Camera extends D3Object {

    constructor(isPerspective = false) {
        super();

        this.isPerspective = isPerspective;

        this.position = Point.ORIGIN;
        this.direction = Vector.UNIT_Z.negative(); //-z
        this.up = Vector.UNIT_Y;
        this.right = Vector.UNIT_X;

        // 摄像机视图矩阵
        this.viewMatrix = Matrix.IDENTITY;

        // 视截体存储结构, 存储顺序 NEAR-FAR-BOTTOM-TOP-LEFT-RIGHT
        this.frustum = new Float32Array(6);

        // 摄像机投影矩阵
        this.projectionMatrix = Matrix.IDENTITY;

        // 投影视图矩阵， 即投影矩阵和视图矩阵的乘积
        // 当视图前置/后置矩阵不为空时会包含它们
        this.projectionViewMatrix = Matrix.IDENTITY;

        // 视图前置矩阵，位置在模型矩阵之后，但在视图矩阵之前
        // 用于对物体的变换， 例如反射等，默认为单位矩阵
        this.preViewMatrix = Matrix.IDENTITY;
        this.preViewIsIdentity = true;

        // 视图后置矩阵，用于屏幕空间转换，例如反射渲染后的图像等，默认为单位矩阵
        this.postProjectionMatrix = Matrix.IDENTITY;
        this.postProjectionIsIdentity = true;

        // 初始化
        this.setFrame(this.position, this.direction, this.up, this.right);
        this.setPerspective(90, 1, 1, 1000);
    }


    /**
     * 所有参数均为世界坐标系
     *
     * @param eye {Point} 相机位置
     * @param center {Point} 场景中心
     * @param up {Vector} 相机上方向
     */
    lookAt(eye, center, up) {

        if (eye.equals(center)) {
            this.position.copy(Point.ORIGIN);
            this.up.copy(up);
            this.direction.copy(Vector.UNIT_Z.negative());
            this.right.copy(Vector.UNIT_X);
            return;
        }

        this.position.copy(eye);

        // 这里可直接计算正-Z方向, 上面已经做过判断
        var z = eye.subAsVector(center);
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
    }

    /**
     * 摄像机的向量使用世界坐标系.
     *
     * @param position  {Point } 位置 default (0, 0,  0; 1)
     * @param direction {Vector} 观察方向 default (0, 0, -1; 0)
     * @param up        {Vector} 上方向 default default (0, 1, 0; 0)
     * @returns {void}
     */
    setFrame(position, direction, up) {
        this.position.copy(position);
        var right = direction.cross(up);
        this.setAxes(direction, up, right);
    }

    /**
     * 设置摄像机位置
     * @param position {Point}
     * @returns {void}
     */
    setPosition(position) {
        this.position.copy(position);
        this.onFrameChange();
    }

    /**
     * 设置摄像机坐标系的3个轴
     *
     * @param direction {Vector} 观察方向
     * @param up        {Vector} 上方向
     * @param right     {Vector} 右方向
     * @returns {void}
     */
    setAxes(direction, up, right) {
        this.direction.copy(direction);
        this.up.copy(up);
        this.right.copy(right);

        // 判断3个轴是否正交, 否则需要校正
        var det = direction.dot(up.cross(right));
        if (_Math.abs(1 - det) > 0.00001) {
            Vector.orthoNormalize(this.direction, this.up, this.right);
        }
        this.onFrameChange();
    }

    /**
     * 设置透视矩阵参数
     * @param fov {float} 垂直视角, 单位: 度
     * @param aspect {float} 高宽比
     * @param near {float} 近平面
     * @param far {float} 远平面
     */
    setPerspective(fov, aspect, near, far) {
        var top = near * _Math.tan(fov * _Math.PI / 360);
        var right = top * aspect;

        this.frustum[Camera.VF_TOP] = top;
        this.frustum[Camera.VF_BOTTOM] = -top;
        this.frustum[Camera.VF_RIGHT] = right;
        this.frustum[Camera.VF_LEFT] = -right;
        this.frustum[Camera.VF_NEAR] = near;
        this.frustum[Camera.VF_FAR] = far;

        this.onFrustumChange();
    }

    /**
     * 返回透视图的4个参数
     * returns {Float32Array} [fov, aspect, near, far]
     */
    getPerspective() {
        var ret = new Float32Array(4);

        if (
            this.frustum[Camera.VF_LEFT] == -this.frustum[Camera.VF_RIGHT] &&
            this.frustum[Camera.VF_BOTTOM] == -this.frustum[Camera.VF_TOP]
        ) {
            var tmp = this.frustum[Camera.VF_TOP] / this.frustum[Camera.VF_NEAR];
            ret[0] = _Math.atan(tmp) * 360 / _Math.PI;
            ret[1] = this.frustum[Camera.VF_RIGHT] / this.frustum[Camera.VF_TOP];
            ret[2] = this.frustum[Camera.VF_NEAR];
            ret[3] = this.frustum[Camera.VF_FAR];
        }
        return ret;
    }

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
    setFrustum(near, far, bottom, top, left, right) {
        this.frustum[Camera.VF_NEAR] = near;
        this.frustum[Camera.VF_FAR] = far;
        this.frustum[Camera.VF_BOTTOM] = bottom;
        this.frustum[Camera.VF_TOP] = top;
        this.frustum[Camera.VF_LEFT] = left;
        this.frustum[Camera.VF_RIGHT] = right;

        this.onFrustumChange();
    }

    /**
     * p00 {Point}
     * p10 {Point}
     * p11 {Point}
     * p01 {Point}
     * nearExtrude {number}
     * farExtrude {number}
     *
     */
    setProjectionMatrix(p00, p10, p11, p01,
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

        var m = Matrix.IPMake(u0, u1, u2, q000);
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
            project = new Matrix(
                n20 * d32 + n20d0, n21d1, d2, -n2,
                n20d0, n21 * d32 + n21d1, d2, -n2,
                n20d0, n21d1, d2, -n2,
                -n20d0, -n21d1, -d2, n2
            );

        this.postProjectionMatrix.copy(project.mul(invM));
        this.postProjectionIsIdentity = Matrix.isIdentity(this.postProjectionMatrix);
        this.updatePVMatrix();
    }

    /**
     * 设置视图前置矩阵
     *
     * @param mat {Matrix}
     * @returns {void}
     */
    setPreViewMatrix(mat) {
        this.preViewMatrix.copy(mat);
        this.preViewIsIdentity = Matrix.isIdentity(mat);
        this.updatePVMatrix();
    }

    /**
     * 设置视图后置矩阵
     *
     * @param mat {Matrix}
     * @returns {void}
     */
    setPostProjectionMatrix(mat) {
        this.postProjectionMatrix.copy(mat);
        this.postProjectionIsIdentity = Matrix.isIdentity(mat);
        this.updatePVMatrix();
    }

    /**
     * 在归一化后的显示空间[-1,1]x[-1,1]计算物体轴对齐包围盒
     *
     * @param numVertices  {number}       顶点数量
     * @param vertices     {Float32Array} 顶点数组
     * @param stride       {number}       步幅
     * @param worldMatrix  {Matrix}   物体变换矩阵
     * @returns {object}
     */
    computeBoundingAABB(numVertices, vertices, stride, worldMatrix) {
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
            var pos = new Point(vertices[i + stride], vertices[i + stride + 1], vertices[i + stride + 2]);
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
        return { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax };
    }

    /**
     * 计算变更后的视图矩阵
     * @returns {void}
     */
    onFrameChange() {
        var nPos = this.position;
        var x = this.right, y = this.up, z = this.direction;

        this.viewMatrix[0] = x[0];
        this.viewMatrix[1] = y[0];
        this.viewMatrix[2] = z[0];
        this.viewMatrix[3] = 0;

        this.viewMatrix[4] = x[1];
        this.viewMatrix[5] = y[1];
        this.viewMatrix[6] = z[1];
        this.viewMatrix[7] = 0;

        this.viewMatrix[8] = x[2];
        this.viewMatrix[9] = y[2];
        this.viewMatrix[10] = z[2];
        this.viewMatrix[11] = 0;

        this.viewMatrix[12] = -nPos.dot(x);
        this.viewMatrix[13] = -nPos.dot(y);
        this.viewMatrix[14] = -nPos.dot(z);
        this.viewMatrix[15] = 1;

        this.updatePVMatrix();
    }

    /**
     * 视截体变化后计算投影矩阵
     * @returns {void}
     */
    onFrustumChange() {
        var f = this.frustum;
        var near = f[Camera.VF_NEAR],
            far = f[Camera.VF_FAR],
            bottom = f[Camera.VF_BOTTOM],
            top = f[Camera.VF_TOP],
            left = f[Camera.VF_LEFT],
            right = f[Camera.VF_RIGHT],

            rl = right - left,
            tb = top - bottom,
            fn = far - near;

        this.projectionMatrix.zero();

        if (this.isPerspective) {
            var near2 = 2 * near;
            this.projectionMatrix[0] = near2 / rl;
            this.projectionMatrix[5] = near2 / tb;
            this.projectionMatrix[8] = (right + left) / rl;
            this.projectionMatrix[9] = (top + bottom) / tb;
            this.projectionMatrix[10] = -(far + near) / fn;
            this.projectionMatrix[11] = -1;
            this.projectionMatrix[14] = -(far * near2) / fn;
        }
        else {
            this.projectionMatrix[0] = 2 / rl;
            this.projectionMatrix[5] = 2 / tb;
            this.projectionMatrix[10] = -2 / fn;
            this.projectionMatrix[12] = -(left + right) / rl;
            this.projectionMatrix[13] = -(top + bottom) / tb;
            this.projectionMatrix[14] = -(far + near) / fn;
            this.projectionMatrix[15] = 1;
        }

        this.updatePVMatrix();
    }

    /**
     * 计算postproj-proj-view-preview的乘积
     * @returns {void}
     */
    updatePVMatrix() {

        this.projectionViewMatrix.copy(this.projectionMatrix.mul(this.viewMatrix));


        if (!this.postProjectionIsIdentity) {
            this.projectionViewMatrix.copy(this.postProjectionMatrix.mul(this.projectionViewMatrix));
        }

        if (!this.preViewIsIdentity) {
            this.projectionViewMatrix.copy(this.projectionViewMatrix.mul(this.preViewMatrix));
        }
    }

    debug() {
        if (!this.output) {
            this.output = document.createElement('div');
            document.querySelector('.nodes-info').appendChild(this.output);
        }
        let pos = this.position;
        let dir = this.direction;
        this.output.innerHTML = `pos:[${pos.x.toFixed(4)}, ${pos.y.toFixed(4)}, ${pos.z.toFixed(4)}]<br/>
                        dir:[${dir.x.toFixed(4)}, ${dir.y.toFixed(4)}, ${dir.z.toFixed(4)}]<br/>`;
    }
};

////////////////////// const 视截体常量定义 //////////////////////
util.DECLARE_ENUM(Camera, {
    VF_NEAR: 0,
    VF_FAR: 1,
    VF_BOTTOM: 2,
    VF_TOP: 3,
    VF_LEFT: 4,
    VF_RIGHT: 5,
    VF_QUANTITY: 6
});



