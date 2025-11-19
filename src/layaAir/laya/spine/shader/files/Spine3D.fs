#define SHADER_NAME Spine3DFS

#include "Color.glsl";

#include "Scene.glsl";
#include "SceneFog.glsl";

#include "Camera.glsl";

varying vec2 v_texcoord;
varying vec4 v_color;
varying vec4 v_color2;

vec4 getColor(){
    vec4 color = texture2D(u_spineTexture, v_texcoord.xy);//vec4(1.0,0.0,0.0,1.0);
    #ifdef Gamma_u_spineTexture
        color = gammaToLinear(color);
    #endif // Gamma_u_spineTexture

    vec4 final;
    #ifdef TWOCOLORTINT
        final.a = color.a * v_color.a;
        final.xyz = ((color.a - 1.0) * v_color2.a + 1.0 - color.xyz) * v_color2.xyz + color.xyz * v_color.xyz;
    #else
        final = color * v_color;
    #endif

    return final;
}

void main()
{
    // 使用Spine的片段着色器逻辑获取颜色
    gl_FragColor = getColor();
    
    gl_FragColor = outputTransform(gl_FragColor);
    
#ifdef FOG
    gl_FragColor = sceneLitFog(gl_FragColor);
#endif
}

