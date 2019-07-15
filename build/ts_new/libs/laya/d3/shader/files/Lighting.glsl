
struct DirectionLight {
	vec3 Color;
	vec3 Direction;
};

struct PointLight {
	vec3 Color;
	vec3 Position;
	float Range;
};

struct SpotLight {
	vec3 Color;
	vec3 Position;
	vec3 Direction;
	float Spot;
	float Range;
};

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

void LayaAirBlinnPhongDiectionLight (in vec3 specColor,in float specColorIntensity,in vec3 normal,in vec3 gloss, in vec3 viewDir, in DirectionLight light,out vec3 diffuseColor,out vec3 specularColor) {
	vec3 lightVec=normalize(light.Direction);
	LayaAirBlinnPhongLight(specColor,specColorIntensity,normal,gloss,viewDir,light.Color,lightVec,diffuseColor,specularColor);
}

void LayaAirBlinnPhongPointLight (in vec3 pos,in vec3 specColor,in float specColorIntensity,in vec3 normal,in vec3 gloss, in vec3 viewDir, in PointLight light,out vec3 diffuseColor,out vec3 specularColor) {
	vec3 lightVec =  pos-light.Position;
	//if( length(lightVec) > light.Range )
	//	return;
	LayaAirBlinnPhongLight(specColor,specColorIntensity,normal,gloss,viewDir,light.Color,lightVec/length(lightVec),diffuseColor,specularColor);
	float attenuate = LayaAttenuation(lightVec, 1.0/light.Range);
	diffuseColor *= attenuate;
	specularColor*= attenuate;
}

void LayaAirBlinnPhongSpotLight (in vec3 pos,in vec3 specColor,in float specColorIntensity,in vec3 normal,in vec3 gloss, in vec3 viewDir, in SpotLight light,out vec3 diffuseColor,out vec3 specularColor) {
	vec3 lightVec =  pos-light.Position;
	//if( length(lightVec) > light.Range)
	//	return;

	vec3 normalLightVec=lightVec/length(lightVec);
	LayaAirBlinnPhongLight(specColor,specColorIntensity,normal,gloss,viewDir,light.Color,normalLightVec,diffuseColor,specularColor);
	vec2 cosAngles=cos(vec2(light.Spot,light.Spot*0.5)*0.5);//ConeAttenuation
	float dl=dot(normalize(light.Direction),normalLightVec);
	dl*=smoothstep(cosAngles[0],cosAngles[1],dl);
	float attenuate = LayaAttenuation(lightVec, 1.0/light.Range)*dl;
	diffuseColor *=attenuate;
	specularColor *=attenuate;
}

vec3 NormalSampleToWorldSpace(vec3 normalMapSample, vec3 unitNormal, vec3 tangent,vec3 binormal) {
	vec3 normalT =vec3(2.0*normalMapSample.x - 1.0,1.0-2.0*normalMapSample.y,2.0*normalMapSample.z - 1.0);

	// Build orthonormal basis.
	vec3 N = normalize(unitNormal);
	vec3 T = normalize(tangent);
	vec3 B = normalize(binormal);
	mat3 TBN = mat3(T, B, N);

	// Transform from tangent space to world space.
	vec3 bumpedNormal = TBN*normalT;

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

vec2 TransformUV(vec2 texcoord,vec4 tilingOffset) {
	vec2 transTexcoord=vec2(texcoord.x,texcoord.y-1.0)*tilingOffset.xy+vec2(tilingOffset.z,-tilingOffset.w);
	transTexcoord.y+=1.0;
	return transTexcoord;
}

vec4 remapGLPositionZ(vec4 position) {
	position.z=position.z * 2.0 - position.w;
	return position;
}

mat3 inverse(mat3 m) {
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

