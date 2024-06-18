#if !defined(Math_lib)
    #define Math_lib

    #ifndef GRAPHICS_API_GLES3
mat2 inverse(mat2 m)
{
    return mat2(m[1][1], -m[0][1], -m[1][0], m[0][0]) / (m[0][0] * m[1][1] - m[0][1] * m[1][0]);
}
mat3 inverse(mat3 m)
{
    float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];
    float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];
    float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];

    float b01 = a22 * a11 - a12 * a21;
    float b11 = -a22 * a10 + a12 * a20;
    float b21 = a21 * a10 - a11 * a20;

    float det = a00 * b01 + a01 * b11 + a02 * b21;

    return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11), b11, (a22 * a00 - a02 * a20),
	       (-a12 * a00 + a02 * a10), b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10))
	/ det;
}

mat4 inverse(mat4 m)
{
    float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3], a10 = m[1][0], a11 = m[1][1], a12 = m[1][2],
	  a13 = m[1][3], a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3], a30 = m[3][0], a31 = m[3][1],
	  a32 = m[3][2], a33 = m[3][3],

	  b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10,
	  b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12,
	  b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30,
	  b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32,

	  det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    return mat4(a11 * b11 - a12 * b10 + a13 * b09, a02 * b10 - a01 * b11 - a03 * b09, a31 * b05 - a32 * b04 + a33 * b03,
	       a22 * b04 - a21 * b05 - a23 * b03, a12 * b08 - a10 * b11 - a13 * b07, a00 * b11 - a02 * b08 + a03 * b07,
	       a32 * b02 - a30 * b05 - a33 * b01, a20 * b05 - a22 * b02 + a23 * b01, a10 * b10 - a11 * b08 + a13 * b06,
	       a01 * b08 - a00 * b10 - a03 * b06, a30 * b04 - a31 * b02 + a33 * b00, a21 * b02 - a20 * b04 - a23 * b00,
	       a11 * b07 - a10 * b09 - a12 * b06, a00 * b09 - a01 * b07 + a02 * b06, a31 * b01 - a30 * b03 - a32 * b00,
	       a20 * b03 - a21 * b01 + a22 * b00)
	/ det;
}

mat4 transpose(mat4 m)
{
    return mat4(m[0][0], m[1][0], m[2][0], m[3][0],
	m[0][1], m[1][1], m[2][1], m[3][1],
	m[0][2], m[1][2], m[2][2], m[3][2],
	m[0][3], m[1][3], m[2][3], m[3][3]);
}
mat3 transpose(mat3 m)
{
    return mat3(m[0][0], m[1][0], m[2][0],
	m[0][1], m[1][1], m[2][1],
	m[0][2], m[1][2], m[2][2]);
}
    #endif // GRAPHICS_API_GLES3

    #define PI 3.14159265359

    #define INVERT_PI 0.31830988618

    #define HALF_PI 1.570796327

    #define MEDIUMP_FLT_MAX 65504.0
    #define MEDIUMP_FLT_MIN 0.00006103515625

    #if defined(GL_FRAGMENT_PRECISION_HIGH)
	#define FLT_EPS		   1e-5
	#define saturateMediump(x) x
    #else
	#define FLT_EPS		   MEDIUMP_FLT_MIN
	#define saturateMediump(x) min(x, MEDIUMP_FLT_MAX)
    #endif // GL_FRAGMENT_PRECISION_HIGH

    #define saturate(x) clamp(x, 0.0, 1.0)

float pow2(float x)
{
    return x * x;
}

vec3 pow2(vec3 x)
{
    return x * x;
}

float pow5(float x)
{
    float x2 = x * x;
    return x2 * x2 * x;
}

const float INVERT_LOG10 = 0.43429448190325176;

float log10(float x)
{
    return log(x) * INVERT_LOG10;
}

float vecmax(const vec2 v)
{
    return max(v.x, v.y);
}

float vecmax(const vec3 v)
{
    return max(v.x, max(v.y, v.z));
}

float vecmax(const vec4 v)
{
    return max(max(v.x, v.y), max(v.z, v.w));
}

float vecmin(const vec2 v)
{
    return min(v.x, v.y);
}

float vecmin(const vec3 v)
{
    return min(v.x, min(v.y, v.z));
}

float vecmin(const vec4 v)
{
    return min(min(v.x, v.y), min(v.z, v.w));
}

vec3 SafeNormalize(in vec3 inVec)
{
    float dp3 = max(0.001, dot(inVec, inVec));
    return inVec * inversesqrt(dp3);
}

vec3 normalScale(in vec3 normal, in float scale)
{
    normal *= vec3(scale, scale, 1.0);
    return normalize(normal);
}

/**
 * Approximates acos(x) with a max absolute error of 9.0x10^-3.
 * Valid in the range -1..1.
 */
