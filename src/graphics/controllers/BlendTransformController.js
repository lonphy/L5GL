import { D3Object } from '../../core/D3Object';
import { Quaternion } from '../../math/Quaternion';
import { _Math } from '../../math/Math';
import { TransformController } from './TransformController';

class BlendTransformController extends TransformController {

    /**
     *  #### Construction
     *  
     *  Set 'rsMatrices' to 'true' when theinput controllers manage
     *  transformations of the form Y = R*S*X + T, where R is a rotation, S is
     *  a diagonal scale matrix of positive scales, and T is a translation;
     *  that is, each transform has mIsRSMatrix equal to 'true'.  In this case,
     *  the rotation and scale blending is either geometric or arithmetic, as
     *  specified in the other constructor inputs.  Translation blending is
     *  always arithmetic.  Let {R0,S0,T0} and {R1,S1,T1} be the transformation
     *  channels, and let weight w be in [0,1].  Let {R,S,T} be the blended
     *  result.  Let q0, q1, and q be quaternions corresponding to R0, R1, and
     *  R with Dot(q0,q1) >= 0 and A = angle(q0,q1) = acos(Dot(q0,q1)).
     *  
     *  Translation:  `T = (1-w)*T0 + w*T1`
     *  
     *  Arithmetic rotation:  `q = Normalize((1-w)*q0 + w*q1)`  
     *  Geometric rotation:
     *  q = `Slerp(w, q0, q1)`
     *    = `(sin((1-w)*A)*q0 + sin(w*A)*q1)/sin(A)`
     *
     * Arithmetic scale:  s = `(1-w)*s0 + w*s1` for each channel s0, s1, s  
     * Geometric scale:  s = `sign(s0)*sign(s1)*pow(|s0|,1-w)*pow(|s1|,w)`  
     * If either of s0 or s1 is zero, then s is zero.
     *
     * Set 'rsMatrices' to 'false' when mIsRMatrix is 'false' for either
     * transformation.  In this case, a weighted average of the full
     * transforms is computed.  This is not recommended, because the visual
     * results are difficult to predict.
     * @param {TransformController} controller0
     * @param {TransformController} controller1
     * @param {boolean} rsMatrices
     * @param {boolean} geometricRotation
     * @param {boolean} geometricScale
     */
    constructor(controller0, controller1, rsMatrices, geometricRotation = false, geometricScale = false) {
        super(Transform.IDENTITY);

        this.controller0 = controller0;
        this.controller1 = controller1;

        this.weight = 0.0;
        this.rsMatrices = rsMatrices;
        this.geometricRotation = geometricRotation;
        this.geometricScale = geometricScale;
    }

    /**
     * @param {ControlledObject} obj
     */
    setObject(obj) {
        this.object = obj;
        this.controller0.object = obj;
        this.controller1.object = obj;
    }

    /**
     * 动画更新
     * @param {number} applicationTime  毫秒
     */
    update(applicationTime) {
        if (!super.update(applicationTime)) {
            return false;
        }

        this.controller0.update(applicationTime);
        this.controller1.update(applicationTime);

        let weight = this.weight;
        let oneMinusWeight = 1 - weight;
        const xfrm0 = this.controller0.localTransform;
        const xfrm1 = this.controller1.localTransform;

        // Arithmetic blend of translations.
        const trn0 = xfrm0.getTranslate();
        const trn1 = xfrm1.getTranslate();

        this.localTransform.setTranslate(trn0.scalar(oneMinusWeight).add(trn1.scalar(weight)));

        if (this.rsMatrices) {
            const rot0 = xfrm0.getRotate();
            const rot1 = xfrm1.getRotate();

            let quat0 = Quaternion.fromRotateMatrix(rot0);
            let quat1 = Quaternion.fromRotateMatrix(rot1);
            if (quat0.dot(quat1) < 0) {
                quat1.copy(quat1.negative());
            }

            let sca0 = xfrm0.getScale();
            let sca1 = xfrm1.getScale();
            let blendQuat = Quaternion.ZERO.clone();

            if (this.geometricRotation) {
                blendQuat.slerp(weight, quat0, quat1);
            }
            else {
                blendQuat = quat0.scalar(oneMinusWeight).add(quat1.scalar(weight));
                blendQuat.normalize();
            }
            this.localTransform.setRotate(blendQuat.toRotateMatrix());

            let pow = Math.pow;
            let sign = Math.sign;
            let abs = Math.abs;
            let blendSca;

            if (this.geometricScale) {
                let s0, s1;
                blendSca = Point.ORIGIN;
                for (let i = 0; i < 3; ++i) {
                    s0 = sca0[i];
                    s1 = sca1[i];
                    if (s0 !== 0 && s1 !== 0) {
                        let sign0 = sign(s0);
                        let sign1 = sign(s1);
                        let pow0 = pow(abs(s0), oneMinusWeight);
                        let pow1 = pow(abs(s1), weight);
                        blendSca[i] = sign0 * sign1 * pow0 * pow1;
                    }
                    // else
                    // {
                    //    blendSca[i] = 0;
                    // }
                }
            }
            else {
                blendSca = sca0.scalar(oneMinusWeight).add(sca1.scalar(weight));
            }
            this.localTransform.setScale(blendSca);
        }
        else {
            let m0 = xfrm0.getMatrix();
            let m1 = xfrm1.getMatrix();
            let blendMat = m0.scalar(oneMinusWeight).add(m1.scalar(weight));

            this.localTransform.setMatrix(blendMat);
        }
        this.object.localTransform.copy(this.localTransform);
        return true;
    }

    load(inStream) {
        super.load(inStream);
        this.controller0 = inStream.readPointer();
        this.controller1 = inStream.readPointer();
        this.weight = inStream.readFloat32();
        this.rsMatrices = inStream.readBool();
        this.geometricRotation = inStream.readBool();
        this.geometricScale = inStream.readBool();
    }
    link(inStream) {
        super.link(inStream);
        this.controller0 = inStream.resolveLink(this.controller0);
        this.controller1 = inStream.resolveLink(this.controller1);
    }
}

D3Object.Register('BlendTransformController', BlendTransformController.factory);

export { BlendTransformController };
