/**
 * 灯光 - Light
 * @class
 * @extends {L5.D3Object}
 * @author lonphy
 * @version 1.0
 *
 * @param type {number} 灯光类型
 */
L5.Light = function (type) {
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
    this.angle = L5.Math.PI;
    this.cosAngle = -1.0;
    this.sinAngle = 0.0;
    this.exponent = 1.0;

    this.position = L5.Point.ORIGIN;
    this.direction = new L5.Vector(0, 0, -1);
    this.up = new L5.Vector(0, 1, 0);
    this.right = new L5.Vector(1, 0, 0);

};
L5.nameFix(L5.Light, 'Light');
L5.extendFix(L5.Light, L5.D3Object);

L5.Light.LT_AMBIENT = 0;  // 环境光
L5.Light.LT_DIRECTIONAL = 1; // 方向光
L5.Light.LT_POINT = 2; // 点光源
L5.Light.LT_SPOT = 3; // 聚光等
L5.Light.LT_INVALID = 4; // 无效光源

L5.Light.prototype.setAngle = function (angle) {
    L5.assert(0 < angle && angle <= L5.Math.PI, "Angle out of range in SetAngle");
    this.angle = angle;
    this.cosAngle = L5.Math.cos(angle);
    this.sinAngle = L5.Math.sin(angle);
};
L5.Light.prototype.setDirection = function (dir) {
    dir.normalize();
    this.direction.copy(dir);
    L5.Vector.generateComplementBasis(this.up, this.right, this.direction);
};
L5.Light.prototype.setPosition = function (pos) {
    this.position.copy(pos);
};


L5.Light.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);
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
};

L5.Light.prototype.save = function (outStream) {
    L5.D3Object.prototype.save.call(this, outStream);
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
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.Light}
 */
L5.Light.factory = function (inStream) {
    var obj = new L5.Light(L5.Light.LT_INVALID);
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.Light', L5.Light.factory);