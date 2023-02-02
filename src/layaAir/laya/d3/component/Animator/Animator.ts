
import { Component } from "../../../components/Component";
import { NodeFlags } from "../../../Const";
import { Loader } from "../../../net/Loader";
import { Stat } from "../../../utils/Stat";
import { AnimationClip } from "../../animation/AnimationClip";
import { AnimatorStateScript } from "../../animation/AnimatorStateScript";
import { KeyframeNode } from "../../animation/KeyframeNode";
import { KeyframeNodeList } from "../../animation/KeyframeNodeList";
import { Material } from "../../core/material/Material";
import { RenderableSprite3D } from "../../core/RenderableSprite3D";
import { Sprite3D } from "../../core/Sprite3D";
import { Utils3D } from "../../utils/Utils3D";
import { AnimatorControllerLayer } from "./AnimatorControllerLayer";
import { AnimatorPlayState } from "./AnimatorPlayState";
import { AnimatorResource } from "./AnimatorResource";
import { AnimatorState } from "./AnimatorState";
import { AvatarMask } from "./AvatarMask";
import { KeyframeNodeOwner, KeyFrameValueType } from "./KeyframeNodeOwner";
import { AnimationEvent } from "../../animation/AnimationEvent";
import { AnimatorTransition } from "./AnimatorTransition";
import { AnimatorController } from "./AnimatorController";
import { Color } from "../../../maths/Color";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { AnimatorUpdateMode } from "../../../components/AnimatorUpdateMode";
import { AnimatorStateCondition } from "../../../components/AnimatorStateCondition";

export type AnimatorParams = { [key: number]: number | boolean };


/**
 * <code>Animator</code> 类用于创建动画组件。
 */
export class Animator extends Component {
    /**@internal */
    private static _tempVector31: Vector3 = new Vector3();
    /**@internal */
    private static _tempColor: Color = new Color();
    /**@internal */
    private static _tempQuaternion1: Quaternion = new Quaternion();

    /** 裁剪模式_始终播放动画。*/
    static CULLINGMODE_ALWAYSANIMATE: number = 0;
    /** 裁剪模式_不可见时完全不播放动画。*/
    static CULLINGMODE_CULLCOMPLETELY: number = 2;

    /**@internal */
    private _speed: number;
    /**@internal */
    private _keyframeNodeOwnerMap: any;
    /**@internal */
    private _keyframeNodeOwners: KeyframeNodeOwner[] = [];
    /**@internal */
    private _updateMark: number;
    /**@internal */
    private _controllerLayers: AnimatorControllerLayer[];
    /**@internal 更新模式*/
    private _updateMode: AnimatorUpdateMode = AnimatorUpdateMode.Normal;
    /**@internal 降低更新频率调整值*/
    private _lowUpdateDelty: number = 20;
    /**@internal */
    private _animatorParams: AnimatorParams = {};
    // /**@internal */
    // _linkSprites: any;
    /**@internal	*/
    _avatarNodeMap: any;
    /**@internal */
    _linkAvatarSpritesData: any = {};
    /**@internal */
    _linkAvatarSprites: Sprite3D[] = [];
    /**@internal */
    _renderableSprites: RenderableSprite3D[] = [];

    /**	裁剪模式*/
    cullingMode: number = Animator.CULLINGMODE_CULLCOMPLETELY;

    /**@internal	[NATIVE]*/
    _animationNodeLocalPositions: Float32Array;
    /**@internal	[NATIVE]*/
    _animationNodeLocalRotations: Float32Array;
    /**@internal	[NATIVE]*/
    _animationNodeLocalScales: Float32Array;
    /**@internal	[NATIVE]*/
    _animationNodeWorldMatrixs: Float32Array;
    /**@internal	[NATIVE]*/
    _animationNodeParentIndices: Int16Array;



    _controller: AnimatorController;


    set controller(val: AnimatorController) {
        this._controller = val;
        if (this._controller) {
            this._controller.updateTo(this);
        }

    }
    get controller() {
        return this._controller;
    }



    /**
     * 动画的播放速度,1.0为正常播放速度。
     */
    get speed(): number {
        return this._speed;
    }


    set speed(value: number) {
        this._speed = value;
    }





    /**
     * 设置更新模式
     */
    set updateMode(value: AnimatorUpdateMode) {
        this._updateMode = value;
    }

    /**
     * 低更新模式
     */
    set lowUpdateDelty(value: number) {
        this._lowUpdateDelty = value;
    }

    get controllerLayerCount(): number {
        return this._controllerLayers.length;
    }

    /**
     * 状态机参数map
     */
    set animatorParams(values: AnimatorParams) {
        this._animatorParams = values;
    }

    get animatorParams() {
        return this._animatorParams;
    }



    /**
     * 创建一个 <code>Animation</code> 实例。
     */
    constructor() {
        super();
        this._controllerLayers = [];
        //this._linkSprites = {};
        this._speed = 1.0;
        this._keyframeNodeOwnerMap = {};
        this._updateMark = 0;
    }

    /**
     * @internal
     */
    private _addKeyframeNodeOwner(clipOwners: KeyframeNodeOwner[], node: KeyframeNode, propertyOwner: any): void {
        var nodeIndex = node._indexInList;
        var fullPath = node.fullPath;
        var keyframeNodeOwner = this._keyframeNodeOwnerMap[fullPath];
        let mat = false;
        if (keyframeNodeOwner) {
            keyframeNodeOwner.referenceCount++;
            clipOwners[nodeIndex] = keyframeNodeOwner;
        } else {
            var property = propertyOwner;
            for (var i = 0, n = node.propertyCount; i < n; i++) {
                property = property[node.getPropertyByIndex(i)];
                if (property instanceof Material) {
                    mat = true
                }
                if (!property)
                    break;
            }

            keyframeNodeOwner = this._keyframeNodeOwnerMap[fullPath] = new KeyframeNodeOwner();
            keyframeNodeOwner.isMaterial = mat;
            keyframeNodeOwner.fullPath = fullPath;
            keyframeNodeOwner.indexInList = this._keyframeNodeOwners.length;
            keyframeNodeOwner.referenceCount = 1;
            keyframeNodeOwner.propertyOwner = propertyOwner;
            keyframeNodeOwner.nodePath = node.nodePath;
            var propertyCount = node.propertyCount;
            var propertys: string[] = [];
            for (i = 0; i < propertyCount; i++)
                propertys[i] = node.getPropertyByIndex(i);
            keyframeNodeOwner.property = propertys;
            keyframeNodeOwner.type = node.type;

            if (property) {//查询成功后赋默认值
                if (node.type === 0) {
                    keyframeNodeOwner.defaultValue = property;
                } else {
                    var defaultValue = new property.constructor();
                    property.cloneTo(defaultValue);
                    keyframeNodeOwner.defaultValue = defaultValue;
                    keyframeNodeOwner.value = new property.constructor();
                    keyframeNodeOwner.crossFixedValue = new property.constructor();
                }
            }

            this._keyframeNodeOwners.push(keyframeNodeOwner);
            clipOwners[nodeIndex] = keyframeNodeOwner;
        }
    }

    /**
     * @internal
     */
    _removeKeyframeNodeOwner(nodeOwners: (KeyframeNodeOwner | null)[], node: KeyframeNode): void {
        var fullPath = node.fullPath;
        var keyframeNodeOwner = this._keyframeNodeOwnerMap[fullPath];
        if (keyframeNodeOwner) {//TODO:Avatar中没该节点,但动画文件有,不会保存_keyframeNodeOwnerMap在中,移除会出BUG,例如动画节点下的SkinnedMeshRender有动画帧，但Avatar中忽略了
            keyframeNodeOwner.referenceCount--;
            if (keyframeNodeOwner.referenceCount === 0) {
                delete this._keyframeNodeOwnerMap[fullPath];
                this._keyframeNodeOwners.splice(this._keyframeNodeOwners.indexOf(keyframeNodeOwner), 1);
            }
            nodeOwners[node._indexInList] = null;
        }
    }

