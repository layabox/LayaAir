import { Laya } from "../../../../Laya";
import { Vector3 } from "../../../maths/Vector3";
import { NavMeshSurface } from "./Component/NavMeshSurface";

/**@internal */
export class NavAgentLinkAnim {
    /**@internal */
    _startPos: Vector3 = new Vector3();
    /**@internal */
    _endPos: Vector3 = new Vector3();
    /**@internal */
    _initPos: Vector3 = new Vector3();
    /**@internal */
    targetSurface: NavMeshSurface;
    /**@internal */
    _active: boolean = false;
    /**@internal */
    _isStart: boolean;
    /**@internal */
    _runTime: number;
    /**@internal */
    _totalTime: number;
    /**@internal */
    _clearn() {
        this._active = false;
        this._isStart = false;
        this._runTime = 0;
    }
    /**@internal */
    _setStartPos(value: Vector3) {
        value.cloneTo(this._startPos);
    }
    /**@internal */
    _getSartPos(): Vector3 {
        return this._startPos;
    }
    /**@internal */
    _setEndPos(value: Vector3) {
        value.cloneTo(this._endPos);
    }
    /**@internal */
    _getEndPos(): Vector3 {
        return this._endPos;
    }
    /**@internal */
    _nearerStartPos(value: Vector3): boolean {
        return Vector3.distance(this._startPos, value) < 0.2;
    }
    /**@internal */
    _nearerEndPos(value: Vector3): boolean {
        return Vector3.distance(this._endPos, value) < 0.1;
    }
    /**@internal */
    _start(maxSpeed: number, postions: Vector3) {
        this._isStart = true;
        this._runTime = 0;
        this._totalTime = Vector3.distance(this._startPos, this._endPos) / maxSpeed;
        postions.cloneTo(this._initPos);
    }
    /**@internal */
    _update(position: Vector3, dir: Vector3) {
        if (!this._isStart) return;
        this._runTime += Laya.timer.delta * 0.001;
        const ta = this._totalTime * 0.05;
        if (this._runTime < ta) {
            const t = this._tween(this._runTime, 0, ta);
            Vector3.lerp(this._initPos, this._startPos, t, position);
        } else {
            const t = this._tween(this._runTime, ta, this._totalTime);
            Vector3.lerp(this._startPos, this._endPos, t, position);
        }
        Vector3.subtract(this._endPos, this._startPos, dir);
        dir.y = 0;
        Vector3.normalize(dir, dir);
    }
    /**@internal */
    _tween(t: number, t0: number, t1: number) {
        let value = (t - t0) / (t1 - t0);
        return Math.max(Math.min(1, value), 0);
    }
}