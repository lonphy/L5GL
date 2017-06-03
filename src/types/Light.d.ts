import { D3Object } from "./D3Object";

declare class Light extends D3Object {
	type: number
	ambient: Float32Array
	diffuse: Float32Array
	specular: Float32Array
	constant: number
	linear: number
	quadratic: number
	intensity: number
	angle: number
	private cosAngle: number
	private sinAngle: number
	exponent: number
	position: Point
	direction: Vector
	up: Vector
	right: Vector

	/**
     * 设置光源[聚光灯]角度
     * 
	 * angle 弧度有效值 0< angle <= PI
     */
	setAngle(angle: number): void

	/**
     * 设置光源方向
     */
	setDirection(dir: Vector): void

	/**
     * 设置光源位置
     *
     * 只对点光源以及聚光灯有效
     */
	setPosition(pos: Point): void

	/** 环境光源 */
	static LT_AMBIENT: number
	/** 平行光源 */
	static LT_DIRECTIONAL: number
	/** 点光源 */
	static LT_POINT: number
	/** 聚光灯光源 */
	static LT_SPOT: number
	/** 无效光源 */
	static LT_INVALID: number
}

export { Light };