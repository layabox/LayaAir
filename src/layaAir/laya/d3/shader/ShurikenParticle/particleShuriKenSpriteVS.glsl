//兼容WGSL
// sprite Uniform
uniform float u_CurrentTime;
uniform vec3 u_Gravity;
uniform vec2 u_DragConstanct;
uniform vec3 u_WorldPosition;
uniform vec4 u_WorldRotation;
//uniform bool u_ThreeDStartRotation;
uniform int u_ThreeDStartRotation; //兼容WGSL，不能使用bool类型
uniform int u_ScalingMode;
uniform vec3 u_PositionScale;
uniform vec3 u_SizeScale;

uniform float u_StretchedBillboardLengthScale;
uniform float u_StretchedBillboardSpeedScale;
uniform int u_SimulationSpace;

#if defined(VELOCITYOVERLIFETIMECONSTANT) || defined(VELOCITYOVERLIFETIMECURVE) || defined(VELOCITYOVERLIFETIMERANDOMCONSTANT) || defined(VELOCITYOVERLIFETIMERANDOMCURVE)
uniform int u_VOLSpaceType;
#endif
#if defined(VELOCITYOVERLIFETIMECONSTANT) || defined(VELOCITYOVERLIFETIMERANDOMCONSTANT)
uniform vec3 u_VOLVelocityConst;
#endif
#if defined(VELOCITYOVERLIFETIMECURVE) || defined(VELOCITYOVERLIFETIMERANDOMCURVE)
uniform vec2 u_VOLVelocityGradientX[4]; // x为key,y为速度
uniform vec2 u_VOLVelocityGradientY[4]; // x为key,y为速度
uniform vec2 u_VOLVelocityGradientZ[4]; // x为key,y为速度
#endif
#ifdef VELOCITYOVERLIFETIMERANDOMCONSTANT
uniform vec3 u_VOLVelocityConstMax;
#endif
#ifdef VELOCITYOVERLIFETIMERANDOMCURVE
uniform vec2 u_VOLVelocityGradientMaxX[4]; // x为key,y为速度
uniform vec2 u_VOLVelocityGradientMaxY[4]; // x为key,y为速度
uniform vec2 u_VOLVelocityGradientMaxZ[4]; // x为key,y为速度
#endif

#ifdef COLORKEYCOUNT_8
    #define COLORCOUNT 8
#else
    #define COLORCOUNT 4
#endif

#ifdef COLOROVERLIFETIME
uniform vec4 u_ColorOverLifeGradientColors[COLORCOUNT]; // x为key,yzw为Color
uniform vec4 u_ColorOverLifeGradientAlphas[COLORCOUNT]; // x为key,y为Alpha
uniform vec4 u_ColorOverLifeGradientRanges;
#endif
#ifdef RANDOMCOLOROVERLIFETIME
uniform vec4 u_ColorOverLifeGradientColors[COLORCOUNT]; // x为key,yzw为Color
uniform vec4 u_ColorOverLifeGradientAlphas[COLORCOUNT]; // x为key,y为Alpha
uniform vec4 u_ColorOverLifeGradientRanges;
uniform vec4 u_MaxColorOverLifeGradientColors[COLORCOUNT]; // x为key,yzw为Color
uniform vec4 u_MaxColorOverLifeGradientAlphas[COLORCOUNT]; // x为key,y为Alpha
uniform vec4 u_MaxColorOverLifeGradientRanges;
#endif

#if defined(SIZEOVERLIFETIMECURVE) || defined(SIZEOVERLIFETIMERANDOMCURVES)
uniform vec4 u_SOLSizeGradient[4]; // x为key,y为尺寸
#endif
#ifdef SIZEOVERLIFETIMERANDOMCURVES
uniform vec4 u_SOLSizeGradientMax[4]; // x为key,y为尺寸
#endif
#if defined(SIZEOVERLIFETIMECURVESEPERATE) || defined(SIZEOVERLIFETIMERANDOMCURVESSEPERATE)
uniform vec2 u_SOLSizeGradientX[4]; // x为key,y为尺寸
uniform vec2 u_SOLSizeGradientY[4]; // x为key,y为尺寸
uniform vec2 u_SOLSizeGradientZ[4]; // x为key,y为尺寸
#endif
#ifdef SIZEOVERLIFETIMERANDOMCURVESSEPERATE
uniform vec2 u_SOLSizeGradientMaxX[4]; // x为key,y为尺寸
uniform vec2 u_SOLSizeGradientMaxY[4]; // x为key,y为尺寸
uniform vec2 u_SOLSizeGradientMaxZ[4]; // x为key,y为尺寸
#endif

#ifdef ROTATIONOVERLIFETIME
    #if defined(ROTATIONOVERLIFETIMECONSTANT) || defined(ROTATIONOVERLIFETIMERANDOMCONSTANTS)
uniform float u_ROLAngularVelocityConst;
    #endif
    #ifdef ROTATIONOVERLIFETIMERANDOMCONSTANTS
uniform float u_ROLAngularVelocityConstMax;
    #endif
    #if defined(ROTATIONOVERLIFETIMECURVE) || defined(ROTATIONOVERLIFETIMERANDOMCURVES)
uniform vec2 u_ROLAngularVelocityGradient[4]; // x为key,y为旋转
    #endif
    #ifdef ROTATIONOVERLIFETIMERANDOMCURVES
uniform vec2 u_ROLAngularVelocityGradientMax[4]; // x为key,y为旋转
    #endif
#endif
#ifdef ROTATIONOVERLIFETIMESEPERATE
    #if defined(ROTATIONOVERLIFETIMECONSTANT) || defined(ROTATIONOVERLIFETIMERANDOMCONSTANTS)
uniform vec3 u_ROLAngularVelocityConstSeprarate;
    #endif
    #ifdef ROTATIONOVERLIFETIMERANDOMCONSTANTS
uniform vec3 u_ROLAngularVelocityConstMaxSeprarate;
    #endif
    #if defined(ROTATIONOVERLIFETIMECURVE) || defined(ROTATIONOVERLIFETIMERANDOMCURVES)
uniform vec2 u_ROLAngularVelocityGradientX[4];
uniform vec2 u_ROLAngularVelocityGradientY[4];
uniform vec2 u_ROLAngularVelocityGradientZ[4];
    #endif
    #ifdef ROTATIONOVERLIFETIMERANDOMCURVES
uniform vec2 u_ROLAngularVelocityGradientMaxX[4];
uniform vec2 u_ROLAngularVelocityGradientMaxY[4];
uniform vec2 u_ROLAngularVelocityGradientMaxZ[4];
uniform vec2 u_ROLAngularVelocityGradientMaxW[4];
    #endif
#endif

#if defined(TEXTURESHEETANIMATIONCURVE) || defined(TEXTURESHEETANIMATIONRANDOMCURVE)
uniform float u_TSACycles;
uniform vec2 u_TSASubUVLength;
uniform vec4 u_TSAGradientUVs[4]; // x为key,y为frame
#endif
#ifdef TEXTURESHEETANIMATIONRANDOMCURVE
uniform vec4 u_TSAMaxGradientUVs[4]; // x为key,y为frame
#endif