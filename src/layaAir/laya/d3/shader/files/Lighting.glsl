#ifdef GRAPHICS_API_GLES3
	#define INVERSE_MAT(mat) inverse(mat)
#else
	#define INVERSE_MAT(mat) inverseMat(mat)
#endif

struct DirectionLight {
	vec3 color;
	vec3 direction;
};

struct PointLight {
	vec3 color;
	vec3 position;
	float range;
};

struct SpotLight {
	vec3 color;
	vec3 position;
	float range;
	vec3 direction;
	float spot;
};

struct LayaGI{
	vec3 diffuse;
	vec3 specular;
};

struct LayaLight{
	vec3 color;
	vec3 dir;
};

const int c_ClusterBufferWidth = CLUSTER_X_COUNT*CLUSTER_Y_COUNT;
const int c_ClusterBufferHeight = CLUSTER_Z_COUNT*(1+int(ceil(float(MAX_LIGHT_COUNT_PER_CLUSTER)/4.0)));
const int c_ClusterBufferFloatWidth = c_ClusterBufferWidth*4;

#ifndef GRAPHICS_API_GLES3
	mat3 inverseMat(mat3 m) {
		float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];
		float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];
		float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];

		float b01 = a22 * a11 - a12 * a21;
		float b11 = -a22 * a10 + a12 * a20;
		float b21 = a21 * a10 - a11 * a20;

		float det = a00 * b01 + a01 * b11 + a02 * b21;

		return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),
					b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),
					b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;
	}
#endif

	#ifdef THICKNESSMAP
		uniform sampler2D u_ThinknessTexture;
	#endif
#ifdef ENABLETRANSMISSION
	uniform float u_TransmissionRate;
	uniform float u_BackDiffuse;
	uniform float u_BackScale;
	uniform vec4 u_TransmissionColor;


	vec3 SubSurfaceIBack(vec3 lightDir,vec3 viewDir,float thinknessFactor){
		vec3 H = normalize(lightDir);
		float VdotH = pow(clamp(dot(viewDir,H),0.0,1.0),u_BackDiffuse)*u_BackScale;
		vec3 I;
		#ifdef THICKNESSMAP
			I = u_TransmissionColor.rgb*VdotH*thinknessFactor;
		#else
			I = u_TransmissionColor.rgb*VdotH;
		#endif
		return I;
	}
#endif

ivec4 getClusterInfo(sampler2D clusterBuffer,mat4 viewMatrix,vec4 viewport,vec3 position,vec4 fragCoord,vec4 projectParams)
{
	vec3 viewPos = vec3(viewMatrix*vec4(position, 1.0)); //position in viewspace

	int clusterXIndex = int(floor(fragCoord.x/ (float(viewport.z)/float(CLUSTER_X_COUNT))));
    int clusterYIndex = int(floor((viewport.w * (projectParams.z <0.0? 0.0 : 1.0) - fragCoord.y * projectParams.z)/ (float(viewport.w)/float(CLUSTER_Y_COUNT))));//Maybe Flipped ProjectMatrix
	float zSliceParam =float(CLUSTER_Z_COUNT)/log2(projectParams.y / projectParams.x);
 	int clusterZIndex = int(floor(log2(-viewPos.z) * zSliceParam- log2(projectParams.x) * zSliceParam));//projectParams x:cameraNear y:cameraFar

	vec2 uv= vec2((float(clusterXIndex + clusterYIndex * CLUSTER_X_COUNT)+0.5)/float(c_ClusterBufferWidth),
				(float(clusterZIndex)+0.5)/float(c_ClusterBufferHeight));
	vec4 clusterPixel=texture2D(clusterBuffer, uv);
	return ivec4(clusterPixel);//X:Point Count Y:Spot Count Z、W:Light Offset
}


int getLightIndex(sampler2D clusterBuffer,int offset,int index) 
{
	int totalOffset=offset+index;
	int row=totalOffset/c_ClusterBufferFloatWidth;
	int lastRowFloat=totalOffset-row*c_ClusterBufferFloatWidth;
	int col=lastRowFloat/4;
	vec2 uv=vec2((float(col)+0.5)/float(c_ClusterBufferWidth),
				(float(row)+0.5)/float(c_ClusterBufferHeight));
	vec4 texel = texture2D(clusterBuffer, uv);
    int pixelComponent = lastRowFloat-col*4;
    if (pixelComponent == 0) 
      return int(texel.x);
    else if (pixelComponent == 1) 
      return int(texel.y);
    else if (pixelComponent == 2) 
      return int(texel.z);
    else //pixelComponent==3
      return int(texel.w);
}

