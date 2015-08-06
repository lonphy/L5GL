##WebGL与OpenGL ES 2.0的差异

1. 缓冲对象绑定 - Buffer Object Binding  
    在WebGL里, 一个给定的缓冲对象只能在它们的生命周期内绑定ARRAY_BUFFER或ELEMENT_ARRAY_BUFFER,这一限制意味着给定的缓冲对象可能包含顶点或索引,而不是两个都包含。  
    WebGLBuffer对象在第一次被当做bindBuffer的参数传递时初始化,随后尝试调用bindBuffer将同一WebGLBuffer对象绑定到其他绑定点将会会产生INVALID_OPERATION错误,同时被绑定的绑定点状态保持不变。

2. 无客户端数组 - No Client Side Arrays  
    WebGL不支持客户端数组。  
    如果用未绑定到绑定点的WebGLBuffer对象调用vertexAttribPointer,将会产生INVALID_OPERATION错误。  
    如果调用drawElements时使用一个顶点数大于0,同时未绑定的ELEMENT_ARRAY_BUFFER类型WebGLBuffer对象，将会产生INVALID_OPERATION错误

3. 无默认纹理 - No Default Textures  
    WebGL不支持默认纹理.为了纹理操作和查询正常操作必须绑定一个非NULL WebGLTexture对象。

6.4 Buffer Offset and Stride Requirements

The offset arguments to drawElements and vertexAttribPointer, and the stride argument to vertexAttribPointer, must be a multiple of the size of the data type passed to the call, or an INVALID_OPERATION error is generated.

This enforces the following requirement from OpenGL ES 2.0.25 [GLES20] p24:

"Clients must align data elements consistent with the requirements of the client platform, with an additional base-level requirement that an offset within a buffer to a datum comprising N basic machine units be a multiple of N."

6.5 Enabled Vertex Attributes and Range Checking

If a vertex attribute is enabled as an array via enableVertexAttribArray but no buffer is bound to that attribute via bindBuffer and vertexAttribPointer, then calls to drawArrays or drawElements will generate an INVALID_OPERATION error.

If a vertex attribute is enabled as an array, a buffer is bound to that attribute, and the attribute is consumed by the current program, then it is possible that the range specified by a call to drawArrays, or any referenced index in a call to drawElements, may reference vertices outside the storage of the bound buffer. If this occurs, then one of the following behaviors will result:

The WebGL implementation may generate an INVALID_OPERATION error and draw no geometry.
Out-of-range vertex fetches may return any of the following values:
Values from anywhere within the buffer object.
Zero values, or (0,0,0,x) vectors for vector reads where x is a valid value represented in the type of the vector components and may be any of:
0, 1, or the maximum representable positive integer value, for signed or unsigned integer components
0.0 or 1.0, for floating-point components
This behavior replicates that defined in [KHRROBUSTACCESS].
If a vertex attribute is enabled as an array, a buffer is bound to that attribute, but the attribute is not consumed by the current program, then regardless of the size of the bound buffer, it will not cause any error to be generated during a call to drawArrays or drawElements.

6.6 Framebuffer Object Attachments

WebGL adds the DEPTH_STENCIL_ATTACHMENT framebuffer object attachment point and the DEPTH_STENCIL renderbuffer internal format. To attach both depth and stencil buffers to a framebuffer object, call renderbufferStorage with the DEPTH_STENCIL internal format, and then call framebufferRenderbuffer with the DEPTH_STENCIL_ATTACHMENT attachment point.

A renderbuffer attached to the DEPTH_ATTACHMENT attachment point must be allocated with the DEPTH_COMPONENT16 internal format. A renderbuffer attached to the STENCIL_ATTACHMENT attachment point must be allocated with the STENCIL_INDEX8 internal format. A renderbuffer attached to the DEPTH_STENCIL_ATTACHMENT attachment point must be allocated with the DEPTH_STENCIL internal format.

In the WebGL API, it is an error to concurrently attach renderbuffers to the following combinations of attachment points:

