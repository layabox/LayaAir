#ifndef GRAPHICS_API_GLES3
	#define NO_NATIVE_SHADOWMAP
#endif

#ifdef NO_NATIVE_SHADOWMAP
	uniform mediump sampler2D u_shadowMap1;
	uniform mediump sampler2D u_shadowMap2;
	uniform mediump sampler2D u_shadowMap3;
#else
	uniform mediump sampler2DShadow u_shadowMap1;
	uniform mediump sampler2DShadow u_shadowMap2;
	uniform mediump sampler2DShadow u_shadowMap3;
#endif

uniform vec2 u_shadowPCFoffset;
uniform vec4 u_shadowPSSMDistance;
uniform vec4 u_ShadowBias; // x: depth bias, y: normal bias

vec4 packDepth(const in float depth)
{
	const vec4 bitShift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);
	const vec4 bitMask	= vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);
	vec4 res = mod(depth*bitShift*vec4(255), vec4(256))/vec4(255);
	res -= res.xxyz * bitMask;
	return res;
}
float unpackDepth(const in vec4 rgbaDepth)
{
	const vec4 bitShift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);
	float depth = dot(rgbaDepth, bitShift);
	return depth;
}
float tex2DPCF( sampler2D shadowMap,vec2 texcoord,vec2 invsize,float zRef )
{
	vec2 texelpos =texcoord / invsize;
	vec2 lerps = fract( texelpos );
	float sourcevals[4];
	sourcevals[0] = float( texture2D(shadowMap,texcoord).r > zRef );
	sourcevals[1] = float( texture2D(shadowMap,texcoord + vec2(invsize.x,0)).r > zRef );
	sourcevals[2] = float( texture2D(shadowMap,texcoord + vec2(0,invsize.y)).r > zRef );
	sourcevals[3] = float( texture2D(shadowMap,texcoord + vec2(invsize.x, invsize.y)).r > zRef );
	return mix( mix(sourcevals[0],sourcevals[2],lerps.y),mix(sourcevals[1],sourcevals[3],lerps.y),lerps.x );
}
float getShadowPSSM3( sampler2D shadowMap1,sampler2D shadowMap2,sampler2D shadowMap3,mat4 lightShadowVP[4],vec4 pssmDistance,vec2 shadowPCFOffset,vec3 worldPos,float posViewZ)
{
	float value = 1.0;
	int nPSNum = int(posViewZ>pssmDistance.x);
	nPSNum += int(posViewZ>pssmDistance.y);
	nPSNum += int(posViewZ>pssmDistance.z);
	//真SB,webgl不支持在PS中直接访问数组
	mat4 lightVP;
	if( nPSNum == 0 )
	{
		lightVP = lightShadowVP[1];
	}
	else if( nPSNum == 1 )
	{
		lightVP = lightShadowVP[2];
	}
	else if( nPSNum == 2 )
	{
		lightVP = lightShadowVP[3];
	}
	vec4 vLightMVPPos = lightVP * vec4(worldPos,1.0);
	//为了效率，在CPU计算/2.0 + 0.5
	//vec3 vText = (vLightMVPPos.xyz / vLightMVPPos.w)/2.0 + 0.5;
	vec3 vText = vLightMVPPos.xyz / vLightMVPPos.w;
	float fMyZ = vText.z;
	/*
	bvec4 bInFrustumVec = bvec4 ( vText.x >= 0.0, vText.x <= 1.0, vText.y >= 0.0, vText.y <= 1.0 );
	bool bInFrustum = all( bInFrustumVec );
	bvec2 bFrustumTestVec = bvec2( bInFrustum, fMyZ <= 1.0 );
	bool bFrustumTest = all( bFrustumTestVec );
	if ( bFrustumTest ) 
	*/
	if( fMyZ <= 1.0 )
	{
		float zdepth=0.0;
#ifdef SHADOWMAP_PCF3
		if ( nPSNum == 0 )
		{
			value =  tex2DPCF( shadowMap1, vText.xy,shadowPCFOffset,fMyZ );
			value += tex2DPCF( shadowMap1, vText.xy+vec2(shadowPCFOffset.xy),shadowPCFOffset,	fMyZ );
			value += tex2DPCF( shadowMap1, vText.xy+vec2(shadowPCFOffset.x,0),shadowPCFOffset,	fMyZ );
			value += tex2DPCF( shadowMap1, vText.xy+vec2(0,shadowPCFOffset.y),shadowPCFOffset,	fMyZ );
			value = value/4.0;
		} 
		else if( nPSNum == 1 )
		{
			value = tex2DPCF( shadowMap2,vText.xy,shadowPCFOffset,fMyZ);
		}
		else if( nPSNum == 2 )
		{
			vec4 color = texture2D( shadowMap3,vText.xy );
			zdepth = color.r;
			value = float(fMyZ < zdepth);
		}
#endif
#ifdef SHADOWMAP_PCF2
		if ( nPSNum == 0 )
		{
			value = tex2DPCF( shadowMap1,vText.xy,shadowPCFOffset,fMyZ);
		}
		else if( nPSNum == 1 )
		{
			value = tex2DPCF( shadowMap2,vText.xy,shadowPCFOffset,fMyZ);
		}
		else if( nPSNum == 2 )
		{
			vec4 color = texture2D( shadowMap3,vText.xy );
			zdepth = color.r;
			value = float(fMyZ < zdepth);
		}

#endif
#ifdef SHADOWMAP_PCF1
		if ( nPSNum == 0 )
		{
			value = tex2DPCF( shadowMap1,vText.xy,shadowPCFOffset,fMyZ);
		}
		else if( nPSNum == 1 )
		{
			vec4 color = texture2D( shadowMap2,vText.xy );
			zdepth = color.r;
			value = float(fMyZ < zdepth);
		}
		else if( nPSNum == 2 )
		{
			vec4 color = texture2D( shadowMap3,vText.xy );
			zdepth = color.r;
			value = float(fMyZ < zdepth);
		}
#endif
#ifdef SHADOWMAP_PCF_NO
		vec4 color;
		if ( nPSNum == 0 )
		{
			color = texture2D( shadowMap1,vText.xy );
		}
		else if( nPSNum == 1 )
		{
			color = texture2D( shadowMap2,vText.xy );
		}
		else if( nPSNum == 2 )
		{
			color = texture2D( shadowMap3,vText.xy );
		}
		zdepth = color.r;
		value = float(fMyZ < zdepth);
#endif
	}
	return value;
}
float getShadowPSSM2( sampler2D shadowMap1,sampler2D shadowMap2,mat4 lightShadowVP[4],vec4 pssmDistance,vec2 shadowPCFOffset,vec3 worldPos,float posViewZ )
{
	float value = 1.0;
	int nPSNum = int(posViewZ>pssmDistance.x);
	nPSNum += int(posViewZ>pssmDistance.y);
	//真SB,webgl不支持在PS中直接访问数组
	mat4 lightVP;
	if( nPSNum == 0 )
	{
		lightVP = lightShadowVP[1];
	}
	else if( nPSNum == 1 )
	{
		lightVP = lightShadowVP[2];
	}
	vec4 vLightMVPPos = lightVP * vec4(worldPos,1.0);
	//为了效率，在CPU计算/2.0 + 0.5
	//vec3 vText = (vLightMVPPos.xyz / vLightMVPPos.w)/2.0 + 0.5;
	vec3 vText = vLightMVPPos.xyz / vLightMVPPos.w;
	float fMyZ = vText.z;
	/*
	bvec4 bInFrustumVec = bvec4 ( vText.x >= 0.0, vText.x <= 1.0, vText.y >= 0.0, vText.y <= 1.0 );
	bool bInFrustum = all( bInFrustumVec );
	bvec2 bFrustumTestVec = bvec2( bInFrustum, fMyZ <= 1.0 );
	bool bFrustumTest = all( bFrustumTestVec );
	if ( bFrustumTest ) 
	*/
	if( fMyZ <= 1.0 )
	{
		float zdepth=0.0;
#ifdef SHADOWMAP_PCF3
		if ( nPSNum == 0 )
		{
			value =  tex2DPCF( shadowMap1, vText.xy,shadowPCFOffset,fMyZ );
			value += tex2DPCF( shadowMap1, vText.xy+vec2(shadowPCFOffset.xy),shadowPCFOffset,	fMyZ );
			value += tex2DPCF( shadowMap1, vText.xy+vec2(shadowPCFOffset.x,0),shadowPCFOffset,	fMyZ );
			value += tex2DPCF( shadowMap1, vText.xy+vec2(0,shadowPCFOffset.y),shadowPCFOffset,	fMyZ );
			value = value/4.0;
		}
		else if( nPSNum == 1 )
		{
			value = tex2DPCF( shadowMap2,vText.xy,shadowPCFOffset,fMyZ);
		}
#endif
#ifdef SHADOWMAP_PCF2
		if ( nPSNum == 0 )
		{
			value = tex2DPCF( shadowMap1,vText.xy,shadowPCFOffset,fMyZ);
		}
		else if( nPSNum == 1 )
		{
			value = tex2DPCF( shadowMap2,vText.xy,shadowPCFOffset,fMyZ);
		}
#endif
#ifdef SHADOWMAP_PCF1
		if ( nPSNum == 0 )
		{
			value = tex2DPCF( shadowMap1,vText.xy,shadowPCFOffset,fMyZ);
		}
		else if( nPSNum == 1 )
		{
			vec4 color = texture2D( shadowMap2,vText.xy );
			zdepth = color.r;
			value = float(fMyZ < zdepth);
		}
#endif
#ifdef SHADOWMAP_PCF_NO
		vec4 color;
		if ( nPSNum == 0 )
		{
			color = texture2D( shadowMap1,vText.xy );
		}
		else if( nPSNum == 1 )
		{
			color = texture2D( shadowMap2,vText.xy );
		}
		zdepth = color.r;
		value = float(fMyZ < zdepth);
#endif
	}
	return value;
}
float getShadowPSSM1(vec4 lightMVPPos,vec4 pssmDistance,vec2 shadowPCFOffset,float posViewZ)
{
	float value = 1.0;
	if( posViewZ < pssmDistance.x )
	{
		vec3 vText = lightMVPPos.xyz / lightMVPPos.w;
		float fMyZ = vText.z;
		/*
		bvec4 bInFrustumVec = bvec4 ( vText.x >= 0.0, vText.x <= 1.0, vText.y >= 0.0, vText.y <= 1.0 );
		bool bInFrustum = all( bInFrustumVec );
		bvec2 bFrustumTestVec = bvec2( bInFrustum, fMyZ <= 1.0 );
		bool bFrustumTest = all( bFrustumTestVec );
		*/
		if ( fMyZ <= 1.0 ) 
		{
			float zdepth=0.0;
#ifdef SHADOWMAP_PCF3
			value =  tex2DPCF( u_shadowMap1, vText.xy,shadowPCFOffset,fMyZ );
			value += tex2DPCF( u_shadowMap1, vText.xy+vec2(shadowPCFOffset.xy),shadowPCFOffset,fMyZ );
			value += tex2DPCF( u_shadowMap1, vText.xy+vec2(shadowPCFOffset.x,0),shadowPCFOffset,fMyZ );
			value += tex2DPCF( u_shadowMap1, vText.xy+vec2(0,shadowPCFOffset.y),shadowPCFOffset,fMyZ );
			value = value/4.0;
#endif
#ifdef SHADOWMAP_PCF2		
			value = tex2DPCF( u_shadowMap1,vText.xy,shadowPCFOffset,fMyZ);
#endif
#ifdef SHADOWMAP_PCF1
			value = tex2DPCF( u_shadowMap1,vText.xy,shadowPCFOffset,fMyZ);
#endif
#ifdef SHADOWMAP_PCF_NO
	#ifdef	NO_NATIVE_SHADOWMAP	
		vec4 color = texture2D(u_shadowMap1,vText.xy );
		zdepth = color.r;
		value = float(fMyZ < zdepth);
	#else
		lowp float shadow = texture2D(u_shadowMap1,vText);
		value = shadow;
	#endif
#endif
		}
	}
	return value;
}

vec3 applyShadowBias(vec3 positionWS, vec3 normalWS, vec3 lightDirection)
{
    float invNdotL = 1.0 - clamp(dot(lightDirection, normalWS),0.0,1.0);
    float scale = invNdotL * u_ShadowBias.y;

    // normal bias is negative since we want to apply an inset normal offset
    positionWS += lightDirection * vec3(u_ShadowBias);
    positionWS += normalWS * vec3(scale);
    return positionWS;
}