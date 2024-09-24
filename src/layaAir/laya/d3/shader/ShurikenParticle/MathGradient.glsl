#ifdef GRAPHICS_API_GLES3
vec2 getVec2ValueByIndexFromeVec4Array(in vec4 gradientNumbers[2],in int vec2Index){
	int v4Index = int(floor(float(vec2Index)/2.0));
	int offset =(vec2Index- v4Index*2)*2;
	return vec2(gradientNumbers[v4Index][offset],gradientNumbers[v4Index][offset+1]);
}

vec2 getVec2ValueByIndexFromeVec4Array_COLORCOUNT(in vec4 gradientNumbers[COLORCOUNT_HALF],in int vec2Index){
	int v4Index = int(floor(float(vec2Index)/2.0));
	int offset =(vec2Index- v4Index*2)*2;
	vec4 v4Value = gradientNumbers[v4Index];
	return vec2(v4Value[offset],v4Value[offset+1]);
}
#endif

float getCurValueFromGradientFloat(in vec4 gradientNumbers[2], in float normalizedAge)
{
    float curValue;
	#ifndef GRAPHICS_API_GLES3
		vec2 gradientNumbersVec2[4];
		gradientNumbersVec2[0] = gradientNumbers[0].xy;
		gradientNumbersVec2[1] = gradientNumbers[0].zw;
		gradientNumbersVec2[2] = gradientNumbers[1].xy;
		gradientNumbersVec2[3] = gradientNumbers[1].zw;

	#endif
    for (int i = 1; i < 4; i++)
	{
	    vec2 gradientNumber;
		#ifdef GRAPHICS_API_GLES3
			gradientNumber = getVec2ValueByIndexFromeVec4Array(gradientNumbers,i);
		#else
			gradientNumber = gradientNumbersVec2[i];
		#endif
	    float key = gradientNumber.x;
		curValue = gradientNumber.y;
	    if (key >= normalizedAge)
		{
			vec2 lastGradientNumber;
			#ifdef GRAPHICS_API_GLES3
				lastGradientNumber = getVec2ValueByIndexFromeVec4Array(gradientNumbers,i - 1);
			#else
				lastGradientNumber = gradientNumbersVec2[i-1];
			#endif

		    float lastKey = lastGradientNumber.x;
		    float age = max((normalizedAge - lastKey), 0.0) / (key - lastKey);
		    curValue = mix(lastGradientNumber.y, gradientNumber.y, age);
		    break;
		}
	}
    return curValue;
}

float getTotalValueFromGradientFloat(in vec4 gradientNumbers[2],
    in float normalizedAge)
{
	#ifndef GRAPHICS_API_GLES3
		vec2 gradientNumbersVec2[4];
		gradientNumbersVec2[0] = gradientNumbers[0].xy;
		gradientNumbersVec2[1] = gradientNumbers[0].zw;
		gradientNumbersVec2[2] = gradientNumbers[1].xy;
		gradientNumbersVec2[3] = gradientNumbers[1].zw;
	#endif
	
	#ifdef GRAPHICS_API_GLES3
		vec2 val = getVec2ValueByIndexFromeVec4Array(gradientNumbers,0);	
	#else
		vec2 val = gradientNumbersVec2[0];
	#endif

	float keyTime = min(normalizedAge,val.x);
    float totalValue = keyTime * val.y;

	float lastSpeed = 0.;
    for (int i = 1; i < 4; i++)
	{
		#ifdef GRAPHICS_API_GLES3
			vec2 gradientNumber= getVec2ValueByIndexFromeVec4Array(gradientNumbers,i);
			vec2 lastGradientNumber = getVec2ValueByIndexFromeVec4Array(gradientNumbers,i - 1);
		#else
			vec2 gradientNumber = gradientNumbersVec2[i];
			vec2 lastGradientNumber =gradientNumbersVec2[i - 1];
		#endif

	    float key = gradientNumber.x;
		float lastValue = lastGradientNumber.y;

	    if (key >= normalizedAge)
		{
		    float lastKey = lastGradientNumber.x;
			float time =  max((normalizedAge - lastKey), 0.);
			float age = time / (key-lastKey);
			lastSpeed = mix(lastValue, gradientNumber.y,age);
		    totalValue += (lastValue + mix(lastValue, gradientNumber.y, age)) / 2.0 * a_ShapePositionStartLifeTime.w * time;
		    keyTime = normalizedAge;
			break;
		}
	    else if(key > keyTime)
		{
		    totalValue += (lastValue + gradientNumber.y) / 2.0 * a_ShapePositionStartLifeTime.w * (key - lastGradientNumber.x);
			keyTime = key;
			lastSpeed = gradientNumber.y;
		}
	}
    return totalValue + max(normalizedAge-keyTime, 0.) * lastSpeed * a_ShapePositionStartLifeTime.w;
}

