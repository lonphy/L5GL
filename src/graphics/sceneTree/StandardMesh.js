/**
 * 标准网格 - StandardMesh
 *
 * @param format {VertexFormat} 网格顶点格式
 * @param isStatic {boolean} 是否使用静态缓冲, 默认true;
 * @param inside {boolean} 是否反向卷绕, 默认false
 * @param transform {Transform} 默认为单位变换
 */
import { _Math, Point, Vector } from '../../math/index'
import { Transform } from '../dataTypes/Transform'
import { VertexFormat } from '../resources/VertexFormat'
import { Buffer } from '../resources/Buffer'
import { IndexBuffer } from '../resources/IndexBuffer'
import { VertexBuffer } from '../resources/VertexBuffer'
import { VertexBufferAccessor } from '../resources/VertexBufferAccessor'
import { TriMesh } from './TriMesh'
import { Visual } from './Visual'

export class StandardMesh {
    constructor(format, isStatic, inside, transform) {
        isStatic = isStatic === undefined ? true : isStatic;
        this.format = format;
        this.transform = transform || Transform.IDENTITY;
        this.isStatic = true;
        this.inside = !!inside;
        this.hasNormals = false;

        this.usage = isStatic ? Buffer.BU_STATIC : Buffer.BU_DYNAMIC;

        // 检查顶点坐标
        var posIndex = format.getIndex(VertexFormat.AU_POSITION);
        console.assert(posIndex >= 0, 'Vertex format must have positions');
        var posType = format.getAttributeType(posIndex);
        console.assert(posType === VertexFormat.AT_FLOAT3, 'Positions must be 3-element of floats');

        // 检查法线
        var norIndex = format.getIndex(VertexFormat.AU_NORMAL);
        if (norIndex >= 0) {
            var norType = format.getAttributeType(norIndex);
            this.hasNormals = (norType === VertexFormat.AT_FLOAT3);
        }

        const MAX_UNITS = StandardMesh.MAX_UNITS;
        const AU_TEXCOORD = VertexFormat.AU_TEXCOORD;
        const AT_FLOAT2 = VertexFormat.AT_FLOAT2;

        this.hasTCoords = new Array(MAX_UNITS);
        for (var unit = 0; unit < MAX_UNITS; ++unit) {
            this.hasTCoords[unit] = false;
            var tcdIndex = format.getIndex(AU_TEXCOORD, unit);
            if (tcdIndex >= 0) {
                var tcdType = format.getAttributeType(tcdIndex);
                if (tcdType === AT_FLOAT2) {
                    this.hasTCoords[unit] = true;
                }
            }
        }
    }

    /**
     * 更改三角形卷绕顺序
     * @param numTriangles {number} 三角形数量
     * @param indices {Uint32Array} 顶点索引数组
     */
    reverseTriangleOrder(numTriangles, indices) {
        var i, j1, j2, save;
        for (i = 0; i < numTriangles; ++i) {
            j1 = 3 * i + 1;
            j2 = j1 + 1;
            save = indices[j1];
            indices[j1] = indices[j2];
            indices[j2] = save;
        }
    }
    /**
     *
     * @param vba {VertexBufferAccessor}
     */
    createPlatonicNormals(vba) {
        if (this.hasNormals) {
            const numVertices = vba.numVertices;
            var t;
            for (var i = 0; i < numVertices; ++i) {
                t = Array.from(vba.getPosition(i));
                vba.setNormal(i, t);
            }
        }
    }
    /**
     *
     * @param vba {VertexBufferAccessor}
     */
    createPlatonicUVs(vba) {
        const MAX_UNITS = StandardMesh.MAX_UNITS;
        const numVertices = vba.numVertices;
        const INV_PI = _Math.INV_PI;
        var unit, i, pos, t;
        for (unit = 0; unit < MAX_UNITS; ++unit) {
            if (this.hasTCoords[unit]) {
                for (i = 0; i < numVertices; ++i) {
                    pos = vba.getPosition(i);
                    t = 0.5;
                    if (_Math.abs(pos[2]) < 1) {
                        t *= 1 + _Math.atan2(pos[1], pos[0]) * INV_PI;
                    }
                    vba.setTCoord(unit, i, [t, _Math.acos(pos[2]) * INV_PI]);
                }
            }
        }
    }


    /**
     * 长方形
     * @param {number} xSamples x方向点数量
     * @param {number} ySamples y方向点数量
     * @param {number} width x 方向长度
     * @param {number} height y 方向长度
     * @returns {TriMesh}
     */
    rectangle(xSamples, ySamples, width, height) {
        const format = this.format;
        const stride = format.stride;
        const usage = this.usage;
        const hasNormals = this.hasNormals;

        const MAX_UNITS = StandardMesh.MAX_UNITS;
        var numVertices = xSamples * ySamples;
        var numTriangles = 2 * (xSamples - 1) * (ySamples - 1);
        var numIndices = 3 * numTriangles;

        // 创建顶点缓冲
        var vertexBuffer = new VertexBuffer(numVertices, stride, usage);
        var vba = new VertexBufferAccessor(format, vertexBuffer);

        // 生成几何体
        var stepX = 1 / (xSamples - 1); // x 方向每2个顶点间的距离
        var stepY = 1 / (ySamples - 1); // y 方向每2个顶点间的距离
        var u, v, x, y, p;
        var i, i0, i1, unit;
        for (i1 = 0, i = 0; i1 < ySamples; ++i1) {
            v = i1 * stepY;
            y = (2 * v - 1) * height;
            for (i0 = 0; i0 < xSamples; ++i0, ++i) {
                u = i0 * stepX;
                x = (2 * u - 1) * width;

                p = vba.setPosition(i, [x, 0, y]);

                if (hasNormals) {
                    p = vba.setNormal(i, [0, 1, 0]);
                }

                for (unit = 0; unit < MAX_UNITS; ++unit) {
                    if (this.hasTCoords[unit]) {
                        p = vba.setTCoord(unit, i, [u, v]);
                    }
                }
            }
        }
        this.transformData(vba);

        // 生成顶点索引
        var indexBuffer = new IndexBuffer(numIndices, 4, usage);
        var indices = new Uint32Array(indexBuffer.getData().buffer);
        var v0, v1, v2, v3, idx = 0;
        for (i1 = 0; i1 < ySamples - 1; ++i1) {
            for (i0 = 0; i0 < xSamples - 1; ++i0) {
                v0 = i0 + xSamples * i1;
                v1 = v0 + 1;
                v2 = v1 + xSamples;
                v3 = v0 + xSamples;
                indices[idx++] = v0;
                indices[idx++] = v1;
                indices[idx++] = v2;
                indices[idx++] = v0;
                indices[idx++] = v2;
                indices[idx++] = v3;
            }
        }

        return new TriMesh(format, vertexBuffer, indexBuffer);
    }

