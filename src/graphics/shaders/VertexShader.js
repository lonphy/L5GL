import { Shader } from './Shader';
import { D3Object } from '../../core/D3Object';

class VertexShader extends Shader { }
D3Object.Register('VertexShader', VertexShader.factory.bind(VertexShader));

export { VertexShader };