    /**
     * @internal
     */
    _getOwnersByClip(clipStateInfo: AnimatorState): void {
        if (!clipStateInfo._clip)
            return;

        var frameNodes = clipStateInfo._clip!._nodes;
        var frameNodesCount = frameNodes!.count;
        var nodeOwners: KeyframeNodeOwner[] = clipStateInfo._nodeOwners;
        nodeOwners.length = frameNodesCount;
        for (var i: number = 0; i < frameNodesCount; i++) {
            var node: KeyframeNode = frameNodes!.getNodeByIndex(i);
            //var property: any = this._avatar ? this._avatarNodeMap[this._avatar._rootNode.name!] : this.owner;//如果有avatar需使用克隆节点
            var property: any = this.owner;
            for (var j: number = 0, m: number = node.ownerPathCount; j < m; j++) {
                var ownPat: string = node.getOwnerPathByIndex(j);
                if (ownPat === "") {//TODO:直接不存
                    break;
                } else {
                    property = property.getChildByName(ownPat);
                    if (!property)
                        break;
                }
            }

            if (property) {
                var propertyOwner: string = node.propertyOwner;
                const oriProperty = property;
                (propertyOwner) && (property = property[propertyOwner]);
                if (!property) {
                    property = AnimatorResource.getAnimatorResource(oriProperty, propertyOwner);
                }
                property && this._addKeyframeNodeOwner(nodeOwners, node, property);
            }
        }
    }

    /**
     * @internal
     */
    private _updatePlayer(animatorState: AnimatorState, playState: AnimatorPlayState, elapsedTime: number, islooping: boolean, layerIndex: number): void {
        var clipDuration: number = animatorState._clip!._duration * (animatorState.clipEnd - animatorState.clipStart);
        var lastElapsedTime: number = playState._elapsedTime;
        var elapsedPlaybackTime: number = lastElapsedTime + elapsedTime;
        playState._lastElapsedTime = lastElapsedTime;
        playState._elapsedTime = elapsedPlaybackTime;
        var normalizedTime: number = elapsedPlaybackTime / clipDuration;//TODO:时候可以都统一为归一化时间
        playState._normalizedTime = normalizedTime;
        var playTime: number = normalizedTime % 1.0;
        playState._normalizedPlayTime = playTime < 0 ? playTime + 1.0 : playTime;
        playState._duration = clipDuration;
        if ((!islooping && elapsedPlaybackTime >= clipDuration)) {
            playState._finish = true;
            playState._elapsedTime = clipDuration;
            playState._normalizedPlayTime = 1.0;
            return;
        }

        animatorState._eventStateUpdate(playState._normalizedPlayTime);
        this._applyTransition(layerIndex, animatorState._eventtransition(playState._normalizedPlayTime, this.animatorParams));
    }

    /**
     * 启用过渡
     * @param layerindex 
     * @param transition 
     * @returns 
     */
    private _applyTransition(layerindex: number, transition: AnimatorTransition) {
        if (!transition)
            return;
        this.crossFade(transition.destState.name, transition.transduration, layerindex, transition.transstartoffset);
    }

    /**
     * @internal
     * @param animatorState 
     * @param playState 
     */
    private _updateStateFinish(animatorState: AnimatorState, playState: AnimatorPlayState): void {
        if (playState._finish) {
            animatorState._eventExit();//派发播放完成的事件
        }
    }

    /**
     * @internal
     */
    private _eventScript(events: AnimationEvent[], eventIndex: number, endTime: number, front: boolean): number {
        let scripts = this.owner.components;
        if (front) {
            for (let n = events.length; eventIndex < n; eventIndex++) {
                let event = events[eventIndex];
                if (event.time <= endTime) {
                    for (let j = 0, m = scripts.length; j < m; j++) {
                        let script = scripts[j];
                        if (script._isScript()) {
                            let fun: Function = (script as any)[event.eventName];
                            (fun) && (fun.apply(script, event.params));
                        }
                    }
                } else {
                    break;
                }
            }
        } else {
            for (; eventIndex >= 0; eventIndex--) {
                let event = events[eventIndex];
                if (event.time >= endTime) {
                    for (let j = 0, m = scripts.length; j < m; j++) {
                        let script = scripts[j];
                        if (script._isScript()) {
                            let fun = (script as any)[event.eventName];
                            (fun) && (fun.apply(script, event.params));
                        }
                    }
                } else {
                    break;
                }
            }
        }
        return eventIndex;
    }

    /**
     * @internal
     */
    private _updateEventScript(stateInfo: AnimatorState, playStateInfo: AnimatorPlayState): void {
        if (!this.owner._getBit(NodeFlags.HAS_SCRIPT))
            return;

        let clip = stateInfo._clip;
        let events = clip!._animationEvents;
        let clipDuration = clip!._duration;
        let elapsedTime = playStateInfo._elapsedTime;
        let time = elapsedTime % clipDuration;
        let loopCount = Math.abs(Math.floor(elapsedTime / clipDuration) - Math.floor(playStateInfo._lastElapsedTime / clipDuration));//backPlay可能为负数

        let frontPlay = playStateInfo._elapsedTime >= playStateInfo._lastElapsedTime;
        if (playStateInfo._lastIsFront !== frontPlay) {
            if (frontPlay)
                playStateInfo._playEventIndex++;
            else
                playStateInfo._playEventIndex--;
            playStateInfo._lastIsFront = frontPlay;
        }
        let preEventIndex = playStateInfo._playEventIndex;
        if (frontPlay) {
            let newEventIndex = this._eventScript(events, playStateInfo._playEventIndex, loopCount > 0 ? clipDuration : time, true);
            (preEventIndex === playStateInfo._playEventIndex) && (playStateInfo._playEventIndex = newEventIndex);//这里打个补丁，在event中调用Play 需要重置eventindex，不能直接赋值
            for (let i = 0, n = loopCount - 1; i < n; i++)
                this._eventScript(events, 0, clipDuration, true);
            (loopCount > 0 && time > 0) && (playStateInfo._playEventIndex = this._eventScript(events, 0, time, true));//if need cross loop,'time' must large than 0
        } else {
            let newEventIndex = this._eventScript(events, playStateInfo._playEventIndex, loopCount > 0 ? 0 : time, false);
            (preEventIndex === playStateInfo._playEventIndex) && (playStateInfo._playEventIndex = newEventIndex);//这里打个补丁，在event中调用Play 需要重置eventindex，不能直接赋值
            let eventIndex = events.length - 1;
            for (let i = 0, n = loopCount - 1; i < n; i++)
                this._eventScript(events, eventIndex, 0, false);
            (loopCount > 0 && time > 0) && (playStateInfo._playEventIndex = this._eventScript(events, eventIndex, time, false));//if need cross loop,'time' must large than 0
        }
    }

    /**
     * 更新clip数据
     * @internal
     */
    private _updateClipDatas(animatorState: AnimatorState, addtive: boolean, playStateInfo: AnimatorPlayState, animatorMask: AvatarMask = null): void {
        var clip = animatorState._clip;
        var clipDuration = clip!._duration;

        var curPlayTime = animatorState.clipStart * clipDuration + playStateInfo._normalizedPlayTime * playStateInfo._duration;
        var currentFrameIndices = animatorState._currentFrameIndices;
        var frontPlay = playStateInfo._elapsedTime > playStateInfo._lastElapsedTime;
        clip!._evaluateClipDatasRealTime(clip!._nodes!, curPlayTime, currentFrameIndices!, addtive, frontPlay, animatorState._realtimeDatas, animatorMask);
    }

    /**
     * @internal
     */
    private _applyFloat(defaultValue: number, nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, data: number): number {
        if (nodeOwner.updateMark === this._updateMark) {//一定非第一层
            if (additive) {
                defaultValue += weight * data;
            } else {
                var oriValue: number = defaultValue;
                defaultValue = oriValue + weight * (data - oriValue);
            }
        } else {
            if (isFirstLayer) {
                if (additive)
                    defaultValue = nodeOwner.defaultValue + data;
                else
                    defaultValue = data;
            } else {
                if (additive) {
                    defaultValue = nodeOwner.defaultValue + weight * (data);
                } else {
                    var defValue: number = nodeOwner.defaultValue;
                    defaultValue = defValue + weight * (data - defValue);
                }
            }
        }
        return defaultValue;
    }