    /**
     * 圆盘
     * todo error
     * @param shellSamples {number}
     * @param radialSamples {number}
     * @param radius {number}
     * @returns {TriMesh}
     */
    disk(shellSamples, radialSamples, radius) {
        const MAX_UNITS = StandardMesh.MAX_UNITS;
        const usage = this.usage;
        const format = this.format;
        const hasNormals = this.hasNormals;
        const cos = _Math.cos;
        const sin = _Math.sin;

        var rsm1 = radialSamples - 1,
            ssm1 = shellSamples - 1;
        var numVertices = 1 + radialSamples * ssm1;
        var numTriangles = radialSamples * (2 * ssm1 - 1);
        var numIndices = 3 * numTriangles;

        var vertexBuffer = new VertexBuffer(numVertices, format.stride, usage);
        var vba = new VertexBufferAccessor(format, vertexBuffer);

        var t;

        // Center of disk.
        vba.setPosition(0, [0, 0, 0]);

        if (hasNormals) {
            vba.setNormal(0, [0, 0, 1]);
        }

        var unit;
        for (unit = 0; unit < MAX_UNITS; ++unit) {
            if (this.hasTCoords[unit]) {
                vba.setTCoord(unit, 0, [0.5, 0.5]);
            }
        }

        var invSSm1 = 1 / ssm1;
        var invRS = 1 / radialSamples;
        var rsPI = _Math.TWO_PI * invRS;
        var tcoord = [0.5, 0.5];

        var angle, cs, sn, s, fraction, fracRadial, fracRadial1, i;

        for (var r = 0; r < radialSamples; ++r) {
            angle = rsPI * r;
            cs = cos(angle);
            sn = sin(angle);

            var radial = new Vector(cs, sn, 0);

            for (s = 1; s < shellSamples; ++s) {
                fraction = invSSm1 * s;  // in (0,R]
                fracRadial = radial.scalar(fraction);
                i = s + ssm1 * r;

                fracRadial1 = fracRadial.scalar(radius);
                vba.setPosition(i, [fracRadial1.x, fracRadial1.y, fracRadial1.z]);

                if (hasNormals) {
                    vba.setNormal(i, [0, 0, 1]);
                }

                tcoord[0] = 0.5 + 0.5 * fracRadial[0];
                tcoord[1] = 0.5 + 0.5 * fracRadial[1];
                for (unit = 0; unit < MAX_UNITS; ++unit) {
                    if (this.hasTCoords[unit]) {
                        vba.setTCoord(unit, i, tcoord);
                    }
                }
            }
        }
        this.transformData(vba);

        // Generate indices.
        var indexBuffer = new IndexBuffer(numIndices, 4, usage);
        var indices = new Uint32Array(indexBuffer.getData().buffer);
        var r0, r1;
        for (r0 = rsm1, r1 = 0, t = 0; r1 < radialSamples; r0 = r1++) {
            indices[0] = 0;
            indices[1] = 1 + ssm1 * r0;
            indices[2] = 1 + ssm1 * r1;
            indices += 3;
            ++t;
            for (s = 1; s < ssm1; ++s, indices += 6) {
                var i00 = s + ssm1 * r0;
                var i01 = s + ssm1 * r1;
                var i10 = i00 + 1;
                var i11 = i01 + 1;
                indices[0] = i00;
                indices[1] = i10;
                indices[2] = i11;
                indices[3] = i00;
                indices[4] = i11;
                indices[5] = i01;
                t += 2;
            }
        }

        return new TriMesh(format, vertexBuffer, indexBuffer);
    }


}
// todo
// StandardMesh.MAX_UNITS = VertexFormat.MAX_TCOORD_UNITS;




/**
 * 长方体, 面朝内
 * 中心点 [0,0,0]
 * @param {number} xExtent
 * @param {number} yExtent
 * @param {number} zExtent
 * @returns {TriMesh}
 */
