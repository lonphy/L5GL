/**
 *
 *
 * @class
 */
L5.GLRenderData = function () {

    /**
     * @type {L5.GLRenderState}
     */
    this.currentRS = new L5.GLRenderState();

    const m = L5.GLRenderData.MAX_NUM_PSAMPLERS;
    /**
     * @type {Array<L5.GLSamplerState>}
     */
    this.currentSS = new Array(m);
    for (var i = 0; i < m; ++i) {
        this.currentSS[i] = new L5.GLSamplerState();
    }

    // Capabilities (queried at run time).
    this.maxVShaderImages  = 0;
    this.maxFShaderImages  = 0;
    this.maxCombinedImages = 0;

    /**
     * @type {L5.GLRenderData.DisplayListInfo}
     */
    this.font = new L5.GLRenderData.DisplayListInfo();
};

// Display list base indices for fonts/characters.
L5.GLRenderData.DisplayListInfo = function()
{
    this.quantity = 1;  // number of display lists, input to glGenLists
    this.start = 0;     // start index, output from glGenLists
    this.base = 0;      // base index for glListBase
};

L5.GLRenderData.MAX_NUM_VSAMPLERS = 4;  // VSModel 3 has 4, VSModel 2 has 0.
L5.GLRenderData.MAX_NUM_PSAMPLERS = 16;  // PSModel 2 and PSModel 3 have 16.

/**
 * Bitmapped fonts/characters.
 * @param font
 * @param c {string}
 */
L5.GLRenderData.prototype.drawCharacter = function(
    font, c
){
    // const BitmapFontChar* bfc = font.mCharacters[(unsigned int)c];
    //
    //const bfc = font.characters[c];
    //
    //// Save unpack state.
    //var swapBytes, lsbFirst, rowLength, skipRows, skipPixels, alignment;
    //glGetIntegerv(GL_UNPACK_SWAP_BYTES, &swapBytes);
    //glGetIntegerv(GL_UNPACK_LSB_FIRST, &lsbFirst);
    //glGetIntegerv(GL_UNPACK_ROW_LENGTH, &rowLength);
    //glGetIntegerv(GL_UNPACK_SKIP_ROWS, &skipRows);
    //glGetIntegerv(GL_UNPACK_SKIP_PIXELS, &skipPixels);
    //glGetIntegerv(GL_UNPACK_ALIGNMENT, &alignment);
    //
    //glPixelStorei(GL_UNPACK_SWAP_BYTES, false);
    //glPixelStorei(GL_UNPACK_LSB_FIRST, false);
    //glPixelStorei(GL_UNPACK_ROW_LENGTH, 0);
    //glPixelStorei(GL_UNPACK_SKIP_ROWS, 0);
    //glPixelStorei(GL_UNPACK_SKIP_PIXELS, 0);
    //glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
    //glBitmap(bfc.xSize, bfc.ySize, bfc.xOrigin, bfc.yOrigin, bfc.xSize, 0, bfc.bitmap);
    //
    //// Restore unpack state.
    //glPixelStorei(GL_UNPACK_SWAP_BYTES, swapBytes);
    //glPixelStorei(GL_UNPACK_LSB_FIRST, lsbFirst);
    //glPixelStorei(GL_UNPACK_ROW_LENGTH, rowLength);
    //glPixelStorei(GL_UNPACK_SKIP_ROWS, skipRows);
    //glPixelStorei(GL_UNPACK_SKIP_PIXELS, skipPixels);
    //glPixelStorei(GL_UNPACK_ALIGNMENT, alignment);
};