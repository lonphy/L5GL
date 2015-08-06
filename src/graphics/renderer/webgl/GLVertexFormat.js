/**
 * VertexFormat 底层包装
 *
 * @param renderer {L5.Renderer}
 * @param format {L5.VertexFormat}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.GLVertexFormat = function (
    renderer, format
) {
    this.stride = format.stride;

    var type;

    var i = format.getIndex (L5.VertexFormat.AU_POSITION);
    if (i >= 0) {
        this.hasPosition      = 1;
        type                  = format.getAttributeType (i);
        this.positionChannels = L5.Webgl.AttributeChannels[ type ];
        this.positionType     = L5.Webgl.AttributeType[ type ];
        this.positionOffset   = format.getOffset (i);
    } else {
        this.hasPosition      = 0;
        this.positionChannels = 0;  // 属性大小
        this.positionType = 0;  // 属性类型
        this.positionOffset = 0;  // 属性偏移量
    }

    i = format.getIndex (L5.VertexFormat.AU_NORMAL);
    if (i >= 0) {
        this.hasNormal      = 1;
        type                = format.getAttributeType (i);
        this.normalChannels = L5.Webgl.AttributeChannels[ type ];
        this.normalType     = L5.Webgl.AttributeType[ format.getAttributeType (i) ];
        this.normalOffset   = format.getOffset (i);
    } else {
        this.hasNormal      = 0;
        this.normalChannels = 0;
        this.normalType     = 0;
        this.normalOffset   = 0;
    }

    i = format.getIndex (L5.VertexFormat.AU_TANGENT);
    if (i >= 0) {
        this.hasTangent      = 1;
        type                 = format.getAttributeType (i);
        this.tangentChannels = L5.Webgl.AttributeChannels[ type ];
        this.tangentType     = L5.Webgl.AttributeType[ format.getAttributeType (i) ];
        this.tangentOffset   = format.getOffset (i);
    } else {
        this.hasTangent      = 0;
        this.tangentChannels = 0;
        this.tangentType     = 0;
        this.tangentOffset   = 0;
    }

    i = format.getIndex (L5.VertexFormat.AU_BINORMAL);
    if (i >= 0) {
        this.hasBinormal      = 1;
        type                  = format.getAttributeType (i);
        this.binormalChannels = L5.Webgl.AttributeChannels[ type ];
        this.binormalType     = L5.Webgl.AttributeType[ format.getAttributeType (i) ];
        this.binormalOffset   = format.getOffset (i);
    }
    else {
        this.hasBinormal      = 0;
        this.binormalChannels = 0;
        this.binormalType     = 0;
        this.binormalOffset   = 0;
    }

    var unit;
    const AM_MAX_TCOORD_UNITS = L5.VertexFormat.AM_MAX_TCOORD_UNITS;

    this.hasTCoord      = new Array (AM_MAX_TCOORD_UNITS);
    this.tCoordChannels = new Array (AM_MAX_TCOORD_UNITS);
    this.tCoordType     = new Array (AM_MAX_TCOORD_UNITS);
    this.tCoordOffset   = new Array (AM_MAX_TCOORD_UNITS);

    for (unit = 0; unit < AM_MAX_TCOORD_UNITS; ++unit) {
        i = format.getIndex (L5.VertexFormat.AU_TEXCOORD, unit);
        if (i >= 0) {
            this.hasTCoord[ unit ]      = 1;
            type                        = format.getAttributeType (i);
            this.tCoordChannels[ unit ] = L5.Webgl.AttributeChannels[ type ];
            this.tCoordType[ unit ]     = L5.Webgl.AttributeType[ format.getAttributeType (i) ];
            this.tCoordOffset[ unit ]   = format.getOffset (i);
        } else {
            this.hasTCoord[ unit ]      = 0;
            this.tCoordChannels[ unit ] = 0;
            this.tCoordType[ unit ]     = 0;
            this.tCoordOffset[ unit ]   = 0;
        }
    }

    const AM_MAX_COLOR_UNITS = L5.VertexFormat.AM_MAX_COLOR_UNITS;
    this.hasColor            = new Array (AM_MAX_COLOR_UNITS);
    this.colorChannels       = new Array (AM_MAX_COLOR_UNITS);
    this.colorType           = new Array (AM_MAX_COLOR_UNITS);
    this.colorOffset         = new Array (AM_MAX_COLOR_UNITS);
    for (unit = 0; unit < AM_MAX_COLOR_UNITS; ++unit) {
        i = format.getIndex (L5.VertexFormat.AU_COLOR, unit);
        if (i >= 0) {
            this.hasColor[ unit ]      = 1;
            type                       = format.getAttributeType (i);
            this.colorChannels[ unit ] = L5.Webgl.AttributeChannels[ type ];
            this.colorType[ unit ]     = L5.Webgl.AttributeType[ format.getAttributeType (i) ];
            this.colorOffset[ unit ]   = format.getOffset (i);
        } else {
            this.hasColor[ unit ]      = 0;
            this.colorChannels[ unit ] = 0;
            this.colorType[ unit ]     = 0;
            this.colorOffset[ unit ]   = 0;
        }
    }

    i = format.getIndex (L5.VertexFormat.AU_BLENDINDICES);
    if (i >= 0) {
        this.hasBlendIndices  = 1;
        type                  = format.getAttributeType (i);
        this.blendIndicesChannels = L5.Webgl.AttributeChannels[ type ];
        this.blendIndicesType     = L5.Webgl.AttributeType[ format.getAttributeType (i) ];
        this.blendIndicesOffset   = format.getOffset (i);
    }
    else {
        this.hasBlendIndices      = 0;
        this.blendIndicesChannels = 0;
        this.blendIndicesType     = 0;
        this.blendIndicesOffset   = 0;
    }

    i = format.getIndex (L5.VertexFormat.AU_BLENDWEIGHT);
    if (i >= 0) {
        this.hasBlendWeight  = 1;
        type                 = format.getAttributeType (i);
        this.blendWeightChannels = L5.Webgl.AttributeChannels[ type ];
        this.blendWeightType     = L5.Webgl.AttributeType[ format.getAttributeType (i) ];
        this.blendWeightOffset   = format.getOffset (i);
    }
    else {
        this.hasBlendWeight      = 0;
        this.blendWeightChannels = 0;
        this.blendWeightType     = 0;
        this.blendWeightOffset   = 0;
    }

    i = format.getIndex (L5.VertexFormat.AU_FOGCOORD);
    if (i >= 0) {
        this.hasFogCoord      = 1;
        type                  = format.getAttributeType (i);
        this.fogCoordChannels = L5.Webgl.AttributeChannels[ type ];
        this.fogCoordType     = L5.Webgl.AttributeType[ format.getAttributeType (i) ];
        this.fogCoordOffset   = format.getOffset (i);
    } else {
        this.hasFogCoord      = 0;
        this.fogCoordChannels = 0;
        this.fogCoordType     = 0;
        this.fogCoordOffset   = 0;
    }

    i = format.getIndex (L5.VertexFormat.AU_PSIZE);
    if (i >= 0) {
        this.hasPSize      = 1;
        type               = format.getAttributeType (i);
        this.pSizeChannels = L5.Webgl.AttributeChannels[ type ];
        this.pSizeType     = L5.Webgl.AttributeType[ format.getAttributeType (i) ];
        this.pSizeOffset   = format.getOffset (i);
    } else {
        this.hasPSize      = 0;
        this.pSizeChannels = 0;
        this.pSizeType     = 0;
        this.pSizeOffset   = 0;
    }

};
L5.nameFix (L5.GLVertexFormat, 'GLVertexFormat');

/**
 * @param renderer {L5.Renderer}
 */
