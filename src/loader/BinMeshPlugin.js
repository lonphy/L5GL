import { XhrTask } from './XHRLoader';
import { VertexFormat, Buffer, VertexBuffer, IndexBuffer } from '../graphics/resources/namespace';
import { TriMesh } from '../graphics/sceneTree/namespace';

function BinMeshPlugin(buf) {
    let fmt = VertexFormat.create(3,
        VertexFormat.AU_POSITION, VertexFormat.AT_FLOAT3, 0,
        VertexFormat.AU_TEXCOORD, VertexFormat.AT_FLOAT2, 0,
        VertexFormat.AU_NORMAL, VertexFormat.AT_FLOAT3, 0
    );
    const stride = fmt.stride;

    let head = new DataView(buf, 0, 8);
    let vBufSize = head.getUint32(0, true);
    let iBufSize = head.getUint32(4, true);


    let vBuffer = new VertexBuffer(vBufSize / stride, 0);
    vBuffer.elementSize = stride;
    vBuffer.numBytes = vBuffer.numElements * stride;
    vBuffer._data = new Uint8Array(buf.slice(8, vBufSize + 8));

    let idxBuf = new IndexBuffer();
    idxBuf.elementSize = 4;
    idxBuf.numElements = iBufSize / 4;
    idxBuf.numBytes = iBufSize;
    idxBuf._data = new Uint8Array(buf.slice(8 + vBufSize));

    let mesh = new TriMesh(fmt, vBuffer, idxBuf);
    mesh.name = 'loadedMeshes';
    return Promise.resolve(mesh);
}

XhrTask.plugin('BinMeshPlugin', BinMeshPlugin);