    private _applyVec2(defaultValue: Vector2, nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, data: Vector2): Vector2 {
        if (!defaultValue) return null;

        if (nodeOwner.updateMark === this._updateMark) {//一定非第一层
            if (additive) {
                defaultValue.x += weight * data.x;
                defaultValue.y += weight * data.y;
            } else {
                var oriValue = defaultValue;
                defaultValue.x = oriValue.x + weight * (data.x - oriValue.x);
                defaultValue.y = oriValue.y + weight * (data.y - oriValue.y);
            }
        } else {
            if (isFirstLayer) {
                if (additive) {
                    defaultValue.x = nodeOwner.defaultValue.x + data.x;
                    defaultValue.y = nodeOwner.defaultValue.y + data.y;
                }
                else
                    data.cloneTo(defaultValue);
            } else {
                if (additive) {
                    defaultValue.x = nodeOwner.defaultValue.x + weight * (data.x);
                    defaultValue.y = nodeOwner.defaultValue.y + weight * (data.y);
                } else {
                    var defValue: Vector2 = nodeOwner.defaultValue;
                    defaultValue.x = defValue.x + weight * (data.x - defValue.x);
                    defaultValue.y = defValue.y + weight * (data.y - defValue.y);
                }
            }
        }
        return defaultValue;
    }

    private _applyVec3(defaultValue: Vector3, nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, data: Vector3) {
        if (!defaultValue) return null;
        if (nodeOwner.updateMark === this._updateMark) {//一定非第一层
            if (additive) {
                defaultValue.x += weight * data.x;
                defaultValue.y += weight * data.y;
                defaultValue.z += weight * data.z;
            } else {
                var oriValue = defaultValue;
                defaultValue.x = oriValue.x + weight * (data.x - oriValue.x);
                defaultValue.y = oriValue.y + weight * (data.y - oriValue.y);
                defaultValue.z = oriValue.z + weight * (data.z - oriValue.z);
            }
        } else {
            if (isFirstLayer) {
                if (additive) {
                    defaultValue.x = nodeOwner.defaultValue.x + data.x;
                    defaultValue.y = nodeOwner.defaultValue.y + data.y;
                    defaultValue.z = nodeOwner.defaultValue.z + data.z;
                }
                else
                    data.cloneTo(defaultValue);
            } else {
                if (additive) {
                    defaultValue.x = nodeOwner.defaultValue.x + weight * (data.x);
                    defaultValue.y = nodeOwner.defaultValue.y + weight * (data.y);
                    defaultValue.z = nodeOwner.defaultValue.z + weight * (data.z);
                } else {
                    var defValue: Vector3 = nodeOwner.defaultValue;
                    defaultValue.x = defValue.x + weight * (data.x - defValue.x);
                    defaultValue.y = defValue.y + weight * (data.y - defValue.y);
                    defaultValue.z = defValue.z + weight * (data.z - defValue.z);
                }
            }
        }
        return defaultValue;
    }

    private _applyVec4(defaultValue: Vector4, nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, data: Vector4) {
        if (!defaultValue) return null;
        if (nodeOwner.updateMark === this._updateMark) {//一定非第一层
            if (additive) {
                defaultValue.x += weight * data.x;
                defaultValue.y += weight * data.y;
                defaultValue.z += weight * data.z;
                defaultValue.w += weight * data.w;
            } else {
                var oriValue = defaultValue;
                defaultValue.x = oriValue.x + weight * (data.x - oriValue.x);
                defaultValue.y = oriValue.y + weight * (data.y - oriValue.y);
                defaultValue.z = oriValue.z + weight * (data.z - oriValue.z);
                defaultValue.w = oriValue.w + weight * (data.w - oriValue.w);
            }
        } else {
            if (isFirstLayer) {
                if (additive) {
                    defaultValue.x = nodeOwner.defaultValue.x + data.x;
                    defaultValue.y = nodeOwner.defaultValue.y + data.y;
                    defaultValue.z = nodeOwner.defaultValue.z + data.z;
                    defaultValue.w = nodeOwner.defaultValue.w + data.w;
                }
                else
                    data.cloneTo(defaultValue);
            } else {
                if (additive) {
                    defaultValue.x = nodeOwner.defaultValue.x + weight * (data.x);
                    defaultValue.y = nodeOwner.defaultValue.y + weight * (data.y);
                    defaultValue.z = nodeOwner.defaultValue.z + weight * (data.z);
                    defaultValue.w = nodeOwner.defaultValue.w + weight * (data.w);
                } else {
                    var defValue: Vector4 = nodeOwner.defaultValue;
                    defaultValue.x = defValue.x + weight * (data.x - defValue.x);
                    defaultValue.y = defValue.y + weight * (data.y - defValue.y);
                    defaultValue.z = defValue.z + weight * (data.z - defValue.z);
                    defaultValue.w = defValue.w + weight * (data.w - defValue.w);
                }
            }
        }
        return defaultValue;
    }

    private _applyColor(defaultValue: Color, nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, data: Vector4) {
        if (!defaultValue) return null;
        if (nodeOwner.updateMark === this._updateMark) {//一定非第一层
            if (additive) {
                defaultValue.r += weight * data.x;
                defaultValue.g += weight * data.y;
                defaultValue.b += weight * data.z;
                defaultValue.a += weight * data.w;
            } else {
                var oriValue = defaultValue;
                defaultValue.r = oriValue.r + weight * (data.x - oriValue.r);
                defaultValue.g = oriValue.g + weight * (data.y - oriValue.g);
                defaultValue.b = oriValue.b + weight * (data.z - oriValue.b);
                defaultValue.a = oriValue.a + weight * (data.w - oriValue.a);
            }
        } else {
            if (isFirstLayer) {
                if (additive) {
                    defaultValue.r = nodeOwner.defaultValue.r + data.x;
                    defaultValue.g = nodeOwner.defaultValue.g + data.y;
                    defaultValue.b = nodeOwner.defaultValue.b + data.z;
                    defaultValue.a = nodeOwner.defaultValue.a + data.w;
                }
                else {
                    //data.cloneTo(defaultValue);
                    defaultValue.setValue(data.x, data.y, data.z, data.w);
                }

            } else {
                if (additive) {
                    defaultValue.r = nodeOwner.defaultValue.r + weight * (data.x);
                    defaultValue.g = nodeOwner.defaultValue.g + weight * (data.y);
                    defaultValue.b = nodeOwner.defaultValue.b + weight * (data.z);
                    defaultValue.a = nodeOwner.defaultValue.a + weight * (data.w);
                } else {
                    var defValue: Color = nodeOwner.defaultValue;
                    defaultValue.r = defValue.r + weight * (data.x - defValue.r);
                    defaultValue.g = defValue.g + weight * (data.y - defValue.g);
                    defaultValue.b = defValue.b + weight * (data.z - defValue.b);
                    defaultValue.a = defValue.a + weight * (data.w - defValue.a);
                }
            }
        }
        return defaultValue;
    }

    /**
     * @internal
     */
    private _applyPositionAndRotationEuler(nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, data: Vector3, out: Vector3): void {
        if (nodeOwner.updateMark === this._updateMark) {//一定非第一层
            if (additive) {
                out.x += weight * data.x;
                out.y += weight * data.y;
                out.z += weight * data.z;
            } else {
                var oriX: number = out.x;
                var oriY: number = out.y;
                var oriZ: number = out.z;
                out.x = oriX + weight * (data.x - oriX);
                out.y = oriY + weight * (data.y - oriY);
                out.z = oriZ + weight * (data.z - oriZ);
            }
        } else {
            if (isFirstLayer) {
                if (additive) {
                    var defValue: Vector3 = nodeOwner.defaultValue;
                    out.x = defValue.x + data.x;
                    out.y = defValue.y + data.y;
                    out.z = defValue.z + data.z;
                } else {
                    out.x = data.x;
                    out.y = data.y;
                    out.z = data.z;
                }
            } else {
                defValue = nodeOwner.defaultValue;
                if (additive) {
                    out.x = defValue.x + weight * data.x;
                    out.y = defValue.y + weight * data.y;
                    out.z = defValue.z + weight * data.z;
                } else {
                    var defX: number = defValue.x;
                    var defY: number = defValue.y;
                    var defZ: number = defValue.z;
                    out.x = defX + weight * (data.x - defX);
                    out.y = defY + weight * (data.y - defY);
                    out.z = defZ + weight * (data.z - defZ);
                }
            }
        }
    }

