import { Component } from "../../components/Component";
import { Node } from "../../display/Node";
import { LayaGL } from "../../layagl/LayaGL";
import { Loader } from "../../net/Loader";
import { Timer } from "../../utils/Timer";
import { AnimationClip } from "../animation/AnimationClip";
import { AnimationEvent } from "../animation/AnimationEvent";
import { AnimationNode } from "../animation/AnimationNode";
import { AnimationTransform3D } from "../animation/AnimationTransform3D";
import { AnimatorStateScript } from "../animation/AnimatorStateScript";
import { KeyframeNode } from "../animation/KeyframeNode";
import { KeyframeNodeList } from "../animation/KeyframeNodeList";
import { Avatar } from "../core/Avatar";
import { RenderableSprite3D } from "../core/RenderableSprite3D";
import { Scene3D } from "../core/scene/Scene3D";
import { Sprite3D } from "../core/Sprite3D";
import { Transform3D } from "../core/Transform3D";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Utils3D } from "../utils/Utils3D";
import { AnimatorControllerLayer } from "./AnimatorControllerLayer";
import { AnimatorPlayState } from "./AnimatorPlayState";
import { AnimatorState } from "./AnimatorState";
import { KeyframeNodeOwner } from "./KeyframeNodeOwner";
import { Script3D } from "./Script3D";
import { ConchQuaternion } from "../math/Native/ConchQuaternion";
import { ConchVector3 } from "../math/Native/ConchVector3";
import { AvatarMask } from "./AvatarMask";

/**
 * <code>Animator</code> 类用于创建动画组件。
 */
export class Animator extends Component {
	/**@internal */
	private static _tempVector31: Vector3 = new Vector3();
	/**@internal */
	private static _tempQuaternion1: Quaternion = new Quaternion();

	/** 裁剪模式_始终播放动画。*/
	static CULLINGMODE_ALWAYSANIMATE: number = 0;
	/** 裁剪模式_不可见时完全不播放动画。*/
	static CULLINGMODE_CULLCOMPLETELY: number = 2;

	/**
	 * @internal
	 */
	static _update(scene: Scene3D): void {
		var pool = scene._animatorPool;
		var elements = pool.elements as Animator[];
		for (var i = 0, n = pool.length; i < n; i++) {
			var animator = elements[i];
			(animator && animator.enabled) && (animator._update());
		}
	}

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

	/**@internal */
	_linkSprites: any;
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

	/**
	 * 动画的播放速度,1.0为正常播放速度。
	 */
	get speed(): number {
		return this._speed;
	}

	set speed(value: number) {
		this._speed = value;
	}


	get controllerLayerCount():number{
		return this._controllerLayers.length;
	}

	/**
	 * 创建一个 <code>Animation</code> 实例。
	 */
	constructor() {
		super();
		this._controllerLayers = [];
		this._linkSprites = {};
		this._speed = 1.0;
		this._keyframeNodeOwnerMap = {};
		this._updateMark = 0;
	}


	/**
	 * @internal
	 */
	private _linkToSprites(linkSprites: any): void {
		for (var k in linkSprites) {
			var nodeOwner = (<Sprite3D>this.owner);
			var path = linkSprites[k];
			for (var j = 0, m: number = path.length; j < m; j++) {
				var p: string = path[j];
				if (p === "") {
					break;
				} else {
					nodeOwner = (<Sprite3D>nodeOwner.getChildByName(p));
					if (!nodeOwner)
						break;
				}
			}
			(nodeOwner) && (this.linkSprite3DToAvatarNode(k, nodeOwner));//此时Avatar文件已经加载完成
		}
	}

