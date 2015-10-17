(function (ns) {
    "use strict";
    var IO    = {};
    ns.IO = IO;
    var stream;
    var reader = new FileReader();

    var gCallback;

    IO.TEXTURE_FILE = 0xFE10;

    IO.init = function (selector) {
        stream = $ (selector);

        stream.addEventListener ('change', function (evt) {
            var c     = gCallback;
            gCallback = null;
            if (c) {
                var f = new FileView (evt.target.files[ 0 ]);
                f.init ();
                c (f);
            }
        }, false);
    };

    IO.openFileDialog = function (callback) {
        gCallback = callback;
        var evt   = document.createEvent ('MouseEvent');
        evt.initEvent ('click', false, false);
        stream.dispatchEvent (evt);
    };

    function FileView (file) {
        this.file = file;
        this.preview = new ns.ImagePreview();
        this.preview.set(this.file);
        this.preview.show();
    }

    FileView.prototype.init = function () {
        console.log (this.file);
        reader.readAsArrayBuffer(this.file);
    };

}) (window.ns);