DirectionLight getDirectionLight(sampler2D lightBuffer,int index) 
{
    DirectionLight light;
    float v = (float(index)+0.5)/ float(MAX_LIGHT_COUNT);
    vec4 p1 = texture2D(lightBuffer, vec2(0.125,v));
    vec4 p2 = texture2D(lightBuffer, vec2(0.375,v));
	light.color=p1.rgb;
    light.direction = p2.rgb;
    return light;
}

PointLight getPointLight(sampler2D lightBuffer,sampler2D clusterBuffer,ivec4 clusterInfo,int index) 
{
    PointLight light;
	int pointIndex=getLightIndex(clusterBuffer,clusterInfo.z*c_ClusterBufferFloatWidth+clusterInfo.w,index);
    float v = (float(pointIndex)+0.5)/ float(MAX_LIGHT_COUNT);
    vec4 p1 = texture2D(lightBuffer, vec2(0.125,v));
    vec4 p2 = texture2D(lightBuffer, vec2(0.375,v));
	light.color=p1.rgb;
	light.range = p1.a;
    light.position = p2.rgb;
    return light;
}

SpotLight getSpotLight(sampler2D lightBuffer,sampler2D clusterBuffer,ivec4 clusterInfo,int index) 
{
    SpotLight light;
	int spoIndex=getLightIndex(clusterBuffer,clusterInfo.z*c_ClusterBufferFloatWidth+clusterInfo.w,clusterInfo.x+index);
    float v = (float(spoIndex)+0.5)/ float(MAX_LIGHT_COUNT);
    vec4 p1 = texture2D(lightBuffer, vec2(0.125,v));
    vec4 p2 = texture2D(lightBuffer, vec2(0.375,v));
	vec4 p3 = texture2D(lightBuffer, vec2(0.625,v));
    light.color = p1.rgb;
	light.range=p1.a;
    light.position = p2.rgb;
	light.spot = p2.a;
	light.direction = p3.rgb;
    return light;
}

// Laya中使用衰减纹理
float LayaAttenuation(in vec3 L,in float invLightRadius) {
	float fRatio = clamp(length(L) * invLightRadius,0.0,1.0);
	fRatio *= fRatio;
	return 1.0 / (1.0 + 25.0 * fRatio)* clamp(4.0*(1.0 - fRatio),0.0,1.0); //fade to black as if 4 pixel texture
}

// Same as Just Cause 2 and Crysis 2 (you can read GPU Pro 1 book for more information)
float BasicAttenuation(in vec3 L,in float invLightRadius) {
	vec3 distance = L * invLightRadius;
	float attenuation = clamp(1.0 - dot(distance, distance),0.0,1.0); // Equals float attenuation = saturate(1.0f - dot(L, L) / (lightRadius *  lightRadius));
	return attenuation * attenuation;
}

// Inspired on http://fools.slindev.com/viewtopic.php?f=11&t=21&view=unread#unread
float NaturalAttenuation(in vec3 L,in float invLightRadius) {
	float attenuationFactor = 30.0;
	vec3 distance = L * invLightRadius;
	float attenuation = dot(distance, distance); // Equals float attenuation = dot(L, L) / (lightRadius *  lightRadius);
	attenuation = 1.0 / (attenuation * attenuationFactor + 1.0);
	// Second we move down the function therewith it reaches zero at abscissa 1:
	attenuationFactor = 1.0 / (attenuationFactor + 1.0); //attenuationFactor contains now the value we have to subtract
	attenuation = max(attenuation - attenuationFactor, 0.0); // The max fixes a bug.
	// Finally we expand the equation along the y-axis so that it starts with a function value of 1 again.
	attenuation /= 1.0 - attenuationFactor;
	return attenuation;
}

void LayaAirBlinnPhongLight (in vec3 specColor,in float specColorIntensity,in vec3 normal,in vec3 gloss, in vec3 viewDir,in vec3 lightColor, in vec3 lightVec,out vec3 diffuseColor,out vec3 specularColor) {
	mediump vec3 h = normalize(viewDir-lightVec);
	lowp float ln = max (0.0, dot (-lightVec,normal));
	float nh = max (0.0, dot (h,normal));
	diffuseColor=lightColor * ln;
	specularColor=lightColor *specColor*pow (nh, specColorIntensity*128.0) * gloss;
}

