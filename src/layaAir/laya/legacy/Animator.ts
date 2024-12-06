import { AnimationClip } from "../d3/animation/AnimationClip";
import { Animator } from "../d3/component/Animator/Animator";
import { AnimatorControllerLayer } from "../d3/component/Animator/AnimatorControllerLayer";
import { AnimatorState } from "../d3/component/Animator/AnimatorState";
import { AvatarMask } from "../d3/component/Animator/AvatarMask";
import { Loader } from "../net/Loader";

Animator && (function () {
    Animator.prototype._parse = function (this: Animator, data: any): void {
        var play: any = data.playOnWake;
        var layersData: any[] = data.layers;
        for (var i: number = 0; i < layersData.length; i++) {
            var layerData: any = layersData[i];
            var animatorLayer: AnimatorControllerLayer = new AnimatorControllerLayer(layerData.name);
            if (i === 0)
                animatorLayer.defaultWeight = 1.0;//TODO:
            else
                animatorLayer.defaultWeight = layerData.weight;

            var blendingModeData: any = layerData.blendingMode;
            (blendingModeData) && (animatorLayer.blendingMode = blendingModeData);
            this.addControllerLayer(animatorLayer);
            var states: any[] = layerData.states;
            for (var j: number = 0, m: number = states.length; j < m; j++) {
                var state: any = states[j];
                var clipPath: string = state.clipPath;
                if (clipPath) {
                    var name: string = state.name;
                    var motion: AnimationClip;
                    motion = Loader.getRes(clipPath);
                    if (motion) {//加载失败motion为空
                        var animatorState: AnimatorState = new AnimatorState();
                        animatorState.name = name;
                        animatorState.clip = motion;
                        state.speed && (animatorState.speed = state.speed);
                        animatorLayer.addState(animatorState);
                        (j === 0) && (this.getControllerLayer(i).defaultState = animatorState);
                    }
                }
            }
            (play !== undefined) && (animatorLayer.playOnWake = play);
            //avatarMask
            let layerMaskData = layerData.avatarMask;
            if (layerMaskData) {
                let avaMask = new AvatarMask();
                animatorLayer.avatarMask = avaMask;
                for (var bips in layerMaskData) {
                    avaMask.setTransformActive(bips, layerMaskData[bips]);
                }
            }
        }
        var cullingModeData: any = data.cullingMode;
        (cullingModeData !== undefined) && (this.cullingMode = cullingModeData);
    };
})();