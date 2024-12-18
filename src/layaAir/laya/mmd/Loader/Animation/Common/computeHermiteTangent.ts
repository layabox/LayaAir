/**
 * compute non-weighted tangent for a given cubic bezier weighted tangent
 * @param x normalized tangent x [0..=1]
 * @param y normalized tangent y [0..=1]
 * @param frameDelta x distance between the frame, must be >= 0
 * @param valueDelta y distance between the value
 * @returns hermite tangent value
 */
export function computeHermiteTangent(x: number, y: number, frameDelta: number, valueDelta: number): number {
    let tangent;

    if (valueDelta === 0) {
        tangent = 0;
    } else if (frameDelta === 0) {
        tangent = valueDelta < 0 ? -Infinity : Infinity;
    } else if (x === 0 && y === 0) {
        tangent = valueDelta / frameDelta;
    } else if (x === 0) {
        tangent = valueDelta < 0 ? -Infinity : Infinity;
    } else if (y === 0) {
        tangent = 0;
    } else {
        tangent = (y * valueDelta) / (x * frameDelta);
    }

    const tangentLimit = 3 * Math.abs(valueDelta) / frameDelta;

    return Math.max(-tangentLimit, Math.min(tangentLimit, tangent));
}
