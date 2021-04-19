// #include "Lighting.glsl";

//修改这里剔除没有用到的光照函数，增加粒子的编译速度
vec2 TransformUV(vec2 texcoord,vec4 tilingOffset) {
	vec2 transTexcoord=vec2(texcoord.x,texcoord.y-1.0)*tilingOffset.xy+vec2(tilingOffset.z,-tilingOffset.w);
	transTexcoord.y+=1.0;
	return transTexcoord;
}

vec4 remapGLPositionZ(vec4 position) {
	position.z=position.z * 2.0 - position.w;
	return position;
}

#if defined(GL_FRAGMENT_PRECISION_HIGH)
  precision highp float;
#else
  precision mediump float;
#endif

#if defined(SPHERHBILLBOARD)||defined(STRETCHEDBILLBOARD)||defined(HORIZONTALBILLBOARD)||defined(VERTICALBILLBOARD)
	attribute vec4 a_CornerTextureCoordinate;
#endif
#ifdef RENDERMODE_MESH
	attribute vec3 a_MeshPosition;
	attribute vec4 a_MeshColor;
	attribute vec2 a_MeshTextureCoordinate;
	varying vec4 v_MeshColor;
#endif

attribute vec4 a_ShapePositionStartLifeTime;
attribute vec4 a_DirectionTime;
attribute vec4 a_StartColor;
attribute vec3 a_StartSize;
attribute vec3 a_StartRotation0;
attribute float a_StartSpeed;
#if defined(COLOROVERLIFETIME)||defined(RANDOMCOLOROVERLIFETIME)||defined(SIZEOVERLIFETIMERANDOMCURVES)||defined(SIZEOVERLIFETIMERANDOMCURVESSEPERATE)||defined(ROTATIONOVERLIFETIMERANDOMCONSTANTS)||defined(ROTATIONOVERLIFETIMERANDOMCURVES)
  attribute vec4 a_Random0;
#endif
#if defined(TEXTURESHEETANIMATIONRANDOMCURVE)||defined(VELOCITYOVERLIFETIMERANDOMCONSTANT)||defined(VELOCITYOVERLIFETIMERANDOMCURVE)
  attribute vec4 a_Random1;
#endif
attribute vec3 a_SimulationWorldPostion;
attribute vec4 a_SimulationWorldRotation;

varying vec4 v_Color;
#ifdef DIFFUSEMAP
	varying vec2 v_TextureCoordinate;
#endif

uniform float u_CurrentTime;
uniform vec3 u_Gravity;

uniform vec3 u_WorldPosition;
uniform vec4 u_WorldRotation;
uniform bool u_ThreeDStartRotation;
uniform int u_ScalingMode;
uniform vec3 u_PositionScale;
uniform vec3 u_SizeScale;
uniform mat4 u_View;
uniform mat4 u_Projection;

#ifdef STRETCHEDBILLBOARD
	uniform vec3 u_CameraPos;
#endif
uniform vec3 u_CameraDirection;//TODO:只有几种广告牌模式需要用
uniform vec3 u_CameraUp;

uniform  float u_StretchedBillboardLengthScale;
uniform  float u_StretchedBillboardSpeedScale;
uniform int u_SimulationSpace;

#if defined(VELOCITYOVERLIFETIMECONSTANT)||defined(VELOCITYOVERLIFETIMECURVE)||defined(VELOCITYOVERLIFETIMERANDOMCONSTANT)||defined(VELOCITYOVERLIFETIMERANDOMCURVE)
  uniform  int  u_VOLSpaceType;
#endif
#if defined(VELOCITYOVERLIFETIMECONSTANT)||defined(VELOCITYOVERLIFETIMERANDOMCONSTANT)
  uniform  vec3 u_VOLVelocityConst;
#endif
#if defined(VELOCITYOVERLIFETIMECURVE)||defined(VELOCITYOVERLIFETIMERANDOMCURVE)
  uniform  vec2 u_VOLVelocityGradientX[4];//x为key,y为速度
  uniform  vec2 u_VOLVelocityGradientY[4];//x为key,y为速度
  uniform  vec2 u_VOLVelocityGradientZ[4];//x为key,y为速度
#endif
#ifdef VELOCITYOVERLIFETIMERANDOMCONSTANT
  uniform  vec3 u_VOLVelocityConstMax;
#endif
#ifdef VELOCITYOVERLIFETIMERANDOMCURVE
  uniform  vec2 u_VOLVelocityGradientMaxX[4];//x为key,y为速度
  uniform  vec2 u_VOLVelocityGradientMaxY[4];//x为key,y为速度
  uniform  vec2 u_VOLVelocityGradientMaxZ[4];//x为key,y为速度
#endif

#ifdef COLOROVERLIFETIME
  uniform  vec4 u_ColorOverLifeGradientColors[4];//x为key,yzw为Color
  uniform  vec2 u_ColorOverLifeGradientAlphas[4];//x为key,y为Alpha
#endif
#ifdef RANDOMCOLOROVERLIFETIME
  uniform  vec4 u_ColorOverLifeGradientColors[4];//x为key,yzw为Color
  uniform  vec2 u_ColorOverLifeGradientAlphas[4];//x为key,y为Alpha
  uniform  vec4 u_MaxColorOverLifeGradientColors[4];//x为key,yzw为Color
  uniform  vec2 u_MaxColorOverLifeGradientAlphas[4];//x为key,y为Alpha
