// sprite Uniform
uniform float u_CurrentTime;
uniform vec3 u_Gravity;
uniform vec2 u_DragConstanct;
uniform vec3 u_WorldPosition;
uniform vec4 u_WorldRotation;
uniform bool u_ThreeDStartRotation;
uniform int u_ScalingMode;
uniform vec3 u_PositionScale;
uniform vec3 u_SizeScale;

uniform float u_StretchedBillboardLengthScale;
uniform float u_StretchedBillboardSpeedScale;
uniform int u_SimulationSpace;

#ifdef VELOCITYOVERLIFETIMERANDOMCURVE
    uniform int u_VOLSpaceType;

    uniform vec2 u_VOLVelocityGradientX[4]; // x为key,y为速度
    uniform vec2 u_VOLVelocityGradientY[4]; // x为key,y为速度
    uniform vec2 u_VOLVelocityGradientZ[4]; // x为key,y为速度

    uniform vec2 u_VOLVelocityGradientMaxX[4]; // x为key,y为速度
    uniform vec2 u_VOLVelocityGradientMaxY[4]; // x为key,y为速度
    uniform vec2 u_VOLVelocityGradientMaxZ[4]; // x为key,y为速度
#endif

#ifdef COLORKEYCOUNT_8
    #define COLORCOUNT 8
#else
    #define COLORCOUNT 4
#endif

#ifdef RANDOMCOLOROVERLIFETIME
    uniform vec4 u_ColorOverLifeGradientColors[COLORCOUNT]; // x为key,yzw为Color
    uniform vec2 u_ColorOverLifeGradientAlphas[COLORCOUNT]; // x为key,y为Alpha
    uniform vec4 u_ColorOverLifeGradientRanges;
    uniform vec4 u_MaxColorOverLifeGradientColors[COLORCOUNT]; // x为key,yzw为Color
    uniform vec2 u_MaxColorOverLifeGradientAlphas[COLORCOUNT]; // x为key,y为Alpha
    uniform vec4 u_MaxColorOverLifeGradientRanges;
#endif

#ifdef SIZEOVERLIFETIMERANDOMCURVES
    uniform vec2 u_SOLSizeGradient[4]; // x为key,y为尺寸
    uniform vec2 u_SOLSizeGradientMax[4]; // x为key,y为尺寸
#endif

#ifdef SIZEOVERLIFETIMERANDOMCURVESSEPERATE
    uniform vec2 u_SOLSizeGradientX[4]; // x为key,y为尺寸
    uniform vec2 u_SOLSizeGradientY[4]; // x为key,y为尺寸
    uniform vec2 u_SOLSizeGradientZ[4]; // x为key,y为尺寸
    uniform vec2 u_SOLSizeGradientMaxX[4]; // x为key,y为尺寸
    uniform vec2 u_SOLSizeGradientMaxY[4]; // x为key,y为尺寸
    uniform vec2 u_SOLSizeGradientMaxZ[4]; // x为key,y为尺寸
#endif

#ifdef ROTATIONOVERLIFETIME
    uniform vec2 u_ROLAngularVelocityGradient[4]; // x为key,y为旋转
    uniform vec2 u_ROLAngularVelocityGradientMax[4]; // x为key,y为旋转
#endif

#ifdef ROTATIONOVERLIFETIMESEPERATE
    uniform vec2 u_ROLAngularVelocityGradientX[4];
    uniform vec2 u_ROLAngularVelocityGradientY[4];
    uniform vec2 u_ROLAngularVelocityGradientZ[4];

    uniform vec2 u_ROLAngularVelocityGradientMaxX[4];
    uniform vec2 u_ROLAngularVelocityGradientMaxY[4];
    uniform vec2 u_ROLAngularVelocityGradientMaxZ[4];
#endif

#ifdef TEXTURESHEETANIMATIONRANDOMCURVE
    uniform float u_TSACycles;
    uniform vec2 u_TSASubUVLength;
    uniform vec2 u_TSAGradientUVs[4]; // x为key,y为frame
    uniform vec2 u_TSAMaxGradientUVs[4]; // x为key,y为frame
#endif