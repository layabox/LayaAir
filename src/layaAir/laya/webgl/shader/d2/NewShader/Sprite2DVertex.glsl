#include "Sprite2DShaderInfo.glsl";

#ifdef CAMERA2D
 uniform mat3 u_view2D;
#endif

#ifdef WORLDMAT
    uniform mat4 u_mmat;
    vec4 transedPos;
#endif

#ifdef PRIMITIVEMESH
    uniform vec4 u_clipMatDir;
    uniform vec2 u_clipMatPos;// 这个是全局的，不用再应用矩阵了。
    uniform vec2 u_size;
    uniform float u_VertAlpha;
    varying vec2 v_cliped;
    varying vec4 v_color;
    // attribute vec4 a_position;
    // attribute vec4 a_attribColor;

    void getVertexInfo(inout vertexInfo info){
        info.color = a_attribColor;
        info.color.a*=u_VertAlpha;
        float clipw = length(u_clipMatDir.xy);
        float cliph = length(u_clipMatDir.zw);
        #ifdef WORLDMAT
            vec2 clippos = transedPos.xy - u_clipMatPos.xy;
        #else
        vec2 clippos = a_position.xy - u_clipMatPos.xy;	//pos已经应用矩阵了，为了减的有意义，clip的位置也要缩放
        #endif

        if(clipw>20000. && cliph>20000.)
            info.cliped = vec2(0.5,0.5);
        else {
            //clipdir是带缩放的方向，由于上面clippos是在缩放后的空间计算的，所以需要把方向先normalize一下
            info.cliped =vec2( dot(clippos,u_clipMatDir.xy)/clipw/clipw, dot(clippos,u_clipMatDir.zw)/cliph/cliph);
        }
    }

    void getPosition(inout vec4 pos){
        pos = vec4(a_position.xy,0.,1.);
        #ifdef WORLDMAT
            pos = u_mmat*pos;
            transedPos=pos;
  			#ifdef CAMERA2D
            	pos.xy = (u_view2D *vec3(pos.x,pos.y,1.0)).xy+u_size/2.;
        	#endif  
            pos = vec4((pos.x/u_size.x-0.5)*2.0,(0.5-pos.y/u_size.y)*2.0,pos.z,1.0);
        #else
  			#ifdef CAMERA2D
           	 pos.xy = (u_view2D *vec3(pos.x,pos.y,1.0)).xy+u_size/2.;
       		#endif  
            pos = vec4((pos.x/u_size.x-0.5)*2.0,(0.5-pos.y/u_size.y)*2.0,pos.z,1.0);
        #endif

        #ifdef INVERTY
            pos.y = -pos.y;
        #endif
    }
#endif

#ifdef TEXTUREVS
    uniform vec4 u_clipMatDir;
    uniform vec2 u_clipMatPos;// 这个是全局的，不用再应用矩阵了。
    uniform vec2 u_size;
    uniform float u_VertAlpha;
    varying vec2 v_cliped;
    varying vec4 v_color;
	//texture和fillrect使用的。
    // attribute vec4 a_posuv;
    // attribute vec4 a_attribColor;
    // attribute vec4 a_attribFlags;
    #ifdef MVP3D
        uniform mat4 u_MvpMatrix;
    #endif

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

       
    }

    void getPosition(inout vec4 glPosition){
        vec4 pos = vec4(a_posuv.xy,0.,1.);
        #ifdef WORLDMAT
            pos= u_mmat * pos;
            transedPos=pos;//vec4(pos.x,pos.y,0.0,1.0);
        #endif

        #ifdef CAMERA2D
            pos.xy = (u_view2D *vec3(pos.x,pos.y,1.0)).xy+u_size/2.;
        #endif  
        
        //clip
    	float clipw = length(u_clipMatDir.xy);
    	float cliph = length(u_clipMatDir.zw);
	    vec2 clpos = u_clipMatPos.xy;
        #ifdef WORLDMAT
            vec2 clippos = transedPos.xy - clpos;
        #else
        vec2 clippos = pos.xy- clpos;	//pos已经应用矩阵了，为了减的有意义，clip的位置也要缩放
        #endif
        if(clipw>20000. && cliph>20000.)
            v_cliped = vec2(0.5,0.5);
        else {
            //转成0到1之间。/clipw/clipw 表示clippos与normalize之后的clip朝向点积之后，再除以clipw
            v_cliped = vec2( dot(clippos,u_clipMatDir.xy)/clipw/clipw, dot(clippos,u_clipMatDir.zw)/cliph/cliph);
        }
        
        vec4 pos1 = vec4((pos.x/u_size.x-0.5)*2.0,(0.5-pos.y/u_size.y)*2.0,0.,1.0);
        
        
        #ifdef MVP3D
            glPosition = u_MvpMatrix * pos1;
        #else
            glPosition = pos1;
        #endif
        
        #ifdef INVERTY
            glPosition.y = -glPosition.y;
        #endif

      
    }