float acosFast(float x)
{
    // Lagarde 2014, "Inverse trigonometric functions GPU optimization for AMD GCN architecture"
    // This is the approximation of degree 1, with a max absolute error of 9.0x10^-3
    float y = abs(x);
    float p = -0.1565827 * y + 1.570796;
    p *= sqrt(1.0 - y);
    return x >= 0.0 ? p : PI - p;
}

/**
 * Approximates acos(x) with a max absolute error of 9.0x10^-3.
 * Valid only in the range 0..1.
 */
float acosFastPositive(float x)
{
    float p = -0.1565827 * x + 1.570796;
    return p * sqrt(1.0 - x);
}

/*
 * Random number between 0 and 1, using interleaved gradient noise.
 * w must not be normalized (e.g. window coordinates)
 */
float interleavedGradientNoise(const highp vec2 w)
{
    const vec3 m = vec3(0.06711056, 0.00583715, 52.9829189);
    return fract(m.z * fract(dot(w, m.xy)));
}

/*
 * vertex rotate by Euler
 */
vec3 rotationByEuler(in vec3 vector, in vec3 rot)
{
    float halfRoll = rot.z * 0.5;
    float halfPitch = rot.x * 0.5;
    float halfYaw = rot.y * 0.5;

    float sinRoll = sin(halfRoll);
    float cosRoll = cos(halfRoll);
    float sinPitch = sin(halfPitch);
    float cosPitch = cos(halfPitch);
    float sinYaw = sin(halfYaw);
    float cosYaw = cos(halfYaw);

    float quaX = (cosYaw * sinPitch * cosRoll) + (sinYaw * cosPitch * sinRoll);
    float quaY = (sinYaw * cosPitch * cosRoll) - (cosYaw * sinPitch * sinRoll);
    float quaZ = (cosYaw * cosPitch * sinRoll) - (sinYaw * sinPitch * cosRoll);
    float quaW = (cosYaw * cosPitch * cosRoll) + (sinYaw * sinPitch * sinRoll);

    // vec4 q=vec4(quaX,quaY,quaZ,quaW);
    // vec3 temp = cross(q.xyz, vector) + q.w * vector;
    // return (cross(temp, -q.xyz) + dot(q.xyz,vector) * q.xyz + q.w * temp);

    float x = quaX + quaX;
    float y = quaY + quaY;
    float z = quaZ + quaZ;
    float wx = quaW * x;
    float wy = quaW * y;
    float wz = quaW * z;
    float xx = quaX * x;
    float xy = quaX * y;
    float xz = quaX * z;
    float yy = quaY * y;
    float yz = quaY * z;
    float zz = quaZ * z;

    return vec3(((vector.x * ((1.0 - yy) - zz)) + (vector.y * (xy - wz))) + (vector.z * (xz + wy)),
	((vector.x * (xy + wz)) + (vector.y * ((1.0 - xx) - zz))) + (vector.z * (yz - wx)),
	((vector.x * (xz - wy)) + (vector.y * (yz + wx))) + (vector.z * ((1.0 - xx) - yy)));
}

/*
 * Assume that axis has been normalized
 * point rotate by one axis
 */
vec3 rotationByAxis(in vec3 vector, in vec3 axis, in float angle)
{
    float halfAngle = angle * 0.5;
    float sinf = sin(halfAngle);

    float quaX = axis.x * sinf;
    float quaY = axis.y * sinf;
    float quaZ = axis.z * sinf;
    float quaW = cos(halfAngle);

    // vec4 q=vec4(quaX,quaY,quaZ,quaW);
    // vec3 temp = cross(q.xyz, vector) + q.w * vector;
    // return (cross(temp, -q.xyz) + dot(q.xyz,vector) * q.xyz + q.w * temp);

    float x = quaX + quaX;
    float y = quaY + quaY;
    float z = quaZ + quaZ;
    float wx = quaW * x;
    float wy = quaW * y;
    float wz = quaW * z;
    float xx = quaX * x;
    float xy = quaX * y;
    float xz = quaX * z;
    float yy = quaY * y;
    float yz = quaY * z;
    float zz = quaZ * z;

    return vec3(((vector.x * ((1.0 - yy) - zz)) + (vector.y * (xy - wz))) + (vector.z * (xz + wy)),
	((vector.x * (xy + wz)) + (vector.y * ((1.0 - xx) - zz))) + (vector.z * (yz - wx)),
	((vector.x * (xz - wy)) + (vector.y * (yz + wx))) + (vector.z * ((1.0 - xx) - yy)));
}

/*
 *rotate by quaternions
 */
vec3 rotationByQuaternions(in vec3 v, in vec4 q)
{
    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

#endif // Math_lib