L5.GLVertexFormat.prototype.enable  = function (renderer) {
    // Use the enabled vertex buffer for data pointers.

    var stride = this.stride;
    var gl     = renderer.gl;

    if (this.hasPosition) {
        gl.enableVertexAttribArray (this.positionChannels);
        gl.vertexAttribPointer (this.positionChannels, 4, this.positionType, false, stride, this.positionOffset);
    }

    if (this.hasNormal) {
        gl.enableVertexAttribArray (this.normalChannels);
        gl.vertexAttribPointer (this.normalChannels, 4, this.normalType, false, stride, this.normalOffset);
    }

    if (this.hasTangent) {
        gl.enableVertexAttribArray (this.tangentChannels);
        gl.vertexAttribPointer (this.tangentChannels, 4, this.tangentType, false, stride, this.tangentOffset);
    }

    if (this.hasBinormal) {
        gl.enableVertexAttribArray (this.normalChannels);
        gl.vertexAttribPointer (this.normalChannels, 4, this.normalType, false, stride, this.normalOffset);
    }

    var unit;
    for (unit = 0; unit < L5.VertexFormat.AM_MAX_TCOORD_UNITS; ++unit) {
        if (this.hasTCoord[ unit ]) {
            gl.activeTexture (gl.TEXTURE0 + unit);
            gl.enableVertexAttribArray (this.tCoordChannels[ unit ]);
            gl.vertexAttribPointer (this.tCoordChannels[ unit ], 4, this.tCoordType[ unit ], false, stride,
                this.tCoordOffset[ unit ]);
        }
    }

    if (this.hasColor[ 0 ]) {
        gl.enableVertexAttribArray (this.colorChannels[ 0 ]);
        gl.vertexAttribPointer (this.colorChannels[ 0 ], 4, this.colorType[ 0 ], false, stride,
            this.colorOffset[ 0 ]);
    }

    if (this.hasColor[ 1 ]) {
        gl.enableVertexAttribArray (this.colorChannels[ 1 ]);
        gl.vertexAttribPointer (this.colorChannels[ 1 ], 4, this.colorType[ 1 ], false, stride,
            this.colorOffset[ 1 ]);
    }

    if (this.hasBlendIndices) {
        gl.enableVertexAttribArray (this.blendIndicesChannels);
        gl.vertexAttribPointer (this.blendIndicesChannels, 4, this.blendIndicesType, false, stride,
            this.blendIndicesOffset);
    }

    if (this.hasBlendWeight) {
        gl.enableVertexAttribArray (this.blendWeightChannels);
        gl.vertexAttribPointer (this.blendWeightChannels, 4, this.blendWeightType, false, stride,
            this.blendWeightOffset);
    }

    if (this.hasFogCoord) {
        gl.enableVertexAttribArray (this.fogCoordChannels);
        gl.vertexAttribPointer (this.fogCoordChannels, 4, this.fogCoordType, false, stride, this.fogCoordOffset);
    }

    if (this.hasPSize) {
        gl.enableVertexAttribArray (this.pSizeChannels);
        gl.vertexAttribPointer (this.pSizeChannels, 4, this.pSizeType, false, stride, this.pSizeOffset);
    }
};
/**
 * @param renderer {L5.Renderer}
 */
