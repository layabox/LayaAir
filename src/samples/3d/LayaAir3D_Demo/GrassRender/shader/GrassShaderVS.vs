#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif

#include "Camera.glsl";
#include "VertexCommon.glsl";
#include "Scene.glsl";

varying vec4 v_Color;

void main() {
    // Vertex vertex;
    // getVertexParams(vertex);
    
    // uniform
    vec3 baseColor = vec3(0.1, 0.5, 0.1);
    float boundSize = 70.71067811865476;

    // const
    float minHeight = 2.0;
    float maxHeight = 5.0;


    vec4 aposition = getVertexPosition();
    vec3 perGrassPivotPosWS = a_privotPosition;
    float perGrassHeight = mix(minHeight, maxHeight, (sin(perGrassPivotPosWS.x * 23.4643 + perGrassPivotPosWS.z) * 0.45 + 0.55)) * u_grassHeight;


    vec3 cameraUpWS = normalize(u_CameraUp);
    vec3 cameraForwardWS = normalize(u_CameraDirection);
    vec3 cameraRightWS = normalize(cross(cameraForwardWS, cameraUpWS));

    //BlillBoard x
    vec3 positionOS = aposition.x * cameraRightWS * u_grassWidth * (sin(perGrassPivotPosWS.x * 95.4643 + perGrassPivotPosWS.z) * 0.45 + 0.55);
    //BillBoard y
    positionOS += aposition.y * cameraUpWS;

    // 每根草 高度
    positionOS.y *= perGrassHeight;


    float wind = 0.0;
    wind += (sin(u_Time * u_WindAFrequency + perGrassPivotPosWS.x * u_WindATiling.x + perGrassPivotPosWS.z * u_WindATiling.y)*u_WindAWrap.x+u_WindAWrap.y) * u_WindAIntensity; //windA
    wind += (sin(u_Time * u_WindBFrequency + perGrassPivotPosWS.x * u_WindBTiling.x + perGrassPivotPosWS.z * u_WindBTiling.y)*u_WindBWrap.x+u_WindBWrap.y) * u_WindBIntensity; //windB
    wind += (sin(u_Time * u_WindCFrequency + perGrassPivotPosWS.x * u_WindCTiling.x + perGrassPivotPosWS.z * u_WindCTiling.y)*u_WindCWrap.x+u_WindCWrap.y) * u_WindCIntensity; //windC
    wind *= a_Position.y; //wind only affect top region, don't affect root region
    vec3 windOffset = cameraRightWS * wind; //swing using billboard left right direction
    //风的影响
    positionOS += windOffset;


    vec3 viewWS = u_CameraPos - perGrassPivotPosWS;
    float viewWSLength = length(viewWS);
    positionOS += cameraRightWS * aposition.x * max(0.0, viewWSLength * 0.02225);

    vec3 positionWS = positionOS + perGrassPivotPosWS;
    vec4 position = u_ViewProjection * vec4(positionWS, 1.0);


    //reset Texture 
    vec2 uv = (positionWS.xz-u_BoundSize.xy)/u_BoundSize.zw;
    baseColor = texture2D(u_albedoTexture, uv).rgb;
    
    vec3 albedo = mix(u_GroundColor,baseColor,a_Position.y);

    v_Color = vec4(albedo, 1.0);

    gl_Position = position;
    gl_Position=remapPositionZ(gl_Position);
}