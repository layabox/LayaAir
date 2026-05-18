import { AnimatorControllerLayer } from "../../AnimatorControllerLayer";
import { AnimatorPlayState } from "../../AnimatorPlayState";
import { AnimatorState } from "../../AnimatorState";
import { LayerTask, LayerTaskType } from "../TaskSlot";

/** RT 路径下复用 Web evaluator 时，用 'non-transform-only' 跳过 Transform 类型让 Native 专门处理。 */
export type WebAnimatorEvaluatorScope = 'all' | 'non-transform-only';

/**
 * Animator 数据处理的 Web 默认实现（WebAnimatorFactory 内部 helper）。
 * 无内部状态/队列；factory 在 flushEvaluate 时遍历 activeList，逐 layer 调 `evaluateLayer`。
 */
export class WebAnimatorEvaluator {

    _scope: WebAnimatorEvaluatorScope = 'all';

    evaluateLayer(layerTask: LayerTask, controllerLayer: AnimatorControllerLayer): void {
        const skipTransform = this._scope === 'non-transform-only';
        switch (layerTask.type) {
            case LayerTaskType.Normal:
                this._sample(layerTask.state!, layerTask.playState!, controllerLayer, skipTransform);
                break;
            case LayerTaskType.Cross:
                this._sample(layerTask.state!, layerTask.playState!, controllerLayer, skipTransform);
                this._sample(layerTask.destState!, layerTask.crossPlayState!, controllerLayer, skipTransform);
                break;
            case LayerTaskType.FixedCross:
                this._sample(layerTask.destState!, layerTask.crossPlayState!, controllerLayer, skipTransform);
                break;
        }
    }

    private _sample(state: AnimatorState, playState: AnimatorPlayState, controllerLayer: AnimatorControllerLayer, skipTransform: boolean): void {
        const clip = state._clip!;
        const clipDuration = clip._duration;
        const curPlayTime = state.clipStart * clipDuration
            + playState._normalizedPlayTime * playState._duration;
        const additive = controllerLayer.blendingMode !== AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
        const frontPlay = playState._elapsedTime > playState._lastElapsedTime;
        clip._evaluateClipDatasRealTime(
            clip._nodes!,
            curPlayTime,
            state._currentFrameIndices!,
            additive,
            frontPlay,
            state._realtimeDatas,
            controllerLayer.avatarMask,
            skipTransform
        );
    }
}
