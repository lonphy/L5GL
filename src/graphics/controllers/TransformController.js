import { Controller } from './Controller';
import { Transform } from '../dataTypes/Transform';

class TransformController extends Controller {

    /**
     * @param {Transform} localTransform
     */
    constructor(localTransform) {
        super();
        this.localTransform = Transform.IDENTITY;
        this.localTransform.copy(localTransform);
    }

    /**
     * @param {number} applicationTime - ms
     */
    update(applicationTime) {
        if (super.update(applicationTime)) {
            this.object.localTransform.copy(this.localTransform);
            return true;
        }
        return false;
    }

    load(inStream) {
        super.load(inStream);
        this.localTransform = inStream.readTransform();
    }
}

export { TransformController };