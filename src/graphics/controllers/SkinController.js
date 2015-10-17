/**
 *
 * @param numVertices {number}
 * @param numBones {number}
 * @constructor
 */

L5.SkinController = function (numVertices, numBones) {
    numVertices = numVertices || 0;
    numBones = numBones || 0;

    this.numVertices = numVertices; // int
    this.numBones = numBones; // int

    this._init();
};
L5.nameFix(L5.SkinController, 'SkinController');
L5.extendFix(L5.SkinController, L5.Controller);

L5.SkinController.prototype._init = function () {
    var numBones = this.numBones;
    var numVertices = this.numVertices;
    if (numBones === 0 || numVertices === 0) {
        return;
    }
    /**
     * @type {Array<L5.Node>}
     */
    this.bones = new Array(numBones);
    /**
     * @type {Array< Array<number> >}
     */
    this.weights = new Array(numVertices);
    /**
     * @type {Array< Array<Point> >}
     */
    this.offsets = new Array(numVertices);

    for (var i = 0; i < numVertices; ++i) {
        this.weights[i] = new Array(numBones);
        this.offsets[i] = new Array(numBones);
    }
};

L5.SkinController.prototype.getNumVertices = function () {
    return this.numVertices;
};
L5.SkinController.prototype.getNumBones = function () {
    return this.numBones;
};
L5.SkinController.prototype.getBones = function () {
    return this.bones;
};
L5.SkinController.prototype.getWeights = function () {
    return this.weights;
};
L5.SkinController.prototype.getOffsets = function () {
    return this.offsets;
};

L5.SkinController.prototype.update = function (applicationTime) {
    if (!L5.Controller.prototype.update.call(this, applicationTime)) {
        return false;
    }

    var visual = this.object;
    L5.assert(
        this.numVertices === visual.vertexBuffer.numElements,
        "Controller must have the same number of vertices as the buffer"
    );
    var vba = L5.VertexBufferAccessor.fromVisual(visual);

    // The skin vertices are calculated in the bone world coordinate system,
    // so the visual's world transform must be the identity.
    visual.worldTransform = L5.Transform.IDENTITY;
    visual.worldTransformIsCurrent = true;

    // Compute the skin vertex locations.
    var nv = this.numVertices, nb = this.numBones, vertex, bone, weight, offset, worldOffset;
    for (vertex = 0; vertex < nv; ++vertex) {
        var position = L5.Point.ORIGIN;

        for (bone = 0; bone < nb; ++bone) {
            weight = this.weights[vertex][bone];
            if (weight !== 0.0) {
                offset = this.offsets[vertex][bone];
                worldOffset = this.bones[bone].worldTransform.mulPoint(offset);
                position = position.add(worldOffset.scalar(weight));
            }
        }
        vba.setPosition(vertex, [position.x, position.y, position.z]);
    }

    visual.updateModelSpace(L5.Visual.GU_NORMALS);
    L5.Renderer.updateAll(visual.vertexBuffer());
    return true;
};


/**
 * @param inStream {L5.InStream}
 */
L5.SkinController.prototype.load = function (inStream) {

    L5.Controller.prototype.load.call(this, inStream);
    var numVertices = inStream.readUint32();
    var numBones = inStream.readUint32();

    this.numVertices = numVertices;
    this.numBones = numBones;
    this._init();
    var total = this.numVertices * this.numBones, i;
    var t = inStream.readArray(total);
    var t1 = inStream.readSizedPointArray(total);
    for (i = 0; i < numVertices; ++i) {
        this.weights[i] = t.slice(i * numBones, (i + 1) * numBones);
        this.offsets[i] = t1.slice(i * numBones, (i + 1) * numBones);
    }
    this.bones = inStream.readSizedPointerArray(numBones);

};

L5.SkinController.prototype.link = function (inStream) {
    L5.Controller.prototype.link.call(this, inStream);
    inStream.resolveArrayLink(this.numBones, this.bones);
};


/**
 * 文件解析工厂方法
 * @param inStream {L5.InStream}
 * @returns {L5.SkinController}
 */
L5.SkinController.factory = function (inStream) {
    var obj = new L5.SkinController(0, 0);
    obj.load(inStream);
    return obj;
};

L5.D3Object.factories.set('Wm5.SkinController', L5.SkinController.factory);