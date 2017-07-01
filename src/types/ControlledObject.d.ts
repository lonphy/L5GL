import { D3Object } from './D3Object'

class ControlledObject extends D3Object {

    // Abstract base class.
    protected constructor()

    // Access to the controllers that control this object.
    getNumControllers(): number;
    getController(i: number): Controller;
    attachController(controller: Controller): void;
    detachController(controller: Controller): void;
    detachAllControllers(): void;
    updateControllers(applicationTime: number): boolean;

    private mNumControllers: number;
    private mCapacity: number;
    private controllers: Array<Controller>;

    // The array of controllers that control this object.    
    private static CO_GROW_BY = 4;
}

export { ControlledObject };
