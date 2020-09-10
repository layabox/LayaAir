/*
	texture和fillrect使用的。
*/
#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
precision highp float;
#else
precision mediump float;
#endif

varying vec4 v_texcoordAlpha;
varying vec4 v_color;
varying float v_useTex;
uniform sampler2D texture;
varying vec2 cliped;

#ifdef BLUR_FILTER
uniform vec4 strength_sig2_2sig2_gauss1;
uniform vec2 blurInfo;

#define PI 3.141593

float getGaussian(float x, float y){
    return strength_sig2_2sig2_gauss1.w*exp(-(x*x+y*y)/strength_sig2_2sig2_gauss1.z);
}

vec4 blur(){
    const float blurw = 9.0;
    vec4 vec4Color = vec4(0.0,0.0,0.0,0.0);
    vec2 halfsz=vec2(blurw,blurw)/2.0/blurInfo;    
    vec2 startpos=v_texcoordAlpha.xy-halfsz;
    vec2 ctexcoord = startpos;
    vec2 step = 1.0/blurInfo;  //每个像素      
    
    for(float y = 0.0;y<=blurw; ++y){
        ctexcoord.x=startpos.x;
        for(float x = 0.0;x<=blurw; ++x){
            //TODO 纹理坐标的固定偏移应该在vs中处理
            vec4Color += texture2D(texture, ctexcoord)*getGaussian(x-blurw/2.0,y-blurw/2.0);
            ctexcoord.x+=step.x;
        }
        ctexcoord.y+=step.y;
    }
    return vec4Color;
}
#endif

#ifdef COLOR_FILTER
uniform vec4 colorAlpha;
uniform mat4 colorMat;
#endif

#ifdef GLOW_FILTER
uniform vec4 u_color;
uniform vec4 u_blurInfo1;
uniform vec4 u_blurInfo2;
#endif

#ifdef COLOR_ADD
uniform vec4 colorAdd;
#endif

#ifdef FILLTEXTURE	
uniform vec4 u_TexRange;//startu,startv,urange, vrange
#endif
void main() {
	if(cliped.x<0.) discard;
	if(cliped.x>1.) discard;
	if(cliped.y<0.) discard;
	if(cliped.y>1.) discard;
	
#ifdef FILLTEXTURE	
   vec4 color= texture2D(texture, fract(v_texcoordAlpha.xy)*u_TexRange.zw + u_TexRange.xy);
#else
   vec4 color= texture2D(texture, v_texcoordAlpha.xy);
#endif

   if(v_useTex<=0.)color = vec4(1.,1.,1.,1.);
   color.a*=v_color.w;
   //color.rgb*=v_color.w;
   color.rgb*=v_color.rgb;
   gl_FragColor=color;
   
   #ifdef COLOR_ADD
	gl_FragColor = vec4(colorAdd.rgb,colorAdd.a*gl_FragColor.a);
	gl_FragColor.xyz *= colorAdd.a;
   #endif
   
   #ifdef BLUR_FILTER
	gl_FragColor =   blur();
	gl_FragColor.w*=v_color.w;   
   #endif
   
   #ifdef COLOR_FILTER
	mat4 alphaMat =colorMat;

	alphaMat[0][3] *= gl_FragColor.a;
	alphaMat[1][3] *= gl_FragColor.a;
	alphaMat[2][3] *= gl_FragColor.a;

	gl_FragColor = gl_FragColor * alphaMat;
	gl_FragColor += colorAlpha/255.0*gl_FragColor.a;
   #endif
   
   #ifdef GLOW_FILTER
	const float c_IterationTime = 10.0;
	float floatIterationTotalTime = c_IterationTime * c_IterationTime;
	vec4 vec4Color = vec4(0.0,0.0,0.0,0.0);
	vec2 vec2FilterDir = vec2(-(u_blurInfo1.z)/u_blurInfo2.x,-(u_blurInfo1.w)/u_blurInfo2.y);
	vec2 vec2FilterOff = vec2(u_blurInfo1.x/u_blurInfo2.x/c_IterationTime * 2.0,u_blurInfo1.y/u_blurInfo2.y/c_IterationTime * 2.0);
	float maxNum = u_blurInfo1.x * u_blurInfo1.y;
	vec2 vec2Off = vec2(0.0,0.0);
	float floatOff = c_IterationTime/2.0;
	for(float i = 0.0;i<=c_IterationTime; ++i){
		for(float j = 0.0;j<=c_IterationTime; ++j){
			vec2Off = vec2(vec2FilterOff.x * (i - floatOff),vec2FilterOff.y * (j - floatOff));
			vec4Color += texture2D(texture, v_texcoordAlpha.xy + vec2FilterDir + vec2Off)/floatIterationTotalTime;
		}
	}
	gl_FragColor = vec4(u_color.rgb,vec4Color.a * u_blurInfo2.z);
	gl_FragColor.rgb *= gl_FragColor.a;   
   #endif
   
}