    /**
     * @internal
     */
    private _applyRotation(nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, clipRot: Quaternion, localRotation: Quaternion): void {
        if (nodeOwner.updateMark === this._updateMark) {//一定非第一层
            if (additive) {
                var tempQuat: Quaternion = Animator._tempQuaternion1;//使用临时四元数_tempQuaternion1，避免引用错乱
                Utils3D.quaternionWeight(clipRot, weight, tempQuat);
                tempQuat.normalize(tempQuat);
                Quaternion.multiply(localRotation, tempQuat, localRotation);
            } else {
                Quaternion.lerp(localRotation, clipRot, weight, localRotation);
            }
        } else {
            if (isFirstLayer) {
                if (additive) {
                    var defaultRot: Quaternion = nodeOwner.defaultValue;
                    Quaternion.multiply(defaultRot, clipRot, localRotation);
                } else {
                    localRotation.x = clipRot.x;
                    localRotation.y = clipRot.y;
                    localRotation.z = clipRot.z;
                    localRotation.w = clipRot.w;
                }
            } else {
                defaultRot = nodeOwner.defaultValue;
                if (additive) {
                    tempQuat = Animator._tempQuaternion1;
                    Utils3D.quaternionWeight(clipRot, weight, tempQuat);
                    tempQuat.normalize(tempQuat);
                    Quaternion.multiply(defaultRot, tempQuat, localRotation);
                } else {
                    Quaternion.lerp(defaultRot, clipRot, weight, localRotation);
                }
            }
        }
    }

    /**
     * @internal
     */
    private _applyScale(nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, clipSca: Vector3, localScale: Vector3): void {
        if (nodeOwner.updateMark === this._updateMark) {//一定非第一层
            if (additive) {
                var scale: Vector3 = Animator._tempVector31;
                Utils3D.scaleWeight(clipSca, weight, scale);
                localScale.x = localScale.x * scale.x;
                localScale.y = localScale.y * scale.y;
                localScale.z = localScale.z * scale.z;
            } else {
                Utils3D.scaleBlend(localScale, clipSca, weight, localScale);
            }
        } else {
            if (isFirstLayer) {
                if (additive) {
                    var defaultSca: Vector3 = nodeOwner.defaultValue;
                    localScale.x = defaultSca.x * clipSca.x;
                    localScale.y = defaultSca.y * clipSca.y;
                    localScale.z = defaultSca.z * clipSca.z;
                } else {
                    localScale.x = clipSca.x;
                    localScale.y = clipSca.y;
                    localScale.z = clipSca.z;
                }
            } else {
                defaultSca = nodeOwner.defaultValue;
                if (additive) {
                    scale = Animator._tempVector31;
                    Utils3D.scaleWeight(clipSca, weight, scale);
                    localScale.x = defaultSca.x * scale.x;
                    localScale.y = defaultSca.y * scale.y;
                    localScale.z = defaultSca.z * scale.z;
                } else {
                    Utils3D.scaleBlend(defaultSca, clipSca, weight, localScale);
                }
            }
        }
    }