L5.GLVertexFormat.prototype.disable = function (renderer) {
    if (this.hasPosition) {
        renderer.gl.disableVertexAttribArray (this.positionChannels);
    }

    if (this.hasNormal) {
        renderer.gl.disableVertexAttribArray (this.normalChannels);
    }

    if (this.hasTangent) {
        renderer.gl.disableVertexAttribArray (this.tangentChannels);
    }

    if (this.hasBinormal) {
        renderer.gl.disableVertexAttribArray (this.binormalChannels);
    }

    var unit;
    for (unit = 0; unit < L5.VertexFormat.AM_MAX_TCOORD_UNITS; ++unit) {
        if (this.hasTCoord[ unit ]) {
            renderer.gl.activeTexture (renderer.gl.TEXTURE0 + unit);
            renderer.gl.bindTexture (renderer.gl.TEXTURE0 + unit, null);
        }
    }

    if (this.hasColor[ 0 ]) {
        renderer.gl.disableVertexAttribArray (this.colorChannels[ 0 ]);
    }

    if (this.hasColor[ 1 ]) {
        renderer.gl.disableVertexAttribArray (this.colorChannels[ 1 ]);
    }

    if (this.hasBlendIndices) {
        renderer.gl.disableVertexAttribArray (this.blendIndicesChannels);
    }

    if (this.hasBlendWeight) {
        renderer.gl.disableVertexAttribArray (this.blendWeightChannels);
    }

    if (this.hasFogCoord) {
        renderer.gl.disableVertexAttribArray (this.fogCoordChannels);
    }

    if (this.hasPSize) {
        renderer.gl.disableVertexAttribArray (this.pSizeChannels);
    }
};