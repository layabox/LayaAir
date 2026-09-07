/**
 * Cold, numeric-only spawn program consumed by the Native particle kernel.
 * Keep the indices in sync with ParticleManager::SpawnValue.
 */
export const RT_PARTICLE_SPAWN_VALUE_COUNT = 104;

export const enum RTParticleSpawnValue {
    RenderMode = 0,
    SimulationSpace = 1,
    ShapeType = 2,
    ShapeRandomDirection = 3,
    ShapeP0 = 4,
    ShapeP1 = 5,
    ShapeP2 = 6,
    ShapeP3 = 7,
    LifetimeType = 8,
    LifetimeConstant = 9,
    LifetimeMin = 10,
    LifetimeMax = 11,
    SpeedType = 12,
    SpeedConstant = 13,
    SpeedMin = 14,
    SpeedMax = 15,
    SizeType = 16,
    Size3D = 17,
    SizeConstant = 18,
    SizeMin = 19,
    SizeMax = 20,
    SizeConstantX = 21,
    SizeConstantY = 22,
    SizeConstantZ = 23,
    SizeMinX = 24,
    SizeMinY = 25,
    SizeMinZ = 26,
    SizeMaxX = 27,
    SizeMaxY = 28,
    SizeMaxZ = 29,
    RotationType = 30,
    Rotation3D = 31,
    RotationRandomDirection = 32,
    RotationConstant = 33,
    RotationMin = 34,
    RotationMax = 35,
    RotationConstantX = 36,
    RotationConstantY = 37,
    RotationConstantZ = 38,
    RotationMinX = 39,
    RotationMinY = 40,
    RotationMinZ = 41,
    RotationMaxX = 42,
    RotationMaxY = 43,
    RotationMaxZ = 44,
    ColorType = 45,
    ColorConstantR = 46,
    ColorConstantG = 47,
    ColorConstantB = 48,
    ColorConstantA = 49,
    ColorMinR = 50,
    ColorMinG = 51,
    ColorMinB = 52,
    ColorMinA = 53,
    ColorMaxR = 54,
    ColorMaxG = 55,
    ColorMaxB = 56,
    ColorMaxA = 57,
    ColorLifetimeEnabled = 58,
    ColorLifetimeType = 59,
    ColorLifetimeConstantR = 60,
    ColorLifetimeConstantG = 61,
    ColorLifetimeConstantB = 62,
    ColorLifetimeConstantA = 63,
    ColorLifetimeMinR = 64,
    ColorLifetimeMinG = 65,
    ColorLifetimeMinB = 66,
    ColorLifetimeMinA = 67,
    ColorLifetimeMaxR = 68,
    ColorLifetimeMaxG = 69,
    ColorLifetimeMaxB = 70,
    ColorLifetimeMaxA = 71,
    SizeLifetimeEnabled = 72,
    SizeLifetimeType = 73,
    SizeLifetimeSeparate = 74,
    SizeLifetimeMin = 75,
    SizeLifetimeMax = 76,
    SizeLifetimeMinX = 77,
    SizeLifetimeMinY = 78,
    SizeLifetimeMinZ = 79,
    SizeLifetimeMaxX = 80,
    SizeLifetimeMaxY = 81,
    SizeLifetimeMaxZ = 82,
    VelocityLifetimeType = 83,
    RotationLifetimeType = 84,
    TextureEnabled = 85,
    TextureTilesX = 86,
    TextureTilesY = 87,
    TextureStartFrameType = 88,
    TextureStartFrameConstant = 89,
    TextureStartFrameMin = 90,
    TextureStartFrameMax = 91,
    TextureFrameType = 92,
    TextureFrameConstant = 93,
    TextureFrameMin = 94,
    TextureFrameMax = 95,
    TextureCycles = 96,
    TextureType = 97,
    TextureRandomRow = 98,
    TextureRowIndex = 99
}

