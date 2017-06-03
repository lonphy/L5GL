(function (ns) {
    "use strict";

    function ImagePreview(tar){
        this.canvas = tar;
        this.canvas.classList.add('image-preview');
        this.ctx = this.canvas.getContext('2d');
    }

    ImagePreview.prototype.show = function(){};

    ImagePreview.prototype.set = function(f){
        return new Promise((resolve, reject)=>{
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

                    //var w = template.width;
                    //var h = template.height;
                    template.style.top = "calc( 50% - " + h / 2 + "px )";
                    template.style.left = "calc( 50% - " + w / 2 + "px )";
                    ctx.clearRect(0, 0, w, h);
                    ctx.drawImage(img, 0, 0, w, h);
                    resolve([w,h]);
                };
                img.src = this.result;
            };
            fr.readAsDataURL(f);
        });
    };
    ImagePreview.prototype.destory = function(){
        this.canvas.hidden = true;
    };

    ns.ImagePreview = ImagePreview;


}) (window.ns);