/**
 * VertexShader 顶点着色器
 *
 * @author lonphy
 * @version 2.0
 */
import {Shader} from './Shader'
import {D3Object} from '../../core/D3Object'

export class VertexShader extends Shader {}
D3Object.Register('L5.VertexShader', VertexShader.factory);