    /**
     * @internal
     */
    private _applyCrossData(nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, srcValue: any, desValue: any, crossWeight: number): void {
        var pro: any = nodeOwner.propertyOwner;
        if (pro) {
            switch (nodeOwner.type) {
                case KeyFrameValueType.Float: //Float
                    var proPat: string[] = nodeOwner.property!;
                    var m: number = proPat.length - 1;
                    for (var j: number = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro)//属性可能或被置空
                            break;
                    }

                    var crossValue: number = srcValue + crossWeight * (desValue - srcValue);
                    nodeOwner.value = crossValue;
                    const lastpro = proPat[m];
                    if (!nodeOwner.isMaterial) {
                        pro && (pro[lastpro] = this._applyFloat(pro[lastpro], nodeOwner, additive, weight, isFirstLayer, crossValue));
                    } else {
                        pro && (pro as Material).setFloat(lastpro, this._applyFloat((pro as Material).getFloat(lastpro), nodeOwner, additive, weight, isFirstLayer, crossValue));
                    }
                    break;
                case KeyFrameValueType.Position: //Position
                    var localPos: Vector3 = pro.localPosition;
                    var position: Vector3 = nodeOwner.value;
                    var srcX: number = srcValue.x, srcY: number = srcValue.y, srcZ: number = srcValue.z;
                    position.x = srcX + crossWeight * (desValue.x - srcX);
                    position.y = srcY + crossWeight * (desValue.y - srcY);
                    position.z = srcZ + crossWeight * (desValue.z - srcZ);
                    this._applyPositionAndRotationEuler(nodeOwner, additive, weight, isFirstLayer, position, localPos);
                    pro.localPosition = localPos;
                    break;
                case KeyFrameValueType.Rotation: //Rotation
                    var localRot: Quaternion = pro.localRotation;
                    var rotation: Quaternion = nodeOwner.value;
                    Quaternion.lerp(srcValue, desValue, crossWeight, rotation);
                    this._applyRotation(nodeOwner, additive, weight, isFirstLayer, rotation, localRot);
                    pro.localRotation = localRot;
                    break;
                case KeyFrameValueType.Scale: //Scale
                    var localSca: Vector3 = pro.localScale;
                    var scale: Vector3 = nodeOwner.value;
                    Utils3D.scaleBlend(srcValue, desValue, crossWeight, scale);
                    this._applyScale(nodeOwner, additive, weight, isFirstLayer, scale, localSca);
                    pro.localScale = localSca;
                    break;
                case KeyFrameValueType.RotationEuler: //RotationEuler
                    var localEuler: Vector3 = pro.localRotationEuler;
                    var rotationEuler: Vector3 = nodeOwner.value;
                    srcX = srcValue.x, srcY = srcValue.y, srcZ = srcValue.z;
                    rotationEuler.x = srcX + crossWeight * (desValue.x - srcX);
                    rotationEuler.y = srcY + crossWeight * (desValue.y - srcY);
                    rotationEuler.z = srcZ + crossWeight * (desValue.z - srcZ);
                    this._applyPositionAndRotationEuler(nodeOwner, additive, weight, isFirstLayer, rotationEuler, localEuler);
                    pro.localRotationEuler = localEuler;
                    break;
                case KeyFrameValueType.Color:
                    //TODO
                    break;
                case KeyFrameValueType.Vector2:
                    //TODO
                    break;
                case KeyFrameValueType.Vector4:
                    //TODO
                    break;
                case KeyFrameValueType.Vector3:
                    //TODO
                    break;
            }
            nodeOwner.updateMark = this._updateMark;
        }
    }

    /**
     * 赋值Node数据
     * @param stateInfo 动画状态
     * @param additive 是否为addtive
     * @param weight state权重
     * @param isFirstLayer 是否是第一层
     */
    private _setClipDatasToNode(stateInfo: AnimatorState, additive: boolean, weight: number, isFirstLayer: boolean, controllerLayer: AnimatorControllerLayer = null): void {
        var realtimeDatas: Array<number | Vector3 | Quaternion | Vector2 | Vector4 | Color> = stateInfo._realtimeDatas;
        var nodes: KeyframeNodeList = stateInfo._clip!._nodes!;
        var nodeOwners: KeyframeNodeOwner[] = stateInfo._nodeOwners;
        for (var i: number = 0, n: number = nodes.count; i < n; i++) {
            var nodeOwner: KeyframeNodeOwner = nodeOwners[i];
            if (nodeOwner) {//骨骼中没有该节点
                var node = nodes.getNodeByIndex(i);
                if (controllerLayer.avatarMask && (!controllerLayer.avatarMask.getTransformActive(node.nodePath))) {
                    continue;
                }
                var pro: any = nodeOwner.propertyOwner;
                let value: string;
                if (pro) {
                    switch (nodeOwner.type) {
                        case KeyFrameValueType.Float: //Float
                            var proPat: string[] = nodeOwner.property!;
                            var m: number = proPat.length - 1;
                            for (var j: number = 0; j < m; j++) {
                                pro = pro[proPat[j]];
                                if (!pro)//属性可能或被置空
                                    break;
                            }
                            //pro && this._applyFloat(pro, proPat[m], nodeOwner, additive, weight, isFirstLayer, <number>realtimeDatas[i]);
                            let lastpro = proPat[m];
                            if (!nodeOwner.isMaterial) {
                                pro && (pro[lastpro] = this._applyFloat(pro[lastpro], nodeOwner, additive, weight, isFirstLayer, <number>realtimeDatas[i]));
                            } else {
                                pro && (pro as Material).setFloat(lastpro, this._applyFloat(0, nodeOwner, additive, weight, isFirstLayer, <number>realtimeDatas[i]));
                            }
                            break;
                        case KeyFrameValueType.Position: //Position
                            var localPos: Vector3 = pro.localPosition;
                            this._applyPositionAndRotationEuler(nodeOwner, additive, weight, isFirstLayer, <Vector3>realtimeDatas[i], localPos);
                            pro.localPosition = localPos;
                            break;
                        case KeyFrameValueType.Rotation: //Rotation
                            var localRot: Quaternion = pro.localRotation;
                            this._applyRotation(nodeOwner, additive, weight, isFirstLayer, <Quaternion>realtimeDatas[i], localRot);
                            pro.localRotation = localRot;
                            break;
                        case KeyFrameValueType.Scale: //Scale
                            var localSca: Vector3 = pro.localScale;
                            this._applyScale(nodeOwner, additive, weight, isFirstLayer, <Vector3>realtimeDatas[i], localSca);
                            pro.localScale = localSca;
                            break;
                        case KeyFrameValueType.RotationEuler: //RotationEuler
                            var localEuler: Vector3 = pro.localRotationEuler;
                            this._applyPositionAndRotationEuler(nodeOwner, additive, weight, isFirstLayer, <Vector3>realtimeDatas[i], localEuler);
                            pro.localRotationEuler = localEuler;
                            break;
                        case KeyFrameValueType.Vector2://vec2
                            var proPat: string[] = nodeOwner.property!;
                            var m: number = proPat.length - 1;
                            for (var j: number = 0; j < m; j++) {
                                pro = pro[proPat[j]];
                                if (!pro)//属性可能或被置空
                                    break;
                            }
                            value = proPat[m];
                            if (!nodeOwner.isMaterial) {
                                pro && (pro[value] = this._applyVec2(pro[value], nodeOwner, additive, weight, isFirstLayer, <Vector2>realtimeDatas[i]));
                            } else {
                                pro && pro.getVector2(value) && (pro as Material).setVector2(value, this._applyVec2(pro.getVector2(value), nodeOwner, additive, weight, isFirstLayer, <Vector2>realtimeDatas[i]));
                            }
                            break;
                        case KeyFrameValueType.Vector3://vec3
                            var proPat: string[] = nodeOwner.property!;
                            var m: number = proPat.length - 1;
                            for (var j: number = 0; j < m; j++) {
                                pro = pro[proPat[j]];
                                if (!pro)//属性可能或被置空
                                    break;
                            }
                            value = proPat[m];
                            if (!nodeOwner.isMaterial) {
                                pro && (pro[value] = this._applyVec3(pro[value], nodeOwner, additive, weight, isFirstLayer, <Vector3>realtimeDatas[i]));
                            } else {
                                pro && pro.getVector3(value) && (pro as Material).setVector3(value, this._applyVec3(pro.getVector3(value), nodeOwner, additive, weight, isFirstLayer, <Vector3>realtimeDatas[i]));
                            }
                            break;
                        case KeyFrameValueType.Vector4://vec4
                            var proPat: string[] = nodeOwner.property!;
                            var m: number = proPat.length - 1;
                            for (var j: number = 0; j < m; j++) {
                                pro = pro[proPat[j]];
                                if (!pro)//属性可能或被置空
                                    break;
                            }
                            value = proPat[m];
                            if (!nodeOwner.isMaterial) {
                                pro && (pro[value] = this._applyVec4(pro[value], nodeOwner, additive, weight, isFirstLayer, <Vector4>realtimeDatas[i]));
                            } else {
                                pro && pro.getVector4(value) && (pro as Material).setVector4(value, this._applyVec4(pro.getVector4(value), nodeOwner, additive, weight, isFirstLayer, <Vector4>realtimeDatas[i]));
                            }
                            break;
                        case KeyFrameValueType.Color://Color
                            var proPat: string[] = nodeOwner.property!;
                            var m: number = proPat.length - 1;
                            for (var j: number = 0; j < m; j++) {
                                pro = pro[proPat[j]];
                                if (!pro)//属性可能或被置空
                                    break;
                            }
                            value = proPat[m];
                            if (!nodeOwner.isMaterial) {
                                pro && (pro[value] = this._applyColor(pro[value], nodeOwner, additive, weight, isFirstLayer, <Vector4>realtimeDatas[i]));
                            } else {
                                pro && pro.getColor(value) && (pro as Material).setColor(value, this._applyColor(pro.getColor(value), nodeOwner, additive, weight, isFirstLayer, <Vector4>realtimeDatas[i]));
                            }
                            break;
                    }
                    nodeOwner.updateMark = this._updateMark;
                }
            }
        }
    }

    /**
     * @internal
     */
    private _setCrossClipDatasToNode(controllerLayer: AnimatorControllerLayer, srcState: AnimatorState, destState: AnimatorState, crossWeight: number, isFirstLayer: boolean): void {
        var nodeOwners: KeyframeNodeOwner[] = controllerLayer._crossNodesOwners;
        var ownerCount: number = controllerLayer._crossNodesOwnersCount;
        var additive: boolean = controllerLayer.blendingMode !== AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
        var weight: number = controllerLayer.defaultWeight;

        var destRealtimeDatas: Array<number | Vector3 | Quaternion> = destState._realtimeDatas;
        var destDataIndices: number[] = controllerLayer._destCrossClipNodeIndices;
        var destNodeOwners: KeyframeNodeOwner[] = destState._nodeOwners;
        var srcRealtimeDatas: Array<number | Vector3 | Quaternion> = srcState._realtimeDatas;
        var srcDataIndices: number[] = controllerLayer._srcCrossClipNodeIndices;
        var srcNodeOwners: KeyframeNodeOwner[] = srcState._nodeOwners;

        for (var i: number = 0; i < ownerCount; i++) {
            var nodeOwner: KeyframeNodeOwner = nodeOwners[i];
            if (nodeOwner) {
                var srcIndex: number = srcDataIndices[i];
                var destIndex: number = destDataIndices[i];
                var srcValue: any = srcIndex !== -1 ? srcRealtimeDatas[srcIndex] : destNodeOwners[destIndex].defaultValue;
                var desValue: any = destIndex !== -1 ? destRealtimeDatas[destIndex] : srcNodeOwners[srcIndex].defaultValue;
                if (!desValue) {
                    desValue = srcNodeOwners[srcIndex].defaultValue;
                }
                if (!controllerLayer.avatarMask || controllerLayer.avatarMask.getTransformActive(nodeOwner.nodePath)) {
                    this._applyCrossData(nodeOwner, additive, weight, isFirstLayer, srcValue, desValue, crossWeight);
                }
            }
        }
    }


    /**
     * @internal
     */
    private _setFixedCrossClipDatasToNode(controllerLayer: AnimatorControllerLayer, destState: AnimatorState, crossWeight: number, isFirstLayer: boolean): void {
        var nodeOwners: KeyframeNodeOwner[] = controllerLayer._crossNodesOwners;
        var ownerCount: number = controllerLayer._crossNodesOwnersCount;
        var additive: boolean = controllerLayer.blendingMode !== AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
        var weight: number = controllerLayer.defaultWeight;
        var destRealtimeDatas: Array<number | Vector3 | Quaternion> = destState._realtimeDatas;
        var destDataIndices: number[] = controllerLayer._destCrossClipNodeIndices;

        for (var i: number = 0; i < ownerCount; i++) {
            var nodeOwner: KeyframeNodeOwner = nodeOwners[i];
            if (nodeOwner) {
                var destIndex: number = destDataIndices[i];
                var srcValue: any = nodeOwner.crossFixedValue;
                var desValue;
                if (destIndex == -1 || !destRealtimeDatas[destIndex]) {
                    desValue = nodeOwner.defaultValue;
                } else {
                    desValue = destRealtimeDatas[destIndex];
                }
                this._applyCrossData(nodeOwner, additive, weight, isFirstLayer, srcValue, desValue, crossWeight);
            }
        }
    }

    /**
     * @internal
     */
    private _revertDefaultKeyframeNodes(clipStateInfo: AnimatorState): void {
        var nodeOwners: KeyframeNodeOwner[] = clipStateInfo._nodeOwners;
        for (var i: number = 0, n: number = nodeOwners.length; i < n; i++) {
            var nodeOwner: KeyframeNodeOwner = nodeOwners[i];
            if (nodeOwner) {
                var pro: any = nodeOwner.propertyOwner;
                let value: string;
                if (pro) {
                    switch (nodeOwner.type) {
                        case KeyFrameValueType.Float:
                            var proPat: string[] = nodeOwner.property!;
                            var m: number = proPat.length - 1;
                            for (var j: number = 0; j < m; j++) {
                                pro = pro[proPat[j]];
                                if (!pro)//属性可能或被置空
                                    break;
                            }
                            //pro && this._applyFloat(pro, proPat[m], nodeOwner, additive, weight, isFirstLayer, <number>realtimeDatas[i]);
                            let lastpro = proPat[m];
                            if (!nodeOwner.isMaterial) {
                                pro && (pro[lastpro] = nodeOwner.defaultValue);
                            } else {
                                pro && (pro as Material).setFloat(lastpro, nodeOwner.defaultValue);
                            }
                            break;
                        case KeyFrameValueType.Position:
                            var locPos: Vector3 = pro.localPosition;
                            var def: Vector3 = nodeOwner.defaultValue;
                            locPos.x = def.x;
                            locPos.y = def.y;
                            locPos.z = def.z;
                            pro.localPosition = locPos;
                            break;
                        case KeyFrameValueType.Rotation:
                            var locRot: Quaternion = pro.localRotation;
                            var defQua: Quaternion = nodeOwner.defaultValue;
                            locRot.x = defQua.x;
                            locRot.y = defQua.y;
                            locRot.z = defQua.z;
                            locRot.w = defQua.w;
                            pro.localRotation = locRot;
                            break;
                        case KeyFrameValueType.Scale:
                            var locSca: Vector3 = pro.localScale;
                            def = nodeOwner.defaultValue;
                            locSca.x = def.x;
                            locSca.y = def.y;
                            locSca.z = def.z;
                            pro.localScale = locSca;
                            break;
                        case KeyFrameValueType.RotationEuler:
                            var locEul: Vector3 = pro.localRotationEuler;
                            def = nodeOwner.defaultValue;
                            locEul.x = def.x;
                            locEul.y = def.y;
                            locEul.z = def.z;
                            pro.localRotationEuler = locEul;
                            break;
                        case KeyFrameValueType.Vector2:
                            var proPat: string[] = nodeOwner.property!;
                            var m: number = proPat.length - 1;
                            for (var j: number = 0; j < m; j++) {
                                pro = pro[proPat[j]];
                                if (!pro)//属性可能或被置空
                                    break;
                            }
                            value = proPat[m];
                            if (!nodeOwner.isMaterial) {
                                pro && (pro[value] = nodeOwner.defaultValue);
                            } else {
                                pro && pro.getVector2(value) && (pro as Material).setVector2(value, nodeOwner.defaultValue);
                            }
                            break;
                        case KeyFrameValueType.Vector3:
                            var proPat: string[] = nodeOwner.property!;
                            var m: number = proPat.length - 1;
                            for (var j: number = 0; j < m; j++) {
                                pro = pro[proPat[j]];
                                if (!pro)//属性可能或被置空
                                    break;
                            }
                            value = proPat[m];
                            if (!nodeOwner.isMaterial) {
                                pro && (pro[value] = nodeOwner.defaultValue);
                            } else {
                                pro && pro.getVector3(value) && (pro as Material).setVector3(value, nodeOwner.defaultValue);
                            }
                            break;
                        case KeyFrameValueType.Vector4:
                            var proPat: string[] = nodeOwner.property!;
                            var m: number = proPat.length - 1;
                            for (var j: number = 0; j < m; j++) {
                                pro = pro[proPat[j]];
                                if (!pro)//属性可能或被置空
                                    break;
                            }
                            value = proPat[m];
                            if (!nodeOwner.isMaterial) {
                                pro && (pro[value] = nodeOwner.defaultValue);
                            } else {
                                pro && pro.getVector3(value) && (pro as Material).setVector3(value, nodeOwner.defaultValue);
                            }
                            break;
                        case KeyFrameValueType.Color:
                            var proPat: string[] = nodeOwner.property!;
                            var m: number = proPat.length - 1;
                            for (var j: number = 0; j < m; j++) {
                                pro = pro[proPat[j]];
                                if (!pro)//属性可能或被置空
                                    break;
                            }
                            value = proPat[m];
                            let tempColor = Animator._tempColor;
                            tempColor.r = nodeOwner.defaultValue.x;
                            tempColor.g = nodeOwner.defaultValue.y;
                            tempColor.b = nodeOwner.defaultValue.z;
                            tempColor.a = nodeOwner.defaultValue.w;
                            if (!nodeOwner.isMaterial) {
                                pro && (pro[value] = tempColor);
                            } else {
                                pro && pro.getColor(value) && (pro as Material).setColor(value, tempColor);
                            }
                            break;
                        default:
                            throw "Animator:unknown type.";
                    }

                }
            }
        }
    }

    /** @internal */
    onAfterDeserialize(): void {
        let arr = (<any>this).controllerLayers;
        if (!arr || null != this.controller)
            return;
        delete (<any>this).controllerLayers;
        this._controllerLayers.length = 0;
        for (let layer of arr) {
            this.addControllerLayer(layer);
        }
    }

    protected _onEnable(): void {
        for (let i = 0, n = this._controllerLayers.length; i < n; i++) {
            if (this._controllerLayers[i].playOnWake) {
                let defaultClip: AnimatorState = this.getDefaultState(i);
                (defaultClip) && (this.play(null, i, 0));
            }
        }
    }

    protected _onDestroy() {
        for (let i = 0, n = this._controllerLayers.length; i < n; i++)
            this._controllerLayers[i]._removeReference();
    }

    private _applyUpdateMode(delta: number): number {
        let ret;
        switch (this._updateMode) {
            case AnimatorUpdateMode.Normal:
                ret = delta;
                break;
            case AnimatorUpdateMode.LowFrame:
                ret = (Stat.loopCount % this._lowUpdateDelty == 0) ? delta * this._lowUpdateDelty : 0;
                break;
            case AnimatorUpdateMode.UnScaleTime:
                ret = 0;
                break;
        }
        return ret;
    }

    /**
     * @internal
     */
    _handleSpriteOwnersBySprite(isLink: boolean, path: string[], sprite: Sprite3D): void {
        for (var i: number = 0, n: number = this._controllerLayers.length; i < n; i++) {
            if (!this._controllerLayers[i].enable)
                continue;
            var clipStateInfos: AnimatorState[] = this._controllerLayers[i]._states;
            for (var j: number = 0, m: number = clipStateInfos.length; j < m; j++) {
                var clipStateInfo: AnimatorState = clipStateInfos[j];
                var clip: AnimationClip = clipStateInfo._clip!;
                var nodePath: string = path.join("/");
                var ownersNodes: KeyframeNode[] = clip._nodesMap[nodePath];
                if (ownersNodes) {
                    var nodeOwners: KeyframeNodeOwner[] = clipStateInfo._nodeOwners;
                    for (var k: number = 0, p: number = ownersNodes.length; k < p; k++) {
                        if (isLink)
                            this._addKeyframeNodeOwner(nodeOwners, ownersNodes[k], sprite);
                        else
                            this._removeKeyframeNodeOwner(nodeOwners, ownersNodes[k]);
                    }
                }
            }
        }
    }

    /**
     * @inheritDoc
     * @internal
     * @override
     */
    _parse(data: any): void {
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
    }

    /**
     * @internal
     */
    onUpdate(): void {
        let timer = this.owner._scene.timer;
        let delta = timer._delta / 1000.0;//Laya.timer.delta已结包含Laya.timer.scale
        delta = this._applyUpdateMode(delta);
        if (this._speed === 0 || delta === 0)//delta为0无需更新,可能造成crossWeight计算值为NaN
            return;
        if (!Stat.enableAnimatorUpdate)
            return;
        var needRender = true;//TODO:有渲染节点才可将needRender变为true
        var i, n;
        this._updateMark++;
        for (i = 0, n = this._controllerLayers.length; i < n; i++) {
            var controllerLayer: AnimatorControllerLayer = this._controllerLayers[i];
            if (!controllerLayer.enable)
                continue;
            var playStateInfo: AnimatorPlayState = controllerLayer._playStateInfo!;
            var crossPlayStateInfo: AnimatorPlayState = controllerLayer._crossPlayStateInfo!;
            addtive = controllerLayer.blendingMode !== AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
            switch (controllerLayer._playType) {
                case 0:
                    var animatorState: AnimatorState = playStateInfo._currentState!;
                    var clip: AnimationClip = animatorState._clip!;
                    var speed: number = this._speed * animatorState.speed;
                    var finish: boolean = playStateInfo._finish;//提前取出finish,防止最后一帧跳过
                    finish || this._updatePlayer(animatorState, playStateInfo, delta * speed, clip.islooping, i);
                    if (needRender) {
                        var addtive: boolean = controllerLayer.blendingMode !== AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
                        this._updateClipDatas(animatorState, addtive, playStateInfo, controllerLayer.avatarMask);//clipDatas为逐动画文件,防止两个使用同一动画文件的Animator数据错乱,即使动画停止也要updateClipDatas
                        this._setClipDatasToNode(animatorState, addtive, controllerLayer.defaultWeight, i === 0, controllerLayer);//多层动画混合时即使动画停止也要设置数据
                        finish || this._updateEventScript(animatorState, playStateInfo);
                    }
                    finish || this._updateStateFinish(animatorState, playStateInfo);
                    break;
                case 1:
                    animatorState = playStateInfo._currentState!;
                    clip = animatorState._clip!;
                    var crossState: AnimatorState = controllerLayer._crossPlayState;
                    var crossClip: AnimationClip = crossState._clip!;
                    var crossDuratuion: number = controllerLayer._crossDuration;
                    var startPlayTime: number = crossPlayStateInfo._startPlayTime;
                    var crossClipDuration: number = crossClip._duration - startPlayTime;
                    var crossScale: number = crossDuratuion > crossClipDuration ? crossClipDuration / crossDuratuion : 1.0;//如果过度时间大于过度动作时间,则减慢速度
                    var crossSpeed: number = this._speed * crossState.speed;
                    this._updatePlayer(crossState, crossPlayStateInfo, delta * crossScale * crossSpeed, crossClip.islooping, i);
                    var crossWeight: number = ((crossPlayStateInfo._elapsedTime - startPlayTime) / crossScale) / crossDuratuion;
                    var needUpdateFinishcurrentState = false;
                    if (crossWeight >= 1.0) {
                        if (needRender) {
                            this._updateClipDatas(crossState, addtive, crossPlayStateInfo, controllerLayer.avatarMask);
                            this._setClipDatasToNode(crossState, addtive, controllerLayer.defaultWeight, i === 0, controllerLayer);

                            controllerLayer._playType = 0;//完成融合,切换到正常播放状态
                            playStateInfo._currentState = crossState;
                            crossPlayStateInfo._cloneTo(playStateInfo);
                        }
                    } else {
                        if (!playStateInfo._finish) {
                            speed = this._speed * animatorState.speed;
                            needUpdateFinishcurrentState = true;
                            this._updatePlayer(animatorState, playStateInfo, delta * speed, clip.islooping, i);
                            if (needRender)
                                this._updateClipDatas(animatorState, addtive, playStateInfo, controllerLayer.avatarMask);
                        }
                        if (needRender) {
                            this._updateClipDatas(crossState, addtive, crossPlayStateInfo, controllerLayer.avatarMask);
                            this._setCrossClipDatasToNode(controllerLayer, animatorState, crossState, crossWeight, i === 0);
                        }
                    }
                    if (needRender) {
                        this._updateEventScript(animatorState, playStateInfo);
                        this._updateEventScript(crossState, crossPlayStateInfo);
                    }
                    this._updateStateFinish(crossState, crossPlayStateInfo);
                    needUpdateFinishcurrentState && this._updateStateFinish(playStateInfo._currentState, playStateInfo);
                    break;
                case 2:
                    crossState = controllerLayer._crossPlayState;
                    crossClip = crossState._clip!;
                    crossDuratuion = controllerLayer._crossDuration;
                    startPlayTime = crossPlayStateInfo._startPlayTime;
                    crossClipDuration = crossClip._duration - startPlayTime;
                    crossScale = crossDuratuion > crossClipDuration ? crossClipDuration / crossDuratuion : 1.0;//如果过度时间大于过度动作时间,则减慢速度
                    crossSpeed = this._speed * crossState.speed;
                    this._updatePlayer(crossState, crossPlayStateInfo, delta * crossScale * crossSpeed, crossClip.islooping, i);
                    if (needRender) {
                        crossWeight = ((crossPlayStateInfo._elapsedTime - startPlayTime) / crossScale) / crossDuratuion;
                        if (crossWeight >= 1.0) {
                            this._updateClipDatas(crossState, addtive, crossPlayStateInfo, controllerLayer.avatarMask);
                            this._setClipDatasToNode(crossState, addtive, 1.0, i === 0, controllerLayer);
                            controllerLayer._playType = 0;//完成融合,切换到正常播放状态
                            playStateInfo._currentState = crossState;
                            crossPlayStateInfo._cloneTo(playStateInfo);
                        } else {
                            this._updateClipDatas(crossState, addtive, crossPlayStateInfo, controllerLayer.avatarMask);
                            this._setFixedCrossClipDatasToNode(controllerLayer, crossState, crossWeight, i === 0);
                        }
                        this._updateEventScript(crossState, crossPlayStateInfo);
                    }
                    this._updateStateFinish(crossState, crossPlayStateInfo);
                    break;
            }
        }
    }

    /**
     * @internal
     * @override
     */
    _cloneTo(dest: Component): void {
        var animator: Animator = (<Animator>dest);
        animator.cullingMode = this.cullingMode;

        for (var i: number = 0, n: number = this._controllerLayers.length; i < n; i++) {
            var controllLayer: AnimatorControllerLayer = this._controllerLayers[i];
            animator.addControllerLayer(controllLayer.clone());
            var animatorStates: AnimatorState[] = controllLayer._states;
            for (var j: number = 0, m: number = animatorStates.length; j < m; j++) {
                var state: AnimatorState = animatorStates[j].clone();
                var cloneLayer: AnimatorControllerLayer = animator.getControllerLayer(i);
                cloneLayer.addState(state);
                (j == 0) && (cloneLayer.defaultState = state);
            }
        }
    }

    /**
     * 获取默认动画状态。
     * @param	layerIndex 层索引。
     * @return 默认动画状态。
     */
    getDefaultState(layerIndex: number = 0): AnimatorState {
        var controllerLayer: AnimatorControllerLayer = this._controllerLayers[layerIndex];
        return controllerLayer.defaultState;
    }

    /**
     * 添加动画状态。
     * @param	state 动画状态。
     * @param   layerIndex 层索引。
     */
    addState(state: AnimatorState, layerIndex: number = 0): void {
        var controllerLayer: AnimatorControllerLayer = this._controllerLayers[layerIndex];
        controllerLayer.addState(state);
        console.warn("Animator:this function is discard,please use animatorControllerLayer.addState() instead.");
    }

    /**
     * 移除动画状态。
     * @param	state 动画状态。
     * @param   layerIndex 层索引。
     */
    removeState(state: AnimatorState, layerIndex: number = 0): void {
        var controllerLayer: AnimatorControllerLayer = this._controllerLayers[layerIndex];
        controllerLayer.removeState(state);
        console.warn("Animator:this function is discard,please use animatorControllerLayer.removeState() instead.");
    }

    /**
     * 添加控制器层。
     */
    addControllerLayer(controllderLayer: AnimatorControllerLayer): void {
        this._controllerLayers.push(controllderLayer);
        controllderLayer._animator = this;//TODO:可以复用,不应该这么设计
        controllderLayer._addReference();
        var states: AnimatorState[] = controllderLayer._states;
        for (var i: number = 0, n: number = states.length; i < n; i++)
            this._getOwnersByClip(states[i]);
    }

    /**
     * 获取控制器层。
     */
    getControllerLayer(layerInex: number = 0): AnimatorControllerLayer {
        return this._controllerLayers[layerInex];
    }

    /**
     * 播放动画。
     * @param	name 如果为null则播放默认动画，否则按名字播放动画片段。
     * @param	layerIndex 层索引。
     * @param	normalizedTime 归一化的播放起始时间。
     */
    play(name: string | null = null, layerIndex: number = 0, normalizedTime: number = Number.NEGATIVE_INFINITY): void {
        var controllerLayer: AnimatorControllerLayer = this._controllerLayers[layerIndex];
        if (controllerLayer) {
            var defaultState: AnimatorState = controllerLayer.defaultState;
            if (!name && !defaultState)
                throw new Error("Animator:must have default clip value,please set clip property.");
            var playStateInfo: AnimatorPlayState = controllerLayer._playStateInfo!;
            var curPlayState: AnimatorState = playStateInfo._currentState!;


            var animatorState: AnimatorState = name ? controllerLayer.getAnimatorState(name) : defaultState;
            if (!animatorState._clip)
                return;

            var clipDuration: number = animatorState._clip!._duration;
            var calclipduration = animatorState._clip!._duration * (animatorState.clipEnd - animatorState.clipStart);
            if (curPlayState !== animatorState) {
                if (normalizedTime !== Number.NEGATIVE_INFINITY)
                    playStateInfo._resetPlayState(clipDuration * normalizedTime, calclipduration);
                else
                    playStateInfo._resetPlayState(0.0, calclipduration);
                (curPlayState !== null && curPlayState !== animatorState) && (this._revertDefaultKeyframeNodes(curPlayState));
                controllerLayer._playType = 0;
                playStateInfo._currentState = animatorState;
            } else {
                if (normalizedTime !== Number.NEGATIVE_INFINITY) {
                    playStateInfo._resetPlayState(clipDuration * normalizedTime, calclipduration);
                    controllerLayer._playType = 0;
                }
            }
            var scripts: AnimatorStateScript[] = animatorState._scripts!;
            animatorState._eventStart();

        }
        else {
            console.warn("Invalid layerIndex " + layerIndex + ".");
        }
        if (this.owner._scene) {
            this.onUpdate();
        }
    }

    /**
     * 在当前动画状态和目标动画状态之间进行融合过渡播放。
     * @param	name 目标动画状态。
     * @param	transitionDuration 过渡时间,该值为当前动画状态的归一化时间，值在0.0~1.0之间。
     * @param	layerIndex 层索引。
     * @param	normalizedTime 归一化的播放起始时间。
     */
    crossFade(name: string, transitionDuration: number, layerIndex: number = 0, normalizedTime: number = Number.NEGATIVE_INFINITY): void {
        var controllerLayer = this._controllerLayers[layerIndex];
        if (controllerLayer) {
            var destAnimatorState = controllerLayer.getAnimatorState(name);
            if (destAnimatorState) {
                var playType = controllerLayer._playType;
                if (playType === -1) {//如果未曾调用过play则回滚到play方法
                    this.play(name, layerIndex, normalizedTime);
                    return;
                }

                var crossPlayStateInfo = controllerLayer._crossPlayStateInfo;
                var crossNodeOwners = controllerLayer._crossNodesOwners;
                var crossNodeOwnerIndicesMap = controllerLayer._crossNodesOwnersIndicesMap;

                var srcAnimatorState = controllerLayer._playStateInfo!._currentState;
                var destNodeOwners = destAnimatorState._nodeOwners;
                var destCrossClipNodeIndices = controllerLayer._destCrossClipNodeIndices;
                var destClip = destAnimatorState._clip;
                var destNodes = destClip._nodes!;
                var destNodesMap = destClip._nodesDic;
                var crossCount = 0;
                switch (playType) {
                    case 0:
                        var srcNodeOwners = srcAnimatorState!._nodeOwners;
                        var scrCrossClipNodeIndices = controllerLayer._srcCrossClipNodeIndices;
                        var srcClip = srcAnimatorState!._clip;
                        var srcNodes = srcClip!._nodes!;
                        var srcNodesMap = srcClip!._nodesDic;
                        controllerLayer._playType = 1;

                        var crossMark = ++controllerLayer._crossMark;
                        crossCount = controllerLayer._crossNodesOwnersCount = 0;

                        for (var i = 0, n = srcNodes.count; i < n; i++) {
                            var srcNode = srcNodes.getNodeByIndex(i);
                            var srcIndex = srcNode._indexInList;
                            var srcNodeOwner = srcNodeOwners[srcIndex];
                            if (srcNodeOwner) {
                                var srcFullPath = srcNode.fullPath;
                                scrCrossClipNodeIndices[crossCount] = srcIndex;
                                var destNode = destNodesMap[srcFullPath];
                                if (destNode)
                                    destCrossClipNodeIndices[crossCount] = destNode._indexInList;
                                else
                                    destCrossClipNodeIndices[crossCount] = -1;

                                crossNodeOwnerIndicesMap[srcFullPath] = crossMark;
                                crossNodeOwners[crossCount] = srcNodeOwner;
                                crossCount++;
                            }
                        }

                        for (i = 0, n = destNodes.count; i < n; i++) {
                            destNode = destNodes.getNodeByIndex(i);
                            var destIndex = destNode._indexInList;
                            var destNodeOwner = destNodeOwners[destIndex];
                            if (destNodeOwner) {
                                var destFullPath = destNode.fullPath;
                                if (!srcNodesMap[destFullPath]) {
                                    scrCrossClipNodeIndices[crossCount] = -1;
                                    destCrossClipNodeIndices[crossCount] = destIndex;

                                    crossNodeOwnerIndicesMap[destFullPath] = crossMark;
                                    crossNodeOwners[crossCount] = destNodeOwner;
                                    crossCount++;
                                }
                            }
                        }
                        break;
                    case 1:
                    case 2:
                        controllerLayer._playType = 2;
                        for (i = 0, n = crossNodeOwners.length; i < n; i++) {
                            var nodeOwner = crossNodeOwners[i];
                            nodeOwner.saveCrossFixedValue();
                            destNode = destNodesMap[nodeOwner.fullPath!];
                            if (destNode)
                                destCrossClipNodeIndices[i] = destNode._indexInList;
                            else
                                destCrossClipNodeIndices[i] = -1;
                        }

                        crossCount = controllerLayer._crossNodesOwnersCount;
                        crossMark = controllerLayer._crossMark;
                        for (i = 0, n = destNodes.count; i < n; i++) {
                            destNode = destNodes.getNodeByIndex(i);
                            destIndex = destNode._indexInList;
                            destNodeOwner = destNodeOwners[destIndex];
                            if (destNodeOwner) {
                                destFullPath = destNode.fullPath;
                                if (crossNodeOwnerIndicesMap[destFullPath] !== crossMark) {
                                    destCrossClipNodeIndices[crossCount] = destIndex;

                                    crossNodeOwnerIndicesMap[destFullPath] = crossMark;
                                    nodeOwner = destNodeOwners[destIndex];
                                    crossNodeOwners[crossCount] = nodeOwner;
                                    nodeOwner.saveCrossFixedValue();
                                    crossCount++;
                                }
                            }
                        }
                        break;
                    default:
                }
                controllerLayer._crossNodesOwnersCount = crossCount;
                controllerLayer._crossPlayState = destAnimatorState;
                controllerLayer._crossDuration = srcAnimatorState!._clip!._duration * transitionDuration;
                if (normalizedTime !== Number.NEGATIVE_INFINITY)
                    crossPlayStateInfo!._resetPlayState(destClip._duration * normalizedTime, controllerLayer._crossDuration);
                else
                    crossPlayStateInfo!._resetPlayState(0.0, controllerLayer._crossDuration);
                destAnimatorState._eventStart();
            }
            else {
                console.warn("Invalid name " + layerIndex + ".");
            }
        }
        else {
            console.warn("Invalid layerIndex " + layerIndex + ".");
        }
    }

    /**
     * set params value
     * @param name 
     */
    setParamsTrigger(name: number): void;
    setParamsTrigger(name: string): void;
    setParamsTrigger(name: string | number) {
        let id;
        if (typeof name == "number")
            id = name;
        else
            id = AnimatorStateCondition.conditionNameToID(name);
        this._animatorParams[id] = true;
    }

    /**
     * set params value
     * @param name 
     */
    setParamsNumber(name: number, value: number): void;
    setParamsNumber(name: string, value: number): void;
    setParamsNumber(name: string | number, value: number) {
        let id;
        if (typeof name == "number")
            id = name;
        else
            id = AnimatorStateCondition.conditionNameToID(name);
        this._animatorParams[id] = value;
    }

    /**
     * set params value
     * @param name 
     */
    setParamsBool(name: number, value: boolean): void;
    setParamsBool(name: string, value: boolean): void;
    setParamsBool(name: string | number, value: boolean) {
        let id;
        if (typeof name == "number")
            id = name;
        else
            id = AnimatorStateCondition.conditionNameToID(name);
        this._animatorParams[id] = value;
    }

    /**
     * get params value
     * @param name 
     */
    getParamsvalue(name: number): number | boolean;
    getParamsvalue(name: string): number | boolean;
    getParamsvalue(name: string | number): number | boolean {
        let id;
        if (typeof name == "number")
            id = name;
        else
            id = AnimatorStateCondition.conditionNameToID(name);
        return this._animatorParams[id];
    }


    /**
     * @deprecated 请使用animator.getControllerLayer(layerIndex).getCurrentPlayState()替换。use animator.getControllerLayer(layerIndex).getCurrentPlayState() instead
     * 获取当前的播放状态。
     * @param   layerIndex 层索引。
     * @return  动画播放状态。
     */
    getCurrentAnimatorPlayState(layerInex: number = 0): AnimatorPlayState {
        return this._controllerLayers[layerInex]._playStateInfo!;
    }
}