void LayaAirBlinnPhongDiectionLight (in vec3 specColor,in float specColorIntensity,in vec3 normal,in vec3 gloss, in vec3 viewDir, in DirectionLight light,float thinknessFactor,out vec3 diffuseColor,out vec3 specularColor,out vec3 transmisColor) {
	vec3 lightVec=normalize(light.direction);
	LayaAirBlinnPhongLight(specColor,specColorIntensity,normal,gloss,viewDir,light.color,lightVec,diffuseColor,specularColor);
	#ifdef ENABLETRANSMISSION
		diffuseColor *= u_TransmissionRate;
		transmisColor = SubSurfaceIBack(lightVec, viewDir,thinknessFactor)*light.color.rgb*(1.0-u_TransmissionRate);
	#endif
}


void LayaAirBlinnPhongDiectionLight (in vec3 specColor,in float specColorIntensity,in vec3 normal,in vec3 gloss, in vec3 viewDir, in DirectionLight light,out vec3 diffuseColor,out vec3 specularColor) {
	vec3 lightVec=normalize(light.direction);
	LayaAirBlinnPhongLight(specColor,specColorIntensity,normal,gloss,viewDir,light.color,lightVec,diffuseColor,specularColor);
}


void LayaAirBlinnPhongPointLight (in vec3 pos,in vec3 specColor,in float specColorIntensity,in vec3 normal,in vec3 gloss, in vec3 viewDir, in PointLight light,float thinknessFactor,out vec3 diffuseColor,out vec3 specularColor,out vec3 transmisColor) {
	vec3 lightVec =  pos-light.position;
	LayaAirBlinnPhongLight(specColor,specColorIntensity,normal,gloss,viewDir,light.color,lightVec/length(lightVec),diffuseColor,specularColor);
	float attenuate = LayaAttenuation(lightVec, 1.0/light.range);
	diffuseColor *= attenuate;
	specularColor*= attenuate;
	#ifdef ENABLETRANSMISSION
		diffuseColor *= u_TransmissionRate;
		transmisColor = SubSurfaceIBack(lightVec, viewDir,thinknessFactor)*light.color.rgb*(1.0-u_TransmissionRate)*attenuate;
	#endif
}

void LayaAirBlinnPhongPointLight (in vec3 pos,in vec3 specColor,in float specColorIntensity,in vec3 normal,in vec3 gloss, in vec3 viewDir, in PointLight light,out vec3 diffuseColor,out vec3 specularColor) {
	vec3 lightVec =  pos-light.position;
	LayaAirBlinnPhongLight(specColor,specColorIntensity,normal,gloss,viewDir,light.color,lightVec/length(lightVec),diffuseColor,specularColor);
	float attenuate = LayaAttenuation(lightVec, 1.0/light.range);
	diffuseColor *= attenuate;
	specularColor*= attenuate;
}

void LayaAirBlinnPhongSpotLight (in vec3 pos,in vec3 specColor,in float specColorIntensity,in vec3 normal,in vec3 gloss, in vec3 viewDir, in SpotLight light,float thinknessFactor,out vec3 diffuseColor,out vec3 specularColor,out vec3 transmisColor) {
	vec3 lightVec =  pos-light.position;
	vec3 normalLightVec=lightVec/length(lightVec);
	LayaAirBlinnPhongLight(specColor,specColorIntensity,normal,gloss,viewDir,light.color,normalLightVec,diffuseColor,specularColor);
	vec2 cosAngles=cos(vec2(light.spot,light.spot*0.5)*0.5);//ConeAttenuation
	float dl=dot(normalize(light.direction),normalLightVec);
	dl*=smoothstep(cosAngles[0],cosAngles[1],dl);
	float attenuate = LayaAttenuation(lightVec, 1.0/light.range)*dl;
	diffuseColor *=attenuate;
	specularColor *=attenuate;
	#ifdef ENABLETRANSMISSION
		diffuseColor *= u_TransmissionRate;
		transmisColor = SubSurfaceIBack(lightVec, viewDir,thinknessFactor)*light.color.rgb*(1.0-u_TransmissionRate)*attenuate;
	#endif
}

