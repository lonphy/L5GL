L5.BinMeshPlugin = function (buf) {
    console.log(buf.byteLength);
    let fmt = L5.VertexFormat.create(3,
        L5.VertexFormat.AU_POSITION, L5.VertexFormat.AT_FLOAT3, 0,
        L5.VertexFormat.AU_TEXCOORD, L5.VertexFormat.AT_FLOAT2, 0,
        L5.VertexFormat.AU_NORMAL, L5.VertexFormat.AT_FLOAT3, 0
    );
    const stride = fmt.stride;

    let head = new DataView(buf, 0, 8);
    let vBufSize = head.getUint32(0, true);
    let iBufSize = head.getUint32(4, true);


    var vBuffer = new L5.VertexBuffer(vBufSize / stride, 0, L5.Buffer.BU_STATIC);
    vBuffer.elementSize = stride;
    vBuffer.numBytes = vBuffer.numElements * stride;
    vBuffer._data = new Uint8Array(buf.slice(8, vBufSize+8));

    var idxBuf = new L5.IndexBuffer();
    idxBuf.elementSize = 4;
    idxBuf.numElements = iBufSize / 4;
    idxBuf.numBytes = iBufSize;
    idxBuf._data = new Uint8Array(buf.slice(8+vBufSize));

    let mesh = new L5.TriMesh(fmt, vBuffer, idxBuf);
    mesh.name = 'loadedMeshes';
    return Promise.resolve(mesh);
};