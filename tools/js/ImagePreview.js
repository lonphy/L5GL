(function (ns) {
    "use strict";

    function ImagePreview(){
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'image-preview';
        this.ctx = this.canvas.getContext('2d');
        this.canvas.hidden = true;
    }

    ImagePreview.prototype.show = function(){
        ns.Env.mainFrame.appendChild(this.canvas);
        this.canvas.hidden = false;
    };
    ImagePreview.prototype.set = function(f){
        var fr = new FileReader();
        var template = this.canvas;
        var ctx = this.ctx;
        fr.onloadend = function () {
            var img = new Image;
            img.onload = function () {
                var w = this.width;
                var h = this.height;
                template.width = w;
                template.height = h;
                template.style.top = "calc( 50% - " + h / 2 + "px )";
                template.style.left = "calc( 50% - " + w / 2 + "px )";
                ctx.clearRect(0, 0, w, h);
                ctx.drawImage(img, 0, 0, w, h);
            };
            img.src = this.result;
        };
        fr.readAsDataURL(f);
    };
    ImagePreview.prototype.destory = function(){
        this.canvas.hidden = true;
        ns.Env.mainFrame.removeChild(this.canvas);
    };

    ns.ImagePreview = ImagePreview;


}) (window.ns);