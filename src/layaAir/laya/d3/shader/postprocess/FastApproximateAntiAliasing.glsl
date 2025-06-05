#if !defined(FXAA_lib)
    #define FXAA_lib
#ifdef FXAA
    #define EDGE_THRESHOLD_MIN 0.0312
    #define EDGE_THRESHOLD_MAX 0.125
    #define QUALITY(q)	       ((q) < 5 ? 1.0 : ((q) > 5 ? ((q) < 10 ? 2.0 : ((q) < 11 ? 4.0 : 8.0)) : 1.5))
    #define ITERATIONS	       12
    #define SUBPIXEL_QUALITY   0.75

float rgb2luma(in vec3 rgb)
{
    return dot(rgb, vec3(0.299, 0.587, 0.114));
}

vec3 textureOffsetbyScreenSize(in vec2 uv, in vec2 offset, in vec2 inverseScreenSize)
{
    vec2 sampleruv = uv + inverseScreenSize * offset; // u_texturesize表示每个像素的偏移量
    return texture2DLodEXT(u_MainTex, sampleruv, 0.0).rgb; // 使用纹理lod函数来获取纹理颜色
}

vec4 FXAAMain(in vec2 texuv, in vec2 inverseScreenSize)
{
    vec4 mainColor = texture2DLodEXT(u_MainTex, texuv, 0.0);
    vec3 colorCenter = mainColor.rgb;
    // Luma at the current fragment
    float lumaCenter = rgb2luma(colorCenter);

    // Luma at the four direct neighbours of the current fragment.
    float lumaDown = rgb2luma(textureOffsetbyScreenSize(texuv, vec2(0, -1), inverseScreenSize));
    float lumaUp = rgb2luma(textureOffsetbyScreenSize(texuv, vec2(0, 1), inverseScreenSize));
    float lumaLeft = rgb2luma(textureOffsetbyScreenSize(texuv, vec2(-1, 0), inverseScreenSize));
    float lumaRight = rgb2luma(textureOffsetbyScreenSize(texuv, vec2(1, 0), inverseScreenSize));

    // Find the maximum and minimum luma around the current fragment.
    float lumaMin = min(lumaCenter, min(min(lumaDown, lumaUp), min(lumaLeft, lumaRight)));
    float lumaMax = max(lumaCenter, max(max(lumaDown, lumaUp), max(lumaLeft, lumaRight)));

    // Compute the delta.
    float lumaRange = lumaMax - lumaMin;

    // If the luma variation is lower that a threshold (or if we are in a really dark area), we are not on an edge, don't perform any AA.
    if (lumaRange < max(EDGE_THRESHOLD_MIN, lumaMax * EDGE_THRESHOLD_MAX))
	{
	    return mainColor;
	}

    // Query the 4 remaining corners lumas.
    float lumaDownLeft = rgb2luma(textureOffsetbyScreenSize(texuv, vec2(-1, -1), inverseScreenSize));
    float lumaUpRight = rgb2luma(textureOffsetbyScreenSize(texuv, vec2(1, 1), inverseScreenSize));
    float lumaUpLeft = rgb2luma(textureOffsetbyScreenSize(texuv, vec2(-1, 1), inverseScreenSize));
    float lumaDownRight = rgb2luma(textureOffsetbyScreenSize(texuv, vec2(1, -1), inverseScreenSize));

    // Combine the four edges lumas (using intermediary variables for future computations with the same values).
    float lumaDownUp = lumaDown + lumaUp;
    float lumaLeftRight = lumaLeft + lumaRight;

    // Same for corners
    float lumaLeftCorners = lumaDownLeft + lumaUpLeft;
    float lumaDownCorners = lumaDownLeft + lumaDownRight;
    float lumaRightCorners = lumaDownRight + lumaUpRight;
    float lumaUpCorners = lumaUpRight + lumaUpLeft;

    // Compute an estimation of the gradient along the horizontal and vertical axis.
    float edgeHorizontal = abs(-2.0 * lumaLeft + lumaLeftCorners) + abs(-2.0 * lumaCenter + lumaDownUp) * 2.0 + abs(-2.0 * lumaRight + lumaRightCorners);
    float edgeVertical = abs(-2.0 * lumaUp + lumaUpCorners) + abs(-2.0 * lumaCenter + lumaLeftRight) * 2.0 + abs(-2.0 * lumaDown + lumaDownCorners);

    // Is the local edge horizontal or vertical ?
    bool isHorizontal = (edgeHorizontal >= edgeVertical);

    // Choose the step size (one pixel) accordingly.
    float stepLength = isHorizontal ? inverseScreenSize.y : inverseScreenSize.x;

    // Select the two neighboring texels lumas in the opposite direction to the local edge.
    float luma1 = isHorizontal ? lumaDown : lumaLeft;
    float luma2 = isHorizontal ? lumaUp : lumaRight;
    // Compute gradients in this direction.
    float gradient1 = luma1 - lumaCenter;
    float gradient2 = luma2 - lumaCenter;

    // Which direction is the steepest ?
    bool is1Steepest = abs(gradient1) >= abs(gradient2);

    // Gradient in the corresponding direction, normalized.
    float gradientScaled = 0.25 * max(abs(gradient1), abs(gradient2));

    // Average luma in the correct direction.
    float lumaLocalAverage = 0.0;
    if (is1Steepest)
	{
	    // Switch the direction
	    stepLength = -stepLength;
	    lumaLocalAverage = 0.5 * (luma1 + lumaCenter);
	}
    else
	{
	    lumaLocalAverage = 0.5 * (luma2 + lumaCenter);
	}

    // Shift UV in the correct direction by half a pixel.
    vec2 currentUv = texuv;
    if (isHorizontal)
	{
	    currentUv.y += stepLength * 0.5;
	}
    else
	{
	    currentUv.x += stepLength * 0.5;
	}

    // Compute offset (for each iteration step) in the right direction.
    vec2 offset = isHorizontal ? vec2(inverseScreenSize.x, 0.0) : vec2(0.0, inverseScreenSize.y);
    // Compute UVs to explore on each side of the edge, orthogonally. The QUALITY allows us to step faster.
    vec2 uv1 = currentUv - offset * QUALITY(0);
    vec2 uv2 = currentUv + offset * QUALITY(0);

    // Read the lumas at both current extremities of the exploration segment, and compute the delta wrt to the local average luma.
    float lumaEnd1 = rgb2luma(textureOffsetbyScreenSize(uv1, vec2(0.0, 0.0), inverseScreenSize));
    float lumaEnd2 = rgb2luma(textureOffsetbyScreenSize(uv2, vec2(0.0, 0.0), inverseScreenSize));
    lumaEnd1 -= lumaLocalAverage;
    lumaEnd2 -= lumaLocalAverage;

    // If the luma deltas at the current extremities is larger than the local gradient, we have reached the side of the edge.
    bool reached1 = abs(lumaEnd1) >= gradientScaled;
    bool reached2 = abs(lumaEnd2) >= gradientScaled;
    bool reachedBoth = reached1 && reached2;

    // If the side is not reached, we continue to explore in this direction.
    if (!reached1)
	{
	    uv1 -= offset * QUALITY(1);
	}
    if (!reached2)
	{
	    uv2 += offset * QUALITY(1);
	}

    // If both sides have not been reached, continue to explore.
    if (!reachedBoth)
	{

	    for (int i = 2; i < ITERATIONS; i++)
		{
		    // If needed, read luma in 1st direction, compute delta.
		    if (!reached1)
			{
			    lumaEnd1 = rgb2luma(textureOffsetbyScreenSize(uv1, vec2(0.0, 0.0), inverseScreenSize));
			    lumaEnd1 = lumaEnd1 - lumaLocalAverage;
			}
		    // If needed, read luma in opposite direction, compute delta.
		    if (!reached2)
			{
			    lumaEnd2 = rgb2luma(textureOffsetbyScreenSize(uv2, vec2(0.0, 0.0), inverseScreenSize));
			    lumaEnd2 = lumaEnd2 - lumaLocalAverage;
			}
		    // If the luma deltas at the current extremities is larger than the local gradient, we have reached the side of the edge.
		    reached1 = abs(lumaEnd1) >= gradientScaled;
		    reached2 = abs(lumaEnd2) >= gradientScaled;
		    reachedBoth = reached1 && reached2;

		    // If the side is not reached, we continue to explore in this direction, with a variable quality.
		    if (!reached1)
			{
			    uv1 -= offset * QUALITY(i);
			}
		    if (!reached2)
			{
			    uv2 += offset * QUALITY(i);
			}

		    // If both sides have been reached, stop the exploration.
		    if (reachedBoth)
			{
			    break;
			}
		}
	}

    // Compute the distances to each side edge of the edge (!).
    float distance1 = isHorizontal ? (texuv.x - uv1.x) : (texuv.y - uv1.y);
    float distance2 = isHorizontal ? (uv2.x - texuv.x) : (uv2.y - texuv.y);

    // In which direction is the side of the edge closer ?
    bool isDirection1 = distance1 < distance2;
    float distanceFinal = min(distance1, distance2);

    // Thickness of the edge.
    float edgeThickness = (distance1 + distance2);

    // Is the luma at center smaller than the local average ?
    bool isLumaCenterSmaller = lumaCenter < lumaLocalAverage;

    // If the luma at center is smaller than at its neighbour, the delta luma at each end should be positive (same variation).
    bool correctVariation1 = (lumaEnd1 < 0.0) != isLumaCenterSmaller;
    bool correctVariation2 = (lumaEnd2 < 0.0) != isLumaCenterSmaller;

    // Only keep the result in the direction of the closer side of the edge.
    bool correctVariation = isDirection1 ? correctVariation1 : correctVariation2;

    // UV offset: read in the direction of the closest side of the edge.
    float pixelOffset = -distanceFinal / edgeThickness + 0.5;

    // If the luma variation is incorrect, do not offset.
    float finalOffset = correctVariation ? pixelOffset : 0.0;

    // Sub-pixel shifting
    // Full weighted average of the luma over the 3x3 neighborhood.
    float lumaAverage = (1.0 / 12.0) * (2.0 * (lumaDownUp + lumaLeftRight) + lumaLeftCorners + lumaRightCorners);
    // Ratio of the delta between the global average and the center luma, over the luma range in the 3x3 neighborhood.
    float subPixelOffset1 = clamp(abs(lumaAverage - lumaCenter) / lumaRange, 0.0, 1.0);
    float subPixelOffset2 = (-2.0 * subPixelOffset1 + 3.0) * subPixelOffset1 * subPixelOffset1;
    // Compute a sub-pixel offset based on this delta.
    float subPixelOffsetFinal = subPixelOffset2 * subPixelOffset2 * SUBPIXEL_QUALITY;

    // Pick the biggest of the two offsets.
    finalOffset = max(finalOffset, subPixelOffsetFinal);

    // Compute the final UV coordinates.
    vec2 finalUv = texuv;
    if (isHorizontal)
	{
	    finalUv.y += finalOffset * stepLength;
	}
    else
	{
	    finalUv.x += finalOffset * stepLength;
	}

    // Read the color at the new UV coordinates, and use it.
    return texture2DLodEXT(u_MainTex, finalUv, 0.0);
}
#endif//FXAA
#endif // Color_lib
