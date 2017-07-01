import { GLRenderState } from './GLRenderState';
// import { GLSamplerState } from './GLSamplerState';

/**
 * Display list base indices for fonts/characters.
 */
// class DisplayListInfo {
//     constructor() {
//         this.quantity = 1;  // number of display lists, input to glGenLists
//         this.start = 0;     // start index, output from glGenLists
//         this.base = 0;      // base index for glListBase
//     }
// }

class GLRenderData {
    constructor() {
        /**
         * @type {GLRenderState}
         */
        this.currentRS = new GLRenderState();

        const m = GLRenderData.MAX_NUM_PSAMPLERS;
        // /**
        //  * @type {Array<GLSamplerState>}
        //  */
        // this.currentSS = new Array(m);
        // for (let i = 0; i < m; ++i) {
        //     this.currentSS[i] = new GLSamplerState();
        // }

        // Capabilities (queried at run time).
        this.maxVShaderImages = 0;
        this.maxFShaderImages = 0;
        this.maxCombinedImages = 0;

        /**
         * @type {DisplayListInfo}
         */
        // this.font = new DisplayListInfo();
    }

    drawCharacter(font, c) {
    }
}

GLRenderData.MAX_NUM_VSAMPLERS = 4;  // VSModel 3 has 4, VSModel 2 has 0.
GLRenderData.MAX_NUM_PSAMPLERS = 16;  // PSModel 2 and PSModel 3 have 16.

export { GLRenderData };