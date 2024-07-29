#if !defined(GridHelpers_lib)
    #define GridHelpers_lib

int imod(int x, int y)
{
    #ifdef GRAPHICS_API_GLES3
    return x % y;
    #else // GRAPHICS_API_GLES3
    return x - (x / y) * y;
    #endif // GRAPHICS_API_GLES3
}

int gridCoordToProbeIndex(in ivec3 probeCoords, const in ivec3 probeCounts)
{
    return probeCoords.x + probeCoords.y * probeCounts.x + probeCoords.z * probeCounts.x * probeCounts.y;
}

ivec3 probeIndexToGridcoord(in int probeIndex, const in ivec3 probeCounts)
{
    ivec3 iPos;
    iPos.x = imod(probeIndex, probeCounts.x);
    iPos.y = imod(probeIndex, (probeCounts.x * probeCounts.y)) / probeCounts.x;
    iPos.z = probeIndex / (probeCounts.x * probeCounts.y);
    return iPos;

    //   ivec3 iPos;
    //   iPos.x = probeIndex & (probeCounts.x - 1);
    //   iPos.y = (probeIndex & ((probeCounts.x * probeCounts.y) - 1)) >>
    //            findMSB(probeCounts.x);
    //   iPos.z = probeIndex >> findMSB(probeCounts.x * probeCounts.y);
    //   return iPos;
}

vec3 gridCoordToPosition(in ivec3 coord, const in vec3 probeStep,
    const in vec3 probeStartPosition)
{
    return (vec3(coord) + 0.5) * probeStep + probeStartPosition;
}

ivec3 baseGridCoord(in vec3 position, in vec3 probeStep,
    in vec3 probeStartPosition, in ivec3 probeCounts)
{
    probeStartPosition += 0.5 * probeStep;
    return ivec3(clamp(vec3((position - probeStartPosition) / probeStep),
	vec3(0, 0, 0), vec3(probeCounts) - vec3(1, 1, 1)));
}

#endif // GridHelpers_lib