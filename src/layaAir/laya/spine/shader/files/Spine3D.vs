#define SHADER_NAME Spine3DVS

#include "Math.glsl";

#include "Scene.glsl";
#include "SceneFogInput.glsl";

#include "Camera.glsl";

#include "Spine3DVertex.glsl";

#ifdef SPINE_BILLBOARD
uniform mat4 u_spineBillboardMatrix;
#endif

varying vec2 v_texcoord;
varying vec4 v_color;
varying vec4 v_color2;

mat4 getWorldMatrix(){
    #ifdef SPINE_BILLBOARD
        return u_spineBillboardMatrix;
    #else
        #ifdef GPU_INSTANCE
        mat4 worldMat = a_WorldMat;
        #else
        mat4 worldMat = u_WorldMat;
        #endif // GPU_INSTANCE
        return worldMat;
    #endif
}

void main()
{
    
    // 获取顶点信息（UV和颜色）
    Vertex vertex;
    getVertexParams(vertex);

    v_texcoord = vertex.texCoord0;
    v_color = vertex.vertexColor;
    
    #ifdef COLOR2
        v_color2 = a_color2;
        #ifdef Gamma_u_spineTexture
            v_color2.rgb = pow(v_color2.rgb, vec3(2.2));
        #endif
    #else
        v_color2 = vec4(0.0, 0.0, 0.0, 1.0);
    #endif

    #ifdef PREMULTIPLYALPHA
        v_color2.xyz = v_color2.xyz * v_color.a;
    #endif
    
    mat4 worldMat = getWorldMatrix();
    vec4 pos = worldMat * vec4(vertex.positionOS, 1.0);
    vec3 positionWS = pos.xyz / pos.w;
    
    gl_Position = getPositionCS(positionWS);

    gl_Position = remapPositionZ(gl_Position);

    #ifdef FOG
        FogHandle(gl_Position.z);
    #endif
}

