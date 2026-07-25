#include "ClipFrag.glsl";
#include "Color.glsl";


vec4 transspaceColor(vec4 color)
{
     
 #ifndef GAMMATEXTURE
     //是linear数据
     #ifdef GAMMASPACE
         color.xyz = linearToGamma(color.xyz);    
     #endif
 #else
     //gamma数据
     #ifndef GAMMASPACE
         color.xyz = gammaToLinear(color.xyz);
     #endif
 #endif
     return color;
 }


#ifdef TEXTUREVS
    varying vec4 v_texcoordAlpha;
    varying vec4 v_color;
    varying float v_useTex;
    varying float v_useClip;
    varying vec4 v_customs;

    //uniform
    #ifdef USE_TEX_ARRAY
        varying float v_texLayer;                 // 来自 VS 的图层索引
        uniform sampler2DArray u_spriteTextureArray;
    #else
        uniform sampler2D u_spriteTexture;
    #endif

    #ifdef FILLTEXTURE
        uniform vec4 u_TexRange; // startu,startv,urange, vrange
        uniform vec4 u_TexTrimRect; // offsetX/sourceW, offsetY/sourceH, width/sourceW, height/sourceH
    #endif

    vec4 getSpriteTextureColor(){
        vec2 uv;
        #ifdef FILLTEXTURE
            vec2 tileUV = fract(v_texcoordAlpha.xy);
            vec2 trimmedUV = (tileUV - u_TexTrimRect.xy) / u_TexTrimRect.zw;
            if (trimmedUV.x < 0.0 || trimmedUV.x > 1.0 || trimmedUV.y < 0.0 || trimmedUV.y > 1.0)
                discard;
            uv = trimmedUV * u_TexRange.zw + u_TexRange.xy;
        #else
            uv = v_texcoordAlpha.xy;
        #endif

        #ifdef USE_TEX_ARRAY
            // WebGL2: 使用 texture() 采样 2D Array（layer 为浮点数，内部按整数取层）
            vec4 color = texture(u_spriteTextureArray, vec3(uv, v_texLayer));
        #else
            vec4 color = texture2D(u_spriteTexture, uv);
        #endif
        return transspaceColor(color);
    }

    void setglColor(in vec4 color){
        // if(v_useTex <= 0.)
        //     color = vec4(1., 1., 1., 1.);
        float useTex = step(1.0, v_useTex);
        color = color * useTex + (1.0 - useTex);

        #ifdef UV_CLIP_GPU
            if (v_useClip >= 1.0) {
                vec2 uv = v_texcoordAlpha.xy;
                vec4 c = v_customs;
                if (uv.x < c.x || uv.x > c.x + c.z || uv.y < c.y || uv.y > c.y + c.w)
                    discard;
            }
        #endif

        color.a *= v_color.w;
        vec4 transColor = v_color;
        #ifndef GAMMASPACE
            transColor = gammaToLinear(v_color);
        #endif
        color.rgb *= transColor.rgb;
        gl_FragColor = color;
    }
#endif

#ifdef BASERENDER2D
    varying vec2 v_texcoord;
    varying vec4 v_color;
    uniform sampler2D u_baseRender2DTexture;
    uniform vec4 u_baseRenderColor;
    uniform vec4 u_tilingOffset;

#ifdef LIGHT2D_ENABLE
    varying vec2 v_lightUV;
    uniform vec3 u_LightDirection;
    uniform vec4 u_LightAndShadow2DParam;
    uniform vec4 u_LightAndShadow2DAmbient;
    uniform sampler2D u_LightAndShadow2D;
    #ifdef LIGHT2D_SCENEMODE_ADD
        uniform sampler2D u_LightAndShadow2D_AddMode;
    #endif
    #ifdef LIGHT2D_SCENEMODE_SUB
        uniform sampler2D u_LightAndShadow2D_SubMode;
    #endif

    #ifdef LIGHT2D_NORMAL_PARAM
        uniform sampler2D u_normal2DTexture;
        uniform float u_normal2DStrength;
    #endif

    void lightAndShadow(inout vec4 color) {
        #ifdef LIGHT2D_EMPTY //场景中没有灯光，只有环境光起作用
            color.rgb *= u_LightAndShadow2DAmbient.rgb;
        #else
            vec2 uv = v_lightUV;
            vec2 tt = step(vec2(0.0), uv) * step(uv, vec2(1.0));
            float side = tt.x * tt.y;
            vec3 ambient = color.rgb * u_LightAndShadow2DAmbient.rgb; //环境光成分
            color.rgb = color.rgb * texture2D(u_LightAndShadow2D, uv).rgb * side; //场景和灯光相乘模式
            side *= color.a; //Alpha预乘
            #ifdef LIGHT2D_SCENEMODE_ADD
                color.rgb = min(vec3(1.0), color.rgb + texture2D(u_LightAndShadow2D_AddMode, uv).rgb * side); //场景和灯光相加模式
            #endif
            #ifdef LIGHT2D_SCENEMODE_SUB
                color.rgb = max(vec3(0.0), color.rgb - texture2D(u_LightAndShadow2D_SubMode, uv).rgb * side); //场景和灯光相减模式
            #endif
            #ifdef LIGHT2D_NORMAL_PARAM
                vec3 dr = normalize(u_LightDirection);
                vec3 normal = normalize(texture2D(u_normal2DTexture, v_texcoord).rgb * 2.0 - 1.0);
                color.rgb = color.rgb * ((1.0 - u_normal2DStrength) + abs(dot(dr, normal.rgb)) * u_normal2DStrength);
            #endif
            color.rgb = min(vec3(1.0), color.rgb + ambient); //叠加环境光
        #endif
    }
#endif

    void setglColor(in vec4 color){
        color.a *= v_color.w;
        vec4 transColor = v_color;
        #ifndef GAMMASPACE
            transColor = gammaToLinear(v_color);
        #endif
        color.rgb *= transColor.rgb;
        gl_FragColor = color;
    }

    vec2 transformUV(in vec2 texcoord, in vec4 tilingOffset)
    {
        vec2 uv = texcoord * tilingOffset.zw + tilingOffset.xy;
        return uv;
    }

#endif