DEPTH_ATTACHMENT + DEPTH_STENCIL_ATTACHMENT
STENCIL_ATTACHMENT + DEPTH_STENCIL_ATTACHMENT
DEPTH_ATTACHMENT + STENCIL_ATTACHMENT
If any of the constraints above are violated, then:
checkFramebufferStatus must return FRAMEBUFFER_UNSUPPORTED.
The following calls, which either modify or read the framebuffer, must generate an INVALID_FRAMEBUFFER_OPERATION error and return early, leaving the contents of the framebuffer, destination texture or destination memory untouched.
clear
copyTexImage2D
copyTexSubImage2D
drawArrays
drawElements
readPixels
The following combinations of framebuffer object attachments, when all of the attachments are framebuffer attachment complete, non-zero, and have the same width and height, must result in the framebuffer being framebuffer complete:
COLOR_ATTACHMENT0 = RGBA/UNSIGNED_BYTE texture
COLOR_ATTACHMENT0 = RGBA/UNSIGNED_BYTE texture + DEPTH_ATTACHMENT = DEPTH_COMPONENT16 renderbuffer
COLOR_ATTACHMENT0 = RGBA/UNSIGNED_BYTE texture + DEPTH_STENCIL_ATTACHMENT = DEPTH_STENCIL renderbuffer
6.7 Texture Upload Width and Height

Unless width and height parameters are explicitly specified, the width and height of the texture set by texImage2D and the width and height of the sub-rectangle updated by texSubImage2D are determined based on the uploaded TexImageSource source object:

source of type ImageData
The width and height of the texture are set to the current values of the width and height properties of the ImageData object, representing the actual pixel width and height of the ImageData object.
source of type HTMLImageElement
If a bitmap is uploaded, the width and height of the texture are set to the width and height of the uploaded bitmap in pixels. If an SVG image is uploaded, the width and height of the texture are set to the current values of the width and height properties of the HTMLImageElement object.
source of type HTMLCanvasElement
The width and height of the texture are set to the current values of the width and height properties of the HTMLCanvasElement object.
source of type HTMLVideoElement
The width and height of the texture are set to the width and height of the uploaded frame of the video in pixels.
6.8 Pixel Storage Parameters

The WebGL API supports the following additional parameters to pixelStorei.

UNPACK_FLIP_Y_WEBGL of type boolean
If set, then during any subsequent calls to texImage2D or texSubImage2D, the source data is flipped along the vertical axis, so that conceptually the last row is the first one transferred. The initial value is false. Any non-zero value is interpreted as true.
UNPACK_PREMULTIPLY_ALPHA_WEBGL of type boolean
If set, then during any subsequent calls to texImage2D or texSubImage2D, the alpha channel of the source data, if present, is multiplied into the color channels during the data transfer. The initial value is false. Any non-zero value is interpreted as true.
UNPACK_COLORSPACE_CONVERSION_WEBGL of type unsigned long
If set to BROWSER_DEFAULT_WEBGL, then the browser's default colorspace conversion is applied during subsequent texImage2D and texSubImage2D calls taking HTMLImageElement. The precise conversions may be specific to both the browser and file type. If set to NONE, no colorspace conversion is applied. The initial value is BROWSER_DEFAULT_WEBGL.
6.9 Reading Pixels Outside the Framebuffer

In the WebGL API, functions which read the framebuffer (copyTexImage2D, copyTexSubImage2D, and readPixels) are defined to generate the RGBA value (0, 0, 0, 0) for any pixel which is outside of the bound framebuffer.

6.10 Stencil Separate Mask and Reference Value

In the WebGL API it is illegal to specify a different mask or reference value for front facing and back facing triangles in stencil operations. A call to drawArrays or drawElements will generate an INVALID_OPERATION error if:

STENCIL_WRITEMASK != STENCIL_BACK_WRITEMASK (as specified by stencilMaskSeparate for the mask parameter associated with the FRONT and BACK values of face, respectively)
STENCIL_VALUE_MASK != STENCIL_BACK_VALUE_MASK (as specified by stencilFuncSeparate for the mask parameter associated with the FRONT and BACK values of face, respectively)
STENCIL_REF != STENCIL_BACK_REF (as specified by stencilFuncSeparate for the ref parameter associated with the FRONT and BACK values of face, respectively)
6.11 Vertex Attribute Data Stride