function numberValue(value: unknown, fallback: number = 0): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function boolValue(value: unknown): number {
    return value ? 1 : 0;
}

function setVector(values: Float64Array, start: number, vector: any, defaults: [number, number, number]): void {
    values[start] = numberValue(vector?.x, defaults[0]);
    values[start + 1] = numberValue(vector?.y, defaults[1]);
    values[start + 2] = numberValue(vector?.z, defaults[2]);
}

function setColor(values: Float64Array, start: number, color: any,
    defaults: [number, number, number, number]): void {
    values[start] = numberValue(color?.x, defaults[0]);
    values[start + 1] = numberValue(color?.y, defaults[1]);
    values[start + 2] = numberValue(color?.z, defaults[2]);
    values[start + 3] = numberValue(color?.w, defaults[3]);
}

/** Compiles the spawn subset used by the 152-byte Shuriken instance ABI. */
export function compileRTParticleSpawnProgram(particleSystem: any, particleRender: any,
    values: Float64Array): boolean {
    values.fill(0);
    values[RTParticleSpawnValue.RenderMode] = numberValue(particleRender?.renderMode, 0);
    values[RTParticleSpawnValue.SimulationSpace] = numberValue(particleSystem.simulationSpace, 1);

    const shape = particleSystem._shape ?? particleSystem.shape;
    values[RTParticleSpawnValue.ShapeType] = shape && shape.enable !== false ?
        numberValue(shape.shapeType, -1) : -1;
    values[RTParticleSpawnValue.ShapeRandomDirection] = boolValue(shape?.randomDirection);
    switch (values[RTParticleSpawnValue.ShapeType]) {
        case 0:
            values[RTParticleSpawnValue.ShapeP0] = numberValue(shape.x, 1);
            values[RTParticleSpawnValue.ShapeP1] = numberValue(shape.y, 1);
            values[RTParticleSpawnValue.ShapeP2] = numberValue(shape.z, 1);
            break;
        case 1:
            values[RTParticleSpawnValue.ShapeP0] = numberValue(shape.radius, 1);
            values[RTParticleSpawnValue.ShapeP1] = numberValue(shape.arc, Math.PI * 2);
            values[RTParticleSpawnValue.ShapeP2] = boolValue(shape.emitFromEdge);
            break;
        case 2:
            values[RTParticleSpawnValue.ShapeP0] = numberValue(shape.angle, 25 / 180 * Math.PI);
            values[RTParticleSpawnValue.ShapeP1] = numberValue(shape.radius, 1);
            values[RTParticleSpawnValue.ShapeP2] = numberValue(shape.length, 5);
            values[RTParticleSpawnValue.ShapeP3] = numberValue(shape.emitType, 0);
            break;
        case 3:
        case 4:
            values[RTParticleSpawnValue.ShapeP0] = numberValue(shape.radius, 1);
            values[RTParticleSpawnValue.ShapeP1] = boolValue(shape.emitFromShell);
            break;
    }

    values[RTParticleSpawnValue.LifetimeType] = numberValue(particleSystem.startLifetimeType, 0);
    values[RTParticleSpawnValue.LifetimeConstant] = numberValue(particleSystem.startLifetimeConstant, 5);
    values[RTParticleSpawnValue.LifetimeMin] = numberValue(particleSystem.startLifetimeConstantMin, 0);
    values[RTParticleSpawnValue.LifetimeMax] = numberValue(particleSystem.startLifetimeConstantMax, 5);
    values[RTParticleSpawnValue.SpeedType] = numberValue(particleSystem.startSpeedType, 0);
    values[RTParticleSpawnValue.SpeedConstant] = numberValue(particleSystem.startSpeedConstant, 5);
    values[RTParticleSpawnValue.SpeedMin] = numberValue(particleSystem.startSpeedConstantMin, 0);
    values[RTParticleSpawnValue.SpeedMax] = numberValue(particleSystem.startSpeedConstantMax, 5);

    values[RTParticleSpawnValue.SizeType] = numberValue(particleSystem.startSizeType, 0);
    values[RTParticleSpawnValue.Size3D] = boolValue(particleSystem.threeDStartSize);
    values[RTParticleSpawnValue.SizeConstant] = numberValue(particleSystem.startSizeConstant, 1);
    values[RTParticleSpawnValue.SizeMin] = numberValue(particleSystem.startSizeConstantMin, 0);
    values[RTParticleSpawnValue.SizeMax] = numberValue(particleSystem.startSizeConstantMax, 1);
    setVector(values, RTParticleSpawnValue.SizeConstantX, particleSystem.startSizeConstantSeparate, [1, 1, 1]);
    setVector(values, RTParticleSpawnValue.SizeMinX, particleSystem.startSizeConstantMinSeparate, [0, 0, 0]);
    setVector(values, RTParticleSpawnValue.SizeMaxX, particleSystem.startSizeConstantMaxSeparate, [1, 1, 1]);

    values[RTParticleSpawnValue.RotationType] = numberValue(particleSystem.startRotationType, 0);
    values[RTParticleSpawnValue.Rotation3D] = boolValue(particleSystem.threeDStartRotation);
    values[RTParticleSpawnValue.RotationRandomDirection] =
        numberValue(particleSystem.randomizeRotationDirection, 0);
    values[RTParticleSpawnValue.RotationConstant] = numberValue(particleSystem.startRotationConstant, 0);
    values[RTParticleSpawnValue.RotationMin] = numberValue(particleSystem.startRotationConstantMin, 0);
    values[RTParticleSpawnValue.RotationMax] = numberValue(particleSystem.startRotationConstantMax, 0);
    setVector(values, RTParticleSpawnValue.RotationConstantX,
        particleSystem.startRotationConstantSeparate, [0, 0, 0]);
    setVector(values, RTParticleSpawnValue.RotationMinX,
        particleSystem.startRotationConstantMinSeparate, [0, 0, 0]);
    setVector(values, RTParticleSpawnValue.RotationMaxX,
        particleSystem.startRotationConstantMaxSeparate, [0, 0, 0]);

    values[RTParticleSpawnValue.ColorType] = numberValue(particleSystem.startColorType, 0);
    setColor(values, RTParticleSpawnValue.ColorConstantR, particleSystem.startColorConstant, [1, 1, 1, 1]);
    setColor(values, RTParticleSpawnValue.ColorMinR, particleSystem.startColorConstantMin, [0, 0, 0, 0]);
    setColor(values, RTParticleSpawnValue.ColorMaxR, particleSystem.startColorConstantMax, [1, 1, 1, 1]);

    const colorLifetime = particleSystem._colorOverLifetime ?? particleSystem.colorOverLifetime;
    const color = colorLifetime?.color;
    values[RTParticleSpawnValue.ColorLifetimeEnabled] = boolValue(colorLifetime?.enable);
    values[RTParticleSpawnValue.ColorLifetimeType] = numberValue(color?.type, 0);
    setColor(values, RTParticleSpawnValue.ColorLifetimeConstantR, color?.constant, [1, 1, 1, 1]);
    setColor(values, RTParticleSpawnValue.ColorLifetimeMinR, color?.constantMin, [1, 1, 1, 1]);
    setColor(values, RTParticleSpawnValue.ColorLifetimeMaxR, color?.constantMax, [1, 1, 1, 1]);

    const sizeLifetime = particleSystem._sizeOverLifetime ?? particleSystem.sizeOverLifetime;
    const size = sizeLifetime?.size;
    values[RTParticleSpawnValue.SizeLifetimeEnabled] = boolValue(sizeLifetime?.enable);
    values[RTParticleSpawnValue.SizeLifetimeType] = numberValue(size?.type, 0);
    values[RTParticleSpawnValue.SizeLifetimeSeparate] = boolValue(size?.separateAxes);
    values[RTParticleSpawnValue.SizeLifetimeMin] = numberValue(size?.constantMin, 1);
    values[RTParticleSpawnValue.SizeLifetimeMax] = numberValue(size?.constantMax, 1);
    setVector(values, RTParticleSpawnValue.SizeLifetimeMinX, size?.constantMinSeparate, [1, 1, 1]);
    setVector(values, RTParticleSpawnValue.SizeLifetimeMaxX, size?.constantMaxSeparate, [1, 1, 1]);

    const velocityLifetime = particleSystem._velocityOverLifetime ?? particleSystem.velocityOverLifetime;
    values[RTParticleSpawnValue.VelocityLifetimeType] = velocityLifetime?.enable ?
        numberValue(velocityLifetime.velocity?.type, 0) : -1;
    const rotationLifetime = particleSystem._rotationOverLifetime ?? particleSystem.rotationOverLifetime;
    values[RTParticleSpawnValue.RotationLifetimeType] = rotationLifetime?.enable ?
        numberValue(rotationLifetime.angularVelocity?.type, 0) : -1;

    const texture = particleSystem._textureSheetAnimation ?? particleSystem.textureSheetAnimation;
    values[RTParticleSpawnValue.TextureEnabled] = boolValue(texture?.enable);
    values[RTParticleSpawnValue.TextureTilesX] = numberValue(texture?.tiles?.x, 1);
    values[RTParticleSpawnValue.TextureTilesY] = numberValue(texture?.tiles?.y, 1);
    values[RTParticleSpawnValue.TextureStartFrameType] = numberValue(texture?.startFrame?.type, 0);
    values[RTParticleSpawnValue.TextureStartFrameConstant] = numberValue(texture?.startFrame?.constant, 0);
    values[RTParticleSpawnValue.TextureStartFrameMin] = numberValue(texture?.startFrame?.constantMin, 0);
    values[RTParticleSpawnValue.TextureStartFrameMax] = numberValue(texture?.startFrame?.constantMax, 0);
    values[RTParticleSpawnValue.TextureFrameType] = numberValue(texture?.frame?.type, 0);
    values[RTParticleSpawnValue.TextureFrameConstant] = numberValue(texture?.frame?.constant, 0);
    values[RTParticleSpawnValue.TextureFrameMin] = numberValue(texture?.frame?.constantMin, 0);
    values[RTParticleSpawnValue.TextureFrameMax] = numberValue(texture?.frame?.constantMax, 0);
    values[RTParticleSpawnValue.TextureCycles] = numberValue(texture?.cycles, 1);
    values[RTParticleSpawnValue.TextureType] = numberValue(texture?.type, 0);
    values[RTParticleSpawnValue.TextureRandomRow] = boolValue(texture?.randomRow);
    values[RTParticleSpawnValue.TextureRowIndex] = numberValue(texture?.rowIndex, 0);

    const shapeType = values[RTParticleSpawnValue.ShapeType];
    return (shapeType === -1 || (shapeType >= 0 && shapeType <= 4)) &&
        (values[RTParticleSpawnValue.SimulationSpace] === 0 ||
            values[RTParticleSpawnValue.SimulationSpace] === 1) &&
        (values[RTParticleSpawnValue.LifetimeType] === 0 ||
            values[RTParticleSpawnValue.LifetimeType] === 2) &&
        (values[RTParticleSpawnValue.SpeedType] === 0 || values[RTParticleSpawnValue.SpeedType] === 2) &&
        (values[RTParticleSpawnValue.SizeType] === 0 || values[RTParticleSpawnValue.SizeType] === 2) &&
        (values[RTParticleSpawnValue.RotationType] === 0 ||
            values[RTParticleSpawnValue.RotationType] === 2) &&
        (values[RTParticleSpawnValue.ColorType] === 0 || values[RTParticleSpawnValue.ColorType] === 2);
}
