import { timer } from "../../Laya";
import { IK_ChainDebugSnapshot } from "./IK_Chain";

export interface IK_DebugFrameSnapshot {
    frameId: number;
    timestamp: number;
    chainStates: IK_ChainDebugSnapshot[];
}

export class IK_DebugRecorder {
    maxFrames = 120;
    enabled = false;

    private _frames: IK_DebugFrameSnapshot[] = [];
    private _replayIndex = -1;

    canRecordFrame() {
        return this.enabled && !this.isReplaying();
    }

    recordFrame(chainStates: IK_ChainDebugSnapshot[]) {
        if (!this.enabled || this.isReplaying() || !chainStates?.length) {
            return;
        }
        const frame: IK_DebugFrameSnapshot = {
            frameId: timer ? timer.currFrame : 0,
            timestamp: Date.now(),
            chainStates,
        };
        this._frames.push(frame);
        if (this._frames.length > this.maxFrames) {
            this._frames.shift();
        }
    }

    clear() {
        this._frames.length = 0;
        this._replayIndex = -1;
    }

    isReplaying() {
        return this._replayIndex >= 0 && this._replayIndex < this._frames.length;
    }

    startReplay(offset = 0) {
        if (!this._frames.length) {
            return false;
        }
        const idx = this._frames.length - 1 - offset;
        this._replayIndex = Math.max(0, Math.min(idx, this._frames.length - 1));
        return true;
    }

    stopReplay() {
        this._replayIndex = -1;
    }

    step(delta: number) {
        if (!this.isReplaying()) {
            return;
        }
        this._replayIndex = Math.max(
            0,
            Math.min(this._replayIndex + delta, this._frames.length - 1)
        );
    }

    getReplayFrame(): IK_DebugFrameSnapshot | null {
        if (!this.isReplaying()) {
            return null;
        }
        return this._frames[this._replayIndex] ?? null;
    }

    get replayInfo() {
        if (!this.isReplaying()) {
            return null;
        }
        const frame = this._frames[this._replayIndex];
        return {
            index: this._replayIndex,
            total: this._frames.length,
            frameId: frame?.frameId ?? 0,
            timestamp: frame?.timestamp ?? 0,
        };
    }
}

