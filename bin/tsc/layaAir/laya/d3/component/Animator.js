import { Component } from "../../components/Component";
import { LayaGL } from "../../layagl/LayaGL";
import { Loader } from "../../net/Loader";
import { Render } from "../../renders/Render";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Utils3D } from "../utils/Utils3D";
import { AnimatorControllerLayer } from "./AnimatorControllerLayer";
import { AnimatorState } from "./AnimatorState";
import { KeyframeNodeOwner } from "./KeyframeNodeOwner";
/**
 * <code>Animator</code> 类用于创建动画组件。
 */
export class Animator extends Component {
    /**
     * 创建一个 <code>Animation</code> 实例。
     */
    constructor() {
        super();
        this._keyframeNodeOwners = [];
        /**@internal */
        this._linkAvatarSpritesData = {};
        /**@internal */
        this._linkAvatarSprites = [];
        /**@internal */
        this._renderableSprites = [];
        /**	裁剪模式*/
        this.cullingMode = Animator.CULLINGMODE_CULLCOMPLETELY;
        this._controllerLayers = [];
        this._linkSprites = {};
        this._speed = 1.0;
        this._keyframeNodeOwnerMap = {};
        this._updateMark = 0;
    }
    /**
     * @internal
     */
    static _update(scene) {
        var pool = scene._animatorPool;
        var elements = pool.elements;
        for (var i = 0, n = pool.length; i < n; i++) {
            var animator = elements[i];
            (animator && animator.enabled) && (animator._update());
        }
    }
    /**
     * 获取动画的播放速度,1.0为正常播放速度。
     * @return 动画的播放速度。
     */
    get speed() {
        return this._speed;
    }
    /**
     * 设置动画的播放速度,1.0为正常播放速度。
     * @param 动画的播放速度。
     */
    set speed(value) {
        this._speed = value;
    }
    _linkToSprites(linkSprites) {
        for (var k in linkSprites) {
            var nodeOwner = this.owner;
            var path = linkSprites[k];
            for (var j = 0, m = path.length; j < m; j++) {
                var p = path[j];
                if (p === "") {
                    break;
                }
                else {
                    nodeOwner = nodeOwner.getChildByName(p);
                    if (!nodeOwner)
                        break;
                }
            }
            (nodeOwner) && (this.linkSprite3DToAvatarNode(k, nodeOwner)); //此时Avatar文件已经加载完成
        }
    }
    _addKeyframeNodeOwner(clipOwners, node, propertyOwner) {
        var nodeIndex = node._indexInList;
        var fullPath = node.fullPath;
        var keyframeNodeOwner = this._keyframeNodeOwnerMap[fullPath];
        if (keyframeNodeOwner) {
            keyframeNodeOwner.referenceCount++;
            clipOwners[nodeIndex] = keyframeNodeOwner;
        }
        else {
            var property = propertyOwner;
            for (var i = 0, n = node.propertyCount; i < n; i++) {
                property = property[node.getPropertyByIndex(i)];
                if (!property)
                    break;
            }
            keyframeNodeOwner = this._keyframeNodeOwnerMap[fullPath] = new KeyframeNodeOwner();
            keyframeNodeOwner.fullPath = fullPath;
            keyframeNodeOwner.indexInList = this._keyframeNodeOwners.length;
            keyframeNodeOwner.referenceCount = 1;
            keyframeNodeOwner.propertyOwner = propertyOwner;
            var propertyCount = node.propertyCount;
            var propertys = [];
            for (i = 0; i < propertyCount; i++)
                propertys[i] = node.getPropertyByIndex(i);
            keyframeNodeOwner.property = propertys;
            keyframeNodeOwner.type = node.type;
            if (property) { //查询成功后赋默认值
                if (node.type === 0) {
                    keyframeNodeOwner.defaultValue = property;
                }
                else {
                    var defaultValue = new property.constructor();
                    property.cloneTo(defaultValue);
                    keyframeNodeOwner.defaultValue = defaultValue;
                }
            }
            this._keyframeNodeOwners.push(keyframeNodeOwner);
            clipOwners[nodeIndex] = keyframeNodeOwner;
        }
    }
    /**
     * @internal
     */
    _removeKeyframeNodeOwner(nodeOwners, node) {
        var fullPath = node.fullPath;
        var keyframeNodeOwner = this._keyframeNodeOwnerMap[fullPath];
        if (keyframeNodeOwner) { //TODO:Avatar中没该节点,但动画文件有,不会保存_keyframeNodeOwnerMap在中,移除会出BUG,例如动画节点下的SkinnedMeshRender有动画帧，但Avatar中忽略了
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
    _getOwnersByClip(clipStateInfo) {
        var frameNodes = clipStateInfo._clip._nodes;
        var frameNodesCount = frameNodes.count;
        var nodeOwners = clipStateInfo._nodeOwners;
        nodeOwners.length = frameNodesCount;
        for (var i = 0; i < frameNodesCount; i++) {
            var node = frameNodes.getNodeByIndex(i);
            var property = this._avatar ? this._avatarNodeMap[this._avatar._rootNode.name] : this.owner; //如果有avatar需使用克隆节点
            for (var j = 0, m = node.ownerPathCount; j < m; j++) {
                var ownPat = node.getOwnerPathByIndex(j);
                if (ownPat === "") { //TODO:直接不存
                    break;
                }
                else {
                    property = property.getChildByName(ownPat);
                    if (!property)
                        break;
                }
            }
            if (property) {
                var propertyOwner = node.propertyOwner;
                (propertyOwner) && (property = property[propertyOwner]);
                property && this._addKeyframeNodeOwner(nodeOwners, node, property);
            }
        }
    }
    _updatePlayer(animatorState, playState, elapsedTime, islooping) {
        var clipDuration = animatorState._clip._duration * (animatorState.clipEnd - animatorState.clipStart);
        var lastElapsedTime = playState._elapsedTime;
        var elapsedPlaybackTime = lastElapsedTime + elapsedTime;
        playState._lastElapsedTime = lastElapsedTime;
        playState._elapsedTime = elapsedPlaybackTime;
        var normalizedTime = elapsedPlaybackTime / clipDuration; //TODO:时候可以都统一为归一化时间
        playState._normalizedTime = normalizedTime;
        var playTime = normalizedTime % 1.0;
        playState._normalizedPlayTime = playTime < 0 ? playTime + 1.0 : playTime;
        playState._duration = clipDuration;
        var scripts = animatorState._scripts;
        if ((!islooping && elapsedPlaybackTime >= clipDuration)) {
            playState._finish = true;
            playState._elapsedTime = clipDuration;
            playState._normalizedPlayTime = 1.0;
            if (scripts) {
                for (var i = 0, n = scripts.length; i < n; i++)
                    scripts[i].onStateExit();
            }
            return;
        }
        if (scripts) {
            for (i = 0, n = scripts.length; i < n; i++)
                scripts[i].onStateUpdate();
        }
    }
    _eventScript(scripts, events, eventIndex, endTime, front) {
        if (front) {
            for (var n = events.length; eventIndex < n; eventIndex++) {
                var event = events[eventIndex];
                if (event.time <= endTime) {
                    for (var j = 0, m = scripts.length; j < m; j++) {
                        var script = scripts[j];
                        var fun = script[event.eventName];
                        (fun) && (fun.apply(script, event.params));
                    }
                }
                else {
                    break;
                }
            }
        }
        else {
            for (; eventIndex >= 0; eventIndex--) {
                event = events[eventIndex];
                if (event.time >= endTime) {
                    for (j = 0, m = scripts.length; j < m; j++) {
                        script = scripts[j];
                        fun = script[event.eventName];
                        (fun) && (fun.apply(script, event.params));
                    }
                }
                else {
                    break;
                }
            }
        }
        return eventIndex;
    }
    _updateEventScript(stateInfo, playStateInfo) {
        var scripts = this.owner._scripts;
        if (scripts) { //TODO:play是否也换成此种计算
            var clip = stateInfo._clip;
            var events = clip._animationEvents;
            var clipDuration = clip._duration;
            var elapsedTime = playStateInfo._elapsedTime;
            var time = elapsedTime % clipDuration;
            var loopCount = Math.abs(Math.floor(elapsedTime / clipDuration) - Math.floor(playStateInfo._lastElapsedTime / clipDuration)); //backPlay可能为负数
            var frontPlay = playStateInfo._elapsedTime >= playStateInfo._lastElapsedTime;
            if (playStateInfo._lastIsFront !== frontPlay) {
                if (frontPlay)
                    playStateInfo._playEventIndex++;
                else
                    playStateInfo._playEventIndex--;
                playStateInfo._lastIsFront = frontPlay;
            }
            if (loopCount == 0) {
                playStateInfo._playEventIndex = this._eventScript(scripts, events, playStateInfo._playEventIndex, time, frontPlay);
            }
            else {
                if (frontPlay) {
                    this._eventScript(scripts, events, playStateInfo._playEventIndex, clipDuration, true);
                    for (var i = 0, n = loopCount - 1; i < n; i++)
                        this._eventScript(scripts, events, 0, clipDuration, true);
                    playStateInfo._playEventIndex = this._eventScript(scripts, events, 0, time, true);
                }
                else {
                    this._eventScript(scripts, events, playStateInfo._playEventIndex, 0, false);
                    var eventIndex = events.length - 1;
                    for (i = 0, n = loopCount - 1; i < n; i++)
                        this._eventScript(scripts, events, eventIndex, 0, false);
                    playStateInfo._playEventIndex = this._eventScript(scripts, events, eventIndex, time, false);
                }
            }
        }
    }
    _updateClipDatas(animatorState, addtive, playStateInfo, scale) {
        var clip = animatorState._clip;
        var clipDuration = clip._duration;
        var curPlayTime = animatorState.clipStart * clipDuration + playStateInfo._normalizedPlayTime * playStateInfo._duration;
        var currentFrameIndices = animatorState._currentFrameIndices;
        var frontPlay = playStateInfo._elapsedTime > playStateInfo._lastElapsedTime;
        clip._evaluateClipDatasRealTime(clip._nodes, curPlayTime, currentFrameIndices, addtive, frontPlay);
    }
    _applyFloat(pro, proName, nodeOwner, additive, weight, isFirstLayer, data) {
        if (nodeOwner.updateMark === this._updateMark) { //一定非第一层
            if (additive) {
                pro[proName] += weight * (data);
            }
            else {
                var oriValue = pro[proName];
                pro[proName] = oriValue + weight * (data - oriValue);
            }
        }
        else {
            if (isFirstLayer) {
                if (additive)
                    pro[proName] = nodeOwner.defaultValue + data;
                else
                    pro[proName] = data;
            }
            else {
                if (additive) {
                    pro[proName] = nodeOwner.defaultValue + weight * (data);
                }
                else {
                    var defValue = nodeOwner.defaultValue;
                    pro[proName] = defValue + weight * (data - defValue);
                }
            }
        }
    }
    _applyPositionAndRotationEuler(nodeOwner, additive, weight, isFirstLayer, data, out) {
        if (nodeOwner.updateMark === this._updateMark) { //一定非第一层
            if (additive) {
                out.x += weight * data.x;
                out.y += weight * data.y;
                out.z += weight * data.z;
            }
            else {
                var oriX = out.x;
                var oriY = out.y;
                var oriZ = out.z;
                out.x = oriX + weight * (data.x - oriX);
                out.y = oriY + weight * (data.y - oriY);
                out.z = oriZ + weight * (data.z - oriZ);
            }
        }
        else {
            if (isFirstLayer) {
                if (additive) {
                    var defValue = nodeOwner.defaultValue;
                    out.x = defValue.x + data.x;
                    out.y = defValue.y + data.y;
                    out.z = defValue.z + data.z;
                }
                else {
                    out.x = data.x;
                    out.y = data.y;
                    out.z = data.z;
                }
            }
            else {
                defValue = nodeOwner.defaultValue;
                if (additive) {
                    out.x = defValue.x + weight * data.x;
                    out.y = defValue.y + weight * data.y;
                    out.z = defValue.z + weight * data.z;
                }
                else {
                    var defX = defValue.x;
                    var defY = defValue.y;
                    var defZ = defValue.z;
                    out.x = defX + weight * (data.x - defX);
                    out.y = defY + weight * (data.y - defY);
                    out.z = defZ + weight * (data.z - defZ);
                }
            }
        }
    }
    _applyRotation(nodeOwner, additive, weight, isFirstLayer, clipRot, localRotation) {
        if (nodeOwner.updateMark === this._updateMark) { //一定非第一层
            if (additive) {
                var tempQuat = Animator._tempQuaternion1; //使用临时四元数_tempQuaternion1，避免引用错乱
                Utils3D.quaternionWeight(clipRot, weight, tempQuat);
                tempQuat.normalize(tempQuat);
                Quaternion.multiply(localRotation, tempQuat, localRotation);
            }
            else {
                Quaternion.lerp(localRotation, clipRot, weight, localRotation);
            }
        }
        else {
            if (isFirstLayer) {
                if (additive) {
                    var defaultRot = nodeOwner.defaultValue;
                    Quaternion.multiply(defaultRot, clipRot, localRotation);
                }
                else {
                    localRotation.x = clipRot.x;
                    localRotation.y = clipRot.y;
                    localRotation.z = clipRot.z;
                    localRotation.w = clipRot.w;
                }
            }
            else {
                defaultRot = nodeOwner.defaultValue;
                if (additive) {
                    tempQuat = Animator._tempQuaternion1;
                    Utils3D.quaternionWeight(clipRot, weight, tempQuat);
                    tempQuat.normalize(tempQuat);
                    Quaternion.multiply(defaultRot, tempQuat, localRotation);
                }
                else {
                    Quaternion.lerp(defaultRot, clipRot, weight, localRotation);
                }
            }
        }
    }
    _applyScale(nodeOwner, additive, weight, isFirstLayer, clipSca, localScale) {
        if (nodeOwner.updateMark === this._updateMark) { //一定非第一层
            if (additive) {
                var scale = Animator._tempVector31;
                Utils3D.scaleWeight(clipSca, weight, scale);
                localScale.x = localScale.x * scale.x;
                localScale.y = localScale.y * scale.y;
                localScale.z = localScale.z * scale.z;
            }
            else {
                Utils3D.scaleBlend(localScale, clipSca, weight, localScale);
            }
        }
        else {
            if (isFirstLayer) {
                if (additive) {
                    var defaultSca = nodeOwner.defaultValue;
                    localScale.x = defaultSca.x * clipSca.x;
                    localScale.y = defaultSca.y * clipSca.y;
                    localScale.z = defaultSca.z * clipSca.z;
                }
                else {
                    localScale.x = clipSca.x;
                    localScale.y = clipSca.y;
                    localScale.z = clipSca.z;
                }
            }
            else {
                defaultSca = nodeOwner.defaultValue;
                if (additive) {
                    scale = Animator._tempVector31;
                    Utils3D.scaleWeight(clipSca, weight, scale);
                    localScale.x = defaultSca.x * scale.x;
                    localScale.y = defaultSca.y * scale.y;
                    localScale.z = defaultSca.z * scale.z;
                }
                else {
                    Utils3D.scaleBlend(defaultSca, clipSca, weight, localScale);
                }
            }
        }
    }
    _applyCrossData(nodeOwner, additive, weight, isFirstLayer, srcValue, desValue, crossWeight) {
        var pro = nodeOwner.propertyOwner;
        if (pro) {
            switch (nodeOwner.type) {
                case 0: //Float
                    var proPat = nodeOwner.property;
                    var m = proPat.length - 1;
                    for (var j = 0; j < m; j++) {
                        pro = pro[proPat[j]];
                        if (!pro) //属性可能或被置空
                            break;
                    }
                    var crossValue = srcValue + crossWeight * (desValue - srcValue);
                    this._applyFloat(pro, proPat[m], nodeOwner, additive, weight, isFirstLayer, crossValue);
                    break;
                case 1: //Position
                    var localPos = pro.localPosition;
                    var position = Animator._tempVector30;
                    var srcX = srcValue.x, srcY = srcValue.y, srcZ = srcValue.z;
                    position.x = srcX + crossWeight * (desValue.x - srcX);
                    position.y = srcY + crossWeight * (desValue.y - srcY);
                    position.z = srcZ + crossWeight * (desValue.z - srcZ);
                    this._applyPositionAndRotationEuler(nodeOwner, additive, weight, isFirstLayer, position, localPos);
                    pro.localPosition = localPos;
                    break;
                case 2: //Rotation
                    var localRot = pro.localRotation;
                    var rotation = Animator._tempQuaternion0;
                    Quaternion.lerp(srcValue, desValue, crossWeight, rotation);
                    this._applyRotation(nodeOwner, additive, weight, isFirstLayer, rotation, localRot);
                    pro.localRotation = localRot;
                    break;
                case 3: //Scale
                    var localSca = pro.localScale;
                    var scale = Animator._tempVector30;
                    Utils3D.scaleBlend(srcValue, desValue, crossWeight, scale);
                    this._applyScale(nodeOwner, additive, weight, isFirstLayer, scale, localSca);
                    pro.localScale = localSca;
                    break;
                case 4: //RotationEuler
                    var localEuler = pro.localRotationEuler;
                    var rotationEuler = Animator._tempVector30;
                    srcX = srcValue.x, srcY = srcValue.y, srcZ = srcValue.z;
                    rotationEuler.x = srcX + crossWeight * (desValue.x - srcX);
                    rotationEuler.y = srcY + crossWeight * (desValue.y - srcY);
                    rotationEuler.z = srcZ + crossWeight * (desValue.z - srcZ);
                    this._applyPositionAndRotationEuler(nodeOwner, additive, weight, isFirstLayer, rotationEuler, localEuler);
                    pro.localRotationEuler = localEuler;
                    break;
            }
            nodeOwner.updateMark = this._updateMark;
        }
    }
    _setClipDatasToNode(stateInfo, additive, weight, isFirstLayer) {
        var nodes = stateInfo._clip._nodes;
        var nodeOwners = stateInfo._nodeOwners;
        for (var i = 0, n = nodes.count; i < n; i++) {
            var nodeOwner = nodeOwners[i];
            if (nodeOwner) { //骨骼中没有该节点
                var pro = nodeOwner.propertyOwner;
                if (pro) {
                    switch (nodeOwner.type) {
                        case 0: //Float
                            var proPat = nodeOwner.property;
                            var m = proPat.length - 1;
                            for (var j = 0; j < m; j++) {
                                pro = pro[proPat[j]];
                                if (!pro) //属性可能或被置空
                                    break;
                            }
                            this._applyFloat(pro, proPat[m], nodeOwner, additive, weight, isFirstLayer, nodes.getNodeByIndex(i).data);
                            break;
                        case 1: //Position
                            var localPos = pro.localPosition;
                            this._applyPositionAndRotationEuler(nodeOwner, additive, weight, isFirstLayer, nodes.getNodeByIndex(i).data, localPos);
                            pro.localPosition = localPos;
                            break;
                        case 2: //Rotation
                            var localRot = pro.localRotation;
                            this._applyRotation(nodeOwner, additive, weight, isFirstLayer, nodes.getNodeByIndex(i).data, localRot);
                            pro.localRotation = localRot;
                            break;
                        case 3: //Scale
                            var localSca = pro.localScale;
                            this._applyScale(nodeOwner, additive, weight, isFirstLayer, nodes.getNodeByIndex(i).data, localSca);
                            pro.localScale = localSca;
                            break;
                        case 4: //RotationEuler
                            var localEuler = pro.localRotationEuler;
                            this._applyPositionAndRotationEuler(nodeOwner, additive, weight, isFirstLayer, nodes.getNodeByIndex(i).data, localEuler);
                            pro.localRotationEuler = localEuler;
                            break;
                    }
                    nodeOwner.updateMark = this._updateMark;
                }
            }
        }
    }
    _setCrossClipDatasToNode(controllerLayer, srcState, destState, crossWeight, isFirstLayer) {
        //TODO:srcNodes、destNodes未使用
        var nodeOwners = controllerLayer._crossNodesOwners;
        var ownerCount = controllerLayer._crossNodesOwnersCount;
        var additive = controllerLayer.blendingMode !== AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
        var weight = controllerLayer.defaultWeight;
        var destDataIndices = controllerLayer._destCrossClipNodeIndices;
        var destNodes = destState._clip._nodes;
        var destNodeOwners = destState._nodeOwners;
        var srcDataIndices = controllerLayer._srcCrossClipNodeIndices;
        var srcNodeOwners = srcState._nodeOwners;
        var srcNodes = srcState._clip._nodes;
        for (var i = 0; i < ownerCount; i++) {
            var nodeOwner = nodeOwners[i];
            if (nodeOwner) {
                var srcIndex = srcDataIndices[i];
                var destIndex = destDataIndices[i];
                var srcValue = srcIndex !== -1 ? srcNodes.getNodeByIndex(srcIndex).data : destNodeOwners[destIndex].defaultValue;
                var desValue = destIndex !== -1 ? destNodes.getNodeByIndex(destIndex).data : srcNodeOwners[srcIndex].defaultValue;
                this._applyCrossData(nodeOwner, additive, weight, isFirstLayer, srcValue, desValue, crossWeight);
            }
        }
    }
    _setFixedCrossClipDatasToNode(controllerLayer, destState, crossWeight, isFirstLayer) {
        var nodeOwners = controllerLayer._crossNodesOwners;
        var ownerCount = controllerLayer._crossNodesOwnersCount;
        var additive = controllerLayer.blendingMode !== AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
        var weight = controllerLayer.defaultWeight;
        var destDataIndices = controllerLayer._destCrossClipNodeIndices;
        var destNodes = destState._clip._nodes;
        for (var i = 0; i < ownerCount; i++) {
            var nodeOwner = nodeOwners[i];
            if (nodeOwner) {
                var destIndex = destDataIndices[i];
                var srcValue = nodeOwner.crossFixedValue;
                var desValue = destIndex !== -1 ? destNodes.getNodeByIndex(destIndex).data : nodeOwner.defaultValue;
                this._applyCrossData(nodeOwner, additive, weight, isFirstLayer, srcValue, desValue, crossWeight);
            }
        }
    }
    _revertDefaultKeyframeNodes(clipStateInfo) {
        var nodeOwners = clipStateInfo._nodeOwners;
        for (var i = 0, n = nodeOwners.length; i < n; i++) {
            var nodeOwner = nodeOwners[i];
            if (nodeOwner) {
                var pro = nodeOwner.propertyOwner;
                if (pro) {
                    switch (nodeOwner.type) {
                        case 0:
                            var proPat = nodeOwner.property;
                            var m = proPat.length - 1;
                            for (var j = 0; j < m; j++) {
                                pro = pro[proPat[j]];
                                if (!pro) //属性可能或被置空
                                    break;
                            }
                            pro[proPat[m]] = nodeOwner.defaultValue;
                            break;
                        case 1:
                            var locPos = pro.localPosition;
                            var def = nodeOwner.defaultValue;
                            locPos.x = def.x;
                            locPos.y = def.y;
                            locPos.z = def.z;
                            pro.localPosition = locPos;
                            break;
                        case 2:
                            var locRot = pro.localRotation;
                            var defQua = nodeOwner.defaultValue;
                            locRot.x = defQua.x;
                            locRot.y = defQua.y;
                            locRot.z = defQua.z;
                            locRot.w = defQua.w;
                            pro.localRotation = locRot;
                            break;
                        case 3:
                            var locSca = pro.localScale;
                            def = nodeOwner.defaultValue;
                            locSca.x = def.x;
                            locSca.y = def.y;
                            locSca.z = def.z;
                            pro.localScale = locSca;
                            break;
                        case 4:
                            var locEul = pro.localRotationEuler;
                            def = nodeOwner.defaultValue;
                            locEul.x = def.x;
                            locEul.y = def.y;
                            locEul.z = def.z;
                            pro.localRotationEuler = locEul;
                            break;
                        default:
                            throw "Animator:unknown type.";
                    }
                }
            }
        }
    }
    /**
     * @inheritDoc
     * @override
     */
    _onAdded() {
        var parent = this.owner._parent;
        this.owner._setHierarchyAnimator(this, parent ? parent._hierarchyAnimator : null); //只有动画组件在加载或卸载时才重新组织数据
        this.owner._changeAnimatorToLinkSprite3DNoAvatar(this, true, []);
    }
    /**
     * @inheritDoc
     * @override
     */
    _onDestroy() {
        for (var i = 0, n = this._controllerLayers.length; i < n; i++)
            this._controllerLayers[i]._removeReference();
        var parent = this.owner._parent;
        this.owner._clearHierarchyAnimator(this, parent ? parent._hierarchyAnimator : null); //只有动画组件在加载或卸载时才重新组织数据
    }
    /**
     * @inheritDoc
     * @override
     */
    _onEnable() {
        this.owner._scene._animatorPool.add(this);
        for (var i = 0, n = this._controllerLayers.length; i < n; i++) {
            if (this._controllerLayers[i].playOnWake) {
                var defaultClip = this.getDefaultState(i);
                (defaultClip) && (this.play(null, i, 0));
            }
        }
    }
    /**
     * @inheritDoc
     * @override
     */
    _onDisable() {
        this.owner._scene._animatorPool.remove(this);
    }
    /**
     * @internal
     */
    _handleSpriteOwnersBySprite(isLink, path, sprite) {
        for (var i = 0, n = this._controllerLayers.length; i < n; i++) {
            var clipStateInfos = this._controllerLayers[i]._states;
            for (var j = 0, m = clipStateInfos.length; j < m; j++) {
                var clipStateInfo = clipStateInfos[j];
                var clip = clipStateInfo._clip;
                var nodePath = path.join("/");
                var ownersNodes = clip._nodesMap[nodePath];
                if (ownersNodes) {
                    var nodeOwners = clipStateInfo._nodeOwners;
                    for (var k = 0, p = ownersNodes.length; k < p; k++) {
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
     * @override
     */
    _parse(data) {
        var avatarData = data.avatar;
        if (avatarData) {
            this.avatar = Loader.getRes(avatarData.path);
            var linkSprites = avatarData.linkSprites;
            this._linkSprites = linkSprites;
            this._linkToSprites(linkSprites);
        }
        var clipPaths = data.clipPaths;
        var play = data.playOnWake;
        var layersData = data.layers;
        for (var i = 0; i < layersData.length; i++) {
            var layerData = layersData[i];
            var animatorLayer = new AnimatorControllerLayer(layerData.name);
            if (i === 0)
                animatorLayer.defaultWeight = 1.0; //TODO:
            else
                animatorLayer.defaultWeight = layerData.weight;
            var blendingModeData = layerData.blendingMode;
            (blendingModeData) && (animatorLayer.blendingMode = blendingModeData);
            this.addControllerLayer(animatorLayer);
            var states = layerData.states;
            for (var j = 0, m = states.length; j < m; j++) {
                var state = states[j];
                var clipPath = state.clipPath;
                if (clipPath) {
                    var name = state.name;
                    var motion;
                    motion = Loader.getRes(clipPath);
                    if (motion) { //加载失败motion为空
                        var animatorState = new AnimatorState();
                        animatorState.name = name;
                        animatorState.clip = motion;
                        animatorLayer.addState(animatorState);
                        (j === 0) && (this.getControllerLayer(i).defaultState = animatorState);
                    }
                }
            }
            (play !== undefined) && (animatorLayer.playOnWake = play);
        }
        var cullingModeData = data.cullingMode;
        (cullingModeData !== undefined) && (this.cullingMode = cullingModeData);
    }
    /**
     * @internal
     */
    _update() {
        if (this._speed === 0)
            return;
        var needRender;
        if (this.cullingMode === Animator.CULLINGMODE_CULLCOMPLETELY) { //所有渲染精灵不可见时
            needRender = false;
            for (var i = 0, n = this._renderableSprites.length; i < n; i++) {
                if (this._renderableSprites[i]._render._visible) {
                    needRender = true;
                    break;
                }
            }
        }
        else {
            needRender = true;
        }
        this._updateMark++;
        var timer = this.owner._scene.timer;
        var delta = timer._delta / 1000.0; //Laya.timer.delta已结包含Laya.timer.scale
        var timerScale = timer.scale;
        for (i = 0, n = this._controllerLayers.length; i < n; i++) {
            var controllerLayer = this._controllerLayers[i];
            var playStateInfo = controllerLayer._playStateInfo;
            var crossPlayStateInfo = controllerLayer._crossPlayStateInfo;
            addtive = controllerLayer.blendingMode !== AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
            switch (controllerLayer._playType) {
                case 0:
                    var animatorState = controllerLayer._currentPlayState;
                    var clip = animatorState._clip;
                    var speed = this._speed * animatorState.speed;
                    var finish = playStateInfo._finish; //提前取出finish,防止最后一帧跳过
                    finish || this._updatePlayer(animatorState, playStateInfo, delta * speed, clip.islooping);
                    if (needRender) {
                        var addtive = controllerLayer.blendingMode !== AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
                        this._updateClipDatas(animatorState, addtive, playStateInfo, timerScale * speed); //clipDatas为逐动画文件,防止两个使用同一动画文件的Animator数据错乱,即使动画停止也要updateClipDatas
                        this._setClipDatasToNode(animatorState, addtive, controllerLayer.defaultWeight, i === 0); //多层动画混合时即使动画停止也要设置数据
                        finish || this._updateEventScript(animatorState, playStateInfo);
                    }
                    break;
                case 1:
                    animatorState = controllerLayer._currentPlayState;
                    clip = animatorState._clip;
                    var crossClipState = controllerLayer._crossPlayState;
                    var crossClip = crossClipState._clip;
                    var crossDuratuion = controllerLayer._crossDuration;
                    var startPlayTime = crossPlayStateInfo._startPlayTime;
                    var crossClipDuration = crossClip._duration - startPlayTime;
                    var crossScale = crossDuratuion > crossClipDuration ? crossClipDuration / crossDuratuion : 1.0; //如果过度时间大于过度动作时间,则减慢速度
                    var crossSpeed = this._speed * crossClipState.speed;
                    this._updatePlayer(crossClipState, crossPlayStateInfo, delta * crossScale * crossSpeed, crossClip.islooping);
                    var crossWeight = ((crossPlayStateInfo._elapsedTime - startPlayTime) / crossScale) / crossDuratuion;
                    if (crossWeight >= 1.0) {
                        if (needRender) {
                            this._updateClipDatas(crossClipState, addtive, crossPlayStateInfo, timerScale * crossSpeed);
                            this._setClipDatasToNode(crossClipState, addtive, controllerLayer.defaultWeight, i === 0);
                            controllerLayer._playType = 0; //完成融合,切换到正常播放状态
                            controllerLayer._currentPlayState = crossClipState;
                            crossPlayStateInfo._cloneTo(playStateInfo);
                        }
                    }
                    else {
                        if (!playStateInfo._finish) {
                            speed = this._speed * animatorState.speed;
                            this._updatePlayer(animatorState, playStateInfo, delta * speed, clip.islooping);
                            if (needRender) {
                                this._updateClipDatas(animatorState, addtive, playStateInfo, timerScale * speed);
                            }
                        }
                        if (needRender) {
                            this._updateClipDatas(crossClipState, addtive, crossPlayStateInfo, timerScale * crossScale * crossSpeed);
                            this._setCrossClipDatasToNode(controllerLayer, animatorState, crossClipState, crossWeight, i === 0);
                        }
                    }
                    if (needRender) {
                        this._updateEventScript(animatorState, playStateInfo);
                        this._updateEventScript(crossClipState, crossPlayStateInfo);
                    }
                    break;
                case 2:
                    crossClipState = controllerLayer._crossPlayState;
                    crossClip = crossClipState._clip;
                    crossDuratuion = controllerLayer._crossDuration;
                    startPlayTime = crossPlayStateInfo._startPlayTime;
                    crossClipDuration = crossClip._duration - startPlayTime;
                    crossScale = crossDuratuion > crossClipDuration ? crossClipDuration / crossDuratuion : 1.0; //如果过度时间大于过度动作时间,则减慢速度
                    crossSpeed = this._speed * crossClipState.speed;
                    this._updatePlayer(crossClipState, crossPlayStateInfo, delta * crossScale * crossSpeed, crossClip.islooping);
                    if (needRender) {
                        crossWeight = ((crossPlayStateInfo._elapsedTime - startPlayTime) / crossScale) / crossDuratuion;
                        if (crossWeight >= 1.0) {
                            this._updateClipDatas(crossClipState, addtive, crossPlayStateInfo, timerScale * crossSpeed);
                            this._setClipDatasToNode(crossClipState, addtive, 1.0, i === 0);
                            controllerLayer._playType = 0; //完成融合,切换到正常播放状态
                            controllerLayer._currentPlayState = crossClipState;
                            crossPlayStateInfo._cloneTo(playStateInfo);
                        }
                        else {
                            this._updateClipDatas(crossClipState, addtive, crossPlayStateInfo, timerScale * crossScale * crossSpeed);
                            this._setFixedCrossClipDatasToNode(controllerLayer, crossClipState, crossWeight, i === 0);
                        }
                        this._updateEventScript(crossClipState, crossPlayStateInfo);
                    }
                    break;
            }
        }
        if (needRender) {
            if (this._avatar) {
                Render.supportWebGLPlusAnimation && this._updateAnimationNodeWorldMatix(this._animationNodeLocalPositions, this._animationNodeLocalRotations, this._animationNodeLocalScales, this._animationNodeWorldMatrixs, this._animationNodeParentIndices); //[NATIVE]
                this._updateAvatarNodesToSprite();
            }
        }
    }
    /**
     * @internal
     * @override
     */
    _cloneTo(dest) {
        var animator = dest;
        animator.avatar = this.avatar;
        animator.cullingMode = this.cullingMode;
        for (var i = 0, n = this._controllerLayers.length; i < n; i++) {
            var controllLayer = this._controllerLayers[i];
            animator.addControllerLayer(controllLayer.clone());
            var animatorStates = controllLayer._states;
            for (var j = 0, m = animatorStates.length; j < m; j++) {
                var state = animatorStates[j].clone();
                var cloneLayer = animator.getControllerLayer(i);
                cloneLayer.addState(state);
                (j == 0) && (cloneLayer.defaultState = state);
            }
        }
        animator._linkSprites = this._linkSprites; //TODO:需要统一概念
        animator._linkToSprites(this._linkSprites);
    }
    /**
     * 获取默认动画状态。
     * @param	layerIndex 层索引。
     * @return 默认动画状态。
     */
    getDefaultState(layerIndex = 0) {
        var controllerLayer = this._controllerLayers[layerIndex];
        return controllerLayer.defaultState;
    }
    /**
     * 添加动画状态。
     * @param	state 动画状态。
     * @param   layerIndex 层索引。
     */
    addState(state, layerIndex = 0) {
        var controllerLayer = this._controllerLayers[layerIndex];
        controllerLayer.addState(state);
        console.warn("Animator:this function is discard,please use animatorControllerLayer.addState() instead.");
    }
    /**
     * 移除动画状态。
     * @param	state 动画状态。
     * @param   layerIndex 层索引。
     */
    removeState(state, layerIndex = 0) {
        var controllerLayer = this._controllerLayers[layerIndex];
        controllerLayer.removeState(state);
        console.warn("Animator:this function is discard,please use animatorControllerLayer.removeState() instead.");
    }
    /**
     * 添加控制器层。
     */
    addControllerLayer(controllderLayer) {
        this._controllerLayers.push(controllderLayer);
        controllderLayer._animator = this; //TODO:可以复用,不应该这么设计
        controllderLayer._addReference();
        var states = controllderLayer._states;
        for (var i = 0, n = states.length; i < n; i++)
            this._getOwnersByClip(states[i]);
    }
    /**
     * 获取控制器层。
     */
    getControllerLayer(layerInex = 0) {
        return this._controllerLayers[layerInex];
    }
    /**
     * 获取当前的播放状态。
     *	@param   layerIndex 层索引。
     * 	@return  动画播放状态。
     */
    getCurrentAnimatorPlayState(layerInex = 0) {
        return this._controllerLayers[layerInex]._playStateInfo;
    }
    /**
     * 播放动画。
     * @param	name 如果为null则播放默认动画，否则按名字播放动画片段。
     * @param	layerIndex 层索引。
     * @param	normalizedTime 归一化的播放起始时间。
     */
    play(name = null, layerIndex = 0, normalizedTime = Number.NEGATIVE_INFINITY) {
        var controllerLayer = this._controllerLayers[layerIndex];
        if (controllerLayer) {
            var defaultState = controllerLayer.defaultState;
            if (!name && !defaultState)
                throw new Error("Animator:must have  default clip value,please set clip property.");
            var curPlayState = controllerLayer._currentPlayState;
            var playStateInfo = controllerLayer._playStateInfo;
            var animatorState = name ? controllerLayer._statesMap[name] : defaultState;
            var clipDuration = animatorState._clip._duration;
            if (curPlayState !== animatorState) {
                if (normalizedTime !== Number.NEGATIVE_INFINITY)
                    playStateInfo._resetPlayState(clipDuration * normalizedTime);
                else
                    playStateInfo._resetPlayState(0.0);
                (curPlayState !== null && curPlayState !== animatorState) && (this._revertDefaultKeyframeNodes(curPlayState));
                controllerLayer._playType = 0;
                controllerLayer._currentPlayState = animatorState;
            }
            else {
                if (normalizedTime !== Number.NEGATIVE_INFINITY) {
                    playStateInfo._resetPlayState(clipDuration * normalizedTime);
                    controllerLayer._playType = 0;
                }
            }
            var scripts = animatorState._scripts;
            if (scripts) {
                for (var i = 0, n = scripts.length; i < n; i++)
                    scripts[i].onStateEnter();
            }
        }
        else {
            console.warn("Invalid layerIndex " + layerIndex + ".");
        }
    }
    /**
     * 在当前动画状态和目标动画状态之间进行融合过渡播放。
     * @param	name 目标动画状态。
     * @param	transitionDuration 过渡时间,该值为当前动画状态的归一化时间，值在0.0~1.0之间。
     * @param	layerIndex 层索引。
     * @param	normalizedTime 归一化的播放起始时间。
     */
    crossFade(name, transitionDuration, layerIndex = 0, normalizedTime = Number.NEGATIVE_INFINITY) {
        var controllerLayer = this._controllerLayers[layerIndex];
        if (controllerLayer) {
            var destAnimatorState = controllerLayer._statesMap[name];
            if (destAnimatorState) {
                var playType = controllerLayer._playType;
                if (playType === -1) {
                    this.play(name, layerIndex, normalizedTime); //如果未层调用过play则回滚到play方法
                    return;
                }
                var crossPlayStateInfo = controllerLayer._crossPlayStateInfo;
                var crossNodeOwners = controllerLayer._crossNodesOwners;
                var crossNodeOwnerIndicesMap = controllerLayer._crossNodesOwnersIndicesMap;
                var srcAnimatorState = controllerLayer._currentPlayState;
                var destNodeOwners = destAnimatorState._nodeOwners;
                var destCrossClipNodeIndices = controllerLayer._destCrossClipNodeIndices;
                var destClip = destAnimatorState._clip;
                var destNodes = destClip._nodes;
                var destNodesMap = destClip._nodesDic;
                switch (playType) {
                    case 0:
                        var srcNodeOwners = srcAnimatorState._nodeOwners;
                        var scrCrossClipNodeIndices = controllerLayer._srcCrossClipNodeIndices;
                        var srcClip = srcAnimatorState._clip;
                        var srcNodes = srcClip._nodes;
                        var srcNodesMap = srcClip._nodesDic;
                        controllerLayer._playType = 1;
                        var crossMark = ++controllerLayer._crossMark;
                        var crossCount = controllerLayer._crossNodesOwnersCount = 0;
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
                            destNode = destNodesMap[nodeOwner.fullPath];
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
                controllerLayer._crossDuration = srcAnimatorState._clip._duration * transitionDuration;
                if (normalizedTime !== Number.NEGATIVE_INFINITY)
                    crossPlayStateInfo._resetPlayState(destClip._duration * normalizedTime);
                else
                    crossPlayStateInfo._resetPlayState(0.0);
                var scripts = destAnimatorState._scripts;
                if (scripts) {
                    for (i = 0, n = scripts.length; i < n; i++)
                        scripts[i].onStateEnter();
                }
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
     * 获取avatar。
     * @return avator。
     */
    get avatar() {
        return this._avatar;
    }
    /**
     * 设置avatar。
     * @param value avatar。
     */
    set avatar(value) {
        if (this._avatar !== value) {
            this._avatar = value;
            if (value) {
                this._getAvatarOwnersAndInitDatasAsync();
                this.owner._changeHierarchyAnimatorAvatar(this, value);
            }
            else {
                var parent = this.owner._parent;
                this.owner._changeHierarchyAnimatorAvatar(this, parent ? parent._hierarchyAnimator._avatar : null);
            }
        }
    }
    _getAvatarOwnersAndInitDatasAsync() {
        for (var i = 0, n = this._controllerLayers.length; i < n; i++) {
            var clipStateInfos = this._controllerLayers[i]._states;
            for (var j = 0, m = clipStateInfos.length; j < m; j++)
                this._getOwnersByClip(clipStateInfos[j]);
        }
        this._avatar._cloneDatasToAnimator(this);
        for (var k in this._linkAvatarSpritesData) {
            var sprites = this._linkAvatarSpritesData[k];
            if (sprites) {
                for (var c = 0, p = sprites.length; c < p; c++)
                    this._isLinkSpriteToAnimationNode(sprites[c], k, true); //TODO:对应移除
            }
        }
    }
    _isLinkSpriteToAnimationNode(sprite, nodeName, isLink) {
        if (this._avatar) {
            var node = this._avatarNodeMap[nodeName];
            if (node) {
                if (isLink) {
                    sprite._transform._dummy = node.transform;
                    this._linkAvatarSprites.push(sprite);
                    var nodeTransform = node.transform; //nodeTransform为空时表示avatar中暂时无此节点
                    var spriteTransform = sprite.transform;
                    if (!spriteTransform.owner.isStatic && nodeTransform) { //Avatar跟节点始终为false,不会更新,Scene无transform
                        //TODO:spriteTransform.owner.isStatic外部判断
                        var spriteWorldMatrix = spriteTransform.worldMatrix;
                        var ownParTra = this.owner._transform._parent;
                        if (ownParTra) {
                            Utils3D.matrix4x4MultiplyMFM(ownParTra.worldMatrix, nodeTransform.getWorldMatrix(), spriteWorldMatrix); //TODO:还可优化
                        }
                        else {
                            var sprWorE = spriteWorldMatrix.elements;
                            var nodWorE = nodeTransform.getWorldMatrix();
                            for (var i = 0; i < 16; i++)
                                sprWorE[i] = nodWorE[i];
                        }
                        spriteTransform.worldMatrix = spriteWorldMatrix;
                    }
                }
                else {
                    sprite._transform._dummy = null;
                    this._linkAvatarSprites.splice(this._linkAvatarSprites.indexOf(sprite), 1);
                }
            }
        }
    }
    _isLinkSpriteToAnimationNodeData(sprite, nodeName, isLink) {
        var linkSprites = this._linkAvatarSpritesData[nodeName]; //存储挂点数据
        if (isLink) {
            linkSprites || (this._linkAvatarSpritesData[nodeName] = linkSprites = []);
            linkSprites.push(sprite);
        }
        else {
            var index = linkSprites.indexOf(sprite);
            linkSprites.splice(index, 1);
        }
    }
    /**
     *@internal
     */
    _updateAvatarNodesToSprite() {
        for (var i = 0, n = this._linkAvatarSprites.length; i < n; i++) {
            var sprite = this._linkAvatarSprites[i];
            var nodeTransform = sprite.transform._dummy; //nodeTransform为空时表示avatar中暂时无此节点
            var spriteTransform = sprite.transform;
            if (!spriteTransform.owner.isStatic && nodeTransform) {
                var spriteWorldMatrix = spriteTransform.worldMatrix;
                var ownTra = this.owner._transform;
                Utils3D.matrix4x4MultiplyMFM(ownTra.worldMatrix, nodeTransform.getWorldMatrix(), spriteWorldMatrix);
                spriteTransform.worldMatrix = spriteWorldMatrix;
            }
        }
    }
    /**
     * 关联精灵节点到Avatar节点,此Animator必须有Avatar文件。
     * @param nodeName 关联节点的名字。
     * @param sprite3D 精灵节点。
     * @return 是否关联成功。
     */
    linkSprite3DToAvatarNode(nodeName, sprite3D) {
        this._isLinkSpriteToAnimationNodeData(sprite3D, nodeName, true);
        this._isLinkSpriteToAnimationNode(sprite3D, nodeName, true);
        return true;
    }
    /**
     * 解除精灵节点到Avatar节点的关联,此Animator必须有Avatar文件。
     * @param sprite3D 精灵节点。
     * @return 是否解除关联成功。
     */
    unLinkSprite3DToAvatarNode(sprite3D) {
        if (sprite3D._hierarchyAnimator === this) {
            var dummy = sprite3D.transform._dummy;
            if (dummy) {
                var nodeName = dummy._owner.name;
                this._isLinkSpriteToAnimationNodeData(sprite3D, nodeName, false);
                this._isLinkSpriteToAnimationNode(sprite3D, nodeName, false);
                return true;
            }
            else {
                return false;
            }
        }
        else {
            throw ("Animator:sprite3D must belong to this Animator");
            return false;
        }
    }
    /**
     *@internal
     * [NATIVE]
     */
    _updateAnimationNodeWorldMatix(localPositions, localRotations, localScales, worldMatrixs, parentIndices) {
        LayaGL.instance.updateAnimationNodeWorldMatix(localPositions, localRotations, localScales, parentIndices, worldMatrixs);
    }
}
Animator._tempVector30 = new Vector3();
Animator._tempVector31 = new Vector3();
Animator._tempQuaternion0 = new Quaternion();
Animator._tempQuaternion1 = new Quaternion();
Animator._tempVector3Array0 = new Float32Array(3);
Animator._tempVector3Array1 = new Float32Array(3);
Animator._tempQuaternionArray0 = new Float32Array(4);
Animator._tempQuaternionArray1 = new Float32Array(4);
/** 裁剪模式_始终播放动画。*/
Animator.CULLINGMODE_ALWAYSANIMATE = 0;
/** 裁剪模式_不可见时完全不播放动画。*/
Animator.CULLINGMODE_CULLCOMPLETELY = 2;