#endif


#if defined(SIZEOVERLIFETIMECURVE)||defined(SIZEOVERLIFETIMERANDOMCURVES)
  uniform  vec2 u_SOLSizeGradient[4];//x为key,y为尺寸
#endif
#ifdef SIZEOVERLIFETIMERANDOMCURVES
  uniform  vec2 u_SOLSizeGradientMax[4];//x为key,y为尺寸
#endif
#if defined(SIZEOVERLIFETIMECURVESEPERATE)||defined(SIZEOVERLIFETIMERANDOMCURVESSEPERATE)
  uniform  vec2 u_SOLSizeGradientX[4];//x为key,y为尺寸
  uniform  vec2 u_SOLSizeGradientY[4];//x为key,y为尺寸
  uniform  vec2 u_SOLSizeGradientZ[4];//x为key,y为尺寸
#endif
#ifdef SIZEOVERLIFETIMERANDOMCURVESSEPERATE
  uniform  vec2 u_SOLSizeGradientMaxX[4];//x为key,y为尺寸
  uniform  vec2 u_SOLSizeGradientMaxY[4];//x为key,y为尺寸
  uniform  vec2 u_SOLSizeGradientMaxZ[4];//x为key,y为尺寸
#endif


#ifdef ROTATIONOVERLIFETIME
  #if defined(ROTATIONOVERLIFETIMECONSTANT)||defined(ROTATIONOVERLIFETIMERANDOMCONSTANTS)
    uniform  float u_ROLAngularVelocityConst;
  #endif
  #ifdef ROTATIONOVERLIFETIMERANDOMCONSTANTS
    uniform  float u_ROLAngularVelocityConstMax;
  #endif
  #if defined(ROTATIONOVERLIFETIMECURVE)||defined(ROTATIONOVERLIFETIMERANDOMCURVES)
    uniform  vec2 u_ROLAngularVelocityGradient[4];//x为key,y为旋转
  #endif
  #ifdef ROTATIONOVERLIFETIMERANDOMCURVES
    uniform  vec2 u_ROLAngularVelocityGradientMax[4];//x为key,y为旋转
  #endif
#endif
#ifdef ROTATIONOVERLIFETIMESEPERATE
  #if defined(ROTATIONOVERLIFETIMECONSTANT)||defined(ROTATIONOVERLIFETIMERANDOMCONSTANTS)
    uniform  vec3 u_ROLAngularVelocityConstSeprarate;
  #endif
  #ifdef ROTATIONOVERLIFETIMERANDOMCONSTANTS
    uniform  vec3 u_ROLAngularVelocityConstMaxSeprarate;
  #endif
  #if defined(ROTATIONOVERLIFETIMECURVE)||defined(ROTATIONOVERLIFETIMERANDOMCURVES)
    uniform  vec2 u_ROLAngularVelocityGradientX[4];
    uniform  vec2 u_ROLAngularVelocityGradientY[4];
    uniform  vec2 u_ROLAngularVelocityGradientZ[4];
  #endif
  #ifdef ROTATIONOVERLIFETIMERANDOMCURVES
    uniform  vec2 u_ROLAngularVelocityGradientMaxX[4];
    uniform  vec2 u_ROLAngularVelocityGradientMaxY[4];
    uniform  vec2 u_ROLAngularVelocityGradientMaxZ[4];
	uniform  vec2 u_ROLAngularVelocityGradientMaxW[4];
  #endif
#endif

#if defined(TEXTURESHEETANIMATIONCURVE)||defined(TEXTURESHEETANIMATIONRANDOMCURVE)
  uniform  float u_TSACycles;
  uniform  vec2 u_TSASubUVLength;
  uniform  vec2 u_TSAGradientUVs[4];//x为key,y为frame
#endif
#ifdef TEXTURESHEETANIMATIONRANDOMCURVE
  uniform  vec2 u_TSAMaxGradientUVs[4];//x为key,y为frame
#endif

uniform vec4 u_TilingOffset;

vec3 rotationByEuler(in vec3 vector,in vec3 rot)
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
	
	//vec4 q=vec4(quaX,quaY,quaZ,quaW);
	//vec3 temp = cross(q.xyz, vector) + q.w * vector;
	//return (cross(temp, -q.xyz) + dot(q.xyz,vector) * q.xyz + q.w * temp);
	
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

