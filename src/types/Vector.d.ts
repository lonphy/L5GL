declare class Vector {
	constructor(x = 0, y = 0, z = 0)
	get x(): number
	get y(): number
	get z(): number
	get w(): number
	set x(v: number)
	set y(v: number)
	set z(v: number)
	set w(v: number)
	copy(vec: Vector)
	assign(x: number, y: number, z: number)
	get length(): number
	squaredLength(): number
	equals(tar: Vector): boolean
	normalize(): number
	cross(vec: Vector): Vector
	unitCross(vec: Vector): Vector
	add(vec: Vector): Vector
	sub(vec: Vector): Vector
	scalar(scalar: number): Vector
	div(scalar: number): Vector
	negative(): Vector
	dot(vec: Vector): number

	static get ZERO(): Vector
	static get UNIT_X(): Vector
	static get UNIT_Y(): Vector
	static get UNIT_Z(): Vector

    /**
     * 正交化给定的3个向量
     *
     * u0 = normalize(v0)  
     * u1 = normalize(v1 - dot(u0,v1)u0)  
     * u2 = normalize(v2 - dot(u0,v2)u0 - dot(u1,v2)u1)  
     */
	static orthoNormalize(vec1: Vector, vec2: Vector, vec3: Vector): void
	/**
     * Input vec2 must be a nonzero vector. The output is an orthonormal
     * basis {vec0,vec1,vec2}.  The input vec2 is normalized by this function.
     * If you know that vec2 is already unit length, use the function
     * generateComplementBasis to compute vec0 and vec1.
     * Input vec0 must be a unit-length vector.  The output vectors
     * {vec0,vec1} are unit length and mutually perpendicular, and
     * {vec0,vec1,vec2} is an orthonormal basis.
     */
	static generateComplementBasis(vec1: Vector, vec2: Vector, vec3: Vector): void
}