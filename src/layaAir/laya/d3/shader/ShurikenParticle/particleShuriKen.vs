#define SHADER_NAME ParticleVS

#include "Camera.glsl";
#include "particleShuriKenSpriteVS.glsl";
#include "Math.glsl";
#include "MathGradient.glsl";
#include "Color.glsl";
#include "Scene.glsl"
#include "SceneFogInput.glsl"


#ifdef RENDERMODE_MESH
varying vec4 v_MeshColor;
#endif

varying vec4 v_Color;
varying vec2 v_TextureCoordinate;

//修改这里剔除没有用到的光照函数，增加粒子的编译速度
vec2 TransformUV(vec2 texcoord, vec4 tilingOffset)
{
    vec2 transTexcoord = vec2(texcoord.x, texcoord.y - 1.0) * tilingOffset.xy + vec2(tilingOffset.z, -tilingOffset.w);
    transTexcoord.y += 1.0;
    return transTexcoord;
}

#ifdef VELOCITYOVERLIFETIMERANDOMCURVE
vec3 computeParticleLifeVelocity(in float normalizedAge)
{
    vec3 outLifeVelocity;
    	outLifeVelocity = vec3(
		mix(getCurValueFromGradientFloat(u_VOLVelocityGradientX, normalizedAge),
			getCurValueFromGradientFloat(u_VOLVelocityGradientMaxX, normalizedAge),
			a_Random1.y),
		mix(getCurValueFromGradientFloat(u_VOLVelocityGradientY, normalizedAge),
			getCurValueFromGradientFloat(u_VOLVelocityGradientMaxY, normalizedAge),
			a_Random1.z),
		mix(getCurValueFromGradientFloat(u_VOLVelocityGradientZ, normalizedAge),
			getCurValueFromGradientFloat(u_VOLVelocityGradientMaxZ, normalizedAge),
			a_Random1.w));

    return outLifeVelocity;
}
#endif

// drag
vec3 getStartPosition(vec3 startVelocity, float age, vec3 dragData)
{
    vec3 startPosition;
    float lasttime = min(startVelocity.x / dragData.x, age);
    startPosition = lasttime * (startVelocity - 0.5 * dragData * lasttime);
    return startPosition;
}

vec3 computeParticlePosition(in vec3 startVelocity, in vec3 lifeVelocity, in float age, in float normalizedAge, vec3 gravityVelocity, vec4 worldRotation, vec3 dragData)
{
    vec3 startPosition = getStartPosition(startVelocity, age, dragData);
    vec3 lifePosition;
#ifdef VELOCITYOVERLIFETIMERANDOMCURVE
   
    #ifdef VELOCITYOVERLIFETIMERANDOMCURVE
		lifePosition = vec3(
		mix(
			getTotalValueFromGradientFloat(u_VOLVelocityGradientX, normalizedAge),
			getTotalValueFromGradientFloat(u_VOLVelocityGradientMaxX, normalizedAge),
			a_Random1.y),
		mix(
			getTotalValueFromGradientFloat(u_VOLVelocityGradientY, normalizedAge),
			getTotalValueFromGradientFloat(u_VOLVelocityGradientMaxY, normalizedAge),
			a_Random1.z),
		mix(
			getTotalValueFromGradientFloat(u_VOLVelocityGradientZ, normalizedAge),
			getTotalValueFromGradientFloat(u_VOLVelocityGradientMaxZ, normalizedAge),
			a_Random1.w));
    #endif

    vec3 finalPosition;
    if (u_VOLSpaceType == 0)
	{
	    if (u_ScalingMode != 2)
		finalPosition = rotationByQuaternions(
		    u_PositionScale * (a_ShapePositionStartLifeTime.xyz + startPosition + lifePosition),
		    worldRotation);
	    else
		finalPosition = rotationByQuaternions(
		    u_PositionScale * a_ShapePositionStartLifeTime.xyz + startPosition + lifePosition,
		    worldRotation);
	}
    else
	{
	    if (u_ScalingMode != 2)
		finalPosition = rotationByQuaternions(
				    u_PositionScale * (a_ShapePositionStartLifeTime.xyz + startPosition),
				    worldRotation)
		    + lifePosition;
	    else
		finalPosition = rotationByQuaternions(
				    u_PositionScale * a_ShapePositionStartLifeTime.xyz + startPosition,
				    worldRotation)
		    + lifePosition;
	}
#else
    // startPosition = startVelocity * age;
    vec3 finalPosition;
    if (u_ScalingMode != 2)
	finalPosition = rotationByQuaternions(
	    u_PositionScale * (a_ShapePositionStartLifeTime.xyz + startPosition),
	    worldRotation);
    else
	finalPosition = rotationByQuaternions(
	    u_PositionScale * a_ShapePositionStartLifeTime.xyz + startPosition,
	    worldRotation);
#endif

    if (u_SimulationSpace == 0)
	finalPosition = finalPosition + a_SimulationWorldPostion;
    else if (u_SimulationSpace == 1)
	finalPosition = finalPosition + u_WorldPosition;

    finalPosition += 0.5 * gravityVelocity * age;

    return finalPosition;
}

