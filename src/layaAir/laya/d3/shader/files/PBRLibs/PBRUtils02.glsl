float PI = 3.14159265359;

#if defined(INDIRECTLIGHT)
	uniform vec4 u_SHAr;
	uniform vec4 u_SHAg;
	uniform vec4 u_SHAb;
	uniform vec4 u_SHBr;
	uniform vec4 u_SHBg;
	uniform vec4 u_SHBb;
	uniform vec4 u_SHC;
#endif


vec3 LinearToGammaSpace (vec3 linRGB)
{
    linRGB = max(linRGB, vec3(0.0, 0.0, 0.0));
    // An almost-perfect approximation from http://chilliant.blogspot.com.au/2012/08/srgb-approximations-for-hlsl.html?m=1
    return max(1.055 * pow(linRGB, vec3(0.416666667)) - 0.055, 0.0);   
}

vec3 LayaNormalizePerVertexNormal(vec3 n)
{
	#ifdef LOWPLAT
		return normalize(n);
	#else
		return n;
	#endif
}

//LayaSHEvalLinearL0L1
//LayaSHEvalLinearL2
//LinearToGammaSpace


#ifdef INDIRECTLIGHT
vec3 LayaSHEvalLinearL0L1(vec4 normal)
{
	vec3 x;
	//九个参数转换为矩阵
	// Linear (L1) + constant (L0) polynomial terms
	x.r = dot(u_SHAr, normal);
	x.g = dot(u_SHAg, normal);
	x.b = dot(u_SHAb, normal);
	return x;
}


vec3 LayaSHEvalLinearL2(vec4 normal)
{
	vec3 x1;
	vec3 x2;
	// 4 of the quadratic (L2) polynomials
	vec4 vB = normal.xyzz * normal.yzzx;
	x1.r = dot(u_SHBr, vB);
	x1.g = dot(u_SHBg, vB);
	x1.b = dot(u_SHBb, vB);

	// Final (5th) quadratic (L2) polynomial
	float vC = normal.x*normal.x - normal.y*normal.y;
	x2 = u_SHC.rgb * vC;

	return x1 + x2;
}

half3 LayaShadeSH9(half4 normal)
{
	// Linear + constant polynomial terms
	//线性+常量多项式项
	half3 res = LayaSHEvalLinearL0L1(normal);

	// Quadratic polynomials
	res += LayaSHEvalLinearL2(normal);

//#   ifdef UNITY_COLORSPACE_GAMMA
	//需要转换到Gamma空间
	res = LinearToGammaSpace(res);
//#   endif
	return res;
}


vec3 LayaShadeSHPerVertex(vec3 normal)
{
	vec3 ambient;
	ambient= max(half3(0, 0, 0), LayaShadeSH9(half4(normal, 1.0)));
	return ambient;
}

vec3 LayaVertexGI(vec3 normalWorld)
{
	vec3 ambientDiffuse;
	#if defined(INDIRECTLIGHT)&&defined(LOWPLAT)
		ambientDiffuse = LayaShadeSHPerVertex(normalWorld);
	#endif
	
	return ambientDiffuse;
}
#endif




