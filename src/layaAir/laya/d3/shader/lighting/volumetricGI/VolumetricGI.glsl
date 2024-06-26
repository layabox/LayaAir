// https://jcgt.org/published/0008/02/01/

#if !defined(VolumetricGI_lib)
    #define VolumetricGI_lib

    #include "Oct.glsl";
    #include "GridHelpers.glsl";

struct VolumetricGI {
    vec3 probeCounts;
    vec3 probeStep;
    vec3 probeStartPosition;
    // float irradianceTexels;
    // float distanceTexels;
    // float normalBias;
    // float viewBias;
    vec4 probeParams; // x: irradianceTexels, y: distanceTexels, z: normalBias, w: viewBias
};

uniform VolumetricGI u_VolumetricGI;

uniform sampler2D u_ProbeIrradiance;
uniform sampler2D u_ProbeDistance;

vec2 porbeGridCoordToTextureGridCoord(in ivec3 porbeGridCoord,
    in ivec3 probeCounts,
    in vec2 textureGridSize)
{
    int probeIndex = gridCoordToProbeIndex(porbeGridCoord, probeCounts);
    ivec2 index;
    index.x = imod(probeIndex, (probeCounts.x * probeCounts.y));
    index.y = probeIndex / (probeCounts.x * probeCounts.y);

    vec2 textureGridCoord = vec2(index);
    textureGridCoord.y = textureGridCoord.y;
    return textureGridCoord;
}

vec3 VolumetricGISurfaceBias(in vec3 surfaceNormal, in vec3 cameraDirection)
{
    return surfaceNormal * u_VolumetricGI.probeParams.z + cameraDirection * u_VolumetricGI.probeParams.w;
}

