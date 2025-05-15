vec3 gammaToLinear(in vec3 value)
{
    return pow((value + 0.055) / 1.055, vec3(2.4));
}

vec4 gammaToLinear(in vec4 value)
{
    return vec4(gammaToLinear(value.rgb), value.a);
}

vec3 linearToGamma(in vec3 value)
{
    return vec3(mix(pow(value.rgb, vec3(0.41666)) * 1.055 - vec3(0.055), value.rgb * 12.92, vec3(lessThanEqual(value.rgb, vec3(0.0031308)))));

    // return pow(value, vec3(1.0 / 2.2));
    // return pow(value, vec3(0.455));
}

vec4 linearToGamma(in vec4 value)
{
    return vec4(linearToGamma(value.rgb), value.a);
}

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


  varying vec2 v_cliped;
#if defined(PRIMITIVEMESH)
    varying vec4 v_color;
  
  

    vec4 getGlColor(vec4 color){
        #ifdef GAMMASPACE
            return color;
        #else
            return gammaToLinear(color);
        #endif
    }

#elif defined(TEXTUREVS)
    varying vec4 v_texcoordAlpha;
    varying vec4 v_color;
    varying float v_useTex;
    
    //uniform
    uniform sampler2D u_spriteTexture;

    #ifdef COLOR_ADD
        uniform vec4 u_colorAdd;
    #endif

    #ifdef FILLTEXTURE
        uniform vec4 u_TexRange; // startu,startv,urange, vrange
    #endif

    vec4 getSpriteTextureColor(){
        #ifdef FILLTEXTURE
            vec4 color = texture2D(u_spriteTexture, fract(v_texcoordAlpha.xy) * u_TexRange.zw + u_TexRange.xy);
        #else
            vec4 color = texture2D(u_spriteTexture, v_texcoordAlpha.xy);
        #endif
        return transspaceColor(color);
    }

    void setglColor(in vec4 color){
        if (v_useTex <= 0.)
            color = vec4(1., 1., 1., 1.);

        color.a *= v_color.w;
        // color.rgb*=v_color.w;
        vec4 transColor = v_color;
        #ifndef GAMMASPACE
            transColor = gammaToLinear(v_color);
        #endif
        color.rgb *= transColor.rgb;
        gl_FragColor = color;

        #ifdef COLOR_ADD
            gl_FragColor = vec4(u_colorAdd.rgb, u_colorAdd.a * gl_FragColor.a);
            gl_FragColor.xyz *= u_colorAdd.a;
        #endif
    }
#endif

#ifdef BASERENDER2D
    varying vec2 v_texcoord;
    varying vec4 v_color;
    uniform sampler2D u_baseRender2DTexture;
    uniform vec4 u_baseRender2DTextureRange;
    uniform vec4 u_baseRenderColor;

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

void clip(){
    if(v_cliped.x<0.) discard;
    if(v_cliped.x>1.) discard;
    if(v_cliped.y<0.) discard;
    if(v_cliped.y>1.) discard;
}