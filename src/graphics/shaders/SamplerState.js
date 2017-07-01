import { D3Object } from '../../core/D3Object';
import { DECLARE_ENUM } from '../../util/util';

class SamplerState extends D3Object {
	constructor() {
		super();
		this.minFilter = SamplerState.LINEAR_MIPMAP_LINEAR;
		this.magFilter = SamplerState.LINEAR;

		this.maxAnisotropy = 1;

		this.wrapS = SamplerState.CLAMP_TO_EDGE;
		this.wrapT = SamplerState.CLAMP_TO_EDGE;
		this.wrapR = SamplerState.CLAMP_TO_EDGE;

		this.minLod = 0;
		this.maxLod = 0;

		this.compare = SamplerState.LEQUAL;
		this.mode = SamplerState.NONE;
	}
}



// filter (value from gl context)
SamplerState.NEAREST = 0x2600;
SamplerState.LINEAR = 0x2601;
SamplerState.NEAREST_MIPMAP_NEAREST = 0x2700;
SamplerState.LINEAR_MIPMAP_NEAREST = 0x2701;
SamplerState.NEAREST_MIPMAP_LINEAR = 0x2702;
SamplerState.LINEAR_MIPMAP_LINEAR = 0x2703;

// compare function (value from gl context)
SamplerState.NEVER = 0x0200;
SamplerState.LESS = 0x0201;
SamplerState.EQUAL = 0x0202;
SamplerState.LEQUAL = 0x0203;
SamplerState.GREATER = 0x0204;
SamplerState.NOTEQUAL = 0x0205;
SamplerState.GEQUAL = 0x0206;
SamplerState.ALWAYS = 0x0207;

// compare mode (value from gl context)
SamplerState.NONE = 0;
SamplerState.COMPARE_REF_TO_TEXTURE = 0x884E;

// wrap mode (value from gl context)
SamplerState.REPEAT = 0x2901;
SamplerState.CLAMP_TO_EDGE = 0x812F;
SamplerState.MIRRORED_REPEAT = 0x8370;

// default sampler
SamplerState.defaultSampler = new SamplerState;

export { SamplerState };