//假定axis已经归一化
vec3 rotationByAxis(in vec3 vector,in vec3 axis, in float angle)
{
	float halfAngle = angle * 0.5;
	float sin = sin(halfAngle);
	
	float quaX = axis.x * sin;
	float quaY = axis.y * sin;
	float quaZ = axis.z * sin;
	float quaW = cos(halfAngle);
	
	//vec4 q=vec4(quaX,quaY,quaZ,quaW);
	//vec3 temp = cross(q.xyz, vector) + q.w * vector;
	//return (cross(temp, -q.xyz) + dot(q.xyz,vector) * q.xyz + q.w * temp);
	
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

vec3 rotationByQuaternions(in vec3 v,in vec4 q) 
{
	return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

 
#if defined(VELOCITYOVERLIFETIMECURVE)||defined(VELOCITYOVERLIFETIMERANDOMCURVE)||defined(SIZEOVERLIFETIMECURVE)||defined(SIZEOVERLIFETIMECURVESEPERATE)||defined(SIZEOVERLIFETIMERANDOMCURVES)||defined(SIZEOVERLIFETIMERANDOMCURVESSEPERATE)
float getCurValueFromGradientFloat(in vec2 gradientNumbers[4],in float normalizedAge)
{
	float curValue;
	for(int i=1;i<4;i++)
	{
		vec2 gradientNumber=gradientNumbers[i];
		float key=gradientNumber.x;
		if(key>=normalizedAge)
		{
			vec2 lastGradientNumber=gradientNumbers[i-1];
			float lastKey=lastGradientNumber.x;
			float age=(normalizedAge-lastKey)/(key-lastKey);
			curValue=mix(lastGradientNumber.y,gradientNumber.y,age);
			break;
		}
	}
	return curValue;
}
#endif

#if defined(VELOCITYOVERLIFETIMECURVE)||defined(VELOCITYOVERLIFETIMERANDOMCURVE)||defined(ROTATIONOVERLIFETIMECURVE)||defined(ROTATIONOVERLIFETIMERANDOMCURVES)
float getTotalValueFromGradientFloat(in vec2 gradientNumbers[4],in float normalizedAge)
{
	float totalValue=0.0;
	for(int i=1;i<4;i++)
	{
		vec2 gradientNumber=gradientNumbers[i];
		float key=gradientNumber.x;
		vec2 lastGradientNumber=gradientNumbers[i-1];
		float lastValue=lastGradientNumber.y;
		
		if(key>=normalizedAge){
			float lastKey=lastGradientNumber.x;
			float age=(normalizedAge-lastKey)/(key-lastKey);
			totalValue+=(lastValue+mix(lastValue,gradientNumber.y,age))/2.0*a_ShapePositionStartLifeTime.w*(normalizedAge-lastKey);
			break;
		}
		else{
			totalValue+=(lastValue+gradientNumber.y)/2.0*a_ShapePositionStartLifeTime.w*(key-lastGradientNumber.x);
		}
	}
	return totalValue;
}
#endif

#if defined(COLOROVERLIFETIME)||defined(RANDOMCOLOROVERLIFETIME)
vec4 getColorFromGradient(in vec2 gradientAlphas[4],in vec4 gradientColors[4],in float normalizedAge)
{
	vec4 overTimeColor;
	for(int i=1;i<4;i++)
	{
		vec2 gradientAlpha=gradientAlphas[i];
		float alphaKey=gradientAlpha.x;
		if(alphaKey>=normalizedAge)
		{
			vec2 lastGradientAlpha=gradientAlphas[i-1];
			float lastAlphaKey=lastGradientAlpha.x;
			float age=(normalizedAge-lastAlphaKey)/(alphaKey-lastAlphaKey);
			overTimeColor.a=mix(lastGradientAlpha.y,gradientAlpha.y,age);
			break;
		}
	}
	
	for(int i=1;i<4;i++)
	{
		vec4 gradientColor=gradientColors[i];
		float colorKey=gradientColor.x;
		if(colorKey>=normalizedAge)
		{
			vec4 lastGradientColor=gradientColors[i-1];
			float lastColorKey=lastGradientColor.x;
			float age=(normalizedAge-lastColorKey)/(colorKey-lastColorKey);
			overTimeColor.rgb=mix(gradientColors[i-1].yzw,gradientColor.yzw,age);
			break;
		}
	}
	return overTimeColor;
}
#endif


#if defined(TEXTURESHEETANIMATIONCURVE)||defined(TEXTURESHEETANIMATIONRANDOMCURVE)
float getFrameFromGradient(in vec2 gradientFrames[4],in float normalizedAge)
{
	float overTimeFrame;
	for(int i=1;i<4;i++)
	{
		vec2 gradientFrame=gradientFrames[i];
		float key=gradientFrame.x;
		if(key>=normalizedAge)
		{
			vec2 lastGradientFrame=gradientFrames[i-1];
			float lastKey=lastGradientFrame.x;
			float age=(normalizedAge-lastKey)/(key-lastKey);
			overTimeFrame=mix(lastGradientFrame.y,gradientFrame.y,age);
			break;
		}
	}
	return floor(overTimeFrame);
}
#endif

#if defined(VELOCITYOVERLIFETIMECONSTANT)||defined(VELOCITYOVERLIFETIMECURVE)||defined(VELOCITYOVERLIFETIMERANDOMCONSTANT)||defined(VELOCITYOVERLIFETIMERANDOMCURVE)
vec3 computeParticleLifeVelocity(in float normalizedAge)
{
  vec3 outLifeVelocity;
  #ifdef VELOCITYOVERLIFETIMECONSTANT
	 outLifeVelocity=u_VOLVelocityConst; 
  #endif
  #ifdef VELOCITYOVERLIFETIMECURVE
     outLifeVelocity= vec3(getCurValueFromGradientFloat(u_VOLVelocityGradientX,normalizedAge),getCurValueFromGradientFloat(u_VOLVelocityGradientY,normalizedAge),getCurValueFromGradientFloat(u_VOLVelocityGradientZ,normalizedAge));
  #endif
  #ifdef VELOCITYOVERLIFETIMERANDOMCONSTANT
	 outLifeVelocity=mix(u_VOLVelocityConst,u_VOLVelocityConstMax,vec3(a_Random1.y,a_Random1.z,a_Random1.w)); 
  #endif
  #ifdef VELOCITYOVERLIFETIMERANDOMCURVE
     outLifeVelocity=vec3(mix(getCurValueFromGradientFloat(u_VOLVelocityGradientX,normalizedAge),getCurValueFromGradientFloat(u_VOLVelocityGradientMaxX,normalizedAge),a_Random1.y),
	                 mix(getCurValueFromGradientFloat(u_VOLVelocityGradientY,normalizedAge),getCurValueFromGradientFloat(u_VOLVelocityGradientMaxY,normalizedAge),a_Random1.z),
					 mix(getCurValueFromGradientFloat(u_VOLVelocityGradientZ,normalizedAge),getCurValueFromGradientFloat(u_VOLVelocityGradientMaxZ,normalizedAge),a_Random1.w));
  #endif
					
  return outLifeVelocity;
} 
#endif

vec3 computeParticlePosition(in vec3 startVelocity, in vec3 lifeVelocity,in float age,in float normalizedAge,vec3 gravityVelocity,vec4 worldRotation)
{
   vec3 startPosition;
   vec3 lifePosition;
   #if defined(VELOCITYOVERLIFETIMECONSTANT)||defined(VELOCITYOVERLIFETIMECURVE)||defined(VELOCITYOVERLIFETIMERANDOMCONSTANT)||defined(VELOCITYOVERLIFETIMERANDOMCURVE)
	#ifdef VELOCITYOVERLIFETIMECONSTANT
		  startPosition=startVelocity*age;
		  lifePosition=lifeVelocity*age;
	#endif
	#ifdef VELOCITYOVERLIFETIMECURVE
		  startPosition=startVelocity*age;
		  lifePosition=vec3(getTotalValueFromGradientFloat(u_VOLVelocityGradientX,normalizedAge),getTotalValueFromGradientFloat(u_VOLVelocityGradientY,normalizedAge),getTotalValueFromGradientFloat(u_VOLVelocityGradientZ,normalizedAge));
	#endif
	#ifdef VELOCITYOVERLIFETIMERANDOMCONSTANT
		  startPosition=startVelocity*age;
		  lifePosition=lifeVelocity*age;
	#endif
	#ifdef VELOCITYOVERLIFETIMERANDOMCURVE
		  startPosition=startVelocity*age;
		  lifePosition=vec3(mix(getTotalValueFromGradientFloat(u_VOLVelocityGradientX,normalizedAge),getTotalValueFromGradientFloat(u_VOLVelocityGradientMaxX,normalizedAge),a_Random1.y)
	      ,mix(getTotalValueFromGradientFloat(u_VOLVelocityGradientY,normalizedAge),getTotalValueFromGradientFloat(u_VOLVelocityGradientMaxY,normalizedAge),a_Random1.z)
	      ,mix(getTotalValueFromGradientFloat(u_VOLVelocityGradientZ,normalizedAge),getTotalValueFromGradientFloat(u_VOLVelocityGradientMaxZ,normalizedAge),a_Random1.w));
	#endif
	
	vec3 finalPosition;
	if(u_VOLSpaceType==0){
	  if(u_ScalingMode!=2)
	   finalPosition =rotationByQuaternions(u_PositionScale*(a_ShapePositionStartLifeTime.xyz+startPosition+lifePosition),worldRotation);
	  else
	   finalPosition =rotationByQuaternions(u_PositionScale*a_ShapePositionStartLifeTime.xyz+startPosition+lifePosition,worldRotation);
	}
	else{
	  if(u_ScalingMode!=2)
	    finalPosition = rotationByQuaternions(u_PositionScale*(a_ShapePositionStartLifeTime.xyz+startPosition),worldRotation)+lifePosition;
	  else
	    finalPosition = rotationByQuaternions(u_PositionScale*a_ShapePositionStartLifeTime.xyz+startPosition,worldRotation)+lifePosition;
	}
  #else
	 startPosition=startVelocity*age;
	 vec3 finalPosition;
	 if(u_ScalingMode!=2)
			finalPosition = rotationByQuaternions(u_PositionScale*(a_ShapePositionStartLifeTime.xyz+startPosition),worldRotation);
	 else
	   	finalPosition = rotationByQuaternions(u_PositionScale*a_ShapePositionStartLifeTime.xyz+startPosition,worldRotation);
  #endif
  
  if(u_SimulationSpace==0)
    finalPosition=finalPosition+a_SimulationWorldPostion;
  else if(u_SimulationSpace==1) 
    finalPosition=finalPosition+u_WorldPosition;
  
  finalPosition+=0.5*gravityVelocity*age;
 
  return  finalPosition;
}


vec4 computeParticleColor(in vec4 color,in float normalizedAge)
{
	#ifdef COLOROVERLIFETIME
	  color*=getColorFromGradient(u_ColorOverLifeGradientAlphas,u_ColorOverLifeGradientColors,normalizedAge);
	#endif
	
	#ifdef RANDOMCOLOROVERLIFETIME
	  color*=mix(getColorFromGradient(u_ColorOverLifeGradientAlphas,u_ColorOverLifeGradientColors,normalizedAge),getColorFromGradient(u_MaxColorOverLifeGradientAlphas,u_MaxColorOverLifeGradientColors,normalizedAge),a_Random0.y);
	#endif

    return color;
}

vec2 computeParticleSizeBillbard(in vec2 size,in float normalizedAge)
{
	#ifdef SIZEOVERLIFETIMECURVE
		size*=getCurValueFromGradientFloat(u_SOLSizeGradient,normalizedAge);
	#endif
	#ifdef SIZEOVERLIFETIMERANDOMCURVES
	    size*=mix(getCurValueFromGradientFloat(u_SOLSizeGradient,normalizedAge),getCurValueFromGradientFloat(u_SOLSizeGradientMax,normalizedAge),a_Random0.z); 
	#endif
	#ifdef SIZEOVERLIFETIMECURVESEPERATE
		size*=vec2(getCurValueFromGradientFloat(u_SOLSizeGradientX,normalizedAge),getCurValueFromGradientFloat(u_SOLSizeGradientY,normalizedAge));
	#endif
	#ifdef SIZEOVERLIFETIMERANDOMCURVESSEPERATE
	    size*=vec2(mix(getCurValueFromGradientFloat(u_SOLSizeGradientX,normalizedAge),getCurValueFromGradientFloat(u_SOLSizeGradientMaxX,normalizedAge),a_Random0.z)
	    ,mix(getCurValueFromGradientFloat(u_SOLSizeGradientY,normalizedAge),getCurValueFromGradientFloat(u_SOLSizeGradientMaxY,normalizedAge),a_Random0.z));
	#endif
	return size;
}

#ifdef RENDERMODE_MESH
vec3 computeParticleSizeMesh(in vec3 size,in float normalizedAge)
{
	#ifdef SIZEOVERLIFETIMECURVE
		size*=getCurValueFromGradientFloat(u_SOLSizeGradient,normalizedAge);
	#endif
	#ifdef SIZEOVERLIFETIMERANDOMCURVES
	    size*=mix(getCurValueFromGradientFloat(u_SOLSizeGradient,normalizedAge),getCurValueFromGradientFloat(u_SOLSizeGradientMax,normalizedAge),a_Random0.z); 
	#endif
	#ifdef SIZEOVERLIFETIMECURVESEPERATE
		size*=vec3(getCurValueFromGradientFloat(u_SOLSizeGradientX,normalizedAge),getCurValueFromGradientFloat(u_SOLSizeGradientY,normalizedAge),getCurValueFromGradientFloat(u_SOLSizeGradientZ,normalizedAge));
	#endif
	#ifdef SIZEOVERLIFETIMERANDOMCURVESSEPERATE
	    size*=vec3(mix(getCurValueFromGradientFloat(u_SOLSizeGradientX,normalizedAge),getCurValueFromGradientFloat(u_SOLSizeGradientMaxX,normalizedAge),a_Random0.z)
	    ,mix(getCurValueFromGradientFloat(u_SOLSizeGradientY,normalizedAge),getCurValueFromGradientFloat(u_SOLSizeGradientMaxY,normalizedAge),a_Random0.z)
		,mix(getCurValueFromGradientFloat(u_SOLSizeGradientZ,normalizedAge),getCurValueFromGradientFloat(u_SOLSizeGradientMaxZ,normalizedAge),a_Random0.z));
	#endif
	return size;
}
#endif

float computeParticleRotationFloat(in float rotation,in float age,in float normalizedAge)
{ 
	#ifdef ROTATIONOVERLIFETIME
		#ifdef ROTATIONOVERLIFETIMECONSTANT
			float ageRot=u_ROLAngularVelocityConst*age;
	        rotation+=ageRot;
		#endif
		#ifdef ROTATIONOVERLIFETIMECURVE
			rotation+=getTotalValueFromGradientFloat(u_ROLAngularVelocityGradient,normalizedAge);
		#endif
		#ifdef ROTATIONOVERLIFETIMERANDOMCONSTANTS
			float ageRot=mix(u_ROLAngularVelocityConst,u_ROLAngularVelocityConstMax,a_Random0.w)*age;
	        rotation+=ageRot;
	    #endif
		#ifdef ROTATIONOVERLIFETIMERANDOMCURVES
			rotation+=mix(getTotalValueFromGradientFloat(u_ROLAngularVelocityGradient,normalizedAge),getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientMax,normalizedAge),a_Random0.w);
		#endif
	#endif
	#ifdef ROTATIONOVERLIFETIMESEPERATE
		#ifdef ROTATIONOVERLIFETIMECONSTANT
			float ageRot=u_ROLAngularVelocityConstSeprarate.z*age;
	        rotation+=ageRot;
		#endif
		#ifdef ROTATIONOVERLIFETIMECURVE
			rotation+=getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientZ,normalizedAge);
		#endif
		#ifdef ROTATIONOVERLIFETIMERANDOMCONSTANTS
			float ageRot=mix(u_ROLAngularVelocityConstSeprarate.z,u_ROLAngularVelocityConstMaxSeprarate.z,a_Random0.w)*age;
	        rotation+=ageRot;
	    #endif
		#ifdef ROTATIONOVERLIFETIMERANDOMCURVES
			rotation+=mix(getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientZ,normalizedAge),getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientMaxZ,normalizedAge),a_Random0.w));
		#endif
	#endif
	return rotation;
}

