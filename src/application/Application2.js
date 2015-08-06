/**
 * Application 2D
 * @param title {string}
 * @param width {number}
 * @param height {number}
 * @param clearColor
 * @param canvas
 *
 * @extends {L5.Application}
 * @class
 *
 * @author lonphy
 * @version 1.0
 */
L5.Application2 = function (
    title, width, height, clearColor, canvas
) {
    L5.Application.call (this, title, width, height, clearColor, canvas);
    this.screenWidth   = 0;
    this.screenHeight  = 0;
    this.screen        = null;
    this.clampToWindow = true;
    this.doFlip        = false;
};

L5.nameFix(L5.Application2, 'Application2');
L5.extendFix (L5.Application2, L5.Application);


// Event callbacks.
L5.Application2.prototype.onInitialize = function () {
    if (!this._proto__.onInitialize.call (this)) {
        return false;
    }

    // The RGBA screen pixels.
    this.screenWidth  = this.width;
    this.screenHeight = this.height;
    this.screen       = new Array (this.screenWidth * this.screenHeight);
    this.clearScreen ();
    return true;
};
L5.Application2.prototype.onTerminate  = function () {};
L5.Application2.prototype.onDisplay    = function () {
    if (this.renderer.preDraw ()) {
        this.renderer.clearBuffers ();
        this.renderer.draw (this.screen, this.doFlip);
        this.screenOverlay ();
        this.renderer.postDraw ();
        this.renderer.displayColorBuffer ();
    }
};

// Allows you to do additional drawing after the screen polygon is drawn.
// Screen overlays should use the Renderer calls and not access the
// mScreen array directly.
L5.Application2.prototype.screenOverlay = function () {};
L5.Application2.prototype.clearScreen   = function () {
    var r       = 255 * this.clearColor[ 0 ];
    var g       = 255 * this.clearColor[ 1 ];
    var b       = 255 * this.clearColor[ 2 ];
    var a       = 255 * this.clearColor[ 3 ];
    var color   = new L5.Application2.ColorRGB (r, g, b, a);
    var current = this.screen;
    var imax    = this.width * this.height;
    for (var i = 0; i < imax; ++i, ++current) {
        this.screen[ i ] = color;
    }
};


// For right-handed drawing.  You still draw to the left-handed screen,
// but immediately before drawing, the screen is copied into another
// buffer with the rows reversed.  You need only call DoFlip(true) once
// for an application.  The default is 'false'.
L5.Application2.prototype.setFlip = function (doFlip) {
    this.doFlip = doFlip;
};

// The drawing routines listed below perform range checking on any (x,y)
// {Set/Get}Pixel call when mClampToWindow is 'true'.  Each pixel is
// processed only when in range.
L5.Application2.prototype.getClampToWindow = function () {
    return this.clampToWindow;
};

// Set the pixel at location (x,y) to the specified color.
L5.Application2.prototype.setPixel = function (
    x, y, color
) {
    var width  = this.width,
        height = this.height;

    if (this.clampToWindow) {
        if (0 <= x && x < width && 0 <= y && y < height) {
            this.screen[ x + width * y ] = color;
        }
    }
    else {
        this.screen[ x + width * y ] = color;
    }
};

// Set the pixels (x',y') for x-thick <= x' <= x+thick and
// y-thick <= y' <= y+thick.
L5.Application2.prototype.setThickPixel = function (
    x, y, thick, color
) {
    for (var dy = -thick; dy <= thick; ++dy) {
        for (var dx = -thick; dx <= thick; ++dx) {
            this.setPixel (x + dx, y + dy, color);
        }
    }
};

// Get the pixel color at location (x,y).
L5.Application2.prototype.getPixel = function (x, y) {
    var width  = this.width,
        height = this.height;
    if (this.clampToWindow) {
        if (0 <= x && x < width && 0 <= y && y < height) {
            return this.screen[ x + width * y ];
        }
        else {
            return new L5.Application2.ColorRGB (0, 0, 0, 0);
        }
    }
    else {
        return this.screen[ x + width * y ];
    }
};