The WebGL API supports vertex attribute data strides up to 255 bytes. A call to vertexAttribPointer will generate an INVALID_VALUE error if the value for the stride parameter exceeds 255.

6.12 Viewport Depth Range

The WebGL API does not support depth ranges with where the near plane is mapped to a value greater than that of the far plane. A call to depthRange will generate an INVALID_OPERATION error if zNear is greater than zFar.

6.13 Blending With Constant Color

In the WebGL API, constant color and constant alpha cannot be used together as source and destination factors in the blend function. A call to blendFunc will generate an INVALID_OPERATION error if one of the two factors is set to CONSTANT_COLOR or ONE_MINUS_CONSTANT_COLOR and the other to CONSTANT_ALPHA or ONE_MINUS_CONSTANT_ALPHA. A call to blendFuncSeparate will generate an INVALID_OPERATION error if srcRGB is set to CONSTANT_COLOR or ONE_MINUS_CONSTANT_COLOR and dstRGB is set to CONSTANT_ALPHA or ONE_MINUS_CONSTANT_ALPHA or vice versa.

6.14 Fixed point support

The WebGL API does not support the GL_FIXED data type.
6.15 GLSL Constructs

Per Supported GLSL Constructs, identifiers starting with "webgl_" and "_webgl_" are reserved for use by WebGL.

6.16 Extension Queries

In the OpenGL ES 2.0 API, the available extensions are determined by calling glGetString(GL_EXTENSIONS), which returns a space-separated list of extension strings. In the WebGL API, the EXTENSIONS enumerant has been removed. Instead, getSupportedExtensions must be called to determine the set of available extensions.

6.17 Compressed Texture Support

The core WebGL specification does not define any supported compressed texture formats. Therefore, in the absence of any other extensions being enabled:

The compressedTexImage2D and compressedTexSubImage2D methods generate an INVALID_ENUM error.
Calling getParameter with the argument COMPRESSED_TEXTURE_FORMATS returns a zero-length array (of type Uint32Array).
6.18 Maximum GLSL Token Size

The GLSL ES spec [GLES20GLSL] does not define a limit to the length of tokens. WebGL requires support of tokens up to 256 characters in length. Shaders containing tokens longer than 256 characters must fail to compile.

6.19 Characters Outside the GLSL Source Character Set

The GLSL ES spec [GLES20GLSL] defines the source character set for the OpenGL ES shading language to be ISO/IEC 646:1991, commonly called ASCII [ASCII]. If a string containing a character not in this set is passed to any of the shader-related entry points bindAttribLocation, getAttribLocation, getUniformLocation, or shaderSource, an INVALID_VALUE error will be generated. The exception is that any character allowed in an HTML DOMString [DOMSTRING] may be used in GLSL comments. Such use must not generate an error.

Some GLSL implementations disallow characters outside the ASCII range, even in comments. The WebGL implementation needs to prevent errors in such cases. The recommended technique is to preprocess the GLSL string, removing all comments, but maintaining the line numbering for debugging purposes by inserting newline characters as needed.

6.20 Maximum Nesting of Structures in GLSL Shaders

WebGL imposes a limit on the nesting of structures in GLSL shaders. Nesting occurs when a field in a struct refers to another struct type; the GLSL ES spec [GLES20GLSL] forbids embedded structure definitions. The fields in a top-level struct definition have a nesting level of 1.

WebGL requires support of a structure nesting level of 4. Shaders containing structures nested more than 4 levels deep must fail to compile.

6.21 Maximum Uniform and Attribute Location Lengths

WebGL imposes a limit of 256 characters on the lengths of uniform and attribute locations.

6.22 String Length Queries

