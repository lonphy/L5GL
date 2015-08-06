/**
 * Plane - 平面
 *
 * 平面表示为 Dot(N,X) - c = 0,其中：
 *  N = (n0,n1,n2,0)，一个单位法向量
 *  X = (x0,x1,x2,1)，是任何在该平面上的点
 *  c 是平面常量
 *
 * @author lonphy
 * @version 1.0
 */

/**
 * @param normal {L5.Vector} 平面单位法向量
 * @param constant {number} 平面常量
 * @class
 */
L5.Plane = function (
    normal, constant
) {
    this._content = new Float32Array(4);
    this._content[0] = normal[0];
    this._content[1] = normal[1];
    this._content[2] = normal[2];
    this._content[3] = -constant;
};

L5.Plane.name = "Plane";

/**
 *  c = dot(normal, point)
 * @param normal {L5.Vector} specified
 * @param point {L5.Point} 平面上的点
 * @returns {L5.Plane}
 */
L5.Plane.fromPoint1 = function(
    normal, point
) {
    return new L5.Plane
    (
        normal,
        point.dot(normal)
    );
};

/**
 *
 * @param normal0 {number}
 * @param normal1 {number}
 * @param normal2 {number}
 * @param constant {number}
 * @returns {L5.Plane}
 */
L5.Plane.fromNumber = function(
    normal0, normal1, normal2, constant
) {
    return new L5.Plane
    (
        new L5.Vector
        (
            normal0,
            normal1,
            normal2
        ),
        constant
    );
};

/**
 * 3个点确定一个平面
 * normal = cross(point1-point0,point2-point0)/length(cross(point1-P0,point2-P0))
 * c = dot(normal,point0)
 * @param point0 {L5.Point} 平面上的点
 * @param point1 {L5.Point} 平面上的点
 * @param point2 {L5.Point} 平面上的点
 * @returns {L5.Plane}
 */
L5.Plane.fromPoint3 = function(
    point0, point1, point2
) {
    var edge1 = point1.sub(point0);
    var edge2 = point2.sub(point0);
    var normal = edge1.unitCross(edge2);
    return new L5.Plane
    (
        normal,
        point0.dot(normal)
    );
};


L5.Plane.prototype = {
    constructor: L5.Plane,

    /**
     * @returns {L5.Vector}
     */
    get normal() {
        return new L5.Vector
        (
            this._content[0],
            this._content[1],
            this._content[2]
        );
    },
    /**
     * @param val {L5.Vector}
     */
    set normal(val) {
        this._content[0] = val.x;
        this._content[1] = val.y;
        this._content[2] = val.z;
    },
    get constant() {
        return -this._content[3];
    },
    set constant(val) {
        this._content[3] = -val||0;
    }
};

/**
 * 复制
 * @param plane {L5.Plane}
 */
L5.Plane.prototype.copy = function(
    plane
) {
    this._content[0] = plane._content[0];
    this._content[1] = plane._content[1];
    this._content[2] = plane._content[2];
    this._content[3] = plane._content[3];
    return this;
};

/**
 * 计算平面法向量的长度，并返回，同时规格化法向量和平面常量
 * @returns {number}
 */
L5.Plane.prototype.normalize = function () {
    var length = L5.Math.sqrt(
        this._content[0]*this._content[0] +
        this._content[1]*this._content[1] +
        this._content[2]*this._content[2]);

    if (length > 0)
    {
        var invLength = 1/length;
        this._content[0] *= invLength;
        this._content[1] *= invLength;
        this._content[2] *= invLength;
        this._content[3] *= invLength;
    }

    return length;
};

/**
 * 计算点到平面的距离[有符号]
 *
 * d = dot(normal, point) - c
 *  normal 是平面的法向量
 *  c 是平面常量
 *  如果返回值是正值则点在平面的正坐标一边，
 *  如果是负值，则在负坐标一边
 *  否则在平面上
 *
 * @param p {L5.Point}
 * @returns {number}
 */
L5.Plane.prototype.distanceTo = function (p) {
    return this._content[0]* p.x +
           this._content[1]* p.y +
           this._content[2]* p.z +
           this._content[3];
};

L5.Plane.prototype.whichSide = function (p) {
    var distance = this.distanceTo(p);

    if (distance < 0)
    {
        return -1;
    }
    else if (distance > 0)
    {
        return +1;
    }

    return 0;
};