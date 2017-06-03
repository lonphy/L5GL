/**
 * 地形
 *
 * @param heightInfo {Object}
 * @param format {L5.VertexFormat}
 * @param camera {L5.Camera}
 * @class
 * @extends {L5.Node}
 *
 * @author lonphy
 * @version 1.0
 */
L5.Terrain = function (heightInfo, format, camera) {
    L5.Node.call(this);

    this.format = format;
    this.cameraRow = -1;
    this.cameraCol = -1;
    this.camera = camera;

    // 外部配置参数
    this.numRows = heightInfo.numRows;
    this.numCols = heightInfo.numCols;
    this.size = heightInfo.size;
    this.minElevation = heightInfo.minElevation;
    this.maxElevation = heightInfo.maxElevation;
    this.spacing = heightInfo.spacing;
    this.pageFilePrefix = heightInfo.pagePath + heightInfo.pageFilePrefix + '.';

    var row, col, numRows = this.numRows, numCols = this.numCols;
    // Load terrain pages.
    this.pages = new Array(numCols * numRows);

    this.loadWaits = numCols*numRows;   // 资源计数器

    for (row = 0; row < numRows; ++row) {
        for (col = 0; col < numCols; ++col) {
            var file = this.pageFilePrefix + row + '.' + col;
            this.loadPage(row, col, file);
        }
    }

    this.onloadend = null;
};

L5.nameFix(L5.Terrain, 'Terrain');
L5.extendFix(L5.Terrain, L5.Node);

/**
 *
 * @param row {int}
 * @param col {int}
 * @returns {L5.TerrainPage}
 */
L5.Terrain.prototype.getPage = function (row, col) {
    if (0 <= row && row < this.numRows && 0 <= col && col < this.numCols) {
        return this.pages[row][col];
    }

    L5.assert(false, 'Invalid row or column index');
    return null;
};

/**
 * 检查是否完成
 * @private
 */
L5.Terrain.prototype.___checkDone = function(){
    if (this.loadWaits === 0) {
        // Attach the terrain pages to the terrain node.
        var numRows = this.numRows;
        var numCols = this.numCols;
        this.childs = new Array(numRows * numCols);
        for (var row = 0; row < numRows; ++row) {
            for (var col = 0; col < numCols; ++col) {
                this.attachChild(this.pages[row][col]);
            }
        }
        if (this.onloadend) {
            this.onloadend.call(null, this);
        }
    }
};

/**
 *
 * @param x {float}
 * @param y {float}
 * @returns {L5.TerrainPage}
 */
L5.Terrain.prototype.getCurrentPage = function (x, y) {
    var invLength = 1 / (this.spacing * (this.size - 1));

    var col = L5.Math.floor(x * invLength);

    col %= this.numCols;
    if (col < 0) {
        col += this.numCols;
    }

    var row = L5.Math.floor(y * invLength);
    row %= this.numRows;
    if (row < 0) {
        row += this.numRows;
    }

    return this.pages[row][col];
};

/**
 * 获取(x,y)处的高度
 * @param x {float}
 * @param y {float}
 * @returns {float}
 */
L5.Terrain.prototype.getHeight = function (x, y) {
    var page = this.getCurrentPage(x, y);
    var trn = page.localTransform.getTranslate();
    return page.getHeight(x - trn.x, y - trn.y);
};

/**
 * 获取(x,y)处的法线
 * @param x {float}
 * @param y {float}
 * @returns {L5.Vector}
 */
L5.Terrain.prototype.getNormal = function (x, y) {
    var spacing = this.spacing;

    var xp = x + spacing;
    var xm = x - spacing;
    var yp = y + spacing;
    var ym = y - spacing;

    var page = this.getCurrentPage(xp, y);
    var trn = page.localTransform.getTranslate();
    var xtmp = xp - trn.x;
    var ytmp = y - trn.y;
    var hpz = page.getHeight(xtmp, ytmp);

    page = this.getCurrentPage(xm, y);
    trn = page.localTransform.getTranslate();
    xtmp = xm - trn.x;
    ytmp = y - trn.y;
    var hmz = page.getHeight(xtmp, ytmp);

    page = this.getCurrentPage(x, yp);
    trn = page.localTransform.getTranslate();
    xtmp = x - trn.x;
    ytmp = yp - trn.y;
    var hzp = page.getHeight(xtmp, ytmp);

    page = this.getCurrentPage(x, ym);
    trn = page.localTransform.getTranslate();
    xtmp = x - trn.x;
    ytmp = ym - trn.y;
    var hzm = page.getHeight(xtmp, ytmp);

    var normal = new L5.Vector(hmz - hpz, hzm - hzp, 1);
    normal.normalize();
    return normal;
};

