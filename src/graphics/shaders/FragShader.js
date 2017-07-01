import { Shader } from './Shader';
import { D3Object } from '../../core/D3Object';

class FragShader extends Shader { }
D3Object.Register('FragShader', FragShader.factory.bind(FragShader));

export { FragShader };