vec4 computeParticleColor(in vec4 color, in float normalizedAge)
{
#ifdef RANDOMCOLOROVERLIFETIME
    color *= mix(getColorFromGradient(u_ColorOverLifeGradientAlphas,
		     u_ColorOverLifeGradientColors,
		     normalizedAge, u_ColorOverLifeGradientRanges),
	getColorFromGradient(u_MaxColorOverLifeGradientAlphas,
	    u_MaxColorOverLifeGradientColors,
	    normalizedAge, u_MaxColorOverLifeGradientRanges),
	a_Random0.y);
#endif
    return color;
}

vec2 computeParticleSizeBillbard(in vec2 size, in float normalizedAge)
{

#ifdef SIZEOVERLIFETIMERANDOMCURVES
    size *= mix(getCurValueFromGradientFloat(u_SOLSizeGradient, normalizedAge),
	getCurValueFromGradientFloat(u_SOLSizeGradientMax, normalizedAge),
	a_Random0.z);
#endif

#ifdef SIZEOVERLIFETIMERANDOMCURVESSEPERATE
    size *= vec2(mix(getCurValueFromGradientFloat(u_SOLSizeGradientX, normalizedAge),
		     getCurValueFromGradientFloat(u_SOLSizeGradientMaxX, normalizedAge),
		     a_Random0.z),
	mix(getCurValueFromGradientFloat(u_SOLSizeGradientY, normalizedAge),
	    getCurValueFromGradientFloat(u_SOLSizeGradientMaxY, normalizedAge),
	    a_Random0.z));
#endif

    return size;
}

#ifdef RENDERMODE_MESH
vec3 computeParticleSizeMesh(in vec3 size, in float normalizedAge)
{

    #ifdef SIZEOVERLIFETIMERANDOMCURVES
    	size *= mix(getCurValueFromGradientFloat(u_SOLSizeGradient, normalizedAge),
					getCurValueFromGradientFloat(u_SOLSizeGradientMax, normalizedAge),
					a_Random0.z);
    #endif

    #ifdef SIZEOVERLIFETIMERANDOMCURVESSEPERATE
    	size *= vec3(mix(getCurValueFromGradientFloat(u_SOLSizeGradientX, normalizedAge),
			     getCurValueFromGradientFloat(u_SOLSizeGradientMaxX, normalizedAge),
		    	 a_Random0.z),
				mix(getCurValueFromGradientFloat(u_SOLSizeGradientY, normalizedAge),
					getCurValueFromGradientFloat(u_SOLSizeGradientMaxY, normalizedAge),
					a_Random0.z),
				mix(getCurValueFromGradientFloat(u_SOLSizeGradientZ, normalizedAge),
					getCurValueFromGradientFloat(u_SOLSizeGradientMaxZ, normalizedAge),
					a_Random0.z));
    #endif
	
    return size;
}
#endif

float computeParticleRotationFloat(in float rotation,
    in float age,
    in float normalizedAge)
{
	#ifdef ROTATIONOVERLIFETIME
		rotation += mix(
			getTotalValueFromGradientFloat(u_ROLAngularVelocityGradient, normalizedAge),
			getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientMax,normalizedAge),
			a_Random0.w);
	#endif

	#ifdef ROTATIONOVERLIFETIMESEPERATE
		rotation += mix(getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientZ,
				normalizedAge),
		getTotalValueFromGradientFloat(
			u_ROLAngularVelocityGradientMaxZ, normalizedAge),
		a_Random0.w);
	#endif
    return rotation;
}

