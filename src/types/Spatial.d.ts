import { ControlledObject } from './ControlledObject';

/**
 * Culling parameters.
 */
enum CullingMode {
	/**
	 * Determine visibility state by comparing the world bounding volume to culling planes.
	 */
	CULL_DYNAMIC,
	/**
	 * Force the object to be culled.  If a Node is culled, its entire
	 * subtree is culled.
	 */
	CULL_ALWAYS,

	/**
	 * Never cull the object.  If a Node is never culled, its entire
	 * subtree is never culled.  To accomplish this, the first time such
	 * a Node is encountered, the bNoCull parameter is set to 'true' in
	 * the recursive chain getVisibleSet/onGetVisibleSet.
	 */
	CULL_NEVER
}

class Spatial extends ControlledObject {
	// Local and world transforms.  In some situations you might need to set
	// the world transform directly and bypass the Spatial.update()
	// mechanism.  If World is set directly, the worldIsCurrent flag should
	// be set to 'true'.
	localTransfrom: Transform;
	worldTransfrom: Transform;
	worldTransformIsCurrent: boolean;

	// World bound access.  In some situations you might want to set the
	// world bound directly and bypass the Spatial.update() mechanism.  If
	// worldBound is set directly, the worldBoundIsCurrent flag should be
	// set to 'true'.
	worldBound: Bound;
	worldBoundIsCurrent: boolean;

	culling: CullingMode;

	// Support for a hierarchical scene graph.  Spatial provides the parent
	// pointer.  Node provides the child pointers.
	parent: Spatial;


	// Abstract base class
	protected constructor();

	/**
	 * update of geometric state and controllers.  The function computes world
	 * transformations on the downward pass of the scene graph traversal and
	 * world bounding volumes on the upward pass of the traversal.
	 */
	update(applicationTime = -Mathd.MAX_REAL, initiator = true): void;

	// Support for the geometric update.
	protected updateWorldData(applicationTime: number): void;
	protected updateWorldBound(): void;
	protected propagateBoundToRoot(): void;

	// Support for hierarchical culling.
	onGetVisibleSet(culler: Culler, noCull: bool): void;
	getVisibleSet(culler: Culler, noCull: bool): void;
}

export { Spatial };
