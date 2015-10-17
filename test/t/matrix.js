QUnit.test( "L5.Matrix", function( assert ) {

    const i = new L5.Matrix(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );

    const z = new L5.Matrix(0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0);

    assert.ok(i.equals(L5.Matrix.IDENTITY), "L5.Matrix.IDENTITY 生成单位矩阵 通过!" );

    var i2 = new L5.Matrix();
    i2.identity();
    assert.ok(i.equals(i2), "L5.Matrix.prototype.identity 置单位矩阵 通过!" );


    assert.ok(z.equals(L5.Matrix.ZERO), "L5.Matrix.ZERO 生成零矩阵 通过!" );

    i2.zero();
    assert.ok(z.equals(i2), "L5.Matrix.prototype.zero 置零矩阵 通过!" );


    var m1 = L5.Matrix.makeRotation(new L5.Vector(1,1,1), Math.PI);
    var mr = m1.inverse();
    var m0 = m1.mul(mr);
    assert.ok(i.equals(m0), "L5.Matrix.prototype.inverse 矩阵求逆 通过!" );
});