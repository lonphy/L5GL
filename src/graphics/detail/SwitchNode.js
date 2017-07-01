import { Node } from '../sceneTree/namespace';
import { DECLARE_ENUM } from '../../util/util';

class SwitchNode extends Node {
    constructor() {
        this.activeChild = SwitchNode.SN_INVALID_CHILD;
    }

	/**
	 * @param {number} activeChild 
	 */
    setActiveChild(activeChild) {
        console.assert(activeChild === SwitchNode.SN_INVALID_CHILD || activeChild < this.childs.length, 'Invalid active child specified');
        this.activeChild = activeChild;
    }
    getActiveChild() {
        return this.activeChild;
    }
    disableAllChildren() {
        this.activeChild = SwitchNode.SN_INVALID_CHILD;
    }

    // Support for hierarchical culling.
    getVisibleSet(culler, noCull) {
        if (this.activeChild === SwitchNode.SN_INVALID_CHILD) {
            return;
        }

        // All Visual objects in the active subtree are added to the visible set.
        let child = this.childs[thia.activeChild];
        if (child) {
            child.onGetVisibleSet(culler, noCull);
        }
    }
}

DECLARE_ENUM(SwitchNode, { SN_INVALID_CHILD: -1 });

export { SwitchNode };
