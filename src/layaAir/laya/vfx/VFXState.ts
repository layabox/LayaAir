import { Matrix4x4 } from "../maths/Matrix4x4";
import { Rand } from "../maths/Rand";
export class VFXState {

    /**
     * 当前帧的 delta time (应用 playRate 后)
     */
    deltaTime: number = 0;

    /**
     * 当前帧的 unscaled delta time (未应用 playRate)
     */
    unscaledDeltaTime: number = 0;

    totalTime: number = 0;

    playRate: number = 1.0;

    systemSeed: number = 0;

    rand: Rand;

    // Emitter 世界矩阵（每帧由 VisualEffect 更新）
    emitterWorldMatrix: Matrix4x4;

    // Emitter 世界矩阵的逆矩阵
    invEmitterWorldMatrix: Matrix4x4;

}