In the WebGL API, the enumerants INFO_LOG_LENGTH, SHADER_SOURCE_LENGTH, ACTIVE_UNIFORM_MAX_LENGTH, and ACTIVE_ATTRIBUTE_MAX_LENGTH have been removed. In the OpenGL ES 2.0 API, these enumerants are needed to determine the size of buffers passed to calls like glGetActiveAttrib. In the WebGL API, the analogous calls (getActiveAttrib, getActiveUniform, getProgramInfoLog, getShaderInfoLog, and getShaderSource) all return DOMString.

6.23 Texture Type in TexSubImage2D Calls

In the WebGL API, the type argument passed to texSubImage2D must match the type used to originally define the texture object (i.e., using texImage2D).

6.24 Packing Restrictions for Uniforms and Varyings

The OpenGL ES Shading Language, Version 1.00 [GLES20GLSL], Appendix A, Section 7 "Counting of Varyings and Uniforms" defines a conservative algorithm for computing the storage required for all of the uniform and varying variables in a shader. The GLSL ES specification requires that if the packing algorithm defined in Appendix A succeeds, then the shader must succeed compilation on the target platform. The WebGL API further requires that if the packing algorithm fails either for the uniform variables of a shader or for the varying variables of a program, compilation or linking must fail.

Instead of using a fixed size grid of registers, the number of rows in the target architecture is determined in the following ways:

when counting uniform variables in a vertex shader: getParameter(MAX_VERTEX_UNIFORM_VECTORS)
when counting uniform variables in a fragment shader: getParameter(MAX_FRAGMENT_UNIFORM_VECTORS)
when counting varying variables: getParameter(MAX_VARYING_VECTORS)
6.25 Feedback Loops Between Textures and the Framebuffer

In the OpenGL ES 2.0 API, it's possible to make calls that both write to and read from the same texture, creating a feedback loop. It specifies that where these feedback loops exist, undefined behavior results.

In the WebGL API, such operations that would cause such feedback loops (by the definitions in the OpenGL ES 2.0 spec) will instead generate an INVALID_OPERATION error.

6.26 Reading From a Missing Attachment

In the OpenGL ES 2.0 API, it is not specified what happens when a command tries to source data from a missing attachment, such as ReadPixels of color data from a complete framebuffer that does not have a color attachment.

In the WebGL API, such operations that require data from an attachment that is missing will generate an INVALID_OPERATION error. This applies to the following functions:

copyTexImage2D
copyTexSubImage2D
readPixels
6.27 NaN Line Width

In the WebGL API, if the width parameter passed to lineWidth is set to NaN, an INVALID_VALUE error is generated and the line width is not changed.

6.28 Attribute Aliasing

It is possible for an application to bind more than one attribute name to the same location. This is referred to as aliasing. When more than one attributes that are aliased to the same location are active in the executable program, linkProgram should fail.

6.29 Initial value for gl_Position

The GLSL ES [GLES20GLSL] spec leaves the value of gl_Position as undefined unless it is written to in a vertex shader. WebGL guarantees that gl_Position's initial value is (0,0,0,0).

6.30 GLSL ES Global Variable Initialization

The GLSL ES 1.00 [GLES20GLSL] spec restricts global variable initializers to be constant expressions. In the WebGL API, it is allowed to use other global variables not qualified with the const qualifier and uniform values in global variable initializers in GLSL ES 1.00 shaders. Global variable initializers must be global initializer expressions, which are defined as one of:

a literal value
a global variable
a uniform
an expression formed by an operator on operands that are global initializer expressions, including getting an element of a global initializer vector or global initializer matrix, or a field of a global initializer structure
a constructor whose arguments are all global initializer expressions
a built-in function call whose arguments are all global initializer expressions, with the exception of the texture lookup functions
The following may not be used in global initializer expressions:

User-defined functions
Attributes and varyings
Global variables as l-values in an assignment or other operation
Compilers should generate a warning when a global variable initializer is in violation of the unmodified GLSL ES spec i.e. when a global variable initializer is not a constant expression.

This behavior has existed in WebGL implementations for several years. Fixing this behavior to be consistent with the GLSL ES specification would have a large compatibility impact with existing content.