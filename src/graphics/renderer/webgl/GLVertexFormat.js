import { default as webgl } from './GLMapping';
import { VertexFormat } from '../../resources/VertexFormat';

class GLVertexFormat {
    /**
     * @param {WebGL2RenderingContext} gl
     * @param {VertexFormat} format
     */
    constructor(gl, format) {
        this.stride = format.stride;

        let type;

        let i = format.getIndex(VertexFormat.AU_POSITION);
        if (i >= 0) {
            this.hasPosition = 1;
            type = format.getAttributeType(i);
            this.positionType = webgl.AttributeType[type]; // 属性元素类型
            this.positionChannels = webgl.AttributeChannels[type]; // 属性元素数量
            this.positionOffset = format.getOffset(i);
        } else {
            this.hasPosition = 0;
            this.positionChannels = 0;  // 属性元素数量
            this.positionType = 0;  // 属性类型
            this.positionOffset = 0;  // 属性偏移量
        }

        i = format.getIndex(VertexFormat.AU_NORMAL);
        if (i >= 0) {
            this.hasNormal = 1;
            type = format.getAttributeType(i);
            this.normalType = webgl.AttributeType[type];
            this.normalChannels = webgl.AttributeChannels[type];
            this.normalOffset = format.getOffset(i);
        } else {
            this.hasNormal = 0;
            this.normalChannels = 0;
            this.normalType = 0;
            this.normalOffset = 0;
        }

        i = format.getIndex(VertexFormat.AU_TANGENT);
        if (i >= 0) {
            this.hasTangent = 1;
            type = format.getAttributeType(i);
            this.tangentType = webgl.AttributeType[type];
            this.tangentChannels = webgl.AttributeChannels[type];
            this.tangentOffset = format.getOffset(i);
        } else {
            this.hasTangent = 0;
            this.tangentChannels = 0;
            this.tangentType = 0;
            this.tangentOffset = 0;
        }

        i = format.getIndex(VertexFormat.AU_BINORMAL);
        if (i >= 0) {
            this.hasBinormal = 1;
            type = format.getAttributeType(i);
            this.binormalType = webgl.AttributeType[type];
            this.binormalChannels = webgl.AttributeChannels[type];
            this.binormalOffset = format.getOffset(i);
        }
        else {
            this.hasBinormal = 0;
            this.binormalType = 0;
            this.binormalChannels = 0;
            this.binormalOffset = 0;
        }

        let unit;
        const AM_MAX_TCOORD_UNITS = VertexFormat.MAX_TCOORD_UNITS;

        this.hasTCoord = new Array(AM_MAX_TCOORD_UNITS);
        this.tCoordChannels = new Array(AM_MAX_TCOORD_UNITS);
        this.tCoordType = new Array(AM_MAX_TCOORD_UNITS);
        this.tCoordOffset = new Array(AM_MAX_TCOORD_UNITS);

        for (unit = 0; unit < AM_MAX_TCOORD_UNITS; ++unit) {
            i = format.getIndex(VertexFormat.AU_TEXCOORD, unit);
            if (i >= 0) {
                this.hasTCoord[unit] = 1;
                type = format.getAttributeType(i);
                this.tCoordType[unit] = webgl.AttributeType[type];
                this.tCoordChannels[unit] = webgl.AttributeChannels[type];
                this.tCoordOffset[unit] = format.getOffset(i);
            } else {
                this.hasTCoord[unit] = 0;
                this.tCoordType[unit] = 0;
                this.tCoordChannels[unit] = 0;
                this.tCoordOffset[unit] = 0;
            }
        }

        const AM_MAX_COLOR_UNITS = VertexFormat.MAX_COLOR_UNITS;
        this.hasColor = new Array(AM_MAX_COLOR_UNITS);
        this.colorChannels = new Array(AM_MAX_COLOR_UNITS);
        this.colorType = new Array(AM_MAX_COLOR_UNITS);
        this.colorOffset = new Array(AM_MAX_COLOR_UNITS);
        for (unit = 0; unit < AM_MAX_COLOR_UNITS; ++unit) {
            i = format.getIndex(VertexFormat.AU_COLOR, unit);
            if (i >= 0) {
                this.hasColor[unit] = 1;
                type = format.getAttributeType(i);
                this.colorType[unit] = webgl.AttributeType[type];
                this.colorChannels[unit] = webgl.AttributeChannels[type];
                this.colorOffset[unit] = format.getOffset(i);
            } else {
                this.hasColor[unit] = 0;
                this.colorType[unit] = 0;
                this.colorChannels[unit] = 0;
                this.colorOffset[unit] = 0;
            }
        }

        i = format.getIndex(VertexFormat.AU_BLENDINDICES);
        if (i >= 0) {
            this.hasBlendIndices = 1;
            type = format.getAttributeType(i);
            this.blendIndicesChannels = webgl.AttributeChannels[type];
            this.blendIndicesType = webgl.AttributeType[type];
            this.blendIndicesOffset = format.getOffset(i);
        }
        else {
            this.hasBlendIndices = 0;
            this.blendIndicesType = 0;
            this.blendIndicesChannels = 0;
            this.blendIndicesOffset = 0;
        }

        i = format.getIndex(VertexFormat.AU_BLENDWEIGHT);
        if (i >= 0) {
            this.hasBlendWeight = 1;
            type = format.getAttributeType(i);
            this.blendWeightType = webgl.AttributeType[type];
            this.blendWeightChannels = webgl.AttributeChannels[type];
            this.blendWeightOffset = format.getOffset(i);
        }
        else {
            this.hasBlendWeight = 0;
            this.blendWeightType = 0;
            this.blendWeightChannels = 0;
            this.blendWeightOffset = 0;
        }

        i = format.getIndex(VertexFormat.AU_FOGCOORD);
        if (i >= 0) {
            this.hasFogCoord = 1;
            type = format.getAttributeType(i);
            this.fogCoordType = webgl.AttributeType[type];
            this.fogCoordChannels = webgl.AttributeChannels[type];
            this.fogCoordOffset = format.getOffset(i);
        } else {
            this.hasFogCoord = 0;
            this.fogCoordChannels = 0;
            this.fogCoordType = 0;
            this.fogCoordOffset = 0;
        }

        i = format.getIndex(VertexFormat.AU_PSIZE);
        if (i >= 0) {
            this.hasPSize = 1;
            type = format.getAttributeType(i);
            this.pSizeType = webgl.AttributeType[type];
            this.pSizeChannels = webgl.AttributeChannels[type];
            this.pSizeOffset = format.getOffset(i);
        } else {
            this.hasPSize = 0;
            this.pSizeType = 0;
            this.pSizeChannels = 0;
            this.pSizeOffset = 0;
        }
    }

