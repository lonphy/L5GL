/**
 * BlendTransformController
 *
 * Set 'rsMatrices' to 'true' when theinput controllers manage
 * transformations of the form Y = R*S*X + T, where R is a rotation, S is
 * a diagonal scale matrix of positive scales, and T is a translation;
 * that is, each transform has mIsRSMatrix equal to 'true'.  In this case,
 * the rotation and scale blending is either geometric or arithmetic, as
 * specified in the other constructor inputs.  Translation blending is
 * always arithmetic.  Let {R0,S0,T0} and {R1,S1,T1} be the transformation
 * channels, and let weight w be in [0,1].  Let {R,S,T} be the blended
 * result.  Let q0, q1, and q be quaternions corresponding to R0, R1, and
 * R with Dot(q0,q1) >= 0 and A = angle(q0,q1) = acos(Dot(q0,q1)).
 *     Translation:  T = (1-w)*T0 + w*T1
 *
 * Arithmetic rotation:  q = Normalize((1-w)*q0 + w*q1)
 * Geometric rotation:
 *     q = Slerp(w,q0,q1)
 *       = (sin((1-w)*A)*q0 + sin(w*A)*q1)/sin(A)
 * Arithmetic scale:  s = (1-w)*s0 + w*s1 for each channel s0, s1, s
 * Geometric scale:  s = sign(s0)*sign(s1)*pow(|s0|,1-w)*pow(|s1|,w)
 *     If either of s0 or s1 is zero, then s is zero.
 *
 * Set 'rsMatrices' to 'false' when mIsRMatrix is 'false' for either
 * transformation.  In this case, a weighted average of the full
 * transforms is computed.  This is not recommended, because the visual
 * results are difficult to predict.
 *
 * @param controller0 {L5.TransformController}
 * @param controller1 {L5.TransformController}
 * @param rsMatrices {boolean}
 * @param geometricRotation {boolean} default false
 * @param geometricScale {boolean} default false
 * @class
 *
 * @extends {L5.TransformController}
 *
 * @author lonphy
 * @version 1.0
 */
L5.BlendTransformController = function (controller0, controller1, rsMatrices, geometricRotation, geometricScale) {
};
L5.nameFix(L5.BlendTransformController, 'BlendTransformController');
L5.extendFix(L5.BlendTransformController, L5.TransformController);

L5.BlendTransformController.prototype.getController0 = function () {
};
L5.BlendTransformController.prototype.getController1 = function () {
};
L5.BlendTransformController.prototype.getRSMatrices = function () {
};
L5.BlendTransformController.prototype.setWeight = function (weight) {
};
L5.BlendTransformController.prototype.getWeight = function () {
};
L5.BlendTransformController.prototype.update = function (applicationTime) {
};
/**
 *
 * @param obj {L5.ControlledObject}
 */
L5.BlendTransformController.prototype.setObject = function (obj) {
};