#if defined(RENDERMODE_MESH)&&(defined(ROTATIONOVERLIFETIME)||defined(ROTATIONOVERLIFETIMESEPERATE))
vec3 computeParticleRotationVec3(in vec3 rotation,in float age,in float normalizedAge)
{ 
	#ifdef ROTATIONOVERLIFETIME
	#ifdef ROTATIONOVERLIFETIMECONSTANT
			float ageRot=u_ROLAngularVelocityConst*age;
	        rotation+=ageRot;
		#endif
		#ifdef ROTATIONOVERLIFETIMECURVE
			rotation+=getTotalValueFromGradientFloat(u_ROLAngularVelocityGradient,normalizedAge);
		#endif
		#ifdef ROTATIONOVERLIFETIMERANDOMCONSTANTS
			float ageRot=mix(u_ROLAngularVelocityConst,u_ROLAngularVelocityConstMax,a_Random0.w)*age;
	        rotation+=ageRot;
	    #endif
		#ifdef ROTATIONOVERLIFETIMERANDOMCURVES
			rotation+=mix(getTotalValueFromGradientFloat(u_ROLAngularVelocityGradient,normalizedAge),getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientMax,normalizedAge),a_Random0.w);
		#endif
	#endif
	#ifdef ROTATIONOVERLIFETIMESEPERATE
		#ifdef ROTATIONOVERLIFETIMECONSTANT
			vec3 ageRot=u_ROLAngularVelocityConstSeprarate*age;
	        rotation+=ageRot;
		#endif
		#ifdef ROTATIONOVERLIFETIMECURVE
			rotation+=vec3(getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientX,normalizedAge),getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientY,normalizedAge),getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientZ,normalizedAge));
		#endif
		#ifdef ROTATIONOVERLIFETIMERANDOMCONSTANTS
			vec3 ageRot=mix(u_ROLAngularVelocityConstSeprarate,u_ROLAngularVelocityConstMaxSeprarate,a_Random0.w)*age;
	        rotation+=ageRot;
	    #endif
		#ifdef ROTATIONOVERLIFETIMERANDOMCURVES
			rotation+=vec3(mix(getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientX,normalizedAge),getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientMaxX,normalizedAge),a_Random0.w)
	        ,mix(getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientY,normalizedAge),getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientMaxY,normalizedAge),a_Random0.w)
	        ,mix(getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientZ,normalizedAge),getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientMaxZ,normalizedAge),a_Random0.w));
		#endif
	#endif
	return rotation;
}
#endif

