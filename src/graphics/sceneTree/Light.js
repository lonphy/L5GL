// @ts-check
import {D3Object} from '../../core/D3Object'
import * as util from '../../util/util'
import {_Math, Point, Vector} from '../../math/index'

/**
 * 灯光 - Light
 */
export class Light extends D3Object {
    constructor(type) {
        super();
        this.type = type;

        // 灯光颜色属性
        this.ambient = new Float32Array([0, 0, 0, 1]);
        this.diffuse = new Float32Array([0, 0, 0, 1]);
        this.specular = new Float32Array([0, 0, 0, 1]);

        // 衰减系数
        //     m = 1/(C + L*d + Q*d*d)
        // C : 常量系数
        // L : 线性系数
        // Q : 2次系数
        // d : 从光源位置到顶点的距离
        // 使用线性衰减光强,可用:m = I/(C + L*d + Q*d*d)替代, I是强度系数
        this.constant = 1.0;
        this.linear = 0.0;
        this.quadratic = 0.0;
        this.intensity = 1.0;

        // 聚光灯参数
        // 椎体夹角为弧度制, 范围为: 0 < angle <= Math.PI.
        this.angle = _Math.PI;
        this.cosAngle = -1.0;
        this.sinAngle = 0.0;
        this.exponent = 1.0;

        this.position = Point.ORIGIN;
        this.direction = Vector.UNIT_Z.negative();
        this.up = Vector.UNIT_Y;
        this.right = Vector.UNIT_X;
    }

    /**
     * 设置光源[聚光灯]角度
     * @param angle {number} 弧度有效值 0< angle <= PI
     */
    setAngle(angle) {
        console.assert(0 < angle && angle <= _Math.PI, 'Angle out of range in SetAngle');
        this.angle = angle;
        this.cosAngle = _Math.cos(angle);
        this.sinAngle = _Math.sin(angle);
    }

    /**
     * 设置光源方向
     * @param dir{Vector} 方向向量
     */
    setDirection(dir) {
        dir.normalize();
        this.direction.copy(dir);
        Vector.generateComplementBasis(this.up, this.right, this.direction);
    }

    /**
     * 设置光源位置
     *
     * 只对点光源以及聚光灯有效
     * @param pos {Point} 位置
     */
    setPosition(pos) {
        this.position.copy(pos);
    }

    load(inStream) {
        super.load(inStream);
        this.type = inStream.readEnum();
        this.ambient.set(inStream.readFloat32Range(4));
        this.diffuse.set(inStream.readFloat32Range(4));
        this.specular.set(inStream.readFloat32Range(4));
        this.constant = inStream.readFloat32();
        this.linear = inStream.readFloat32();
        this.quadratic = inStream.readFloat32();
        this.intensity = inStream.readFloat32();
        this.angle = inStream.readFloat32();
        this.cosAngle = inStream.readFloat32();
        this.sinAngle = inStream.readFloat32();
        this.exponent = inStream.readFloat32();
        this.position = inStream.readPoint();
        this.direction.copy(inStream.readFloat32Range(4));
        this.up.copy(inStream.readFloat32Range(4));
        this.right.copy(inStream.readFloat32Range(4));
    }

    save(outStream) {
        super.save(outStream);
        outStream.writeEnum(this.type);
        outStream.writeFloat32Array(4, this.ambient);
        outStream.writeFloat32Array(4, this.diffuse);
        outStream.writeFloat32Array(4, this.specular);
        outStream.writeFloat32(this.constant);
        outStream.writeFloat32(this.linear);
        outStream.writeFloat32(this.quadratic);
        outStream.writeFloat32(this.intensity);
        outStream.writeFloat32(this.angle);
        outStream.writeFloat32(this.cosAngle);
        outStream.writeFloat32(this.sinAngle);
        outStream.writeFloat32(this.exponent);
        outStream.writeFloat32Array(4, this.position);
        outStream.writeFloat32Array(4, this.direction);
        outStream.writeFloat32Array(4, this.up);
        outStream.writeFloat32Array(4, this.right);
    }

    /**
     * 文件解析工厂方法
     * @param inStream {InStream}
     * @returns {Light}
     */
    static factory(inStream) {
        var l = new Light(Light.LT_INVALID);
        l.load(inStream);
        return l;
    }
};

util.DECLARE_ENUM(Light, {
    LT_AMBIENT:     0,  // 环境光
    LT_DIRECTIONAL: 1, // 方向光
    LT_POINT:       2, // 点光源
    LT_SPOT:        3, // 聚光等
    LT_INVALID:     4 // 无效光源
});

D3Object.Register('Light', Light.factory);
