// sprite Uniform
uniform float u_CurrentTime;
uniform vec3 u_Gravity;
uniform vec2 u_DragConstanct;
uniform vec3 u_WorldPosition;
uniform vec4 u_WorldRotation;
uniform int u_ThreeDStartRotation;
uniform int u_Shape;
uniform int u_ScalingMode;
uniform vec3 u_PositionScale;
uniform vec3 u_SizeScale;

uniform float u_StretchedBillboardLengthScale;
uniform float u_StretchedBillboardSpeedScale;
uniform int u_SimulationSpace;

#ifdef VELOCITYOVERLIFETIMERANDOMCURVE
    uniform int u_VOLSpaceType;

    uniform vec4 u_VOLVelocityGradientX[2];  // x为key,y为速度 z为key,w为速度
    uniform vec4 u_VOLVelocityGradientY[2];  // x为key,y为速度 z为key,w为速度
    uniform vec4 u_VOLVelocityGradientZ[2];  // x为key,y为速度 z为key,w为速度

    uniform vec4 u_VOLVelocityGradientMaxX[2]; // x为key,y为速度 z为key,w为速度
    uniform vec4 u_VOLVelocityGradientMaxY[2]; // x为key,y为速度 z为key,w为速度
    uniform vec4 u_VOLVelocityGradientMaxZ[2]; // x为key,y为速度 z为key,w为速度
#endif

#ifdef COLORKEYCOUNT_8
    #define COLORCOUNT 8
    #define COLORCOUNT_HALF 4
#else
    #define COLORCOUNT 4
    #define COLORCOUNT_HALF 2
#endif

#ifdef RANDOMCOLOROVERLIFETIME
    uniform vec4 u_ColorOverLifeGradientColors[COLORCOUNT]; // x为key,yzw为Color
    uniform vec4 u_ColorOverLifeGradientAlphas[COLORCOUNT_HALF]; // x为key,y为Alpha,z为key,w为Alpha 
    uniform vec4 u_ColorOverLifeGradientRanges;
    uniform vec4 u_MaxColorOverLifeGradientColors[COLORCOUNT]; // x为key,yzw为Color
    uniform vec4 u_MaxColorOverLifeGradientAlphas[COLORCOUNT_HALF]; // x为key,y为Alpha,z为key,w为Alpha 
    uniform vec4 u_MaxColorOverLifeGradientRanges;
#endif

#ifdef SIZEOVERLIFETIMERANDOMCURVES
    uniform vec4 u_SOLSizeGradient[2]; // x为key,y为尺寸, z为key,w为尺寸
    uniform vec4 u_SOLSizeGradientMax[2]; // x为key,y为尺寸, z为key,w为尺寸
#endif

#ifdef SIZEOVERLIFETIMERANDOMCURVESSEPERATE
    uniform vec4 u_SOLSizeGradientX[2]; // x为key,y为尺寸,z为key,w为尺寸
    uniform vec4 u_SOLSizeGradientY[2]; // x为key,y为尺寸,z为key,w为尺寸
    uniform vec4 u_SOLSizeGradientZ[2]; // x为key,y为尺寸,z为key,w为尺寸
    uniform vec4 u_SOLSizeGradientMaxX[2];// x为key,y为尺寸,z为key,w为尺寸
    uniform vec4 u_SOLSizeGradientMaxY[2]; // x为key,y为尺寸,z为key,w为尺寸
    uniform vec4 u_SOLSizeGradientMaxZ[2]; // x为key,y为尺寸,z为key,w为尺寸
#endif

#ifdef ROTATIONOVERLIFETIME
    uniform vec4 u_ROLAngularVelocityGradient[2]; // x为key,y为旋转,z为key,w为旋转
    uniform vec4 u_ROLAngularVelocityGradientMax[2]; // x为key,y为旋转,z为key,w为旋转,
#endif

#ifdef ROTATIONOVERLIFETIMESEPERATE
    uniform vec4 u_ROLAngularVelocityGradientX[2]; //x为key,y为旋转速度,z为key,w为旋转速度
    uniform vec4 u_ROLAngularVelocityGradientY[2];
    uniform vec4 u_ROLAngularVelocityGradientZ[2];

    uniform vec4 u_ROLAngularVelocityGradientMaxX[2];
    uniform vec4 u_ROLAngularVelocityGradientMaxY[2];
    uniform vec4 u_ROLAngularVelocityGradientMaxZ[2];
#endif

#ifdef TEXTURESHEETANIMATIONRANDOMCURVE
    uniform float u_TSACycles;
    uniform vec2 u_TSASubUVLength;
    uniform vec4 u_TSAGradientUVs[2]; // x为key,y为frame,z为key,w为frame
    uniform vec4 u_TSAMaxGradientUVs[2]; // x为key,y为frame,z为key,w为frame
#endif