    /**
     * @param {WebGL2RenderingContext} gl
     */
    enable(gl) {
        // Use the enabled vertex buffer for data pointers.

        const stride = this.stride;
        if (this.hasPosition) {
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, this.positionChannels, this.positionType, false, stride, this.positionOffset);
        }

        if (this.hasNormal) {
            gl.enableVertexAttribArray(2);
            gl.vertexAttribPointer(2, this.normalChannels, this.normalType, false, stride, this.normalOffset);
        }

        if (this.hasTangent) {
            gl.enableVertexAttribArray(14);
            gl.vertexAttribPointer(14, this.tangentChannels, this.tangentType, false, stride, this.tangentOffset);
        }

        if (this.hasBinormal) {
            gl.enableVertexAttribArray(15);
            gl.vertexAttribPointer(15, this.binormalChannels, this.binormalType, false, stride, this.normalOffset);
        }

        let unit;
        for (unit = 0; unit < VertexFormat.MAX_TCOORD_UNITS; ++unit) {
            if (this.hasTCoord[unit]) {
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.enableVertexAttribArray(8 + unit);
                gl.vertexAttribPointer(8 + unit, this.tCoordChannels[unit], this.tCoordType[unit], false, stride, this.tCoordOffset[unit]);
            }
        }

        if (this.hasColor[0]) {
            gl.enableVertexAttribArray(3);
            gl.vertexAttribPointer(3, this.colorChannels[0], this.colorType[0], false, stride, this.colorOffset[0]);
        }

        if (this.hasColor[1]) {
            gl.enableVertexAttribArray(4);
            gl.vertexAttribPointer(4, this.colorChannels[1], this.colorType[1], false, stride, this.colorOffset[1]);
        }

        if (this.hasBlendIndices) {
            gl.enableVertexAttribArray(7);
            gl.vertexAttribPointer(7, this.blendIndicesChannels, this.blendIndicesType, false, stride, this.blendIndicesOffset);
        }

        if (this.hasBlendWeight) {
            gl.enableVertexAttribArray(1);
            gl.vertexAttribPointer(1, this.blendWeightChannels, this.blendWeightType, false, stride, this.blendWeightOffset);
        }

        if (this.hasFogCoord) {
            gl.enableVertexAttribArray(5);
            gl.vertexAttribPointer(5, this.fogCoordChannels, this.fogCoordType, false, stride, this.fogCoordOffset);
        }

        if (this.hasPSize) {
            gl.enableVertexAttribArray(6);
            gl.vertexAttribPointer(6, this.pSizeChannels, this.pSizeType, false, stride, this.pSizeOffset);
        }
    }
}

export { GLVertexFormat };
