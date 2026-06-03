import { VFXEventAttribute } from "../VFXEventAttribute";

export enum VFXSpawnerLoopState {
    Finished,
    DelayBeforeLoop,
    Looping,
    DelayAfterLoop
}

export class VFXSpawnerSettings {

    loopCount: number = -1;

    loopDuration: number = -1.0;

    delayBeforeLoop: number = 0.0;

    delayAfterLoop: number = 0.0;
}

/**
 * 
 */
export class VFXSpawnerState {

    private _eventAttribute: VFXEventAttribute;

    get eventAttribute(): VFXEventAttribute {
        return this._eventAttribute;
    }

    setEventAttribute(attr: VFXEventAttribute) {
        this._eventAttribute = attr;
    }

    settings: VFXSpawnerSettings = new VFXSpawnerSettings();

    delayDirty: boolean = false;
    loopState: VFXSpawnerLoopState = VFXSpawnerLoopState.Finished;
    newLoop: boolean = false;
    loopIndex: number = 0;

    public get spawnCount(): number {
        return this._eventAttribute.getFloat("spawnCount");
    }
    public set spawnCount(value: number) {
        this._eventAttribute.setFloat("spawnCount", value);
    }

    isPlaying(): boolean {
        return this.loopState == VFXSpawnerLoopState.Looping;
    }

    /**
     * 当前状态运行时间
     */
    totalTime: number = 0.0;
    deltaTime: number = 0.0;

    private getCurrentMaximumDuration(): number {
        switch (this.loopState) {
            case VFXSpawnerLoopState.Finished:
                break;
            case VFXSpawnerLoopState.DelayBeforeLoop:
                return this.settings.delayBeforeLoop;
            case VFXSpawnerLoopState.Looping:
                return this.settings.loopDuration;
            case VFXSpawnerLoopState.DelayAfterLoop:
                return this.settings.delayAfterLoop;
            default:
                break;
        }
        return -1;
    }

    private gotoNextLoopState() {
        if (this.loopState == VFXSpawnerLoopState.Finished) {
            return;
        }

        switch (this.loopState) {
            case VFXSpawnerLoopState.DelayBeforeLoop:
                this.loopState = VFXSpawnerLoopState.Looping;
                break;
            case VFXSpawnerLoopState.Looping:
                this.loopState = VFXSpawnerLoopState.DelayAfterLoop;
                break;
            case VFXSpawnerLoopState.DelayAfterLoop: {
                this.loopIndex++;
                if (this.settings.loopCount < 0 || this.loopIndex < this.settings.loopCount) {
                    this.loopState = VFXSpawnerLoopState.DelayBeforeLoop;
                    this.delayDirty = true;
                    this.newLoop = true;
                }
                else {
                    this.loopState = VFXSpawnerLoopState.Finished;
                }
                break;
            }
            default:
                break;
        }
    }

    private fastFowarduntilValidLoopState() {
        while (this.getCurrentMaximumDuration() == 0
            && (!this.newLoop
                || this.settings.delayAfterLoop != 0
                || this.settings.loopDuration != 0
                || this.settings.delayBeforeLoop != 0)) {
            this.gotoNextLoopState();
        }
    }

    private updateLoopCount(currentSettings: VFXSpawnerSettings) {
        this.settings.loopCount = currentSettings.loopCount;
    }

    private updateDelay(currentSettings: VFXSpawnerSettings) {
        this.delayDirty = false;

        this.settings.delayBeforeLoop = currentSettings.delayBeforeLoop;
        this.settings.delayAfterLoop = currentSettings.delayAfterLoop;
        this.settings.loopDuration = currentSettings.loopDuration;
    }

    setLoopState(state: VFXSpawnerLoopState) {
        if (this.loopState != state) {
            this.loopState = state;
            this.totalTime = 0.0;

            this.fastFowarduntilValidLoopState();
        }
    }

    constructor() {

    }

    prepareOnPlay(sourceEvtAttr: VFXEventAttribute) {
        this.eventAttribute.copyFrom(sourceEvtAttr);
    }

    onPlay(currentSettings: VFXSpawnerSettings) {
        this.loopIndex = 0;
        this.newLoop = true;

        this.updateDelay(currentSettings);
        this.updateLoopCount(currentSettings);

        let state = VFXSpawnerLoopState.DelayBeforeLoop;
        if (this.settings.loopCount == 0) {
            state = VFXSpawnerLoopState.Finished;
        }

        this.setLoopState(state);
    }

    beginUpdate(deltaTime: number, currentSettings: VFXSpawnerSettings) {
        if (this.delayDirty) {
            this.updateDelay(currentSettings);
        }

        this.deltaTime = deltaTime;
    }

    endUpdate() {
        this.newLoop = false;
        this.totalTime += this.deltaTime;

        let currentMaximumDuration = this.getCurrentMaximumDuration();
        if (currentMaximumDuration >= 0 && this.totalTime >= currentMaximumDuration) {
            // 清零而非保留剩余时间，确保每帧最多一次状态转换，保证每个非0 duration状态至少渲染一帧
            this.totalTime = 0.0;
            this.gotoNextLoopState();
            this.fastFowarduntilValidLoopState();
        }
    }

    onStop() {
        this.setLoopState(VFXSpawnerLoopState.Finished);
    }

    release() {
        this._eventAttribute = null;
    }

}