#if defined(RENDERMODE_MESH) && (defined(ROTATIONOVERLIFETIME) || defined(ROTATIONOVERLIFETIMESEPERATE))
vec3 computeParticleRotationVec3(in vec3 rotation,
    in float age,
    in float normalizedAge)
{
    #ifdef ROTATIONOVERLIFETIME
			rotation += mix(
			getTotalValueFromGradientFloat(u_ROLAngularVelocityGradient, normalizedAge),
			getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientMax,
				normalizedAge),
			a_Random0.w);
    #endif
    
	#ifdef ROTATIONOVERLIFETIMESEPERATE
		rotation += vec3(mix(getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientX,
					normalizedAge),
				getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientMaxX,
					normalizedAge),
				a_Random0.w),
		mix(getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientY,
			normalizedAge),
			getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientMaxY,
			normalizedAge),
			a_Random0.w),
		mix(getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientZ,
			normalizedAge),
			getTotalValueFromGradientFloat(u_ROLAngularVelocityGradientMaxZ,
			normalizedAge),
			a_Random0.w));
    #endif
    return rotation;
}
#endif

vec2 computeParticleUV(in vec2 uv, in float normalizedAge)
{

#ifdef TEXTURESHEETANIMATIONRANDOMCURVE
    float cycleNormalizedAge = normalizedAge * u_TSACycles;
    float uvNormalizedAge = cycleNormalizedAge - floor(cycleNormalizedAge);
    float frame = floor(mix(getFrameFromGradient(u_TSAGradientUVs, uvNormalizedAge),
	getFrameFromGradient(u_TSAMaxGradientUVs, uvNormalizedAge),
	a_Random1.x));
    float totalULength = frame * u_TSASubUVLength.x;
    float floorTotalULength = floor(totalULength);
    uv.x += totalULength - floorTotalULength;
    uv.y += floorTotalULength * u_TSASubUVLength.y;
#endif
    return uv;
}

