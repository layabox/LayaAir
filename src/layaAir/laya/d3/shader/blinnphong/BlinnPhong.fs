#define SHADER_NAME BlinnPhongFS

#include "Camera.glsl";
#include "MeshFrag.glsl";

#include "BlinnPhongFrag.glsl";

void main()
{
    VertexParams params;
    getMeshVertexParams(params);

    BlinnPhongSurface surface;
    getBinnPhongSurfaceParams(surface, params);

    vec3 surfaceColor = vec3(0.0);

#if defined(LIGHTING)
    vec3 lightingColor = BlinnPhongLighting(surface);
    surfaceColor += lightingColor;
#endif // LIGHTING

    gl_FragColor = vec4(surfaceColor, 1.0);
}
