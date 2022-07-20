// //用来传入Laya3D渲染深度的数据
// #ifdef ENUNIFORMBLOCK
//     uniform ShadowUniformBlock{
//         vec4 u_ShadowBias;// x: depth bias, y: normal bias
//         mat4 u_ViewProjection;
//         vec3 u_ShadowLightDirection;
//     };
// #else
//     uniform vec4 u_ShadowBias; // x: depth bias, y: normal bias
//     uniform mat4 u_ViewProjection;
//     #ifdef SHADOW
// 	    uniform vec3 u_ShadowLightDirection;
//     #endif
// #endif


// //#ifdef ENUNIFORMBLOCK
// //    uniform SpriteUniformBlock{
// //        mat4 u_WorldMat;
//         //light map
// //        vec4 u_LightmapScaleOffset;
// //        vec4 u_ReflectCubeHDRParams;
// //    };
// //#else
//     uniform mat4 u_WorldMat;
//     //light map
//     uniform vec4 u_LightmapScaleOffset;
//     uniform vec4 u_ReflectCubeHDRParams;
// //#endif