StandardMesh.prototype.box = function (xExtent, yExtent, zExtent) {
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;
    const MAX_UNITS = StandardMesh.MAX_UNITS;

    var numVertices = 8;
    var numTriangles = 12;
    var numIndices = 3 * numTriangles;

    // Create a vertex buffer.
    var vbuffer = new VertexBuffer(numVertices, stride, usage);
    var vba = new VertexBufferAccessor(format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [-xExtent, -yExtent, -zExtent]);
    vba.setPosition(1, [+xExtent, -yExtent, -zExtent]);
    vba.setPosition(2, [+xExtent, +yExtent, -zExtent]);
    vba.setPosition(3, [-xExtent, +yExtent, -zExtent]);
    vba.setPosition(4, [-xExtent, -yExtent, +zExtent]);
    vba.setPosition(5, [+xExtent, -yExtent, +zExtent]);
    vba.setPosition(6, [+xExtent, +yExtent, +zExtent]);
    vba.setPosition(7, [-xExtent, +yExtent, +zExtent]);

    for (var unit = 0; unit < MAX_UNITS; ++unit) {
        if (this.hasTCoords[unit]) {
            vba.setTCoord(unit, 0, [0.25, 0.75]);
            vba.setTCoord(unit, 1, [0.75, 0.75]);
            vba.setTCoord(unit, 2, [0.75, 0.25]);
            vba.setTCoord(unit, 3, [0.25, 0.25]);
            vba.setTCoord(unit, 4, [0, 1]);
            vba.setTCoord(unit, 5, [1, 1]);
            vba.setTCoord(unit, 6, [1, 0]);
            vba.setTCoord(unit, 7, [0, 0]);
        }
    }
    this.transformData(vba);

    // Generate indices (outside view).
    var ibuffer = new IndexBuffer(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 0;
    indices[1] = 1;
    indices[2] = 2;
    indices[3] = 0;
    indices[4] = 2;
    indices[5] = 3;

    indices[6] = 0;
    indices[7] = 5;
    indices[8] = 1;
    indices[9] = 0;
    indices[10] = 4;
    indices[11] = 5;

    indices[12] = 0;
    indices[13] = 7;
    indices[14] = 4;
    indices[15] = 0;
    indices[16] = 3;
    indices[17] = 7;

    indices[18] = 6;
    indices[19] = 5;
    indices[20] = 4;
    indices[21] = 6;
    indices[22] = 4;
    indices[23] = 7;

    indices[24] = 6;
    indices[25] = 1;
    indices[26] = 5;
    indices[27] = 6;
    indices[28] = 2;
    indices[29] = 1;

    indices[30] = 6;
    indices[31] = 3;
    indices[32] = 2;
    indices[33] = 6;
    indices[34] = 7;
    indices[35] = 3;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    var mesh = new TriMesh(format, vbuffer, ibuffer);
    if (this.hasNormals) {
        mesh.updateModelSpace(Visual.GU_NORMALS);
    }
    return mesh;
};

/**
 * 圆柱体
 *
 * 中心(0,0,0)
 * @param {number} axisSamples 轴细分
 * @param {number} radialSamples 半径细分
 * @param {number} radius 圆柱体圆面半径
 * @param {number} height 圆柱体高度
 * @param {boolean} open 是否上下开口的
 * @returns {TriMesh}
 */
StandardMesh.prototype.cylinder = function (axisSamples, radialSamples, radius, height, open) {
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;
    const TWO_PI = _Math.TWO_PI;
    const MAX_UNITS = StandardMesh.MAX_UNITS;
    const cos = _Math.cos;
    const sin = _Math.sin;
    const hasNormals = this.hasNormals;
    const inside = this.inside;

    var unit, numVertices, vba;
    var tcoord;
    var t, i;
    var vertexBuffer, ibuffer;
    var mesh;

    if (open) {
        numVertices = axisSamples * (radialSamples + 1);
        var numTriangles = 2 * (axisSamples - 1) * radialSamples;
        var numIndices = 3 * numTriangles;

        // Create a vertex buffer.
        vertexBuffer = new VertexBuffer(numVertices, stride, usage);
        vba = new VertexBufferAccessor(format, vertexBuffer);

        // Generate geometry.
        var invRS = 1 / radialSamples;
        var invASm1 = 1 / (axisSamples - 1);
        var halfHeight = 0.5 * height;
        var r, a, aStart, angle;

        // Generate points on the unit circle to be used in computing the
        // mesh points on a cylinder slice.
        var cs = new Float32Array(radialSamples + 1);
        var sn = new Float32Array(radialSamples + 1);
        for (r = 0; r < radialSamples; ++r) {
            angle = TWO_PI * invRS * r;
            cs[r] = cos(angle);
            sn[r] = sin(angle);
        }
        cs[radialSamples] = cs[0];
        sn[radialSamples] = sn[0];

        // Generate the cylinder itself.
        for (a = 0, i = 0; a < axisSamples; ++a) {
            var axisFraction = a * invASm1;  // in [0,1]
            var z = -halfHeight + height * axisFraction;

            // Compute center of slice.
            var sliceCenter = new Point(0, 0, z);

            // Compute slice vertices with duplication at endpoint.
            var save = i;
            for (r = 0; r < radialSamples; ++r) {
                var radialFraction = r * invRS;  // in [0,1)
                var normal = new Vector(cs[r], sn[r], 0);
                t = sliceCenter.add(normal.scalar(radius));
                vba.setPosition(i, [t.x, t.y, t.z]);

                if (hasNormals) {
                    if (inside) {
                        normal = normal.negative();
                    }
                    vba.setNormal(i, [normal.x, normal.y, normal.z]);
                }

                tcoord = [radialFraction, axisFraction];
                for (unit = 0; unit < MAX_UNITS; ++unit) {
                    if (this.hasTCoords[unit]) {
                        vba.setTCoord(unit, i, tcoord);
                    }
                }

                ++i;
            }

            vba.setPosition(i, vba.getPosition(save));
            if (hasNormals) {
                vba.setNormal(i, vba.getNormal(save));
            }

            tcoord = [1, axisFraction];
            for (unit = 0; unit < MAX_UNITS; ++unit) {
                if (this.hasTCoords[unit]) {
                    vba.setTCoord(0, i, tcoord);
                }
            }

            ++i;
        }
        this.transformData(vba);

        // Generate indices.
        ibuffer = new IndexBuffer(numIndices, 4, usage);
        var indices = new Uint32Array(ibuffer.getData().buffer);
        var j = 0;
        for (a = 0, aStart = 0; a < axisSamples - 1; ++a) {
            var i0 = aStart;
            var i1 = i0 + 1;
            aStart += radialSamples + 1;
            var i2 = aStart;
            var i3 = i2 + 1;
            for (i = 0; i < radialSamples; ++i, j += 6) {
                if (inside) {
                    indices[j] = i0++;
                    indices[j + 1] = i2;
                    indices[j + 2] = i1;
                    indices[j + 3] = i1++;
                    indices[j + 4] = i2++;
                    indices[j + 5] = i3++;
                }
                else { // outside view
                    indices[j] = i0++;
                    indices[j + 1] = i1;
                    indices[j + 2] = i2;
                    indices[j + 3] = i1++;
                    indices[j + 4] = i3++;
                    indices[j + 5] = i2++;
                }
            }
        }
        mesh = new TriMesh(format, vertexBuffer, ibuffer);
    }
    else {
        mesh = this.sphere(axisSamples, radialSamples, radius);
        vertexBuffer = mesh.vertexBuffer;
        numVertices = vertexBuffer.numElements;
        vba = new VertexBufferAccessor(format, vertexBuffer);

        // Flatten sphere at poles.
        var hDiv2 = 0.5 * height;
        vba.getPosition(numVertices - 2)[2] = -hDiv2;  // south pole
        vba.getPosition(numVertices - 1)[2] = +hDiv2;  // north pole

        // Remap z-values to [-h/2,h/2].
        var zFactor = 2 / (axisSamples - 1);
        var tmp0 = radius * (-1 + zFactor);
        var tmp1 = 1 / (radius * (1 - zFactor));
        for (i = 0; i < numVertices - 2; ++i) {
            var pos = vba.getPosition(i);
            pos[2] = hDiv2 * (-1 + tmp1 * (pos[2] - tmp0));
            var adjust = radius * _Math.invSqrt(pos[0] * pos[0] + pos[1] * pos[1]);
            pos[0] *= adjust;
            pos[1] *= adjust;
        }
        this.transformData(vba);

        if (hasNormals) {
            mesh.updateModelSpace(Visual.GU_NORMALS);
        }
    }

    mesh.modelBound.center = Point.ORIGIN;
    mesh.modelBound.radius = _Math.sqrt(radius * radius + height * height);
    return mesh;
};

/**
 * 球体
 * 物体中心:(0,0,0), 半径: radius, 北极点(0,0,radius), 南极点(0,0,-radius)
 *
 * @param radius {float} 球体半径
 * @param zSamples {int}
 * @param radialSamples {int}
 */
StandardMesh.prototype.sphere = function (zSamples, radialSamples, radius) {
    const MAX_UNITS = StandardMesh.MAX_UNITS;
    const TWO_PI = _Math.TWO_PI;
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;
    const hasNormal = this.hasNormals;
    const inside = this.inside;

    var zsm1 = zSamples - 1,
        zsm2 = zSamples - 2,
        zsm3 = zSamples - 3;
    var rsp1 = radialSamples + 1;
    var numVertices = zsm2 * rsp1 + 2;
    var numTriangles = 2 * zsm2 * radialSamples;
    var numIndices = 3 * numTriangles;

    // Create a vertex buffer.
    var vbuffer = new VertexBuffer(numVertices, stride, usage);
    var vba = new VertexBufferAccessor(format, vbuffer);

    // Generate geometry.
    var invRS = 1 / radialSamples;
    var zFactor = 2 / zsm1;
    var r, z, zStart, i, unit, tcoord, angle;

    // Generate points on the unit circle to be used in computing the mesh
    // points on a cylinder slice.
    var sn = new Float32Array(rsp1);
    var cs = new Float32Array(rsp1);
    for (r = 0; r < radialSamples; ++r) {
        angle = TWO_PI * invRS * r;
        cs[r] = _Math.cos(angle);
        sn[r] = _Math.sin(angle);
    }
    sn[radialSamples] = sn[0];
    cs[radialSamples] = cs[0];

    var t;

    // Generate the cylinder itself.
    for (z = 1, i = 0; z < zsm1; ++z) {
        var zFraction = zFactor * z - 1;  // in (-1,1)
        var zValue = radius * zFraction;

        // Compute center of slice.
        var sliceCenter = new Point(0, 0, zValue);

        // Compute radius of slice.
        var sliceRadius = _Math.sqrt(_Math.abs(radius * radius - zValue * zValue));

        // Compute slice vertices with duplication at endpoint.
        var save = i;
        for (r = 0; r < radialSamples; ++r) {
            var radialFraction = r * invRS;  // in [0,1)
            var radial = new Vector(cs[r], sn[r], 0);
            t = radial.scalar(sliceRadius).add(sliceCenter);
            vba.setPosition(i, [t.x, t.y, t.z]);

            if (hasNormal) {
                t.normalize();
                if (inside) {
                    t = t.negative();
                }
                vba.setNormal(i, [t.x, t.y, t.z]);
            }

            tcoord = [radialFraction, 0.5 * (zFraction + 1)];
            for (unit = 0; unit < MAX_UNITS; ++unit) {
                if (this.hasTCoords[unit]) {
                    vba.setTCoord(unit, i, tcoord);
                }
            }
            ++i;
        }

        vba.setPosition(i, vba.getPosition(save));
        if (hasNormal) {
            vba.setNormal(i, vba.getNormal(save));
        }

        tcoord = [1, 0.5 * (zFraction + 1)];
        for (unit = 0; unit < MAX_UNITS; ++unit) {
            if (this.hasTCoords[unit]) {
                vba.setTCoord(unit, i, tcoord);
            }
        }
        ++i;
    }

    // south pole
    vba.setPosition(i, [0, 0, -radius]);
    var nor = [0, 0, inside ? 1 : -1];
    if (hasNormal) {
        vba.setNormal(i, nor);
    }
    tcoord = [0.5, 0.5];
    for (unit = 0; unit < MAX_UNITS; ++unit) {
        if (this.hasTCoords[unit]) {
            vba.setTCoord(unit, i, tcoord);
        }
    }
    ++i;

    // north pole
    vba.setPosition(i, [0, 0, radius]);
    nor = [0, 0, inside ? -1 : 1];
    if (hasNormal) {
        vba.setNormal(i, nor);
    }
    tcoord = [0.5, 1];
    for (unit = 0; unit < MAX_UNITS; ++unit) {
        if (this.hasTCoords[unit]) {
            vba.setTCoord(unit, i, tcoord);
        }
    }
    ++i;

    this.transformData(vba);

    // Generate indices.
    var ibuffer = new IndexBuffer(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    var j;
    for (z = 0, j = 0, zStart = 0; z < zsm3; ++z) {
        var i0 = zStart;
        var i1 = i0 + 1;
        zStart += rsp1;
        var i2 = zStart;
        var i3 = i2 + 1;
        for (i = 0; i < radialSamples; ++i, j += 6) {
            if (inside) {
                indices[j] = i0++;
                indices[j + 1] = i2;
                indices[j + 2] = i1;
                indices[j + 3] = i1++;
                indices[j + 4] = i2++;
                indices[j + 5] = i3++;
            }
            else  // inside view
            {
                indices[j] = i0++;
                indices[j + 1] = i1;
                indices[j + 2] = i2;
                indices[j + 3] = i1++;
                indices[j + 4] = i3++;
                indices[j + 5] = i2++;
            }
        }
    }

    // south pole triangles
    var numVerticesM2 = numVertices - 2;
    for (i = 0; i < radialSamples; ++i, j += 3) {
        if (inside) {
            indices[j] = i;
            indices[j + 1] = i + 1;
            indices[j + 2] = numVerticesM2;
        }
        else {
            indices[j] = i;
            indices[j + 1] = numVerticesM2;
            indices[j + 2] = i + 1;
        }
    }

    // north pole triangles
    var numVerticesM1 = numVertices - 1,
        offset = zsm3 * rsp1;
    for (i = 0; i < radialSamples; ++i, j += 3) {
        if (inside) {
            indices[j] = i + offset;
            indices[j + 1] = numVerticesM1;
            indices[j + 2] = i + 1 + offset;
        }
        else {
            indices[j] = i + offset;
            indices[j + 1] = i + 1 + offset;
            indices[j + 2] = numVerticesM1;
        }
    }

    // The duplication of vertices at the seam cause the automatically
    // generated bounding volume to be slightly off center.  Reset the bound
    // to use the true information.
    var mesh = new TriMesh(this.format, vbuffer, ibuffer);
    mesh.modelBound.center = Point.ORIGIN;
    mesh.modelBound.radius = radius;
    return mesh;
};

/**
 * 圆环
 * @param circleSamples {int} 大圆细分
 * @param radialSamples {int} 小圆细分
 * @param outerRadius {float} 大圆半径
 * @param innerRadius {float} 小圆半径
 * @returns {TriMesh}
 */
StandardMesh.prototype.torus = function (circleSamples, radialSamples, outerRadius, innerRadius) {
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;
    const hasNormals = this.hasNormals;
    const inside = this.inside;
    const MAX_UNITS = StandardMesh.MAX_UNITS;

    const TWO_PI = _Math.TWO_PI;
    const cos = _Math.cos;
    const sin = _Math.sin;

    var numVertices = (circleSamples + 1) * (radialSamples + 1);
    var numTriangles = 2 * circleSamples * radialSamples;
    var numIndices = 3 * numTriangles;

    // Create a vertex buffer.
    var vbuffer = new VertexBuffer(numVertices, stride, usage);
    var vba = new VertexBufferAccessor(format, vbuffer);

    // Generate geometry.
    var invCS = 1 / circleSamples;
    var invRS = 1 / radialSamples;
    var c, r, i, save, unit, tcoord;
    var circleFraction, theta, cosTheta, sinTheta;
    var radialFraction, phi, cosPhi, sinPhi;
    var radial = Vector.ZERO;
    var torusMiddle = Vector.ZERO;
    var normal = Vector.ZERO;

    // Generate the cylinder itself.
    for (c = 0, i = 0; c < circleSamples; ++c) {
        // Compute center point on torus circle at specified angle.
        circleFraction = c * invCS;  // in [0,1)
        theta = TWO_PI * circleFraction;
        cosTheta = cos(theta);
        sinTheta = sin(theta);
        radial.assign(cosTheta, sinTheta, 0);
        torusMiddle.assign(cosTheta * outerRadius, sinTheta * outerRadius, 0);

        // Compute slice vertices with duplication at endpoint.
        save = i;
        for (r = 0; r < radialSamples; ++r) {
            radialFraction = r * invRS;  // in [0,1)
            phi = TWO_PI * radialFraction;
            cosPhi = cos(phi);
            sinPhi = sin(phi);

            normal.assign(innerRadius * cosTheta * cosPhi, innerRadius * sinTheta * cosPhi, innerRadius * sinPhi);
            vba.setPosition(i, torusMiddle.add(normal));
            if (hasNormals) {
                if (inside) {
                    normal.assign(-normal.x, -normal.y, -normal.z);
                }
                vba.setNormal(i, normal);
            }

            tcoord = [radialFraction, circleFraction];
            for (unit = 0; unit < MAX_UNITS; ++unit) {
                if (this.hasTCoords[unit]) {
                    vba.setTCoord(unit, i, tcoord);
                }
            }

            ++i;
        }

        vba.setPosition(i, vba.getPosition(save));
        if (hasNormals) {
            vba.setNormal(i, vba.getNormal(save));
        }

        tcoord = [1, circleFraction];
        for (unit = 0; unit < MAX_UNITS; ++unit) {
            if (this.hasTCoords[unit]) {
                vba.setTCoord(unit, i, tcoord);
            }
        }

        ++i;
    }

    // Duplicate the cylinder ends to form a torus.
    for (r = 0; r <= radialSamples; ++r, ++i) {
        vba.setPosition(i, vba.getPosition(r));
        if (hasNormals) {
            vba.setNormal(i, vba.getNormal(r));
        }

        for (unit = 0; unit < MAX_UNITS; ++unit) {
            if (this.hasTCoords[unit]) {
                vba.setTCoord(unit, i, [vba.getTCoord(unit, r)[0], 1]);
            }
        }
    }

    this.transformData(vba);

    // Generate indices.
    var ibuffer = new IndexBuffer(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    var i0, i1, i2, i3, offset = 0;
    var cStart = 0;
    for (c = 0; c < circleSamples; ++c) {
        i0 = cStart;
        i1 = i0 + 1;
        cStart += radialSamples + 1;
        i2 = cStart;
        i3 = i2 + 1;
        for (i = 0; i < radialSamples; ++i, offset += 6) {
            if (inside) {
                indices[offset] = i0++;
                indices[offset + 1] = i1;
                indices[offset + 2] = i2;
                indices[offset + 3] = i1++;
                indices[offset + 4] = i3++;
                indices[offset + 5] = i2++;
            }
            else {  // inside view
                indices[offset] = i0++;
                indices[offset + 1] = i2;
                indices[offset + 2] = i1;
                indices[offset + 3] = i1++;
                indices[offset + 4] = i2++;
                indices[offset + 5] = i3++;
            }
        }
    }

    // The duplication of vertices at the seam cause the automatically
    // generated bounding volume to be slightly off center.  Reset the bound
    // to use the true information.
    var mesh = new TriMesh(format, vbuffer, ibuffer);
    mesh.modelBound.center.assign(0, 0, 0);
    mesh.modelBound.radius = outerRadius;
    return mesh;
};

/**
 * 四面体
 */
StandardMesh.prototype.tetrahedron = function () {
    const fSqrt2Div3 = _Math.sqrt(2) / 3;
    const fSqrt6Div3 = _Math.sqrt(6) / 3;
    const fOneThird = 1 / 3;

    const numVertices = 4;
    const numTriangles = 4;
    const numIndices = 12;
    const stride = this.format.stride;

    // Create a vertex buffer.
    var vbuffer = new VertexBuffer(numVertices, stride, this.usage);
    var vba = new VertexBufferAccessor(this.format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [0, 0, 1]);
    vba.setPosition(1, [2 * fSqrt2Div3, 0, -fOneThird]);
    vba.setPosition(2, [-fSqrt2Div3, fSqrt6Div3, -fOneThird]);
    vba.setPosition(3, [-fSqrt2Div3, -fSqrt6Div3, -fOneThird]);
    this.createPlatonicNormals(vba);
    this.createPlatonicUVs(vba);
    this.transformData(vba);

    // Generate indices.
    var ibuffer = new IndexBuffer(numIndices, 4, this.usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 0;
    indices[1] = 1;
    indices[2] = 2;
    indices[3] = 0;
    indices[4] = 2;
    indices[5] = 3;
    indices[6] = 0;
    indices[7] = 3;
    indices[8] = 1;
    indices[9] = 1;
    indices[10] = 3;
    indices[11] = 2;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    return new TriMesh(this.format, vbuffer, ibuffer);
};
/**
 * 六面体
 */
StandardMesh.prototype.hexahedron = function () {
    const fSqrtThird = _Math.sqrt(1 / 3);

    const numVertices = 8;
    const numTriangles = 12;
    const numIndices = 36;
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;

    // Create a vertex buffer.
    var vbuffer = new VertexBuffer(numVertices, stride, usage);
    var vba = new VertexBufferAccessor(format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [-fSqrtThird, -fSqrtThird, -fSqrtThird]);
    vba.setPosition(1, [fSqrtThird, -fSqrtThird, -fSqrtThird]);
    vba.setPosition(2, [fSqrtThird, fSqrtThird, -fSqrtThird]);
    vba.setPosition(3, [-fSqrtThird, fSqrtThird, -fSqrtThird]);
    vba.setPosition(4, [-fSqrtThird, -fSqrtThird, fSqrtThird]);
    vba.setPosition(5, [fSqrtThird, -fSqrtThird, fSqrtThird]);
    vba.setPosition(6, [fSqrtThird, fSqrtThird, fSqrtThird]);
    vba.setPosition(7, [-fSqrtThird, fSqrtThird, fSqrtThird]);
    this.createPlatonicNormals(vba);
    this.createPlatonicUVs(vba);
    this.transformData(vba);

    // Generate indices.
    var ibuffer = new IndexBuffer(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 0;
    indices[1] = 3;
    indices[2] = 2;
    indices[3] = 0;
    indices[4] = 2;
    indices[5] = 1;
    indices[6] = 0;
    indices[7] = 1;
    indices[8] = 5;
    indices[9] = 0;
    indices[10] = 5;
    indices[11] = 4;
    indices[12] = 0;
    indices[13] = 4;
    indices[14] = 7;
    indices[15] = 0;
    indices[16] = 7;
    indices[17] = 3;
    indices[18] = 6;
    indices[19] = 5;
    indices[20] = 1;
    indices[21] = 6;
    indices[22] = 1;
    indices[23] = 2;
    indices[24] = 6;
    indices[25] = 2;
    indices[26] = 3;
    indices[27] = 6;
    indices[28] = 3;
    indices[29] = 7;
    indices[30] = 6;
    indices[31] = 7;
    indices[32] = 4;
    indices[33] = 6;
    indices[34] = 4;
    indices[35] = 5;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    return new TriMesh(this.format, vbuffer, ibuffer);
};
/**
 * 八面体
 */
StandardMesh.prototype.octahedron = function () {
    const numVertices = 6;
    const numTriangles = 8;
    const numIndices = 24;
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;

    // Create a vertex buffer.
    var vbuffer = new VertexBuffer(numVertices, stride, usage);
    var vba = new VertexBufferAccessor(format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [1, 0, 0]);
    vba.setPosition(1, [-1, 0, 0]);
    vba.setPosition(2, [0, 1, 0]);
    vba.setPosition(3, [0, -1, 0]);
    vba.setPosition(4, [0, 0, 1]);
    vba.setPosition(5, [0, 0, -1]);
    this.createPlatonicNormals(vba);
    this.createPlatonicUVs(vba);
    this.transformData(vba);

    // Generate indices.
    var ibuffer = new IndexBuffer(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 4;
    indices[1] = 0;
    indices[2] = 2;
    indices[3] = 4;
    indices[4] = 2;
    indices[5] = 1;
    indices[6] = 4;
    indices[7] = 1;
    indices[8] = 3;
    indices[9] = 4;
    indices[10] = 3;
    indices[11] = 0;
    indices[12] = 5;
    indices[13] = 2;
    indices[14] = 0;
    indices[15] = 5;
    indices[16] = 1;
    indices[17] = 2;
    indices[18] = 5;
    indices[19] = 3;
    indices[20] = 1;
    indices[21] = 5;
    indices[22] = 0;
    indices[23] = 3;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    return new TriMesh(this.format, vbuffer, ibuffer);
};
/**
 * 十二面体
 */
StandardMesh.prototype.dodecahedron = function () {
    const a = 1 / _Math.sqrt(3);
    const b = _Math.sqrt((3 - _Math.sqrt(5)) / 6);
    const c = _Math.sqrt((3 + _Math.sqrt(5)) / 6);

    const numVertices = 20;
    const numTriangles = 36;
    const numIndices = 108;
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;

    // Create a vertex buffer.
    var vbuffer = new VertexBuffer(numVertices, stride, usage);
    var vba = new VertexBufferAccessor(this.format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [a, a, a]);
    vba.setPosition(1, [a, a, -a]);
    vba.setPosition(2, [a, -a, a]);
    vba.setPosition(3, [a, -a, -a]);
    vba.setPosition(4, [-a, a, a]);
    vba.setPosition(5, [-a, a, -a]);
    vba.setPosition(6, [-a, -a, a]);
    vba.setPosition(7, [-a, -a, -a]);
    vba.setPosition(8, [b, c, 0]);
    vba.setPosition(9, [-b, c, 0]);
    vba.setPosition(10, [b, -c, 0]);
    vba.setPosition(11, [-b, -c, 0]);
    vba.setPosition(12, [c, 0, b]);
    vba.setPosition(13, [c, 0, -b]);
    vba.setPosition(14, [-c, 0, b]);
    vba.setPosition(15, [-c, 0, -b]);
    vba.setPosition(16, [0, b, c]);
    vba.setPosition(17, [0, -b, c]);
    vba.setPosition(18, [0, b, -c]);
    vba.setPosition(19, [0, -b, -c]);
    this.createPlatonicNormals(vba);
    this.createPlatonicUVs(vba);
    this.transformData(vba);

    // Generate indices.
    var ibuffer = new IndexBuffer(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 0;
    indices[1] = 8;
    indices[2] = 9;
    indices[3] = 0;
    indices[4] = 9;
    indices[5] = 4;
    indices[6] = 0;
    indices[7] = 4;
    indices[8] = 16;
    indices[9] = 0;
    indices[10] = 12;
    indices[11] = 13;
    indices[12] = 0;
    indices[13] = 13;
    indices[14] = 1;
    indices[15] = 0;
    indices[16] = 1;
    indices[17] = 8;
    indices[18] = 0;
    indices[19] = 16;
    indices[20] = 17;
    indices[21] = 0;
    indices[22] = 17;
    indices[23] = 2;
    indices[24] = 0;
    indices[25] = 2;
    indices[26] = 12;
    indices[27] = 8;
    indices[28] = 1;
    indices[29] = 18;
    indices[30] = 8;
    indices[31] = 18;
    indices[32] = 5;
    indices[33] = 8;
    indices[34] = 5;
    indices[35] = 9;
    indices[36] = 12;
    indices[37] = 2;
    indices[38] = 10;
    indices[39] = 12;
    indices[40] = 10;
    indices[41] = 3;
    indices[42] = 12;
    indices[43] = 3;
    indices[44] = 13;
    indices[45] = 16;
    indices[46] = 4;
    indices[47] = 14;
    indices[48] = 16;
    indices[49] = 14;
    indices[50] = 6;
    indices[51] = 16;
    indices[52] = 6;
    indices[53] = 17;
    indices[54] = 9;
    indices[55] = 5;
    indices[56] = 15;
    indices[57] = 9;
    indices[58] = 15;
    indices[59] = 14;
    indices[60] = 9;
    indices[61] = 14;
    indices[62] = 4;
    indices[63] = 6;
    indices[64] = 11;
    indices[65] = 10;
    indices[66] = 6;
    indices[67] = 10;
    indices[68] = 2;
    indices[69] = 6;
    indices[70] = 2;
    indices[71] = 17;
    indices[72] = 3;
    indices[73] = 19;
    indices[74] = 18;
    indices[75] = 3;
    indices[76] = 18;
    indices[77] = 1;
    indices[78] = 3;
    indices[79] = 1;
    indices[80] = 13;
    indices[81] = 7;
    indices[82] = 15;
    indices[83] = 5;
    indices[84] = 7;
    indices[85] = 5;
    indices[86] = 18;
    indices[87] = 7;
    indices[88] = 18;
    indices[89] = 19;
    indices[90] = 7;
    indices[91] = 11;
    indices[92] = 6;
    indices[93] = 7;
    indices[94] = 6;
    indices[95] = 14;
    indices[96] = 7;
    indices[97] = 14;
    indices[98] = 15;
    indices[99] = 7;
    indices[100] = 19;
    indices[101] = 3;
    indices[102] = 7;
    indices[103] = 3;
    indices[104] = 10;
    indices[105] = 7;
    indices[106] = 10;
    indices[107] = 11;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    return new TriMesh(format, vbuffer, ibuffer);
};
/**
 * 二十面体
 */
StandardMesh.prototype.icosahedron = function () {
    const goldenRatio = 0.5 * (1 + _Math.sqrt(5));
    const invRoot = 1 / _Math.sqrt(1 + goldenRatio * goldenRatio);
    const u = goldenRatio * invRoot;
    const v = invRoot;

    const numVertices = 12;
    const numTriangles = 20;
    const numIndices = 60;
    const format = this.format;
    const stride = format.stride;
    const usage = this.usage;

    // Create a vertex buffer.
    var vbuffer = new VertexBuffer(numVertices, stride, usage);
    var vba = new VertexBufferAccessor(this.format, vbuffer);

    // Generate geometry.
    vba.setPosition(0, [u, v, 0]);
    vba.setPosition(1, [-u, v, 0]);
    vba.setPosition(2, [u, -v, 0]);
    vba.setPosition(3, [-u, -v, 0]);
    vba.setPosition(4, [v, 0, u]);
    vba.setPosition(5, [v, 0, -u]);
    vba.setPosition(6, [-v, 0, u]);
    vba.setPosition(7, [-v, 0, -u]);
    vba.setPosition(8, [0, u, v]);
    vba.setPosition(9, [0, -u, v]);
    vba.setPosition(10, [0, u, -v]);
    vba.setPosition(11, [0, -u, -v]);

    this.createPlatonicNormals(vba);
    this.createPlatonicUVs(vba);
    this.transformData(vba);

    // Generate indices.
    var ibuffer = new IndexBuffer(numIndices, 4, usage);
    var indices = new Uint32Array(ibuffer.getData().buffer);
    indices[0] = 0;
    indices[1] = 8;
    indices[2] = 4;
    indices[3] = 0;
    indices[4] = 5;
    indices[5] = 10;
    indices[6] = 2;
    indices[7] = 4;
    indices[8] = 9;
    indices[9] = 2;
    indices[10] = 11;
    indices[11] = 5;
    indices[12] = 1;
    indices[13] = 6;
    indices[14] = 8;
    indices[15] = 1;
    indices[16] = 10;
    indices[17] = 7;
    indices[18] = 3;
    indices[19] = 9;
    indices[20] = 6;
    indices[21] = 3;
    indices[22] = 7;
    indices[23] = 11;
    indices[24] = 0;
    indices[25] = 10;
    indices[26] = 8;
    indices[27] = 1;
    indices[28] = 8;
    indices[29] = 10;
    indices[30] = 2;
    indices[31] = 9;
    indices[32] = 11;
    indices[33] = 3;
    indices[34] = 11;
    indices[35] = 9;
    indices[36] = 4;
    indices[37] = 2;
    indices[38] = 0;
    indices[39] = 5;
    indices[40] = 0;
    indices[41] = 2;
    indices[42] = 6;
    indices[43] = 1;
    indices[44] = 3;
    indices[45] = 7;
    indices[46] = 3;
    indices[47] = 1;
    indices[48] = 8;
    indices[49] = 6;
    indices[50] = 4;
    indices[51] = 9;
    indices[52] = 4;
    indices[53] = 6;
    indices[54] = 10;
    indices[55] = 5;
    indices[56] = 7;
    indices[57] = 11;
    indices[58] = 7;
    indices[59] = 5;

    if (this.inside) {
        this.reverseTriangleOrder(numTriangles, indices);
    }

    return new TriMesh(format, vbuffer, ibuffer);
};

/**
 * @param vba {VertexBufferAccessor}
 */
StandardMesh.prototype.transformData = function (vba) {
    if (this.transform.isIdentity()) {
        return;
    }

    const numVertices = vba.numVertices;
    var i, f3, t;
    for (i = 0; i < numVertices; ++i) {
        t = vba.getPosition(i);
        f3 = new Point(t);
        f3 = this.transform.mulPoint(f3);
        t[0] = f3.x;
        t[1] = f3.y;
        t[2] = f3.z;
    }

    if (this.hasNormals) {
        for (i = 0; i < numVertices; ++i) {
            t = vba.getNormal(i);
            f3 = (new Vector(t)).normalize();
            t[0] = f3.x;
            t[1] = f3.y;
            t[2] = f3.z;
        }
    }
};
