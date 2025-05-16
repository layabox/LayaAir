
#ifdef CAMERA2D
 uniform mat3 u_view2D;
#endif

#ifdef WORLDMAT
    uniform mat4 u_mmat;
    vec4 transedPos;
#endif

#ifdef RENDERTEXTURE
    uniform vec3 u_InvertMat_0;
    uniform vec3 u_InvertMat_1;
#endif

#ifdef VERTEX_SIZE
    uniform vec4 u_vertexSize;
#endif

uniform vec3 u_NMatrix_0;
uniform vec3 u_NMatrix_1;

uniform vec2 u_size;
#ifdef MATERIALCLIP
    uniform vec4 u_mClipMatDir;
    uniform vec4 u_mClipMatPos;
#else
    uniform vec4 u_clipMatDir;
    uniform vec4 u_clipMatPos;// 这个是全局的，不用再应用矩阵了。
#endif
// uniform vec2 u_pivotPos;
varying vec2 v_cliped;
varying vec4 v_color;

void transfrom(vec2 pos,vec3 xDir,vec3 yDir,out vec2 outPos){
    // float x = pos.x - u_pivotPos.x;
    // float y = pos.y - u_pivotPos.y;
    // outPos.x= xDir.x*x+xDir.y*y + u_pivotPos.x +xDir.z;
    // outPos.y= yDir.x*x+yDir.y*y + u_pivotPos.y +yDir.z;
    outPos.x=xDir.x*pos.x+xDir.y*pos.y +xDir.z;
    outPos.y=yDir.x*pos.x+yDir.y*pos.y +yDir.z;
    // outPos.x=xDir.x*x+xDir.y*y + u_pivotPos.x +xDir.z;
    // outPos.y=yDir.x*x+yDir.y*y + u_pivotPos.y +yDir.z;
}

void clip(inout vec2 globalPos){
    vec2 tempPos = vec2(globalPos.x,globalPos.y);
    // 根据视口调整位置
    vec4 clipMatDir;
    vec4 clipMatPos;
    #ifdef MATERIALCLIP
        clipMatDir = u_mClipMatDir;
        clipMatPos = u_mClipMatPos;
    #else
        clipMatDir = u_clipMatDir;
        clipMatPos = u_clipMatPos;
    #endif

    vec2 cliped;
    float clipw = length(clipMatDir.xy);
    float cliph = length(clipMatDir.zw);
    vec2 clippos = tempPos - clipMatPos.xy;	//pos已经应用矩阵了，为了减的有意义，clip的位置也要缩放
    if(clipw>20000. && cliph>20000.)
        cliped = vec2(0.5,0.5);
    else {
        //clipdir是带缩放的方向，由于上面clippos是在缩放后的空间计算的，所以需要把方向先normalize一下
        cliped =vec2( dot(clippos,clipMatDir.xy)/clipw/clipw, dot(clippos,clipMatDir.zw)/cliph/cliph);
    }
    tempPos.xy = clippos + clipMatPos.zw;

    #ifdef RENDERTEXTURE
        transfrom(tempPos , u_InvertMat_0, u_InvertMat_1, globalPos);
    #else
        globalPos = tempPos;
    #endif

    v_cliped = cliped;
}

void getGlobalPos(in vec2 localPos,out vec2 globalPos){
    transfrom(localPos,u_NMatrix_0,u_NMatrix_1,globalPos);
}

void getProjectPos(in vec2 viewPos,out vec4 projectPos){
    projectPos= vec4((viewPos.x/u_size.x-0.5)*2.0,(0.5-viewPos.y/u_size.y)*2.0,0.,1.0);
    #ifdef INVERTY
        projectPos.y = -projectPos.y;
    #endif
}

void getViewPos(in vec2 globalPos,out vec2 viewPos){
    #ifdef CAMERA2D
        viewPos.xy = (u_view2D *vec3(globalPos,1.0)).xy+u_size/2.;
    #else
        viewPos.xy = globalPos;
    #endif
}

