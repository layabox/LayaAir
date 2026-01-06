#if !defined(ShruikenParticleCommon_glsl)
#define ShruikenParticleCommon_glsl

// render node 2d
uniform vec3 u_NMatrix_0;
uniform vec3 u_NMatrix_1;

uniform vec2 u_size;

#ifdef COLOROVERLIFETIME

#ifdef COLOROVERLIFETIME_COLORKEY_8

uniform vec4 u_GradientRGB[8];
uniform vec4 u_GradientAlpha[4];
uniform vec4 u_GradientMaxRGB[8];
uniform vec4 u_GradientMaxAlpha[4];

#else // COLOROVERLIFETIME_COLORKEY_8

uniform vec4 u_GradientRGB[4];
uniform vec4 u_GradientAlpha[2];
uniform vec4 u_GradientMaxRGB[4];
uniform vec4 u_GradientMaxAlpha[2];

#endif // COLOROVERLIFETIME_COLORKEY_8

uniform vec4 u_GradientTimeRange;
uniform vec4 u_GradientMaxTimeRange;

#endif // COLOROVERLIFETIME

#ifdef VELOCITYOVERLIFETIME

uniform vec4 u_VelocityCurveMinX[2];
uniform vec4 u_VelocityCurveMinY[2];

uniform vec4 u_VelocityCurveMaxX[2];
uniform vec4 u_VelocityCurveMaxY[2];

uniform float u_VelocityOverLifetimeSpace;

#endif // VELOCITYOVERLIFETIME

#ifdef SIZEOVERLIFETIME

uniform vec4 u_SizeCurveMinX[2];
uniform vec4 u_SizeCurveMinY[2];
uniform vec4 u_SizeCurveMinTimeRange;

uniform vec4 u_SizeCurveMaxX[2];
uniform vec4 u_SizeCurveMaxY[2];
uniform vec4 u_SizeCurveMaxTimeRange;

#endif // SIZEOVERLIFETIME

#ifdef ROTATIONOVERLIFETIME

uniform vec4 u_RotationCurveMin[2];
uniform vec4 u_RotationCurveMax[2];

#endif // ROTATIONOVERLIFETIME

#ifdef TEXTURESHEETANIMATION

uniform vec4 u_TextureSheetFrame[2];
uniform vec4 u_TextureSheetFrameMax[2];
uniform vec4 u_TextureSheetFrameRange;

uniform vec4 u_TextureSheetFrameData;

#endif // TEXTURESHEETANIMATION

// base render
uniform float u_CurrentTime;
uniform float u_UnitPixels;
uniform vec4 u_SpriteRotAndScale;

varying vec4 v_ParticleColor;
varying vec2 v_ParticleUV;

#ifdef CAMERA2D
    uniform mat3 u_view2D;
#endif

#ifdef RENDERTEXTURE
    uniform vec3 u_InvertMat_0;
    uniform vec3 u_InvertMat_1;
#endif

uniform vec4 u_clipMatDir;
uniform vec4 u_clipMatPos;
varying vec2 v_cliped;

#endif // ShruikenParticleCommon_glsl