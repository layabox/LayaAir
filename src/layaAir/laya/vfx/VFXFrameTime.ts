import { MathUtil } from "../maths/MathUtil";

export class VFXFrameTime {

    fixedDeltaTime: number = 0;

    deltaTime: number = 0;

    timeStepCount: number = 0;

    unscaledDeltaTime: number = 0;

    unscaledFixedDeltaTime: number = 0;

    unscaledTimeStepCount: number = 0;

    timeAccum: number = 0;
    unscaledTimeAccum: number = 0;

    constructor() {

    }

    computeStepCount(fixedTimeStep: number, maxFixedStepCount: number, currentDeltaTime: number, maxDeltaTime: number) {
        this.timeAccum += currentDeltaTime;
        let signedStepCount = Math.round(this.timeAccum / fixedTimeStep);
        this.timeStepCount = Math.min(Math.max(signedStepCount, 0), maxFixedStepCount);
        this.timeAccum -= this.timeStepCount * fixedTimeStep;

        currentDeltaTime = MathUtil.clamp(currentDeltaTime, 0, maxDeltaTime);
    }

    computeUnscaledStepCount(fixedTimeStep: number, maxFixedStepCount: number, currentUnscaledDeltaTime: number, maxDeltaTime: number) {
        this.unscaledTimeAccum += currentUnscaledDeltaTime;
        let signedStepCount = Math.round(this.unscaledTimeAccum / fixedTimeStep);
        this.unscaledTimeStepCount = Math.min(Math.max(signedStepCount, 0), maxFixedStepCount);
        this.unscaledTimeAccum -= this.unscaledTimeStepCount * fixedTimeStep;

        currentUnscaledDeltaTime = MathUtil.clamp(currentUnscaledDeltaTime, 0, maxDeltaTime);
    }
}
