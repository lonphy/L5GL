(function (g) {
    "use strict";

    function $(selector, context) {
        return (context || document).querySelector (selector);
    }

    // menu

    function Menu (id) {
        this.show    = 0;
        this.current = null;
        this.root    = $ (id);
    }

    Menu.init               = function (id) {
        Menu._instance = new Menu (id);
        Menu._listen (Menu._instance);
    };
    Menu.prototype.doAction = function (dom) {
        if (dom.className === 'menu-item') {
            if (this.show === 0) {
                this.show = 1;
                this.current = dom;
                $ ('.sub-menu', dom).style.display = 'block';
            } else {
                this.show = 0;
                $ ('.sub-menu', this.current).style.display = 'none';
                this.current = null;
            }
        } else {
            this.doAction(this.current);
            switch (dom.dataset[ 'command' ]) {
                case 'open-file':
                    ns.IO.openFileDialog (function (data) {
                        console.log (data);
                    });
                    break;
                default :
                    console.assert (false, 'unknow menu command: ' + dom.dataset[ 'command' ]);
            }
        }
    };
    Menu.prototype.doMove   = function (dom) {
        if (this.show === 0 || dom === this.current) {
            return;
        }
        if (dom === this.root) {
            $ ('.sub-menu', this.current).style.display = 'none';
            this.current                                = null;
            return;
        }

        // 子选项
        if (dom.className !== 'menu-item') {
            return;
        }

        $ ('.sub-menu', this.current).style.display = 'none';
        this.current                                = dom;
        $ ('.sub-menu', dom).style.display          = 'block';
    };

    Menu._listen = function (m) {
        m.root.addEventListener ('click', function (evt) {
            evt.stopPropagation ();
            m.doAction (evt.target);
        }, false);
        m.root.addEventListener ('mousemove', function (evt) {
            evt.stopPropagation ();
            m.doMove (evt.target);
        }, false);
    };

    g.$ = $;
    g.ns = {
        Menu: Menu,
        Env: {}
    };

})(window);