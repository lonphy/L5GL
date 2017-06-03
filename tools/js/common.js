'use strict';
(function (g) {
    function $(selector, context) {
        return (context || document).querySelector(selector);
    }

    // menu
    class Menu {
        constructor(id) {
            this.show = 0;
            this.current = null;
            this.root = id;
        }

        static init(id) {
            Menu._instance = new Menu(id);
            Menu._listen(Menu._instance);
        }

        doAction(dom) {
            if (dom.className === 'menu-item') {
                if (this.show === 0) {
                    this.show = 1;
                    this.current = dom;
                    $('.sub-menu', dom).style.display = 'block';
                } else {
                    this.show = 0;
                    $('.sub-menu', this.current).style.display = 'none';
                    this.current = null;
                }
            } else {
                this.doAction(this.current);

                switch (dom.dataset['command']) {
                    case 'obj-mlt-convert-to-l5mf':
                        ns.IO.openFileDialog(ns.IO.META_OBJ);
                        break;
                    case 'new-texture2D':
                        ns.createFrame(ns.FRAME_TEXTURE_2D);
                        break;
                    case 'new-textureCube':
                        ns.createFrame(ns.FRAME_TEXTURE_CUBE);
                        break;
                    case 'save':
                        ns.saveFrame();
                        break;
                    default :
                        console.assert(false, 'unknow menu command: ' + dom.dataset['command']);
                }
                console.info('菜单执行完毕');
            }
        }

        doMove(dom) {
            if (this.show === 0 || dom === this.current) {
                return;
            }
            if (dom === $(this.root)) {
                $('.sub-menu', this.current).style.display = 'none';
                this.current = null;
                return;
            }

            // 子选项
            if (dom.className !== 'menu-item') {
                return;
            }

            $('.sub-menu', this.current).style.display = 'none';
            this.current = dom;
            $('.sub-menu', dom).style.display = 'block';
        }

        static _listen(m) {
            $(m.root).addEventListener('click', function (evt) {
                evt.stopPropagation();
                m.doAction(evt.target);
            });
            $(m.root).addEventListener('mousemove', function (evt) {
                evt.stopPropagation();
                m.doMove(evt.target);
            });
        }
    }

    class IModel {
        createPanel(){}
        drawFrame(){}
        onMessage(evt){}
    }

    g.$ = $;
    g.ns = {
        Menu: Menu,
        Env:  {},
        IModel: IModel
    };

})(window);