	/**
	 * @internal
	 */
	private _addKeyframeNodeOwner(clipOwners: KeyframeNodeOwner[], node: KeyframeNode, propertyOwner: any): void {
		var nodeIndex = node._indexInList;
		var fullPath = node.fullPath;
		var keyframeNodeOwner = this._keyframeNodeOwnerMap[fullPath];
		if (keyframeNodeOwner) {
			keyframeNodeOwner.referenceCount++;
			clipOwners[nodeIndex] = keyframeNodeOwner;
		} else {
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
	_removeKeyframeNodeOwner(nodeOwners: (KeyframeNodeOwner|null)[], node: KeyframeNode): void {
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
		var frameNodes = clipStateInfo._clip!._nodes;
		var frameNodesCount= frameNodes!.count;
		var nodeOwners: KeyframeNodeOwner[] = clipStateInfo._nodeOwners;
		nodeOwners.length = frameNodesCount;
		for (var i: number = 0; i < frameNodesCount; i++) {
			var node: KeyframeNode = frameNodes!.getNodeByIndex(i);
			var property: any = this._avatar ? this._avatarNodeMap[this._avatar._rootNode.name!] : this.owner;//如果有avatar需使用克隆节点
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
				(propertyOwner) && (property = property[propertyOwner]);
				property && this._addKeyframeNodeOwner(nodeOwners, node, property);
			}
		}
	}

	/**
	 * @internal
	 */
	private _updatePlayer(animatorState: AnimatorState, playState: AnimatorPlayState, elapsedTime: number, islooping: boolean): void {
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
		var scripts: AnimatorStateScript[]|null = animatorState._scripts;

		if ((!islooping && elapsedPlaybackTime >= clipDuration)) {
			playState._finish = true;
			playState._elapsedTime = clipDuration;
			playState._normalizedPlayTime = 1.0;

			if (scripts) {
				for (var i: number = 0, n: number = scripts.length; i < n; i++)
					scripts[i].onStateExit();
			}
			return;
		}

		if (scripts) {
			for (i = 0, n = scripts.length; i < n; i++)
				scripts[i].onStateUpdate();
		}
	}

	/**
	 * @internal
	 */
	private _eventScript(scripts: Script3D[], events: AnimationEvent[], eventIndex: number, endTime: number, front: boolean): number {
		if (front) {
			for (var n = events.length; eventIndex < n; eventIndex++) {
				var event = events[eventIndex];
				if (event.time <= endTime) {
					for (var j = 0, m = scripts.length; j < m; j++) {
						var script = scripts[j];
						var fun: Function = (script as any)[event.eventName];
						(fun) && (fun.apply(script, event.params));
					}
				} else {
					break;
				}
			}
		} else {
			for (; eventIndex >= 0; eventIndex--) {
				event = events[eventIndex];
				if (event.time >= endTime) {
					for (j = 0, m = scripts.length; j < m; j++) {
						script = scripts[j];
						fun = (script as any)[event.eventName];
						(fun) && (fun.apply(script, event.params));
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
		var scripts = (<Sprite3D>this.owner)._scripts;
		if (scripts) {//TODO:play是否也换成此种计算
			var clip = stateInfo._clip;
			var events = clip!._animationEvents;
			var clipDuration = clip!._duration;
			var elapsedTime = playStateInfo._elapsedTime;
			var time = elapsedTime % clipDuration;
			var loopCount = Math.abs(Math.floor(elapsedTime / clipDuration) - Math.floor(playStateInfo._lastElapsedTime / clipDuration));//backPlay可能为负数

			var frontPlay = playStateInfo._elapsedTime >= playStateInfo._lastElapsedTime;
			if (playStateInfo._lastIsFront !== frontPlay) {
				if (frontPlay)
					playStateInfo._playEventIndex++;
				else
					playStateInfo._playEventIndex--;
				playStateInfo._lastIsFront = frontPlay;
			}
			var preEventIndex = playStateInfo._playEventIndex;
			if (frontPlay) {
				var newEventIndex = this._eventScript(scripts, events, playStateInfo._playEventIndex, loopCount > 0 ? clipDuration : time, true);
				(preEventIndex === playStateInfo._playEventIndex) &&(playStateInfo._playEventIndex = newEventIndex);//这里打个补丁，在event中调用Play 需要重置eventindex，不能直接赋值
				for (var i = 0, n = loopCount - 1; i < n; i++)
					this._eventScript(scripts, events, 0, clipDuration, true);
				(loopCount > 0 && time > 0) && (playStateInfo._playEventIndex = this._eventScript(scripts, events, 0, time, true));//if need cross loop,'time' must large than 0
			} else {
				var newEventIndex  = this._eventScript(scripts, events, playStateInfo._playEventIndex, loopCount > 0 ? 0 : time, false);
				(preEventIndex === playStateInfo._playEventIndex) &&(playStateInfo._playEventIndex = newEventIndex);//这里打个补丁，在event中调用Play 需要重置eventindex，不能直接赋值
				var eventIndex = events.length - 1;
				for (i = 0, n = loopCount - 1; i < n; i++)
					this._eventScript(scripts, events, eventIndex, 0, false);
				(loopCount > 0 && time > 0) && (playStateInfo._playEventIndex = this._eventScript(scripts, events, eventIndex, time, false));//if need cross loop,'time' must large than 0
			}
		}
	}

	/**
	 * 更新clip数据
	 * @internal
	 */
	private _updateClipDatas(animatorState: AnimatorState, addtive: boolean, playStateInfo: AnimatorPlayState,animatorMask:AvatarMask = null): void {
		var clip = animatorState._clip;
		var clipDuration = clip!._duration;

		var curPlayTime = animatorState.clipStart * clipDuration + playStateInfo._normalizedPlayTime * playStateInfo._duration;
		var currentFrameIndices = animatorState._currentFrameIndices;
		var frontPlay = playStateInfo._elapsedTime > playStateInfo._lastElapsedTime;
		clip!._evaluateClipDatasRealTime(clip!._nodes!, curPlayTime, currentFrameIndices!, addtive, frontPlay, animatorState._realtimeDatas,animatorMask);
		
	}

	/**
	 * @internal
	 */
	private _applyFloat(pro: any, proName: string, nodeOwner: KeyframeNodeOwner, additive: boolean, weight: number, isFirstLayer: boolean, data: number): void {
		if (nodeOwner.updateMark === this._updateMark) {//一定非第一层
			if (additive) {
				pro[proName] += weight * data;
			} else {
				var oriValue: number = pro[proName];
				pro[proName] = oriValue + weight * (data - oriValue);
			}
		} else {
			if (isFirstLayer) {
				if (additive)
					pro[proName] = nodeOwner.defaultValue + data;
				else
					pro[proName] = data;
			} else {
				if (additive) {
					pro[proName] = nodeOwner.defaultValue + weight * (data);
				} else {
					var defValue: number = nodeOwner.defaultValue;
					pro[proName] = defValue + weight * (data - defValue);
				}
			}
		}
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
				case 0: //Float
					var proPat: string[] = nodeOwner.property!;
					var m: number = proPat.length - 1;
					for (var j: number = 0; j < m; j++) {
						pro = pro[proPat[j]];
						if (!pro)//属性可能或被置空
							break;
					}

					var crossValue: number = srcValue + crossWeight * (desValue - srcValue);
					nodeOwner.value = crossValue;
					pro && this._applyFloat(pro, proPat[m], nodeOwner, additive, weight, isFirstLayer, crossValue);
					break;
				case 1: //Position
					var localPos: Vector3 = pro.localPosition;
					var position: Vector3 = nodeOwner.value;
					var srcX: number = srcValue.x, srcY: number = srcValue.y, srcZ: number = srcValue.z;
					position.x = srcX + crossWeight * (desValue.x - srcX);
					position.y = srcY + crossWeight * (desValue.y - srcY);
					position.z = srcZ + crossWeight * (desValue.z - srcZ);
					this._applyPositionAndRotationEuler(nodeOwner, additive, weight, isFirstLayer, position, localPos);
					pro.localPosition = localPos;
					break;
				case 2: //Rotation
					var localRot: Quaternion = pro.localRotation;
					var rotation: Quaternion = nodeOwner.value;
					Quaternion.lerp(srcValue, desValue, crossWeight, rotation);
					this._applyRotation(nodeOwner, additive, weight, isFirstLayer, rotation, localRot);
					pro.localRotation = localRot;
					break;
				case 3: //Scale
					var localSca: Vector3 = pro.localScale;
					var scale: Vector3 = nodeOwner.value;
					Utils3D.scaleBlend(srcValue, desValue, crossWeight, scale);
					this._applyScale(nodeOwner, additive, weight, isFirstLayer, scale, localSca);
					pro.localScale = localSca;
					break;
				case 4: //RotationEuler
					var localEuler: Vector3 = pro.localRotationEuler;
					var rotationEuler: Vector3 = nodeOwner.value;
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

	/**
	 * 赋值Node数据
	 * @param stateInfo 动画状态
	 * @param additive 是否为addtive
	 * @param weight state权重
	 * @param isFirstLayer 是否是第一层
	 */
	private _setClipDatasToNode(stateInfo: AnimatorState, additive: boolean, weight: number, isFirstLayer: boolean,controllerLayer:AnimatorControllerLayer = null): void {
		var realtimeDatas: Array<number | Vector3 | Quaternion | ConchVector3 | ConchQuaternion> = stateInfo._realtimeDatas;
		var nodes: KeyframeNodeList = stateInfo._clip!._nodes!;
		var nodeOwners: KeyframeNodeOwner[] = stateInfo._nodeOwners;
		for (var i: number = 0, n: number = nodes.count; i < n; i++) {
			var nodeOwner: KeyframeNodeOwner = nodeOwners[i];
			if (nodeOwner) {//骨骼中没有该节点
				var node = nodes.getNodeByIndex(i);
				if(controllerLayer.avatarMask&&(!controllerLayer.avatarMask.getTransformActive( node.nodePath)))
					continue;
				var pro: any = nodeOwner.propertyOwner;
				if (pro) {
					switch (nodeOwner.type) {
						case 0: //Float
							var proPat: string[] = nodeOwner.property!;
							var m: number = proPat.length - 1;
							for (var j: number = 0; j < m; j++) {
								pro = pro[proPat[j]];
								if (!pro)//属性可能或被置空
									break;
							}
							pro&&this._applyFloat(pro, proPat[m], nodeOwner, additive, weight, isFirstLayer, <number>realtimeDatas[i]);
							break;
						case 1: //Position
							var localPos: Vector3 = pro.localPosition;
							this._applyPositionAndRotationEuler(nodeOwner, additive, weight, isFirstLayer, <Vector3>realtimeDatas[i], localPos);
							pro.localPosition = localPos;
							break;
						case 2: //Rotation
							var localRot: Quaternion = pro.localRotation;
							this._applyRotation(nodeOwner, additive, weight, isFirstLayer, <Quaternion>realtimeDatas[i], localRot);
							pro.localRotation = localRot;
							break;
						case 3: //Scale
							var localSca: Vector3 = pro.localScale;
							this._applyScale(nodeOwner, additive, weight, isFirstLayer, <Vector3>realtimeDatas[i], localSca);
							pro.localScale = localSca;
							break;
						case 4: //RotationEuler
							var localEuler: Vector3 = pro.localRotationEuler;
							this._applyPositionAndRotationEuler(nodeOwner, additive, weight, isFirstLayer, <Vector3>realtimeDatas[i], localEuler);
							pro.localRotationEuler = localEuler;
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

		var destRealtimeDatas: Array<number | Vector3 | Quaternion | ConchVector3 | ConchQuaternion> = destState._realtimeDatas;
		var destDataIndices: number[] = controllerLayer._destCrossClipNodeIndices;
		var destNodeOwners: KeyframeNodeOwner[] = destState._nodeOwners;
		var srcRealtimeDatas: Array<number | Vector3 | Quaternion | ConchVector3 | ConchQuaternion> = srcState._realtimeDatas;
		var srcDataIndices: number[] = controllerLayer._srcCrossClipNodeIndices;
		var srcNodeOwners: KeyframeNodeOwner[] = srcState._nodeOwners;

		for (var i: number = 0; i < ownerCount; i++) {
			var nodeOwner: KeyframeNodeOwner = nodeOwners[i];
			if (nodeOwner) {
				var srcIndex: number = srcDataIndices[i];
				var destIndex: number = destDataIndices[i];
				var srcValue: any = srcIndex !== -1 ? srcRealtimeDatas[srcIndex] : destNodeOwners[destIndex].defaultValue;
				var desValue: any = destIndex !== -1 ? destRealtimeDatas[destIndex] : srcNodeOwners[srcIndex].defaultValue;
				this._applyCrossData(nodeOwner, additive, weight, isFirstLayer, srcValue, desValue, crossWeight);
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
		var destRealtimeDatas: Array<number | Vector3 | Quaternion | ConchVector3 | ConchQuaternion> = destState._realtimeDatas;
		var destDataIndices: number[] = controllerLayer._destCrossClipNodeIndices;

		for (var i: number = 0; i < ownerCount; i++) {
			var nodeOwner: KeyframeNodeOwner = nodeOwners[i];
			if (nodeOwner) {
				var destIndex: number = destDataIndices[i];
				var srcValue: any = nodeOwner.crossFixedValue;
				var desValue: any = destIndex !== -1 ? destRealtimeDatas[destIndex] : nodeOwner.defaultValue;
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
				if (pro) {
					switch (nodeOwner.type) {
						case 0:
							var proPat: string[] = nodeOwner.property!;
							var m: number = proPat.length - 1;
							for (var j: number = 0; j < m; j++) {
								pro = pro[proPat[j]];
								if (!pro)//属性可能或被置空
									break;
							}
							pro[proPat[m]] = nodeOwner.defaultValue;
							break;
						case 1:
							var locPos: Vector3 = pro.localPosition;
							var def: Vector3 = nodeOwner.defaultValue;
							locPos.x = def.x;
							locPos.y = def.y;
							locPos.z = def.z;
							pro.localPosition = locPos;
							break;
						case 2:
							var locRot: Quaternion = pro.localRotation;
							var defQua: Quaternion = nodeOwner.defaultValue;
							locRot.x = defQua.x;
							locRot.y = defQua.y;
							locRot.z = defQua.z;
							locRot.w = defQua.w;
							pro.localRotation = locRot;
							break;
						case 3:
							var locSca: Vector3 = pro.localScale;
							def = nodeOwner.defaultValue;
							locSca.x = def.x;
							locSca.y = def.y;
							locSca.z = def.z;
							pro.localScale = locSca;
							break;
						case 4:
							var locEul: Vector3 = pro.localRotationEuler;
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
	 * @internal
	 * @override
	 */
	_onAdded(): void {
		var parent: Node = this.owner._parent;
		((<Sprite3D>this.owner))._setHierarchyAnimator(this, parent ? ((<Sprite3D>parent))._hierarchyAnimator : null);//只有动画组件在加载或卸载时才重新组织数据
		((<Sprite3D>this.owner))._changeAnimatorToLinkSprite3DNoAvatar(this, true, []);
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _onDestroy(): void {
		for (var i: number = 0, n: number = this._controllerLayers.length; i < n; i++)
			this._controllerLayers[i]._removeReference();
		var parent: Node = this.owner._parent;
		((<Sprite3D>this.owner))._clearHierarchyAnimator(this, parent ? ((<Sprite3D>parent))._hierarchyAnimator : null);//只有动画组件在加载或卸载时才重新组织数据
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_onEnable(): void {
		((<Scene3D>this.owner._scene))._animatorPool.add(this);
		for (var i: number = 0, n: number = this._controllerLayers.length; i < n; i++) {
			if (this._controllerLayers[i].playOnWake) {
				var defaultClip: AnimatorState = this.getDefaultState(i);
				(defaultClip) && (this.play(null, i, 0));
			}
		}
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _onDisable(): void {
		((<Scene3D>this.owner._scene))._animatorPool.remove(this);
	}

	/**
	 * @internal
	 */
	_handleSpriteOwnersBySprite(isLink: boolean, path: string[], sprite: Sprite3D): void {
		for (var i: number = 0, n: number = this._controllerLayers.length; i < n; i++) {
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
		var avatarData: any = data.avatar;
		if (avatarData) {
			this.avatar = Loader.getRes(avatarData.path);
			var linkSprites: any = avatarData.linkSprites;
			this._linkSprites = linkSprites;
			this._linkToSprites(linkSprites);
		}

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
						animatorLayer.addState(animatorState);
						(j === 0) && (this.getControllerLayer(i).defaultState = animatorState);
					}
				}
			}
			(play !== undefined) && (animatorLayer.playOnWake = play);
			//avatarMask
			let layerMaskData = layerData.avatarMask;
			if(layerMaskData){
				let avaMask =new AvatarMask(this);
				animatorLayer.avatarMask = avaMask;
				for(var bips in layerMaskData){
					avaMask.setTransformActive(bips,layerMaskData[bips]);
				}
			}

		}
		var cullingModeData: any = data.cullingMode;
		(cullingModeData !== undefined) && (this.cullingMode = cullingModeData);
	}

	/**
	 * @internal
	 */
	_update(): void {
		var timer: Timer = ((<Scene3D>this.owner._scene)).timer;
		var delta: number = timer._delta / 1000.0;//Laya.timer.delta已结包含Laya.timer.scale
		if (this._speed === 0 || delta === 0)//delta为0无需更新,可能造成crossWeight计算值为NaN
			return;
		var needRender: boolean;
		if (this.cullingMode === Animator.CULLINGMODE_CULLCOMPLETELY) {//所有渲染精灵不可见时
			needRender = false;
			for (var i: number = 0, n: number = this._renderableSprites.length; i < n; i++) {
				if (this._renderableSprites[i]._render.isRender) {
					needRender = true;
					break;
				}
			}
		} else {
			needRender = true;
		}
		this._updateMark++;
		for (i = 0, n = this._controllerLayers.length; i < n; i++) {
			var controllerLayer: AnimatorControllerLayer = this._controllerLayers[i];
			var playStateInfo: AnimatorPlayState = controllerLayer._playStateInfo!;
			var crossPlayStateInfo: AnimatorPlayState = controllerLayer._crossPlayStateInfo!;
			addtive = controllerLayer.blendingMode !== AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
			switch (controllerLayer._playType) {
				case 0:
					var animatorState: AnimatorState = playStateInfo._currentState!;
					var clip: AnimationClip = animatorState._clip!;
					var speed: number = this._speed * animatorState.speed;
					var finish: boolean = playStateInfo._finish;//提前取出finish,防止最后一帧跳过
					finish || this._updatePlayer(animatorState, playStateInfo, delta * speed, clip.islooping);
					if (needRender) {
						var addtive: boolean = controllerLayer.blendingMode !== AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
						this._updateClipDatas(animatorState, addtive, playStateInfo,controllerLayer.avatarMask);//clipDatas为逐动画文件,防止两个使用同一动画文件的Animator数据错乱,即使动画停止也要updateClipDatas
						this._setClipDatasToNode(animatorState, addtive, controllerLayer.defaultWeight, i === 0,controllerLayer);//多层动画混合时即使动画停止也要设置数据
						finish || this._updateEventScript(animatorState, playStateInfo);
					}
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
					this._updatePlayer(crossState, crossPlayStateInfo, delta * crossScale * crossSpeed, crossClip.islooping);
					var crossWeight: number = ((crossPlayStateInfo._elapsedTime - startPlayTime) / crossScale) / crossDuratuion;
					if (crossWeight >= 1.0) {
						if (needRender) {
							this._updateClipDatas(crossState, addtive, crossPlayStateInfo,controllerLayer.avatarMask);
							this._setClipDatasToNode(crossState, addtive, controllerLayer.defaultWeight, i === 0,controllerLayer);

							controllerLayer._playType = 0;//完成融合,切换到正常播放状态
							playStateInfo._currentState = crossState;
							crossPlayStateInfo._cloneTo(playStateInfo);
						}
					} else {
						if (!playStateInfo._finish) {
							speed = this._speed * animatorState.speed;
							this._updatePlayer(animatorState, playStateInfo, delta * speed, clip.islooping);
							if (needRender)
								this._updateClipDatas(animatorState, addtive, playStateInfo,controllerLayer.avatarMask);
						}
						if (needRender) {
							this._updateClipDatas(crossState, addtive, crossPlayStateInfo,controllerLayer.avatarMask);
							this._setCrossClipDatasToNode(controllerLayer, animatorState, crossState, crossWeight, i === 0);
						}
					}
					if (needRender) {
						this._updateEventScript(animatorState, playStateInfo);
						this._updateEventScript(crossState, crossPlayStateInfo);
					}
					break;
				case 2:
					crossState = controllerLayer._crossPlayState;
					crossClip = crossState._clip!;
					crossDuratuion = controllerLayer._crossDuration;
					startPlayTime = crossPlayStateInfo._startPlayTime;
					crossClipDuration = crossClip._duration - startPlayTime;
					crossScale = crossDuratuion > crossClipDuration ? crossClipDuration / crossDuratuion : 1.0;//如果过度时间大于过度动作时间,则减慢速度
					crossSpeed = this._speed * crossState.speed;
					this._updatePlayer(crossState, crossPlayStateInfo, delta * crossScale * crossSpeed, crossClip.islooping);
					if (needRender) {
						crossWeight = ((crossPlayStateInfo._elapsedTime - startPlayTime) / crossScale) / crossDuratuion;
						if (crossWeight >= 1.0) {
							this._updateClipDatas(crossState, addtive, crossPlayStateInfo,controllerLayer.avatarMask);
							this._setClipDatasToNode(crossState, addtive, 1.0, i === 0,controllerLayer);
							controllerLayer._playType = 0;//完成融合,切换到正常播放状态
							playStateInfo._currentState = crossState;
							crossPlayStateInfo._cloneTo(playStateInfo);
						} else {
							this._updateClipDatas(crossState, addtive, crossPlayStateInfo,controllerLayer.avatarMask);
							this._setFixedCrossClipDatasToNode(controllerLayer, crossState, crossWeight, i === 0);
						}
						this._updateEventScript(crossState, crossPlayStateInfo);
					}
					break;
			}
		}

		if (needRender) {
			if (this._avatar) {
				this._updateAvatarNodesToSprite();
			}
		}
	}

	/**
	 * @internal
	 * @override
	 */
	_cloneTo(dest: Component): void {
		var animator: Animator = (<Animator>dest);
		animator.avatar = this.avatar;
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
		animator._linkSprites = this._linkSprites;//TODO:需要统一概念
		animator._linkToSprites(this._linkSprites);
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
	play(name: string|null = null, layerIndex: number = 0, normalizedTime: number = Number.NEGATIVE_INFINITY): void {
		var controllerLayer: AnimatorControllerLayer = this._controllerLayers[layerIndex];
		if (controllerLayer) {
			var defaultState: AnimatorState = controllerLayer.defaultState;
			if (!name && !defaultState)
				throw new Error("Animator:must have default clip value,please set clip property.");
			var playStateInfo: AnimatorPlayState = controllerLayer._playStateInfo!;
			var curPlayState: AnimatorState = playStateInfo._currentState!;


			var animatorState: AnimatorState = name ? controllerLayer._statesMap[name] : defaultState;
			var clipDuration: number = animatorState._clip!._duration;
			var calclipduration=animatorState._clip!._duration * (animatorState.clipEnd - animatorState.clipStart);
			if (curPlayState !== animatorState) {
				if (normalizedTime !== Number.NEGATIVE_INFINITY)
					playStateInfo._resetPlayState(clipDuration * normalizedTime,calclipduration);
				else
					playStateInfo._resetPlayState(0.0,calclipduration);
				(curPlayState !== null && curPlayState !== animatorState) && (this._revertDefaultKeyframeNodes(curPlayState));
				controllerLayer._playType = 0;
				playStateInfo._currentState = animatorState;
			} else {
				if (normalizedTime !== Number.NEGATIVE_INFINITY) {
					playStateInfo._resetPlayState(clipDuration * normalizedTime,calclipduration);
					controllerLayer._playType = 0;
				}
			}

			var scripts: AnimatorStateScript[] = animatorState._scripts!;
			if (scripts) {
				for (var i: number = 0, n: number = scripts.length; i < n; i++)
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
	crossFade(name: string, transitionDuration: number, layerIndex: number = 0, normalizedTime: number = Number.NEGATIVE_INFINITY): void {
		var controllerLayer = this._controllerLayers[layerIndex];
		if (controllerLayer) {
			var destAnimatorState = controllerLayer._statesMap[name];
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
					crossPlayStateInfo!._resetPlayState(destClip._duration * normalizedTime,controllerLayer._crossDuration);
				else
					crossPlayStateInfo!._resetPlayState(0.0,controllerLayer._crossDuration);

				var scripts: AnimatorStateScript[] = destAnimatorState._scripts;
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
	 * @deprecated 请使用animator.getControllerLayer(layerIndex).getCurrentPlayState()替换。use animator.getControllerLayer(layerIndex).getCurrentPlayState() instead
	 * 获取当前的播放状态。
	 * @param   layerIndex 层索引。
	 * @return  动画播放状态。
	 */
	getCurrentAnimatorPlayState(layerInex: number = 0): AnimatorPlayState {
		return this._controllerLayers[layerInex]._playStateInfo!;
	}


	//-----------------------------------------------------------------------------------------------------------------------------------------------------------
	/** @internal */
	private _avatar: Avatar;//[兼容性API]

	/**
	 * avatar。
	 */
	get avatar(): Avatar {//[兼容性API]
		return this._avatar;
	}

	set avatar(value: Avatar) {//[兼容性API]
		if (this._avatar !== value) {
			this._avatar = value;
			if (value) {
				this._getAvatarOwnersAndInitDatasAsync();
				((<Sprite3D>this.owner))._changeHierarchyAnimatorAvatar(this, value);
			} else {
				var parent: Node = this.owner._parent;
				((<Sprite3D>this.owner))._changeHierarchyAnimatorAvatar(this, parent ? ((<Sprite3D>parent))._hierarchyAnimator!._avatar : null);
			}
		}
	}


	/**
	 *@internal
	 */
	private _isLinkSpriteToAnimationNodeData(sprite: Sprite3D, nodeName: string, isLink: boolean): void {//[兼容性API]
		var linkSprites: any[] = this._linkAvatarSpritesData[nodeName];//存储挂点数据
		if (isLink) {
			linkSprites || (this._linkAvatarSpritesData[nodeName] = linkSprites = []);
			linkSprites.push(sprite);
		} else {
			var index: number = linkSprites.indexOf(sprite);
			linkSprites.splice(index, 1);
		}
	}


	/**
	 *@internal
	 */
	private _getAvatarOwnersAndInitDatasAsync(): void {//[兼容性API]
		for (var i: number = 0, n: number = this._controllerLayers.length; i < n; i++) {
			var clipStateInfos: AnimatorState[] = this._controllerLayers[i]._states;
			for (var j: number = 0, m: number = clipStateInfos.length; j < m; j++)
				this._getOwnersByClip(clipStateInfos[j]);
		}

		this._avatar._cloneDatasToAnimator(this);
		for (var k in this._linkAvatarSpritesData) {
			var sprites: any[] = this._linkAvatarSpritesData[k];
			if (sprites) {
				for (var c: number = 0, p: number = sprites.length; c < p; c++)
					this._isLinkSpriteToAnimationNode(sprites[c], k, true);//TODO:对应移除
			}
		}
	}

	/**
	 *@internal
	 */
	private _isLinkSpriteToAnimationNode(sprite: Sprite3D, nodeName: string, isLink: boolean): void {//[兼容性API]
		if (this._avatar) {
			var node: AnimationNode = this._avatarNodeMap[nodeName];
			if (node) {
				if (isLink) {
					sprite._transform._dummy = node.transform;
					this._linkAvatarSprites.push(sprite);

					var nodeTransform: AnimationTransform3D = node.transform;//nodeTransform为空时表示avatar中暂时无此节点
					var spriteTransform: Transform3D = sprite.transform;
					if (!spriteTransform.owner.isStatic && nodeTransform) {//Avatar跟节点始终为false,不会更新,Scene无transform
						//TODO:spriteTransform.owner.isStatic外部判断
						var spriteWorldMatrix: Matrix4x4 = spriteTransform.worldMatrix;
						var ownParTra: Transform3D|null = ((<Sprite3D>this.owner))._transform._parent;
						if (ownParTra) {
							Utils3D.matrix4x4MultiplyMFM(ownParTra.worldMatrix, nodeTransform.getWorldMatrix(), spriteWorldMatrix);//TODO:还可优化
						} else {
							var sprWorE: Float32Array = spriteWorldMatrix.elements;
							var nodWorE: Float32Array = nodeTransform.getWorldMatrix();
							for (var i: number = 0; i < 16; i++)
								sprWorE[i] = nodWorE[i];
						}
						spriteTransform.worldMatrix = spriteWorldMatrix;
					}
				} else {
					sprite._transform._dummy = null;
					this._linkAvatarSprites.splice(this._linkAvatarSprites.indexOf(sprite), 1);
				}
			}
		}
	}

	/**
	 *@internal
	 */
	_updateAvatarNodesToSprite(): void {
		for (var i: number = 0, n: number = this._linkAvatarSprites.length; i < n; i++) {
			var sprite: Sprite3D = this._linkAvatarSprites[i];
			var nodeTransform = sprite.transform._dummy;//nodeTransform为空时表示avatar中暂时无此节点
			var spriteTransform: Transform3D = sprite.transform;
			if (!spriteTransform.owner.isStatic && nodeTransform) {
				var spriteWorldMatrix: Matrix4x4 = spriteTransform.worldMatrix;
				var ownTra: Transform3D = ((<Sprite3D>this.owner))._transform;
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
	linkSprite3DToAvatarNode(nodeName: string, sprite3D: Sprite3D): boolean {//[兼容性API]
		this._isLinkSpriteToAnimationNodeData(sprite3D, nodeName, true);
		this._isLinkSpriteToAnimationNode(sprite3D, nodeName, true);
		return true;
	}

	/**
	 * 解除精灵节点到Avatar节点的关联,此Animator必须有Avatar文件。
	 * @param sprite3D 精灵节点。
	 * @return 是否解除关联成功。
	 */
	unLinkSprite3DToAvatarNode(sprite3D: Sprite3D): boolean {//[兼容性API]
		var dummy = sprite3D.transform._dummy;
		if (dummy) {
			var nodeName = dummy._owner.name;
			this._isLinkSpriteToAnimationNodeData(sprite3D, nodeName!, false);
			this._isLinkSpriteToAnimationNode(sprite3D, nodeName!, false);
			return true;
		} else {
			return false;
		}
	}

	/**
	 *@internal
	 * [NATIVE]
	 */
	_updateAnimationNodeWorldMatix(localPositions: Float32Array, localRotations: Float32Array, localScales: Float32Array, worldMatrixs: Float32Array, parentIndices: Int16Array): void {
		(<any>LayaGL.instance).updateAnimationNodeWorldMatix(localPositions, localRotations, localScales, parentIndices, worldMatrixs);
	}
}


