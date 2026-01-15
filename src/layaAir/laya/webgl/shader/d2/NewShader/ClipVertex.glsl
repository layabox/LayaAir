#if !defined(ClipVertex_lib)
    #define ClipVertex_lib

#ifdef MATERIALCLIP
    uniform vec4 u_mClipMatDir;
    uniform vec4 u_mClipMatPos;
#endif

varying vec2 v_cliped;

#ifdef UNIFORMCLIP
    uniform vec4 u_clipMatDir;
    uniform vec4 u_clipMatPos;// 这个是全局的，不用再应用矩阵了。
#endif

void clip(inout vec2 globalPos){
    
#ifdef UNIFORMCLIP
    // 根据视口调整位置
    vec4 clipMatDir;
    vec4 clipMatPos;
    #ifdef MATERIALCLIP
        clipMatDir = u_mClipMatDir;
        clipMatPos = u_mClipMatPos;

        float tx = clipMatPos.z;
        float ty = clipMatPos.w;
        float cmaxx = tx + clipMatDir.x;
        float cmaxy = ty + clipMatDir.w;
        //计算交集
        float parentMinX = u_clipMatPos.x;
        float parentMinY = u_clipMatPos.y;
        float offsetx = u_clipMatPos.z - parentMinX;
        float offsety = u_clipMatPos.w - parentMinY;
        float parentMaxX = parentMinX + u_clipMatDir.x;
        float parentMaxY = parentMinY + u_clipMatDir.w;

        if (tx < parentMinX) {
            clipMatDir.x -= (parentMinX - tx);
            tx = clipMatPos.x = parentMinX;
        }

        if (cmaxx > parentMaxX) {
            clipMatDir.x -= (cmaxx - parentMaxX);
        }

        if (ty < parentMinY) {
            clipMatDir.w -= (parentMinY - ty);
            ty = clipMatPos.y = parentMinY;
            // offsety += parentMinY - cm.ty;
        }
        
        if (cmaxy > parentMaxY) {
            clipMatDir.w -= (cmaxy - parentMaxY);
        }

        clipMatPos.zw = vec2(tx + offsetx,ty + offsety);
    #else
        clipMatDir = u_clipMatDir;
        clipMatPos = u_clipMatPos;
    #endif

    vec2 cliped;
    float clipw = length(clipMatDir.xy);
    float cliph = length(clipMatDir.zw);
    vec2 clippos = globalPos - clipMatPos.xy;	//pos已经应用矩阵了，为了减的有意义，clip的位置也要缩放
    if(clipw>20000. && cliph>20000.)
        cliped = vec2(0.5,0.5);
    else {
        //clipdir是带缩放的方向，由于上面clippos是在缩放后的空间计算的，所以需要把方向先normalize一下
        cliped =vec2( dot(clippos,clipMatDir.xy)/clipw/clipw, dot(clippos,clipMatDir.zw)/cliph/cliph);
    }
    
    globalPos = clippos + clipMatPos.zw;
    v_cliped = cliped;
#endif
}

#endif  //ClipVertex_lib