#ifdef TEXTUREVS
    
    struct vertexInfo {
        vec2 pos;
        vec4 color;
        vec2 cliped;
        vec4 texcoordAlpha;
        float useTex;
    };

    uniform float u_VertAlpha;
	//texture和fillrect使用的。
    // attribute vec4 a_posuv;
    // attribute vec4 a_attribColor;
    // attribute vec4 a_attribFlags;

    varying vec4 v_texcoordAlpha;
    varying float v_useTex;

    void getVertexInfo(inout vertexInfo info){
       	//texcoordAlpha
        info.texcoordAlpha.xy = a_posuv.zw;
        //color
        info.color = a_attribColor;
        info.color.a*=u_VertAlpha;
	    info.color.xyz*= info.color.w;//反正后面也要预乘
        //useTex
        info.useTex = a_attribFlags.r;
        vec2 pos;
        #ifdef VERTEX_SIZE
            pos = (a_posuv.xy*u_vertexSize.zw ) +u_vertexSize.xy;//xy偏移，zw 顶点扩展宽高
        #else
            pos = a_posuv.xy;
        #endif
        info.pos = pos;
    }

    vec4 getPosition(in vec2 positionOS){
        vec2 globalPos;
        #ifdef VERTEX_SIZE
            getGlobalPos(positionOS , globalPos);
        #else
            globalPos = positionOS;
        #endif
       
        clip(globalPos);

        vec2 viewPos;
        getViewPos(globalPos,viewPos);
        vec4 pos;
        getProjectPos(viewPos,pos);
        return pos;
    }

#endif

#ifdef BASERENDER2D
    varying vec2 v_texcoord;

    uniform vec4 u_baseRenderColor;
    
    struct vertexInfo {
        vec4 color;
        vec2 uv;
        vec2 pos;
        vec2 lightUV;
    };

    #ifdef LIGHT2D_ENABLE
        varying vec2 v_lightUV; //光影图采样坐标
        uniform vec4 u_LightAndShadow2DParam; //光影图尺寸和位置
        uniform vec3 u_LightAndShadow2DSceneInv0; //scene逆矩阵
        uniform vec3 u_LightAndShadow2DSceneInv1;
        uniform vec3 u_LightAndShadow2DStageMat0; //stage矩阵
        uniform vec3 u_LightAndShadow2DStageMat1;

        void lightAndShadow(vertexInfo info) {
            v_lightUV = info.lightUV;
        }

        void invertMat(inout vec3 v1, inout vec3 v2) {
            float a1 = v1.x;
            float b1 = v2.x;
            float c1 = v1.y;
            float d1 = v2.y;
            float tx1 = v1.z;
            float ty1 = v2.z;
            float n = a1 * d1 - b1 * c1;
            v1.x = d1 / n;
            v2.x = -b1 / n;
            v1.y = -c1 / n;
            v2.y = a1 / n;
            v1.z = (c1 * ty1 - d1 * tx1) / n;
            v2.z = -(a1 * ty1 - b1 * tx1) / n;
        }
    #endif

    vec4 linearToGamma(in vec4 value)
    {
        return vec4(mix(pow(value.rgb, vec3(0.41666)) * 1.055 - vec3(0.055), value.rgb * 12.92, vec3(lessThanEqual(value.rgb, vec3(0.0031308)))),value.a);

        // return pow(value, vec3(1.0 / 2.2));
        // return pow(value, vec3(0.455));
    }

    void getVertexInfo(inout vertexInfo info){
        info.pos = a_position.xy;
        info.color = vec4(1.0,1.0,1.0,1.0);
        #ifdef COLOR
            info.color = a_color;
            info.color.rgb *=a_color.a;
        #endif
        info.color*= linearToGamma(u_baseRenderColor);
        #ifdef UV
            info.uv = a_uv;
        #endif

        #ifdef LIGHT2D_ENABLE
            vec2 global;
            vec3 stageInv0 = vec3(u_LightAndShadow2DStageMat0.x, u_LightAndShadow2DStageMat0.y, u_LightAndShadow2DStageMat0.z);
            vec3 stageInv1 = vec3(u_LightAndShadow2DStageMat1.x, u_LightAndShadow2DStageMat1.y, u_LightAndShadow2DStageMat1.z);
            invertMat(stageInv0, stageInv1); //获取stage的逆矩阵
            getGlobalPos(info.pos, global); //先获得完整世界变换的位置
            transfrom(global, stageInv0, stageInv1, global); //先去除stage变换
            transfrom(global, u_LightAndShadow2DSceneInv0, u_LightAndShadow2DSceneInv1, global); //再去除scene变换
            transfrom(global, u_LightAndShadow2DStageMat0, u_LightAndShadow2DStageMat1, global); //再恢复stage变换
            //现在global中的值就和生成光影图时的值一致了，基于这个值生成光影图采样uv坐标
            info.lightUV.x = (global.x - u_LightAndShadow2DParam.x) / u_LightAndShadow2DParam.z;
            info.lightUV.y = 1.0 - (global.y - u_LightAndShadow2DParam.y) / u_LightAndShadow2DParam.w;
        #endif
    }
    
    vec4 getPosition(in vec2 positionOS){
        vec2 globalPos;
        getGlobalPos(positionOS,globalPos);
        clip(globalPos);

        vec2 viewPos;
        getViewPos(globalPos,viewPos);
        vec4 pos;
        getProjectPos(viewPos,pos);
        return pos;
    }
#endif
