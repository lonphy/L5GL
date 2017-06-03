declare type FactoryFn = (args: InStream) => D3Object;

/**
 * The root class of the object system.  It provides some basic services for
 * an object-oriented library.  This class is abstract.
 */
declare abstract class D3Object {
	name: string;
	protected _factories: Map<string, FactoryFn>;

	constructor(name?: string);
	getObjectByName(name: string): (D3Object | null);
	getAllObjectsByName(name: string, objs: Array<D3Object>): void;
	load();
	link();
	postLink();
	save();
	static get factories(): Map<string, FactoryFn>;
	static find(name: string): D3Object;
	static factory(inStream): D3Object;
	static Register(name: string, factory: FactoryFn): void;
}

export { D3Object, FactoryFn };