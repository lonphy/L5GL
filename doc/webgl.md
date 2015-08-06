#WebGL 1.0 API


##pixelStorei

为`texImage2D`和`texSubImage2D`纹理读取和解包图素设置存储模式
####_语法_ :
`WebGLRenderingContext.pixelStorei ( pname, param );`

####_参数_ :
`pname` [in]

**类型**: Number  
符号参数名称. 可为下面的值之一:  

* __gl.PACK_ALIGNMENT__  
影响打包图素数据到内存的字节对齐方式.初始值为4, 可设置为1,2,4,或8.
 
* __gl.UNPACK_ALIGNMENT__  
影响从内存解包图素数据的字节对齐方式. 初始值为4, 可设置为1,2,4,或8.
  
* __gl.UNPACK_FLIP_Y_WEBGL__  
在调用`texImage2D`或`texSubImage2D`时, 如果param值为true, 则沿垂直轴翻转源数据.初始值为false.

* __gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL__  
在调用`texImage2D`或`texSubImage2D`时, 如果param值为true,且透明通道存在，则在数据传输期间预乘其他颜色通道.初始值为false.

* __gl.UNPACK_COLORSPACE_CONVERSION_WEBGL__  
使用`HTMLImageElement`纹理数据源调用`texImage2D`或`texSubImage2D`时，应用浏览器默认色彩空间转换。初始值为 _BROWSER_DEFAULT_WEBGL_. 值被设置为`NONE`时不做颜色空间转换
 
`param` [in]  
**类型**: Number  
值取决于pname的值。参见上面.

####_返回值_ :无

####_附注_:
WebGL 错误描述  

* gl.INVALID_VALUE	
如果指定的alignment值不是1,2,4,8时触发。  

* gl.INVALID_ENUM  
如果pname不是一个有效的值时触发
