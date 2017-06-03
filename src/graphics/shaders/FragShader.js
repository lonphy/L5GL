/**
 * FragShader 片元着色器
 *
 * @author lonphy
 * @version 1.0
 *
 * @extends {L5.Shader}
 * @type {L5.FragShader}
 */
import {Shader} from './Shader'
import {D3Object} from '../../core/D3Object'

export class FragShader extends Shader {};
D3Object.Register('L5.FragShader', FragShader.factory);