vec2 computeParticleUV(in vec2 uv,in float normalizedAge)
{ 
	#ifdef TEXTURESHEETANIMATIONCURVE
		float cycleNormalizedAge=normalizedAge*u_TSACycles;
		float frame=getFrameFromGradient(u_TSAGradientUVs,cycleNormalizedAge-floor(cycleNormalizedAge));
		float totalULength=frame*u_TSASubUVLength.x;
		float floorTotalULength=floor(totalULength);
	    uv.x+=totalULength-floorTotalULength;
		uv.y+=floorTotalULength*u_TSASubUVLength.y;
    #endif
	#ifdef TEXTURESHEETANIMATIONRANDOMCURVE
		float cycleNormalizedAge=normalizedAge*u_TSACycles;
		float uvNormalizedAge=cycleNormalizedAge-floor(cycleNormalizedAge);
	    float frame=floor(mix(getFrameFromGradient(u_TSAGradientUVs,uvNormalizedAge),getFrameFromGradient(u_TSAMaxGradientUVs,uvNormalizedAge),a_Random1.x));
		float totalULength=frame*u_TSASubUVLength.x;
		float floorTotalULength=floor(totalULength);
	    uv.x+=totalULength-floorTotalULength;
		uv.y+=floorTotalULength*u_TSASubUVLength.y;
    #endif
	return uv;
}

