//用来传入Laya3D渲染所需的共用数据
#ifdef ENUNIFORMBLOCK
    //uniformBufferObject
    uniform SceneUniformBlock{
         //ambientColor
        vec3 u_AmbientColor;
        vec4 u_AmbientSHAr;
        vec4 u_AmbientSHAg;
        vec4 u_AmbientSHAb;
        vec4 u_AmbientSHBr;
        vec4 u_AmbientSHBg;
        vec4 u_AmbientSHBb;
        vec4 u_AmbientSHC;
        //time
        float u_Time;
        //fog
        float u_FogStart;
        float u_FogRange;
        vec3 u_FogColor;
        //Main Light
        vec3 u_SunLight_direction;
        vec3 u_SunLight_color;
    };
#else
    //ambientColor
    uniform vec3 u_AmbientColor;
    #if defined(GI_AMBIENT_SH)
        uniform vec4 u_AmbientSHAr;
        uniform vec4 u_AmbientSHAg;
        uniform vec4 u_AmbientSHAb;
        uniform vec4 u_AmbientSHBr;
        uniform vec4 u_AmbientSHBg;
        uniform vec4 u_AmbientSHBb;
        uniform vec4 u_AmbientSHC;
    #endif
    //time
    uniform float u_Time;
    //fog
    #ifdef FOG
        uniform float u_FogStart;
        uniform float u_FogRange;
        uniform vec3 u_FogColor;
    #endif
    //Main Light
    uniform vec3 u_SunLight_direction;
    uniform vec3 u_SunLight_color;
#endif

//Light

//=======Scene End=======
//=======Camera=======
#ifdef ENUNIFORMBLOCK
    uniform CameraUniformBlock{
        mat4 u_View;
        mat4 u_Projection;
        mat4 u_ViewProjection;
        vec4 u_ProjectionParams; // x: near, y: far, z: invert, w: 1/far
        vec4 u_Viewport; //x,y,width,height
        vec3 u_CameraDirection;
        vec3 u_CameraUp;
        vec3 u_CameraPos;
    };
#else
    uniform mat4 u_View;
    uniform mat4 u_Projection;
    uniform mat4 u_ViewProjection;
    uniform vec4 u_ProjectionParams; // x: near, y: far, z: invert, w: 1/far
    uniform vec4 u_Viewport; //x,y,width,height
    uniform vec3 u_CameraDirection;
    uniform vec3 u_CameraUp;
    uniform vec3 u_CameraPos;
#endif
//=======Camera end=======

//=======Sprite3D==========
//#ifdef ENUNIFORMBLOCK
//    uniform SpriteUniformBlock{
//        mat4 u_WorldMat;
        //light map
        //vec4 u_LightmapScaleOffset;
//        vec4 u_ReflectCubeHDRParams;
//    };
//#else
    uniform mat4 u_WorldMat;
    //light map
    //uniform vec4 u_LightmapScaleOffset;
    uniform vec4 u_ReflectCubeHDRParams;
//#endif
uniform vec4 u_LightmapScaleOffset;//todo 过大年实在找不到的bug 静态合并和UBO的冲突  示例为AStarPath
//=======Sprite3D End======