vec3 VolumetricGIVolumeIrradiance(in vec3 worldPosition, in vec3 surfaceBias,
    in vec3 direction)
{
    // direction *= vec3(-1.0, 1.0, 1.0);
    ivec3 porbeCounts = ivec3(u_VolumetricGI.probeCounts);
    vec3 probeStep = u_VolumetricGI.probeStep;
    vec3 probeStartPosition = u_VolumetricGI.probeStartPosition;
    vec2 volumeCounts = vec2(porbeCounts.x * porbeCounts.y, porbeCounts.z);
    vec4 irradianceTexels = vec4(u_VolumetricGI.probeParams.x, u_VolumetricGI.probeParams.x, 1.0 / u_VolumetricGI.probeParams.x, 1.0 / u_VolumetricGI.probeParams.x);
    vec4 distanceTexels = vec4(u_VolumetricGI.probeParams.y, u_VolumetricGI.probeParams.y, 1.0 / u_VolumetricGI.probeParams.y, 1.0 / u_VolumetricGI.probeParams.y);

    ivec3 maxGridCoord = porbeCounts - ivec3(1);

    vec3 irradiance = vec3(0.0);
    float accumulatedWeights = 0.0;

    // Bias the world space position
    vec3 biasedWorldPosition = worldPosition + surfaceBias;

    // Get the 3D grid coordinates of the probe nearest the biased world position
    // (i.e. the "base" probe)
    ivec3 baseProbeCoords = baseGridCoord(biasedWorldPosition, probeStep,
	probeStartPosition, porbeCounts);

    // Get the world-space position of the base probe (ignore relocation)
    vec3 baseProbeWorldPosition = gridCoordToPosition(baseProbeCoords, probeStep, probeStartPosition);

    // Clamp the distance (in grid space) between the given point and the base
    // probe's world position (on each axis) to [0, 1]
    vec3 gridSpaceDistance = biasedWorldPosition - baseProbeWorldPosition;

    vec3 alpha = clamp(gridSpaceDistance / probeStep, vec3(0.0), vec3(1.0));

    // Iterate over the 8 closest probes and accumulate their contributions
    for (int probeIndex = 0; probeIndex < 8; probeIndex++)
	{
	    // Compute the offset to the adjacent probe in grid coordinates by sourcing
	    // the offsets from the bits of the loop index: x = bit 0, y = bit 1, z =
	    // bit 2
	    // ivec3 adjacentProbeOffset = ivec3(probeIndex, probeIndex >> 1, probeIndex >> 2) & ivec3(1, 1, 1);
		ivec3 adjacentProbeOffset = ivec3(imod(probeIndex, 2), imod((probeIndex / 2), 2),imod( (probeIndex / 4), 2));

	    // Get the 3D grid coordinates of the adjacent probe by adding the offset to
	    // the base probe and clamping to the grid boundaries
	    ivec3 adjacentProbeCoords = ivec3(clamp(vec3(baseProbeCoords + adjacentProbeOffset), vec3(0), vec3(maxGridCoord)));

	    // Get the adjacent probe's world position
	    vec3 adjacentProbeWorldPosition = gridCoordToPosition(adjacentProbeCoords, probeStep, probeStartPosition);

	    // Compute the distance and direction from the (biased and non-biased)
	    // shading point and the adjacent probe
	    vec3 worldPosToAdjProbe = normalize(adjacentProbeWorldPosition - worldPosition);
	    vec3 biasedPosToAdjProbe = normalize(adjacentProbeWorldPosition - biasedWorldPosition);
	    float biasedPosToAdjProbeDist = distance(adjacentProbeWorldPosition, biasedWorldPosition);

	    // Compute trilinear weights based on the distance to each adjacent probe to
	    // smoothly transition between probes. adjacentProbeOffset is binary, so
	    // we're using a 1-alpha when adjacentProbeOffset = 0 and alpha when
	    // adjacentProbeOffset = 1.
	    vec3 trilinear = max(vec3(0.001), mix(1.0 - alpha, alpha, vec3(adjacentProbeOffset)));
	    float trilinearWeight = trilinear.x * trilinear.y * trilinear.z;
	    float weight = 1.0;

	    // A naive soft backface weight would ignore a probe when
	    // it is behind the surface. That's good for walls, but for
	    // small details inside of a room, the normals on the details
	    // might rule out all of the probes that have mutual visibility
	    // to the point. We instead use a "wrap shading" test. The small
	    // offset at the end reduces the "going to zero" impact.
	    float warpShading = (dot(worldPosToAdjProbe, direction) + 1.0) * 0.5;
	    weight *= (warpShading * warpShading) * 0.2;

	    vec2 textureGridCoord = porbeGridCoordToTextureGridCoord(
		adjacentProbeCoords, porbeCounts, volumeCounts);
	    // compute the octahedral coordinates of the adjacent probe
	    vec2 probeTextureUV = textureCoordFromDirection(-biasedPosToAdjProbe, distanceTexels,
		vec4(textureGridCoord, volumeCounts));
	    // Sample the probe's distance texture to get the mean distance to nearby
	    // surfaces
	    vec3 filteredDistance = texture2D(u_ProbeDistance, probeTextureUV).xyz;
	    // Find the variance of the mean distance
	    float variance = abs(filteredDistance.x * filteredDistance.x - filteredDistance.y);

	    // Occlusion test
	    float chebyshevWeight = 1.0;
	    if (biasedPosToAdjProbeDist > filteredDistance.x)
		{
		    float v = biasedPosToAdjProbeDist - filteredDistance.x;
		    // v must be greater than 0, which is guaranteed by the if condition
		    // above.
		    chebyshevWeight = variance / (variance + (v * v));

		    // Increase the contrast in the weight
		    chebyshevWeight = max(chebyshevWeight * chebyshevWeight * chebyshevWeight, 0.0);
		}

	    if (filteredDistance.z < 1.0)
		{
		    chebyshevWeight = 1.0;
		}

	    // Avoid visibility weights ever going all the way to zero because
	    // when *no* probe has visibility we need a fallback value
	    weight *= max(0.05, chebyshevWeight);

	    // Avoid a weight of zero
	    weight = max(0.000001, weight);

	    // A small amount of light is visible due to logarithmic perception, so
	    // crush tiny weights but keep the curve continuous
	    const float crushThreshold = 0.2;
	    if (weight < crushThreshold)
		{
		    weight *= (weight * weight) * (1.0 / (crushThreshold * crushThreshold));
		}

	    // Apply the trilinear weights
	    weight *= trilinearWeight;

	    probeTextureUV = textureCoordFromDirection(
		direction, irradianceTexels, vec4(textureGridCoord, volumeCounts));

	    // Sample the probe's irradiance
	    vec3 probeIrradiance = linearToGamma(texture2D(u_ProbeIrradiance, probeTextureUV).rgb);

	    irradiance += (probeIrradiance * weight);
	    accumulatedWeights += weight;
	}

    if (accumulatedWeights == 0.0)
	{
	    return vec3(0.0);
	}

    irradiance *= (1.0 / accumulatedWeights); // Normalize by the accumulated weights

    irradiance = gammaToLinear(irradiance);

    return irradiance;
}

#endif // VolumetricGI_lib