void main()
{
	float age = u_CurrentTime - a_DirectionTime.w;
	float normalizedAge = age/a_ShapePositionStartLifeTime.w;
	vec3 lifeVelocity;
	if(normalizedAge<1.0)
	{ 
		vec3 startVelocity=a_DirectionTime.xyz*a_StartSpeed;
		#if defined(VELOCITYOVERLIFETIMECONSTANT)||defined(VELOCITYOVERLIFETIMECURVE)||defined(VELOCITYOVERLIFETIMERANDOMCONSTANT)||defined(VELOCITYOVERLIFETIMERANDOMCURVE)
			lifeVelocity= computeParticleLifeVelocity(normalizedAge);//计算粒子生命周期速度
		#endif 
		vec3 gravityVelocity=u_Gravity*age;
		
		vec4 worldRotation;
		if(u_SimulationSpace==0)
			worldRotation=a_SimulationWorldRotation;
		else
			worldRotation=u_WorldRotation;
		
		vec3 center=computeParticlePosition(startVelocity, lifeVelocity, age, normalizedAge,gravityVelocity,worldRotation);//计算粒子位置
	
	
		#ifdef SPHERHBILLBOARD
			vec2 corner=a_CornerTextureCoordinate.xy;//Billboard模式z轴无效
			vec3 cameraUpVector =normalize(u_CameraUp);//TODO:是否外面归一化
			vec3 sideVector = normalize(cross(u_CameraDirection,cameraUpVector));
			vec3 upVector = normalize(cross(sideVector,u_CameraDirection));
			corner*=computeParticleSizeBillbard(a_StartSize.xy,normalizedAge);
			#if defined(ROTATIONOVERLIFETIME)||defined(ROTATIONOVERLIFETIMESEPERATE)
				if(u_ThreeDStartRotation){
					vec3 rotation=vec3(a_StartRotation0.xy,computeParticleRotationFloat(a_StartRotation0.z,age,normalizedAge));
					center += u_SizeScale.xzy*rotationByEuler(corner.x*sideVector+corner.y*upVector,rotation);
				}
				else{
					float rot = computeParticleRotationFloat(a_StartRotation0.x, age,normalizedAge);
					float c = cos(rot);
					float s = sin(rot);
					mat2 rotation= mat2(c, -s, s, c);
					corner=rotation*corner;
					center += u_SizeScale.xzy*(corner.x*sideVector+corner.y*upVector);
				}
			#else
				if(u_ThreeDStartRotation){
					center += u_SizeScale.xzy*rotationByEuler(corner.x*sideVector+corner.y*upVector,a_StartRotation0);
				}
				else{
					float c = cos(a_StartRotation0.x);
					float s = sin(a_StartRotation0.x);
					mat2 rotation= mat2(c, -s, s, c);
					corner=rotation*corner;
					center += u_SizeScale.xzy*(corner.x*sideVector+corner.y*upVector);
				}
			#endif
		#endif
	
		#ifdef STRETCHEDBILLBOARD
			vec2 corner=a_CornerTextureCoordinate.xy;//Billboard模式z轴无效
			vec3 velocity;
			#if defined(VELOCITYOVERLIFETIMECONSTANT)||defined(VELOCITYOVERLIFETIMECURVE)||defined(VELOCITYOVERLIFETIMERANDOMCONSTANT)||defined(VELOCITYOVERLIFETIMERANDOMCURVE)
				if(u_VOLSpaceType==0)
				velocity=rotationByQuaternions(u_SizeScale*(startVelocity+lifeVelocity),worldRotation)+gravityVelocity;
				else
				velocity=rotationByQuaternions(u_SizeScale*startVelocity,worldRotation)+lifeVelocity+gravityVelocity;
			#else
				velocity= rotationByQuaternions(u_SizeScale*startVelocity,worldRotation)+gravityVelocity;
			#endif	
			vec3 cameraUpVector = normalize(velocity);
			vec3 direction = normalize(center-u_CameraPos);
			vec3 sideVector = normalize(cross(direction,normalize(velocity)));
			
			sideVector=u_SizeScale.xzy*sideVector;
			cameraUpVector=length(vec3(u_SizeScale.x,0.0,0.0))*cameraUpVector;
			
			vec2 size=computeParticleSizeBillbard(a_StartSize.xy,normalizedAge);
			
			const mat2 rotaionZHalfPI=mat2(0.0, -1.0, 1.0, 0.0);
			corner=rotaionZHalfPI*corner;
			corner.y=corner.y-abs(corner.y);
			
			float speed=length(velocity);//TODO:
			center +=sign(u_SizeScale.x)*(sign(u_StretchedBillboardLengthScale)*size.x*corner.x*sideVector+(speed*u_StretchedBillboardSpeedScale+size.y*u_StretchedBillboardLengthScale)*corner.y*cameraUpVector);
		#endif
	
		#ifdef HORIZONTALBILLBOARD
			vec2 corner=a_CornerTextureCoordinate.xy;//Billboard模式z轴无效
			const vec3 cameraUpVector=vec3(0.0,0.0,1.0);
			const vec3 sideVector = vec3(-1.0,0.0,0.0);
			
			float rot = computeParticleRotationFloat(a_StartRotation0.x, age,normalizedAge);
			float c = cos(rot);
			float s = sin(rot);
			mat2 rotation= mat2(c, -s, s, c);
			corner=rotation*corner*cos(0.78539816339744830961566084581988);//TODO:临时缩小cos45,不确定U3D原因
			corner*=computeParticleSizeBillbard(a_StartSize.xy,normalizedAge);
			center +=u_SizeScale.xzy*(corner.x*sideVector+ corner.y*cameraUpVector);
		#endif
	
		#ifdef VERTICALBILLBOARD
			vec2 corner=a_CornerTextureCoordinate.xy;//Billboard模式z轴无效
			const vec3 cameraUpVector =vec3(0.0,1.0,0.0);
			vec3 sideVector = normalize(cross(u_CameraDirection,cameraUpVector));
			
			float rot = computeParticleRotationFloat(a_StartRotation0.x, age,normalizedAge);
			float c = cos(rot);
			float s = sin(rot);
			mat2 rotation= mat2(c, -s, s, c);
			corner=rotation*corner*cos(0.78539816339744830961566084581988);//TODO:临时缩小cos45,不确定U3D原因
			corner*=computeParticleSizeBillbard(a_StartSize.xy,normalizedAge);
			center +=u_SizeScale.xzy*(corner.x*sideVector+ corner.y*cameraUpVector);
		#endif
	
		#ifdef RENDERMODE_MESH
			vec3 size=computeParticleSizeMesh(a_StartSize,normalizedAge);
			#if defined(ROTATIONOVERLIFETIME)||defined(ROTATIONOVERLIFETIMESEPERATE)
				if(u_ThreeDStartRotation){
					vec3 rotation=vec3(a_StartRotation0.xy,computeParticleRotationFloat(a_StartRotation0.z, age,normalizedAge));
					center+= rotationByQuaternions(u_SizeScale*rotationByEuler(a_MeshPosition*size,rotation),worldRotation);
				}
				else{
					#ifdef ROTATIONOVERLIFETIME
						float angle=computeParticleRotationFloat(a_StartRotation0.x, age,normalizedAge);
						if(a_ShapePositionStartLifeTime.x!=0.0||a_ShapePositionStartLifeTime.y!=0.0){
							center+= (rotationByQuaternions(rotationByAxis(u_SizeScale*a_MeshPosition*size,normalize(cross(vec3(0.0,0.0,1.0),vec3(a_ShapePositionStartLifeTime.xy,0.0))),angle),worldRotation));//已验证
						}
						else{
							#ifdef SHAPE
								center+= u_SizeScale.xzy*(rotationByQuaternions(rotationByAxis(a_MeshPosition*size,vec3(0.0,-1.0,0.0),angle),worldRotation));
							#else
								if(u_SimulationSpace==0)
									center+=rotationByAxis(u_SizeScale*a_MeshPosition*size,vec3(0.0,0.0,-1.0),angle);//已验证
								else if(u_SimulationSpace==1)
									center+=rotationByQuaternions(u_SizeScale*rotationByAxis(a_MeshPosition*size,vec3(0.0,0.0,-1.0),angle),worldRotation);//已验证
							#endif
						}
					#endif
					#ifdef ROTATIONOVERLIFETIMESEPERATE
						//TODO:是否应合并if(u_ThreeDStartRotation)分支代码,待测试
						vec3 angle=computeParticleRotationVec3(vec3(0.0,0.0,-a_StartRotation0.x), age,normalizedAge);
						center+= (rotationByQuaternions(rotationByEuler(u_SizeScale*a_MeshPosition*size,vec3(angle.x,angle.y,angle.z)),worldRotation));//已验证
					#endif		
				}
			#else
				if(u_ThreeDStartRotation){
					center+= rotationByQuaternions(u_SizeScale*rotationByEuler(a_MeshPosition*size,a_StartRotation0),worldRotation);//已验证
				}
				else{
					if(a_ShapePositionStartLifeTime.x!=0.0||a_ShapePositionStartLifeTime.y!=0.0){
						if(u_SimulationSpace==0)
							center+= rotationByAxis(u_SizeScale*a_MeshPosition*size,normalize(cross(vec3(0.0,0.0,1.0),vec3(a_ShapePositionStartLifeTime.xy,0.0))),a_StartRotation0.x);
						else if(u_SimulationSpace==1)
							center+= (rotationByQuaternions(u_SizeScale*rotationByAxis(a_MeshPosition*size,normalize(cross(vec3(0.0,0.0,1.0),vec3(a_ShapePositionStartLifeTime.xy,0.0))),a_StartRotation0.x),worldRotation));//已验证
					}
					else{
						#ifdef SHAPE
							if(u_SimulationSpace==0)
								center+= u_SizeScale*rotationByAxis(a_MeshPosition*size,vec3(0.0,-1.0,0.0),a_StartRotation0.x);
							else if(u_SimulationSpace==1)
								center+= rotationByQuaternions(u_SizeScale*rotationByAxis(a_MeshPosition*size,vec3(0.0,-1.0,0.0),a_StartRotation0.x),worldRotation);	
						#else
							if(u_SimulationSpace==0)
								center+= rotationByAxis(u_SizeScale*a_MeshPosition*size,vec3(0.0,0.0,-1.0),a_StartRotation0.x);
							else if(u_SimulationSpace==1)
								center+= rotationByQuaternions(u_SizeScale*rotationByAxis(a_MeshPosition*size,vec3(0.0,0.0,-1.0),a_StartRotation0.x),worldRotation);//已验证
						#endif
					}
				}
			#endif
			v_MeshColor=a_MeshColor;
		#endif
	
		gl_Position=u_Projection*u_View*vec4(center,1.0);
		v_Color = computeParticleColor(a_StartColor, normalizedAge);
		#ifdef DIFFUSEMAP
			#if defined(SPHERHBILLBOARD)||defined(STRETCHEDBILLBOARD)||defined(HORIZONTALBILLBOARD)||defined(VERTICALBILLBOARD)
				v_TextureCoordinate =computeParticleUV(a_CornerTextureCoordinate.zw, normalizedAge);
			#endif
			#ifdef RENDERMODE_MESH
				v_TextureCoordinate =computeParticleUV(a_MeshTextureCoordinate, normalizedAge);
			#endif
			
			v_TextureCoordinate=TransformUV(v_TextureCoordinate,u_TilingOffset);
		#endif
   	}
   	else
	{
		gl_Position=vec4(2.0,2.0,2.0,1.0);//Discard use out of X(-1,1),Y(-1,1),Z(0,1)
	}
	gl_Position=remapGLPositionZ(gl_Position);
}