#endif

#ifdef BASERENDER2D
    varying vec2 v_texcoord;
    varying vec4 v_color;
    varying vec2 v_cliped;

    uniform vec3 u_NMatrix_0;
    uniform vec3 u_NMatrix_1;
    uniform vec2 u_baseRenderSize2D;
    uniform vec4 u_baseRenderColor;
   
    uniform vec4 u_clipMatDir;
    uniform vec2 u_clipMatPos;// 这个是全局的，不用再应用矩阵了。
    
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

    void transfrom(vec2 pos,vec3 xDir,vec3 yDir,out vec2 outPos){
        outPos.x=xDir.x*pos.x+xDir.y*pos.y+xDir.z;
        outPos.y=yDir.x*pos.x+yDir.y*pos.y+yDir.z;
    }

    void getGlobalPos(in vec2 localPos,out vec2 globalPos){
        transfrom(localPos,u_NMatrix_0,u_NMatrix_1,globalPos);
    }

    void getViewPos(in vec2 globalPos,out vec2 viewPos){
        #ifdef CAMERA2D
            viewPos.xy = (u_view2D *vec3(globalPos,1.0)).xy+u_baseRenderSize2D/2.;
        #else
            viewPos.xy = globalPos;
        #endif
    }

    void getVertexInfo(inout vertexInfo info){
        info.pos = a_position.xy;
        info.color = vec4(1.0,1.0,1.0,1.0);
        #ifdef COLOR
            info.color = a_color;
        #endif
        info.color*=u_baseRenderColor;
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

    vec2 getClipedInfo(vec2 screenPos){
        vec2 cliped;
        float clipw = length(u_clipMatDir.xy);
        float cliph = length(u_clipMatDir.zw);
        vec2 clippos = screenPos - u_clipMatPos.xy;	//pos已经应用矩阵了，为了减的有意义，clip的位置也要缩放
        if(clipw>20000. && cliph>20000.)
            cliped = vec2(0.5,0.5);
        else {
            //clipdir是带缩放的方向，由于上面clippos是在缩放后的空间计算的，所以需要把方向先normalize一下
            cliped =vec2( dot(clippos,u_clipMatDir.xy)/clipw/clipw, dot(clippos,u_clipMatDir.zw)/cliph/cliph);
        }
        return cliped;
    }

    void getProjectPos(in vec2 viewPos,out vec4 projectPos){
        projectPos= vec4((viewPos.x/u_baseRenderSize2D.x-0.5)*2.0,(0.5-viewPos.y/u_baseRenderSize2D.y)*2.0,0.,1.0);
        #ifdef INVERTY
            projectPos.y = -projectPos.y;
        #endif
    }

    void getPosition(inout vec4 pos){
        vec2 globalPos;
        getGlobalPos(a_position.xy,globalPos);
        vec2 viewPos;
        getViewPos(globalPos,viewPos);
        v_cliped = getClipedInfo(viewPos);
        getProjectPos(viewPos,pos);
    }
#endif
