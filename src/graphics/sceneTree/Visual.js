/**
 * Visual
 */
import { Spatial } from './Spatial'
import { Bound } from '../dataTypes/Bound'
import * as util from '../../util/util'
import { VertexFormat, VertexBufferAccessor, VertexBuffer } from '../resources/namespace'

export class Visual extends Spatial {

    /**
     * @param {number} type primitiveType
     * @param {VertexFormat} format
     * @param {VertexBuffer} vertexBuffer
     * @param {IndexBuffer} indexBuffer
     */
    constructor(type, format, vertexBuffer, indexBuffer) {
        super();
        this.primitiveType = type || Visual.PT_NONE;

        /**
         * @type {VertexFormat}
         */
        this.format = format;

        /**
         * @type {VertexBuffer}
         */
        this.vertexBuffer = vertexBuffer;

        /**
         * @type {IndexBuffer}
         */
        this.indexBuffer = indexBuffer;
        this.modelBound = new Bound();

        /**
         * Shader effect used to draw the Visual.
         * @type {VisualEffectInstance}
         * @private
         */
        this.effect = null;

        // true则以线框模式渲染
        this.wire = false;

        if (format && vertexBuffer && indexBuffer) {
            this.updateModelSpace(Spatial.GU_MODEL_BOUND_ONLY);
        }
    }

    updateModelSpace(type) {
        this.updateModelBound();
    }

    updateWorldBound() {
        this.modelBound.transformBy(this.worldTransform, this.worldBound);
    }

    updateModelBound() {
        var numVertices = this.vertexBuffer.numElements;
        const format = this.format;
        var stride = format.stride;

        var posIndex = format.getIndex(VertexFormat.AU_POSITION);
        if (posIndex == -1) {
            console.assert(false, 'Update requires vertex positions');
            return;
        }

        var posType = format.getAttributeType(posIndex);
        if (posType != VertexFormat.AT_FLOAT3 && posType != VertexFormat.AT_FLOAT4) {
            console.assert(false, 'Positions must be 3-tuples or 4-tuples');
            return;
        }

        var data = this.vertexBuffer.getData();
        var posOffset = format.getOffset(posIndex);
        this.modelBound.computeFromData(numVertices, stride, data.slice(posOffset).buffer);
    }

    /**
     * Support for hierarchical culling.
     * @param {Culler} culler
     * @param {boolean} noCull
     */
    getVisibleSet(culler, noCull) {
        culler.insert(this);
    }

    /**
     * @param fileName {string} 文件
     */
    static loadWMVF(fileName) {
        return new Promise(function (resolve, reject) {
            var load = new L5.XhrTask(fileName, 'arraybuffer');
            load.then(function (data) {
                var inFile = new DataView(data);
                var ret = {};
                inFile.offset = 0;
                ret.primitiveType = inFile.getInt32(inFile.offset, true);
                inFile.offset += 4;

                ret.format = Visual.loadVertexFormat(inFile); // ok
                ret.vertexBuffer = Visual.loadVertexBuffer(inFile, ret.format);
                ret.indexBuffer = Visual.loadIndexBuffer(inFile);

                console.log(data.byteLength);
                console.log(inFile.offset);

                resolve(ret);
            }).catch(function (err) {
                console.log(err);
                reject(err);
            });
        }).catch(function (err) {
            console.assert(false, "Failed to open file :" + fileName);
        });
    }

    /**
     * 解析顶点格式
     * @param inFile {DataView}
     * @returns {VertexFormat}
     */
    static loadVertexFormat(inFile) {
        var numAttributes = inFile.getInt32(inFile.offset, true);
        inFile.offset += 4;

        var format = new VertexFormat(numAttributes);
        var streamIndex, offset, usageIndex, type, usage;

        for (var i = 0; i < numAttributes; ++i) {
            streamIndex = inFile.getUint32(inFile.offset, true);
            inFile.offset += 4;

            offset = inFile.getUint32(inFile.offset, true);
            inFile.offset += 4;

            type = inFile.getInt32(inFile.offset, true);
            inFile.offset += 4;

            usage = inFile.getInt32(inFile.offset, true);
            inFile.offset += 4;

            usageIndex = inFile.getUint32(inFile.offset, true);
            inFile.offset += 4;

            format.setAttribute(i, streamIndex, offset, type, usage, usageIndex);
        }

        format.stride = inFile.getInt32(inFile.offset, true);
        inFile.offset += 4;

        return format;
    }

