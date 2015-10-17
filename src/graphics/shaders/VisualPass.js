/**
 * VisualPass
 *
 * @class
 * @extends {L5.D3Object}
 *
 * @author lonphy
 * @version 1.0
 */
L5.VisualPass = function () {
    L5.D3Object.call(this);
    /**
     * @type {L5.Program}
     */
    this.program = null;
    /**
     * @type {L5.AlphaState}
     */
    this.alphaState = null;
    /**
     * @type {L5.CullState}
     */
    this.cullState = null;
    /**
     * @type {L5.DepthState}
     */
    this.depthState = null;
    /**
     * @type {L5.OffsetState}
     */
    this.offsetState = null;
    /**
     * @type {L5.StencilState}
     */
    this.stencilState = null;
    /**
     * @type {L5.WireState}
     */
    this.wireState = null;
};
L5.nameFix(L5.VisualPass, 'VisualPass');
L5.extendFix(L5.VisualPass, L5.D3Object);

/**
 * @returns {L5.FragShader}
 */
L5.VisualPass.prototype.getFragShader = function () {
    return this.program.fragShader;
};

/**
 * @returns {L5.VertexShader}
 */
L5.VisualPass.prototype.getVertexShader = function () {
    return this.program.vertexShader;
};


L5.VisualPass.prototype.load = function (inStream) {
    L5.D3Object.prototype.load.call(this, inStream);

    var vertexShader = inStream.readPointer();
    var fragShader = inStream.readPointer();
    this.program = new L5.Program('L5.Program', vertexShader, fragShader);
    this.alphaState = inStream.readPointer();
    this.cullState = inStream.readPointer();
    this.depthState = inStream.readPointer();
    this.offsetState = inStream.readPointer();
    this.stencilState = inStream.readPointer();
    this.wireState = inStream.readPointer();
};

L5.VisualPass.prototype.link = function (inStream) {
    L5.D3Object.prototype.link.call(this, inStream);

    this.program.vertexShader = inStream.resolveLink(this.program.vertexShader);
    this.program.fragShader = inStream.resolveLink(this.program.fragShader);

    this.alphaState = inStream.resolveLink(this.alphaState);
    this.cullState = inStream.resolveLink(this.cullState);
    this.depthState = inStream.resolveLink(this.depthState);
    this.offsetState = inStream.resolveLink(this.offsetState);
    this.stencilState = inStream.resolveLink(this.stencilState);
    this.wireState = inStream.resolveLink(this.wireState);
};

L5.VisualPass.prototype.save = function (inStream) {
    L5.D3Object.prototype.save.call(this, inStream);
    // todo: implement
};

/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.VisualPass}
 */
L5.VisualPass.factory = function (inStream) {
    var obj = new L5.VisualPass();
    obj.load(inStream);
    return obj;
};
L5.D3Object.factories.set('Wm5.VisualPass', L5.VisualPass.factory);