// Use Bresenham's algorithm to draw the line from (x0,y0) to (x1,y1)
// using the specified color for the drawn pixels.  The algorithm is
// biased in that the pixels set by DrawLine(x0,y0,x1,y1) are not
// necessarily the same as those set by DrawLine(x1,y1,x0,y0).
// TODO: Implement the midpoint algorithm to avoid the bias.
L5.Application2.prototype.drawLine = function (
    x0, y0, x1, y1, color
) {
    var x = x0, y = y0;

    // The direction of the line segment.
    var dx = x1 - x0, dy = y1 - y0;

    // Increment or decrement depending on the direction of the line.
    var sx = (dx > 0 ? 1 : (dx < 0 ? -1 : 0));
    var sy = (dy > 0 ? 1 : (dy < 0 ? -1 : 0));

    // Decision parameters for pixel selection.
    if (dx < 0) {
        dx = -dx;
    }
    if (dy < 0) {
        dy = -dy;
    }
    var ax = 2 * dx, ay = 2 * dy;
    var decx, decy;

    // Determine the largest direction component and single-step using the
    // related variable.
    var dir = 0;
    if (dy > dx) {
        dir = 1;
    }

    // Traverse the line segment using Bresenham's algorithm.
    switch (dir) {
        case 0:  // Single-step in the x-direction.
            decy = ay - dx;
            for (/**/; /**/; x += sx, decy += ay) {
                // Process the pixel.
                this.setPixel (x, y, color);

                // Take the Bresenham step.
                if (x == x1) {
                    break;
                }
                if (decy >= 0) {
                    decy -= ax;
                    y += sy;
                }
            }
            break;
        case 1:  // Single-step in the y-direction.
            decx = ax - dy;
            for (/**/; /**/; y += sy, decx += ax) {
                // Process the pixel.
                this.setPixel (x, y, color);

                // Take the Bresenham step.
                if (y == y1) {
                    break;
                }
                if (decx >= 0) {
                    decx -= ay;
                    x += sx;
                }
            }
            break;
    }
};

// Draw an axis-aligned rectangle using the specified color.  The
// 'solid' parameter indicates whether or not to fill the rectangle.
L5.Application2.prototype.drawRectangle = function (
    xMin, yMin, xMax, yMax, color, solid
) {
    if (xMin >= this.width || xMax < 0 || yMin >= this.height || yMax < 0) {
        // rectangle not visible
        return;
    }

    var x, y;

    if (solid) {
        for (y = yMin; y <= yMax; ++y) {
            for (x = xMin; x <= xMax; ++x) {
                this.setPixel (x, y, color);
            }
        }
    }
    else {
        for (x = xMin; x <= xMax; ++x) {
            this.setPixel (x, yMin, color);
            this.setPixel (x, yMax, color);
        }
        for (y = yMin + 1; y <= yMax - 1; ++y) {
            this.setPixel (xMin, y, color);
            this.setPixel (xMax, y, color);
        }
    }
};

// Use Bresenham's algorithm to draw the circle centered at
// (xCenter,yCenter) with the specified 'radius' and using the
// specified color.  The 'solid' parameter indicates whether or not
// to fill the circle.
L5.Application2.prototype.drawCircle = function (
    cx, cy, radius, color, solid
) {
    var x, y, dec;

    if (solid) {
        var xValue, yMin, yMax, i;
        for (x = 0, y = radius, dec = 3 - 2 * radius; x <= y; ++x) {
            xValue = cx + x;
            yMin   = cy - y;
            yMax   = cy + y;
            for (i = yMin; i <= yMax; ++i) {
                this.setPixel (xValue, i, color);
            }

            xValue = cx - x;
            for (i = yMin; i <= yMax; ++i) {
                this.setPixel (xValue, i, color);
            }

            xValue = cx + y;
            yMin   = cy - x;
            yMax   = cy + x;
            for (i = yMin; i <= yMax; ++i) {
                this.setPixel (xValue, i, color);
            }

            xValue = cx - y;
            for (i = yMin; i <= yMax; ++i) {
                this.setPixel (xValue, i, color);
            }

            if (dec >= 0) {
                dec += -4 * (y--) + 4;
            }
            dec += 4 * x + 6;
        }
    }
    else {
        for (x = 0, y = radius, dec = 3 - 2 * radius; x <= y; ++x) {
            this.setPixel (cx + x, cy + y, color);
            this.setPixel (cx + x, cy - y, color);
            this.setPixel (cx - x, cy + y, color);
            this.setPixel (cx - x, cy - y, color);
            this.setPixel (cx + y, cy + x, color);
            this.setPixel (cx + y, cy - x, color);
            this.setPixel (cx - y, cy + x, color);
            this.setPixel (cx - y, cy - x, color);

            if (dec >= 0) {
                dec += -4 * (y--) + 4;
            }
            dec += 4 * x + 6;
        }
    }
};