    /**
     * 解析顶点缓冲对象
     * @param {BinDataView} inFile
     * @param {VertexFormat} format
     * @returns {VertexBuffer}
     */
    static loadVertexBuffer(inFile, format) {
        var numElements = inFile.getInt32(inFile.offset, true);
        inFile.offset += 4;

        var elementSize = inFile.getInt32(inFile.offset, true);
        inFile.offset += 4;

        var usage = inFile.getInt32(inFile.offset, true);
        inFile.offset += 4;

        var buffer = new VertexBuffer(numElements, elementSize, usage);
        var vba = new VertexBufferAccessor(format, buffer);
        // end ok

        vba.read(inFile);

        return buffer;
    }

    /**
     * @param {BinDataView} inFile
     * @returns {IndexBuffer}
     */
    static loadIndexBuffer(inFile) {
        var numElements = inFile.getInt32(inFile.offset, true);
        inFile.offset += 4;

        if (numElements > 0) {
            var elementSize = inFile.getInt32(inFile.offset, true);
            inFile.offset += 4;
            var usage = inFile.getInt32(inFile.offset, true);
            inFile.offset += 4;
            var offset = inFile.getInt32(inFile.offset, true);
            inFile.offset += 4;

            var buffer = new IndexBuffer(numElements, elementSize, usage);
            buffer.offset = offset;
            //var start = inFile.offset;
            // var end = start + buffer.numBytes;
            buffer.getData().set(new Uint8Array(inFile.buffer, inFile.offset, buffer.numBytes));

            inFile.offset += buffer.numBytes;

            return buffer;
        }

        return null;
    }

    /**
     * @param {InStream} inStream
     */
    load(inStream) {
        super.load(inStream);
        this.type = inStream.readEnum();
        this.modelBound = inStream.readBound();
        this.format = inStream.readPointer();
        this.vertexBuffer = inStream.readPointer();
        this.indexBuffer = inStream.readPointer();
        this.effect = inStream.readPointer();
    }

    link(inStream) {
        super.link(inStream);
        this.format = inStream.resolveLink(this.format);
        this.vertexBuffer = inStream.resolveLink(this.vertexBuffer);
        this.indexBuffer = inStream.resolveLink(this.indexBuffer);
        this.effect = inStream.resolveLink(this.effect);
    }
}

/////////////////// 绘制类型 //////////////////////////////
util.DECLARE_ENUM(Visual, {
    PT_NONE: 0,  // 默认
    PT_POLYPOINT: 1,   // 点
    PT_POLYSEGMENTS_DISJOINT: 2,
    PT_POLYSEGMENTS_CONTIGUOUS: 3,
    PT_TRIANGLES: 4,  // abstract
    PT_TRIMESH: 5,
    PT_TRISTRIP: 6,
    PT_TRIFAN: 7,
    PT_MAX_QUANTITY: 8
}, false);

// Geometric updates.  If the positions in the vertex buffer have been
// modified, you might want to update the surface frames (normals,
// tangents, and bitangents) for indexed-triangle primitives.  It is
// assumed that the positions have been updated and the vertex buffer is
// unlocked.  The argument of UpdateModelSpace specifies the update
// algorithm:
//
//   GU_MODEL_BOUND_ONLY:
//      Update only the model-space bound of the new positions.
//
// For the other options, the model-space bound is always recomputed,
// regardless of type of primitive.  For the surface frames to be updated,
// the Visual must represent an indexed-triangle primitive and must have
// the relevant channels (normal, tangents, bitangents).  If the primitive
// is not indexed triangles, the update call does nothing to the frames.
// An update occurs only for those channels present in the vertex buffer.
// For example, if the vertex buffer has no normals, GU_NORMALS will
// have no effect on the vertex buffer.  As another example, if you
// specify GU_USE_GEOMETRY and the vertex buffer has normals and tangents
// but not bitangents, only normals and tangents are updated (i.e. the
// vertex buffer is not regenerated to have bitangents).
//
//   GU_NORMALS:
//      Update the normals.
//
//   GU_USE_GEOMETRY:
//      Use the mesh topology to determine the surface frames.  The
//      algorithm uses a least-squares method, which is expensive.
//
//   GU_USE_TCOORD_CHANNEL + nonnegative_integer:
//      The standard way to generate surface frames is to use a texture
//      coordinate unit from the vertex buffer.
//
// To reduce video memory usage by the vertex buffers, if your vertex
// shaders use normals, tangents, and bitangents, consider passing in
// normals and tangents, and then have the shader compute the bitangent as
//    bitangent = Cross(normal, tangent)
util.DECLARE_ENUM(Visual, {
    GU_MODEL_BOUND_ONLY: -3,
    GU_NORMALS: -2,
    GU_USE_GEOMETRY: -1,
    GU_USE_TCOORD_CHANNEL: 0
});