vec4 getColorFromGradient(in vec4 gradientAlphas[COLORCOUNT_HALF],
    in vec4 gradientColors[COLORCOUNT],
    in float normalizedAge, in vec4 keyRanges)
{
	#ifndef GRAPHICS_API_GLES3
		#ifdef COLORKEYCOUNT_8
			vec2 resoult[8];
			resoult[0] = gradientAlphas[0].xy;
			resoult[1] = gradientAlphas[0].zw;
			resoult[2] = gradientAlphas[1].xy;
			resoult[3] = gradientAlphas[1].zw;
			resoult[4] = gradientAlphas[2].xy;
			resoult[5] = gradientAlphas[2].zw;
			resoult[6] = gradientAlphas[3].xy;
			resoult[7] = gradientAlphas[3].zw;
		#else
			vec2 resoult[4];
			resoult[0] = gradientAlphas[0].xy;
			resoult[1] = gradientAlphas[0].zw;
			resoult[2] = gradientAlphas[1].xy;
			resoult[3] = gradientAlphas[1].zw;
		#endif
	#endif

    float alphaAge = clamp(normalizedAge, keyRanges.z, keyRanges.w);
    vec4 overTimeColor;
    for (int i = 1; i < COLORCOUNT; i++)
	{
		#ifdef GRAPHICS_API_GLES3
	    	vec2 gradientAlpha = getVec2ValueByIndexFromeVec4Array_COLORCOUNT(gradientAlphas,i);
		#else
			vec2 gradientAlpha = resoult[i];
		#endif
	    float alphaKey = gradientAlpha.x;
	    if (alphaKey >= alphaAge)
		{

			#ifdef GRAPHICS_API_GLES3
		    	vec2 lastGradientAlpha =getVec2ValueByIndexFromeVec4Array_COLORCOUNT(gradientAlphas,i - 1);
			#else
				vec2 lastGradientAlpha = resoult[i - 1];
			#endif

		    float lastAlphaKey = lastGradientAlpha.x;
		    float age = clamp((alphaAge - lastAlphaKey) / (alphaKey - lastAlphaKey), 0.0, 1.0);
		    overTimeColor.a = mix(lastGradientAlpha.y, gradientAlpha.y, age);
		    break;
		}
	}

    float colorAge = clamp(normalizedAge, keyRanges.x, keyRanges.y);
    for (int i = 1; i < COLORCOUNT; i++)
	{
	    vec4 gradientColor = gradientColors[i];
	    float colorKey = gradientColor.x;
	    if (colorKey >= colorAge)
		{
		    vec4 lastGradientColor = gradientColors[i - 1];
		    float lastColorKey = lastGradientColor.x;
		    float age = (colorAge - lastColorKey) / (colorKey - lastColorKey);
		    overTimeColor.rgb = mix(gradientColors[i - 1].yzw, gradientColor.yzw, age);
		    break;
		}
	}
    return overTimeColor;
}

float getFrameFromGradient(in vec4 gradientFrames[2], in float normalizedAge)
{
	#ifndef GRAPHICS_API_GLES3
		vec2 gradientNumbersVec2[4];
		gradientNumbersVec2[0] = gradientFrames[0].xy;
		gradientNumbersVec2[1] = gradientFrames[0].zw;
		gradientNumbersVec2[2] = gradientFrames[1].xy;
		gradientNumbersVec2[3] = gradientFrames[1].zw;
	#endif
    float overTimeFrame;
    for (int i = 1; i < 4; i++)
	{
		#ifdef GRAPHICS_API_GLES3
	    	vec2 gradientFrame = getVec2ValueByIndexFromeVec4Array(gradientFrames,i);
		#else
			vec2 gradientFrame = gradientNumbersVec2[i];
		#endif
	    float key = gradientFrame.x;
		overTimeFrame = gradientFrame.y;
	    if (key >= normalizedAge)
		{
			#ifdef GRAPHICS_API_GLES3
				vec2 lastGradientFrame = getVec2ValueByIndexFromeVec4Array(gradientFrames,i-1);
			#else
				vec2 lastGradientFrame = gradientNumbersVec2[i-1];
			#endif
		    float lastKey = lastGradientFrame.x;
			float age = max((normalizedAge-lastKey), 0.)/(key-lastKey);
		    overTimeFrame = mix(lastGradientFrame.y, gradientFrame.y, age);
		    break;
		}
	}
    return floor(overTimeFrame);
}