// Flood-fill a region whose pixels are of color 'backColor' by
// changing their color to 'foreColor'.  The fill treats the screen
// as 4-connected; that is, after (x,y) is visited, then (x-1,y),
// (x+1,y), (x,y-1), and (x,y+1) are visited (as long as they are in
// the screen boundary).  The function simulates recursion by using
// stacks, which avoids the expense of true recursion and the potential
// to overflow the calling stack.
L5.Application2.prototype.fill = function (
    x, y, foreColor, backColor
) {
    // Allocate the maximum amount of space needed.  If you prefer less, you
    // need to modify this data structure to allow for dynamic reallocation
    // when it is needed.  An empty stack has top == -1.
    var xMax      = this.width, yMax = this.height;
    var stackSize = xMax * yMax;
    var xStack    = new Array (stackSize);
    var yStack    = new Array (stackSize);

    // Push the seed point onto the stack if it has the background color.  All
    // points pushed onto stack have background color backColor.
    var top       = 0;
    xStack[ top ] = x;
    yStack[ top ] = y;

    while (top >= 0)  // The stack is not empty.
    {
        // Read the top of the stack.  Do not pop it since we need to return
        // to this top value later to restart the fill in a different
        // direction.
        x = xStack[ top ];
        y = yStack[ top ];

        // Fill the pixel.
        this.setPixel (x, y, foreColor);

        var xp1 = x + 1;
        if (xp1 < xMax && this.getPixel (xp1, y).equals (backColor)) {
            // Push the pixel with the background color.
            top++;
            xStack[ top ] = xp1;
            yStack[ top ] = y;
            continue;
        }

        var xm1 = x - 1;
        if (0 <= xm1 && this.getPixel (xm1, y).equals (backColor)) {
            // Push the pixel with the background color.
            top++;
            xStack[ top ] = xm1;
            yStack[ top ] = y;
            continue;
        }

        var yp1 = y + 1;
        if (yp1 < yMax && this.getPixel (x, yp1).equals (backColor)) {
            // Push the pixel with the background color.
            top++;
            xStack[ top ] = x;
            yStack[ top ] = yp1;
            continue;
        }

        var ym1 = y - 1;
        if (0 <= ym1 && this.getPixel (x, ym1).equals (backColor)) {
            // Push the pixel with the background color.
            top++;
            xStack[ top ] = x;
            yStack[ top ] = ym1;
            continue;
        }

        // We are done in all directions, so pop and return to search other
        // directions.
        top--;
    }
};

// TODO:  Added an alpha channel to get 32-bits per pixel for performance
// in drawing on the GPU.  A change in class name will affect many
// applications, so that will be deferred until closer to shipping WM5.6.
L5.Application2.ColorRGB = function (
    red, green, blue, alpha
) {
    this.r = red;
    this.g = green;
    this.b = blue;
    this.a = alpha === undefined ? 255 : alpha;
};

L5.Application2.ColorRGB.prototype.equals = function (c) {
    return b === color.b && g === color.g && r === color.r && a === color.a;
};

L5.Application2.ColorRGB.prototype.notEquals = function (c) {
    return b !== color.b || g !== color.g || r !== color.r || a !== color.a;
};