void LayaAirBlinnPhongSpotLight (in vec3 pos,in vec3 specColor,in float specColorIntensity,in vec3 normal,in vec3 gloss, in vec3 viewDir, in SpotLight light,out vec3 diffuseColor,out vec3 specularColor) {
	vec3 lightVec =  pos-light.position;
	vec3 normalLightVec=lightVec/length(lightVec);
	LayaAirBlinnPhongLight(specColor,specColorIntensity,normal,gloss,viewDir,light.color,normalLightVec,diffuseColor,specularColor);
	vec2 cosAngles=cos(vec2(light.spot,light.spot*0.5)*0.5);//ConeAttenuation
	float dl=dot(normalize(light.direction),normalLightVec);
	dl*=smoothstep(cosAngles[0],cosAngles[1],dl);
	float attenuate = LayaAttenuation(lightVec, 1.0/light.range)*dl;
	diffuseColor *=attenuate;
	specularColor *=attenuate;
}




vec3 NormalSampleToWorldSpace(vec3 normalMapSample, vec3 unitNormal, vec3 tangent,vec3 binormal) {
	vec3 normalT =vec3(2.0*normalMapSample.x - 1.0,1.0-2.0*normalMapSample.y,2.0*normalMapSample.z - 1.0);
	mediump vec3 N = unitNormal;
	mediump vec3 T = tangent;
	mediump vec3 B = binormal;
	mat3 TBN = mat3(T, B, N);

	// Transform from tangent space to world space.
	vec3 bumpedNormal =normalize(TBN*normalT);
	return bumpedNormal;
}

vec3 NormalSampleToWorldSpace1(vec4 normalMapSample, vec3 tangent, vec3 binormal, vec3 unitNormal) {
	vec3 normalT;
	normalT.x = 2.0 * normalMapSample.x - 1.0;
	normalT.y = 1.0 - 2.0 * normalMapSample.y;
	normalT.z = sqrt(1.0 - clamp(dot(normalT.xy, normalT.xy), 0.0, 1.0));

	vec3 T = normalize(tangent);
	vec3 B = normalize(binormal);
	vec3 N = normalize(unitNormal);
	mat3 TBN = mat3(T, B, N);

	// Transform from tangent space to world space.
	vec3 bumpedNormal = TBN * normalize(normalT);

	return bumpedNormal;
}

vec3 DecodeLightmap(vec4 color) {
	return color.rgb*color.a*5.0;
}

vec3 decodeHDR(vec4 color,float range) {
	return color.rgb*color.a*range;
}

vec2 TransformUV(vec2 texcoord,vec4 tilingOffset) {
	vec2 transTexcoord=vec2(texcoord.x,texcoord.y-1.0)*tilingOffset.xy+vec2(tilingOffset.z,-tilingOffset.w);
	transTexcoord.y+=1.0;
	return transTexcoord;
}

vec4 remapGLPositionZ(vec4 position) {
	position.z=position.z * 2.0 - position.w;
	return position;
}

mediump vec3 layaLinearToGammaSpace (mediump vec3 linRGB)
{
    linRGB = max(linRGB, vec3(0.0));
    // An almost-perfect approximation from http://chilliant.blogspot.com.au/2012/08/srgb-approximations-for-hlsl.html?m=1
    return max(1.055 * pow(linRGB,vec3(0.416666667)) - 0.055, 0.0);   
}

LayaLight layaDirectionLightToLight(in DirectionLight light,in float attenuate)
{
	LayaLight relight;
	relight.color = light.color*attenuate;
	relight.dir = light.direction;
	return relight;
}

LayaLight layaPointLightToLight(in vec3 pos,in vec3 normal, in PointLight light,in float attenuate)
{
	LayaLight relight;
	vec3 lightVec =  pos-light.position;
	attenuate *= LayaAttenuation(lightVec, 1.0/light.range);
	relight.color = light.color*attenuate;
	relight.dir = normalize(lightVec);
	return relight;
}

LayaLight layaSpotLightToLight(in vec3 pos,in vec3 normal, in SpotLight light,in float attenuate)
{
	LayaLight relight;
	vec3 lightVec =  pos-light.position;
	vec3 normalLightVec=lightVec/length(lightVec);
	vec2 cosAngles=cos(vec2(light.spot,light.spot*0.5)*0.5);//ConeAttenuation
	float dl=dot(normalize(light.direction),normalLightVec);
	dl*=smoothstep(cosAngles[0],cosAngles[1],dl);
	attenuate *= LayaAttenuation(lightVec, 1.0/light.range)*dl;
	relight.dir = normalLightVec;
	relight.color = light.color*attenuate;
	return relight;
}




