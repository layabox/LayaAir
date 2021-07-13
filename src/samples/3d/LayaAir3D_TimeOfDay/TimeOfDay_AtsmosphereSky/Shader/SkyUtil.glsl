#define SCATTERING_SAMPLES 2
//计算系数
uniform vec4 u_kradius;
uniform vec4 u_kScale;
uniform vec4 u_k4PI;
uniform vec4 u_kSun;

uniform vec3 u_SunSkyColor;
uniform vec3 u_MoonSkyColor;

uniform vec3 u_LocalSunDirection;
uniform vec3 u_LocalMoonDirection;

//计算散射颜色
uniform vec3 u_kBetaMie;

uniform float u_MoonHaloPower;
uniform vec3 u_MoonHaloColor;

uniform vec3 u_GroundColor;
uniform vec3 u_FogColor;
uniform float u_Contrast;
uniform float u_Brightness;
uniform float u_Fogginess;

uniform vec3 u_noonColor;

float Scale(float inCos)
{
	float x = 1.0 - inCos;
	return 0.25 * exp(-0.00287 + x * (0.459 + x * (3.83 + x * (-6.80 + x * 5.25))));
}


float MiePhase(float eyeCos, float eyeCos2)
{
	return u_kBetaMie.x * (1.0 + eyeCos2) / pow(u_kBetaMie.y + u_kBetaMie.z * eyeCos, 1.5);
}

float RayleighPhase(float eyeCos2)
{
	return 0.75 + 0.75 * eyeCos2;
}

vec3 NightPhase(vec3 dir)
{
	dir.y = max(0.0, dir.y);

	return u_MoonSkyColor * (1.0 - 0.75 * dir.y);
}

vec3 MoonPhase(vec3 dir)
{
	return u_MoonHaloColor * pow(max(0.0, dot(dir, u_LocalMoonDirection)), u_MoonHaloPower);
}

vec3 PostProcess(vec3 col, vec3 dir)
{
	// Lerp to ground color
	col = mix(col, u_GroundColor, clamp(-dir.y,0.0,1.0));

	// Lerp to fog color
	col = mix(col, u_FogColor, u_Fogginess);

	// Adjust output color
	col = pow(col * u_Brightness, vec3(u_Contrast));

	return col;
}



//散射系数
void ScatteringCoefficients(vec3 dir, out vec3 inscatter, out vec3 outscatter) {
	dir = normalize(vec3(dir.x, max(0.0, dir.y), dir.z));

	float kInnerRadius = u_kradius.x;
	float kInnerRadius2 = u_kradius.y;
	float kOuterRadius2 = u_kradius.w;

	float kScale = u_kScale.x;
	float kScaleOverScaleDepth = u_kScale.z;
	float kCameraHeight = u_kScale.w;

	vec3 kKr4PI = u_k4PI.xyz;
	float  kKm4PI = u_k4PI.w;

	vec3 kKrESun = u_kSun.xyz;
	float  kKmESun = u_kSun.w;

	// Current camera position
	vec3 cameraPos = vec3(0, kInnerRadius + kCameraHeight, 0);

	// Length of the atmosphere
	float far = sqrt(kOuterRadius2 + kInnerRadius2 * dir.y * dir.y - kInnerRadius2) - kInnerRadius * dir.y;

	// Ray starting position and its scattering offset
	float startDepth = exp(kScaleOverScaleDepth * (-kCameraHeight));
	float startAngle = dot(dir, cameraPos) / (kInnerRadius + kCameraHeight);
	float startOffset = startDepth * Scale(startAngle);

	// Scattering loop variables
	float  sampleLength = far / 2.0;
	float  scaledLength = sampleLength * kScale;
	vec3 sampleRay = dir * sampleLength;
	vec3 samplePoint = cameraPos + sampleRay * 0.5;

	vec3 sunColor = vec3(0.0, 0.0, 0.0);
	for (int i = 0; i < int(2.0); i++)
	{

		float height = max(1.0, length(samplePoint));
		float invHeight = 1.0 / height;

		float depth = exp(kScaleOverScaleDepth * (kInnerRadius - height));
		float atten = depth * scaledLength;

		float cameraAngle = dot(dir, samplePoint) * invHeight;
		float sunAngle = dot(u_LocalSunDirection, samplePoint) * invHeight;
		float sunScatter = startOffset + depth * (Scale(sunAngle) - Scale(cameraAngle));

		vec3 sunAtten = exp(-sunScatter * (kKr4PI + kKm4PI));

		sunColor += sunAtten * atten;
		samplePoint += sampleRay;
	}

	inscatter = u_SunSkyColor * sunColor * kKrESun;

	outscatter = u_SunSkyColor * sunColor * kKmESun;

}
//散射颜色
vec4 ScatteringColor(vec3 dir, vec3 inscatter, vec3 outscatter) {
	vec3 resultColor = vec3(0, 0, 0);

	float sunCos = dot(u_LocalSunDirection, dir);
	float sunCos2 = sunCos * sunCos;
		//miner 补充白天天空亮度
	float delta = step(0.0, u_LocalSunDirection.y)*u_LocalSunDirection.y;
	//RAYLEIGH
	resultColor += NightPhase(dir)+u_noonColor* delta;
	//resultColor += NightPhase(dir);
	//MIE
	resultColor += MoonPhase(dir);
	//RAYLEIGH
	resultColor += RayleighPhase(sunCos2) * inscatter*0.5;
	//MIE
	resultColor += MiePhase(sunCos, sunCos2) * outscatter*0.3;

	vec4 resultc = vec4(PostProcess(resultColor, dir), 1.0);
	
	return resultc;
}

//采用RAYLEIGH散射以及MIE散射
vec4 outScatteringColor(vec3 dir) {
	vec3 inscatter, outscatter;
	ScatteringCoefficients(dir, inscatter, outscatter);
	return ScatteringColor(dir, inscatter, outscatter);
}

vec4 HDR2LDR(vec4 color) {
	return (1.0 - exp2(-u_Brightness * color));
}

vec4 LINEAR2GAMMA(vec4 color) {
	return sqrt(color);
}

vec4 GAMMA2LINEAR(vec4 color) {
	return (color * color);
}

//color adjust

vec4 Adjust(vec4 color)
{

//#if !TOD_OUTPUT_HDR
//	color = HDR2LDR(color);
//#endif
//
//#if !TOD_OUTPUT_LINEAR
//	color = LINEAR2GAMMA(color);
//#endif
	//color = GAMMA2LINEAR(color);

	return color;
}