void main()
{
    float age = u_CurrentTime - a_DirectionTime.w;
    float normalizedAge = age / a_ShapePositionStartLifeTime.w;
    vec3 lifeVelocity;
    if (normalizedAge < 1.0)
	{
	    vec3 startVelocity = a_DirectionTime.xyz * a_StartSpeed;
	
		#ifdef VELOCITYOVERLIFETIMERANDOMCURVE
				lifeVelocity = computeParticleLifeVelocity(normalizedAge); //计算粒子生命周期速度
		#endif
	
	    vec3 gravityVelocity = u_Gravity * age;

	    vec4 worldRotation;
	    
		if (u_SimulationSpace == 0)
			worldRotation = a_SimulationWorldRotation;
	    else
			worldRotation = u_WorldRotation;

	    // drag
	    vec3 dragData = a_DirectionTime.xyz * mix(u_DragConstanct.x, u_DragConstanct.y, a_Random0.x);
		//miner 计算顶点位置
	    vec3 center = computeParticlePosition(startVelocity, lifeVelocity, age, normalizedAge, gravityVelocity, worldRotation, dragData); //计算粒子位置

#ifdef SPHERHBILLBOARD
	    vec2 corner = a_CornerTextureCoordinate.xy; // Billboard模式z轴无效
	    vec3 cameraUpVector = normalize(u_CameraUp); // TODO:是否外面归一化
	    vec3 sideVector = normalize(cross(u_CameraDirection, cameraUpVector));
	    vec3 upVector = normalize(cross(sideVector, u_CameraDirection));
	    corner *= computeParticleSizeBillbard(a_StartSize.xy, normalizedAge);
    #if defined(ROTATIONOVERLIFETIME) || defined(ROTATIONOVERLIFETIMESEPERATE)
	    if (u_ThreeDStartRotation)
		{
		    vec3 rotation = vec3(
			a_StartRotation0.xy,
			computeParticleRotationFloat(a_StartRotation0.z, age, normalizedAge));
		    center += u_SizeScale.xzy * rotationByEuler(corner.x * sideVector + corner.y * upVector, rotation);
		}
	    else
		{
		    float rot = computeParticleRotationFloat(a_StartRotation0.x, age, normalizedAge);
		    float c = cos(rot);
		    float s = sin(rot);
		    mat2 rotation = mat2(c, -s, s, c);
		    corner = rotation * corner;
		    center += u_SizeScale.xzy * (corner.x * sideVector + corner.y * upVector);
		}
    #else
	    if (u_ThreeDStartRotation)
		{
		    center += u_SizeScale.xzy * rotationByEuler(corner.x * sideVector + corner.y * upVector, a_StartRotation0);
		}
	    else
		{
		    float c = cos(a_StartRotation0.x);
		    float s = sin(a_StartRotation0.x);
		    mat2 rotation = mat2(c, -s, s, c);
		    corner = rotation * corner;
		    center += u_SizeScale.xzy * (corner.x * sideVector + corner.y * upVector);
		}
    #endif
#endif

#ifdef STRETCHEDBILLBOARD
	    vec2 corner = a_CornerTextureCoordinate.xy; // Billboard模式z轴无效
	    vec3 velocity;
    #ifdef VELOCITYOVERLIFETIMERANDOMCURVE
	    if (u_VOLSpaceType == 0)
		velocity = rotationByQuaternions(u_SizeScale * (startVelocity + lifeVelocity),
			       worldRotation)
		    + gravityVelocity;
	    else
		velocity = rotationByQuaternions(u_SizeScale * startVelocity, worldRotation) + lifeVelocity + gravityVelocity;
    #else
	    velocity = rotationByQuaternions(u_SizeScale * startVelocity, worldRotation) + gravityVelocity;
    #endif

	    vec3 cameraUpVector = normalize(velocity);
	    vec3 direction = normalize(center - u_CameraPos);
	    vec3 sideVector = normalize(cross(direction, normalize(velocity)));

	    sideVector = u_SizeScale.xzy * sideVector;
	    cameraUpVector = length(vec3(u_SizeScale.x, 0.0, 0.0)) * cameraUpVector;

	    vec2 size = computeParticleSizeBillbard(a_StartSize.xy, normalizedAge);

	    const mat2 rotaionZHalfPI = mat2(0.0, -1.0, 1.0, 0.0);
	    corner = rotaionZHalfPI * corner;
	    corner.y = corner.y - abs(corner.y);

	    float speed = length(velocity); // TODO:
	    center += sign(u_SizeScale.x) * (sign(u_StretchedBillboardLengthScale) * size.x * corner.x * sideVector + (speed * u_StretchedBillboardSpeedScale + size.y * u_StretchedBillboardLengthScale) * corner.y * cameraUpVector);
#endif

#ifdef HORIZONTALBILLBOARD
	    vec2 corner = a_CornerTextureCoordinate.xy; // Billboard模式z轴无效
	    const vec3 cameraUpVector = vec3(0.0, 0.0, 1.0);
	    const vec3 sideVector = vec3(-1.0, 0.0, 0.0);

	    float rot = computeParticleRotationFloat(a_StartRotation0.x, age, normalizedAge);
	    float c = cos(rot);
	    float s = sin(rot);
	    mat2 rotation = mat2(c, -s, s, c);
	    corner = rotation * corner * cos(0.78539816339744830961566084581988); // TODO:临时缩小cos45,不确定U3D原因
	    corner *= computeParticleSizeBillbard(a_StartSize.xy, normalizedAge);
	    center += u_SizeScale.xzy * (corner.x * sideVector + corner.y * cameraUpVector);
#endif

#ifdef VERTICALBILLBOARD
	    vec2 corner = a_CornerTextureCoordinate.xy; // Billboard模式z轴无效
	    const vec3 cameraUpVector = vec3(0.0, 1.0, 0.0);
	    vec3 sideVector = normalize(cross(u_CameraDirection, cameraUpVector));

	    float rot = computeParticleRotationFloat(a_StartRotation0.x, age, normalizedAge);
	    float c = cos(rot);
	    float s = sin(rot);
	    mat2 rotation = mat2(c, -s, s, c);
	    corner = rotation * corner * cos(0.78539816339744830961566084581988); // TODO:临时缩小cos45,不确定U3D原因
	    corner *= computeParticleSizeBillbard(a_StartSize.xy, normalizedAge);
	    center += u_SizeScale.xzy * (corner.x * sideVector + corner.y * cameraUpVector);
#endif

#ifdef RENDERMODE_MESH
	    vec3 size = computeParticleSizeMesh(a_StartSize, normalizedAge);
		#if defined(ROTATIONOVERLIFETIME) || defined(ROTATIONOVERLIFETIMESEPERATE)
			if (u_ThreeDStartRotation)
			{
				vec3 rotation = vec3(
				a_StartRotation0.xy,
				computeParticleRotationFloat(a_StartRotation0.z, age, normalizedAge));
				center += rotationByQuaternions(
				u_SizeScale * rotationByEuler(a_MeshPosition * size, rotation),
				worldRotation);
			}
			else
			{
				#ifdef ROTATIONOVERLIFETIME
						float angle = computeParticleRotationFloat(a_StartRotation0.x, age, normalizedAge);
						if (a_ShapePositionStartLifeTime.x != 0.0 || a_ShapePositionStartLifeTime.y != 0.0)
						{
							center += (rotationByQuaternions(
							rotationByAxis(
								u_SizeScale * a_MeshPosition * size,
								normalize(cross(vec3(0.0, 0.0, 1.0),
								vec3(a_ShapePositionStartLifeTime.xy, 0.0))),
								angle),
							worldRotation)); //已验证
						}
						else
						{
							 if (u_SimulationSpace == 0){
								center += rotationByAxis(u_SizeScale * a_MeshPosition * size,vec3(0.0, 0.0, -1.0),angle); //已验证
							}
			
							else if (u_SimulationSpace == 1){
								center += rotationByQuaternions(
										u_SizeScale * rotationByAxis(a_MeshPosition * size, vec3(0.0, 0.0, -1.0), angle),
										worldRotation); //已验证
							}
						}
							
				#endif
				#ifdef ROTATIONOVERLIFETIMESEPERATE
						// TODO:是否应合并if(u_ThreeDStartRotation)分支代码,待测试
						vec3 angle = computeParticleRotationVec3(
						vec3(0.0, 0.0, -a_StartRotation0.x), age, normalizedAge);
						center += (rotationByQuaternions(
						rotationByEuler(u_SizeScale * a_MeshPosition * size,
							vec3(angle.x, angle.y, angle.z)),
						worldRotation)); //已验证
				#endif
		}
    #else
	    if (u_ThreeDStartRotation)
		{
		    center += rotationByQuaternions(
			u_SizeScale * rotationByEuler(a_MeshPosition * size, a_StartRotation0),
			worldRotation); //已验证
		}
	    else
		{
		    if (a_ShapePositionStartLifeTime.x != 0.0 || a_ShapePositionStartLifeTime.y != 0.0)
			{
			    if (u_SimulationSpace == 0)
					center += rotationByAxis(
						u_SizeScale * a_MeshPosition * size,
						normalize(cross(vec3(0.0, 0.0, 1.0),
						vec3(a_ShapePositionStartLifeTime.xy, 0.0))),
						a_StartRotation0.x);
			    else if (u_SimulationSpace == 1)
					center += (rotationByQuaternions(
						u_SizeScale * rotationByAxis(a_MeshPosition * size, normalize(cross(vec3(0.0, 0.0, 1.0), vec3(a_ShapePositionStartLifeTime.xy, 0.0))), a_StartRotation0.x),
						worldRotation)); //已验证
			}
		    else
			{
				 if (u_SimulationSpace == 0)
				center += rotationByAxis(u_SizeScale * a_MeshPosition * size,
				    vec3(0.0, 0.0, -1.0),
				    a_StartRotation0.x);
			    else if (u_SimulationSpace == 1)
				center += rotationByQuaternions(
				    u_SizeScale * rotationByAxis(a_MeshPosition * size, vec3(0.0, 0.0, -1.0), a_StartRotation0.x),
				    worldRotation); //已验证
			}
		}
    #endif
	    v_MeshColor = a_MeshColor;
#endif
	    gl_Position = u_Projection * u_View * vec4(center, 1.0);
		vec4 startcolor = gammaToLinear(a_StartColor);
	    v_Color = computeParticleColor(startcolor, normalizedAge);
#ifdef DIFFUSEMAP
	    vec2 simulateUV;
    #if defined(SPHERHBILLBOARD) || defined(STRETCHEDBILLBOARD) || defined(HORIZONTALBILLBOARD) || defined(VERTICALBILLBOARD)
	    simulateUV = a_SimulationUV.xy + a_CornerTextureCoordinate.zw * a_SimulationUV.zw;
	    v_TextureCoordinate = computeParticleUV(simulateUV, normalizedAge);
    #endif
	
    #ifdef RENDERMODE_MESH
	    simulateUV = a_SimulationUV.xy + a_MeshTextureCoordinate * a_SimulationUV.zw;
	    v_TextureCoordinate = computeParticleUV(simulateUV, normalizedAge);
    #endif
	    v_TextureCoordinate = TransformUV(v_TextureCoordinate, u_TilingOffset);
#endif
	}
    else
	{
	    gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // Discard use out of X(-1,1),Y(-1,1),Z(0,1)
	}
    gl_Position = remapPositionZ(gl_Position);
	#ifdef FOG
        FogHandle(gl_Position.z);
    #endif
}