/**
 *
 * @param row {int}
 * @param col {int}
 * @param filePrefix {string}
 */
L5.Terrain.prototype.loadPage = function (row, col, filePrefix) {
    const size = this.size;
    var numHeights = size * size;
    var heights = new Uint16Array(numHeights);
    var fileName = filePrefix + '.wmhf';
    var file = new L5.XhrTask(fileName, 'arraybuffer');
    var $this = this;
    file.then(function (data) {
        heights.set(new Uint16Array(data), 0);
        var length = $this.spacing * (size - 1);
        $this.pages[row][col] = new L5.TerrainPage(
            $this.format,
            size,
            heights,
            [col * length, row * length],
            $this.minElevation,
            $this.maxElevation,
            $this.spacing
        );
        --$this.loadWaits;
    }).catch(function (err) {
        console.log(err);
        L5.assert(false, "Cannot open file :" + fileName);
    });
};

/**
 *
 * @param row {int}
 * @param col {int}
 * @param filePrefix {string}
 * @return {L5.TerrainPage}
 */
L5.Terrain.prototype.replacePageFile = function (row, col, filePrefix) {
    if (0 <= row && row < this.numRows && 0 <= col && col < this.numCols) {
        var save = this.pages[row][col];
        this.loadPage(row, col, filePrefix);
        return save;
    }

    L5.assert(false, "Invalid row or column index");
    return null;
};

/**
 *
 * @param row {int}
 * @param col {int}
 * @param newPage {L5.TerrainPage}
 * @return {L5.TerrainPage}
 */
L5.Terrain.prototype.replacePage = function (row, col, newPage) {
    if (0 <= row && row < this.numRows && 0 <= col && col < this.numCols) {
        var save = this.pages[row][col];
        this.pages[row][col] = newPage;
        return save;
    }

    L5.assert(false, "Invalid row or column index\n");
    return null;
};

L5.Terrain.prototype.onCameraMotion = function () {
    L5.assert(!!this.camera, "Camera must exist");
    var cam = this.camera;
    if (!cam) {
        return;
    }

    // Get camera location/direction in model space of terrain.
    var worldEye = cam.position;
    var worldDir = cam.direction;
    var m = this.worldTransform.inverse();
    var modelEye = m.mulPoint(worldEye);
    var modelDir = m.mulPoint(worldDir);

    // Update the model-space origins of the terrain pages.  Start the
    // process by locating the page that contains the camera.
    var length = this.spacing * (this.size - 1);
    var invLength = 1 / length;
    var newCameraCol = Math.floor(modelEye.x * invLength);
    var newCameraRow = Math.floor(modelEye.y * invLength);

    const numCols = this.numCols;
    const numRows = this.numRows;

    if (newCameraCol !== this.cameraCol || newCameraRow !== this.cameraRow) {
        this.cameraCol = newCameraCol;
        this.cameraRow = newCameraRow;

        // Translate page origins for toroidal wraparound.
        var cminO = newCameraCol - numCols / 2;
        var cminP = cminO % numCols;
        if (cminP < 0) {
            cminP += numCols;
        }

        var rminO = newCameraRow - numRows / 2;
        var rminP = rminO % numRows;
        if (rminP < 0) {
            rminP += numRows;
        }

        var rO = rminO, rP = rminP, cO, cP, page, col, newOrigin = [0, 0], pageTrn = L5.Point.ORIGIN;
        for (var row = 0; row < numRows; ++row) {
            cO = cminO;
            cP = cminP;

            for (col = 0; col < numCols; ++col) {
                page = this.pages[rP][cP];
                var oldOrigin = page.origin;

                newOrigin[0] = cO * length;
                newOrigin[1] = rO * length;

                pageTrn.set(
                    newOrigin[0] - oldOrigin[0],
                    newOrigin[1] - oldOrigin[1],
                    page.localTransform.getTranslate().z
                );

                page.localTransform.setTranslate(pageTrn);

                ++cO;
                if (++cP === numCols) {
                    cP = 0;
                }
            }

            ++rO;
            if (++rP === numRows) {
                rP = 0;
            }
        }
        this.update();
    }
};