#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
	precision highp int;
#else
	precision mediump float;
	precision mediump int;
#endif


#include "Lighting.glsl";

varying vec2 v_Texcoord0;
varying vec3 v_Normal;
varying vec3 v_ViewDir; 
varying vec3 v_Tangent;
varying vec3 v_Binormal;
varying vec3 v_PositionWorld;
// 屏幕坐标
varying vec4 v_ScreenTexcoord;

// glassRefractionShader相关
uniform sampler2D u_BumpTexture;
 uniform sampler2D u_cameraOpaqueTexture;
 uniform sampler2D u_MainTexture;
 uniform samplerCube u_CubeTexture;
uniform float u_Distortion;
uniform vec4 u_RefractionTex_TexelSize;
uniform float u_RefractAmount;

vec3 UnpackNormal(vec4 packedNormal){
	packedNormal.x *= packedNormal.w;
	vec3 normal;
	normal.xy = packedNormal.xy * 2.0 -1.0;
	normal.z = sqrt(1.0 - clamp(dot(normal.xy, normal.xy), 0.0, 1.0));
	return normal;
}

void main()
{
	// // glassRefraction Shader
	vec4 screenCoord = v_ScreenTexcoord;
	vec4 TtoW0 = vec4(v_Tangent.x, v_Binormal.x, v_Normal.x, v_PositionWorld.x);
	vec4 TtoW1 = vec4(v_Tangent.y, v_Binormal.y, v_Normal.y, v_PositionWorld.y);
	vec4 TtoW2 = vec4(v_Tangent.z, v_Binormal.z, v_Normal.z, v_PositionWorld.z);

	vec3 worldPos = vec3(TtoW0.w, TtoW1.w, TtoW2.w);
	mat3 TtoW = mat3(TtoW0.xyz, TtoW1.xyz, TtoW2.xyz);

	vec3 worldViewDir = normalize(worldPos);
	
	// 此处的v_Texcoord0已经在vs内做过UV转换
	vec3 tanNormal = UnpackNormal(texture2D(u_BumpTexture, v_Texcoord0));
	// tanNormal转到TtoW矩阵
	vec3 worldNormal = TtoW * tanNormal;
	//对采集的屏幕图像进行关于法线方向上的扭曲和偏移，也就是模拟折射的效果
	vec2 offset = tanNormal.xy * u_Distortion * u_RefractionTex_TexelSize.xy;
	screenCoord.xy += offset;
	// 这里使用相机当前渲染的纹理
	vec3 refractCol = texture2D(u_cameraOpaqueTexture, screenCoord.xy/screenCoord.w).xyz;
	//这一块用来模拟反射的效果，反射越强，也就是透光度越低，越能看到主贴图纹理以及周围环境反射的残影
	vec3 reflectDir = reflect(worldViewDir, worldNormal);
	vec4 mainTexCol = texture2D(u_MainTexture, v_Texcoord0.xy);
	vec4 cubemapCol = textureCube(u_CubeTexture, reflectDir);
	vec3 reflectCol = mainTexCol.rgb * cubemapCol.rgb;
	//最后将折射和反射进行一个综合叠加，_RefractAmount可以认为是透光率，当它为1时，就是全透过而没有反射，为0时就是全反射跟镜子一样
	vec3 color = refractCol * u_RefractAmount + reflectCol * (1.0 - u_RefractAmount);
	gl_FragColor =  vec4(color, 1.0);

}

