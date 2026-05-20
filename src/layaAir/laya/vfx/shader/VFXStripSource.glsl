Shader3D Start
{
    type:Shader3D,
    name:VFXStrip,
    enableInstancing:false,
    shaderType:D3,
    supportReflectionProbe:false,
    attributeMap: {
        'a_Position': ["Vector4", 0],
        'a_Color': ["Vector4", 1],
        'a_Texcoord0': ["Vector2", 2],
        'a_Normal': ["Vector3", 3]
    },
    uniformMap:{
        u_Color: { type: Color },
        u_AlbedoTexture: { type: Texture2D },
        u_VfxStripGradient: { type: Texture2D },
        u_VfxUVScale: { type: Vector2 },
        u_VfxUVBias: { type: Vector2 }
    },
    defines: {
        VFX_STRIP_GRADIENT_MAPPED: { type: bool, default: false },
        VFX_STRIP_UV_SCALE_BIAS: { type: bool, default: false }
    }
    shaderPass:[
        {
            pipeline:Forward,
            VS:stripVS,
            FS:stripPS
        }
    ]
}
Shader3D End

GLSL Start
#defineGLSL stripVS

    #define SHADER_NAME VFXStrip
    #define COLOR

    #include "Scene.glsl";
    #include "Camera.glsl";
    #include "Sprite3DVertex.glsl";

    varying vec4 v_Color;
    varying vec2 v_Texcoord0;

    void main()
    {
        mat4 worldMat = getWorldMatrix();
        vec4 posWS = worldMat * a_Position;

        v_Color = a_Color;
        v_Texcoord0 = a_Texcoord0;

        gl_Position = getPositionCS(posWS.xyz);
        gl_Position = remapPositionZ(gl_Position);
    }
#endGLSL

#defineGLSL stripPS

    #define SHADER_NAME VFXStrip

    #include "Color.glsl";
    #include "Scene.glsl";
    #include "Camera.glsl";

    varying vec4 v_Color;
    varying vec2 v_Texcoord0;

    void main()
    {
        // UV transform (Scale & Bias mode)
        vec2 _uv = v_Texcoord0;
        #ifdef VFX_STRIP_UV_SCALE_BIAS
            _uv = _uv * u_VfxUVScale + u_VfxUVBias;
        #endif

        vec4 baseColor = u_Color * v_Color;
        vec4 texColor = texture2D(u_AlbedoTexture, _uv);

        #ifdef VFX_STRIP_GRADIENT_MAPPED
            // ColorMapping = GradientMapped: 用 mainTex 灰度作 gradient sample t（对齐 Unity URPGradientMappingShader）
            // gradient 是 256×1 RGBA 纹理（runtime bake from props.gradient stops）
            vec4 gradColor = texture2D(u_VfxStripGradient, vec2(texColor.r, 0.5));
            baseColor.rgb *= gradColor.rgb;
            baseColor.a *= gradColor.a * texColor.a;
        #else
            baseColor *= texColor;
        #endif

        gl_FragColor = baseColor;

        gl_FragColor = outputTransform(gl_FragColor);
    }
#endGLSL
GLSL End
