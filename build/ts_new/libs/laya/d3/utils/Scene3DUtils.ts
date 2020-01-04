import { Component } from "../../components/Component";
import { Node } from "../../display/Node";
import { Browser } from "../../utils/Browser";
import { Camera } from "../core/Camera";
import { DirectionLight } from "../core/light/DirectionLight";
import { PointLight } from "../core/light/PointLight";
import { SpotLight } from "../core/light/SpotLight";
import { MeshSprite3D } from "../core/MeshSprite3D";
import { ShuriKenParticle3D } from "../core/particleShuriKen/ShuriKenParticle3D";
import { RenderableSprite3D } from "../core/RenderableSprite3D";
import { Scene3D } from "../core/scene/Scene3D";
import { SkinnedMeshSprite3D } from "../core/SkinnedMeshSprite3D";
import { Sprite3D } from "../core/Sprite3D";
import { TrailSprite3D } from "../core/trail/TrailSprite3D";
import { StaticBatchManager } from "../graphics/StaticBatchManager";
import { ClassUtils } from "../../utils/ClassUtils";



/**
 * <code>Utils3D</code> 类用于创建3D工具。
 */
export class Scene3DUtils {
	private static _createSprite3DInstance(nodeData: any, spriteMap: any, outBatchSprites: RenderableSprite3D[]): Node {
		var node: Node;
		switch (nodeData.type) {
			case "Scene3D":
				node = new Scene3D();
				break;
			case "Sprite3D":
				node = new Sprite3D();
				break;
			case "MeshSprite3D":
				node = new MeshSprite3D();
				(outBatchSprites && nodeData.props.isStatic) && (outBatchSprites.push(<MeshSprite3D>node));
				break;
			case "SkinnedMeshSprite3D":
				node = new SkinnedMeshSprite3D();
				break;
			case "ShuriKenParticle3D":
				node = new ShuriKenParticle3D();
				break;
			case "Camera":
				node = new Camera();
				break;
			case "DirectionLight":
				node = new DirectionLight();
				break;
			case "PointLight":
				node = new PointLight();
				break;
			case "SpotLight":
				node = new SpotLight();
				break;
			case "TrailSprite3D":
				node = new TrailSprite3D();
				break;
			default:
				throw new Error("Utils3D:unidentified class type in (.lh) file.");
		}

		var childData: any[] = nodeData.child;
		if (childData) {
			for (var i: number = 0, n: number = childData.length; i < n; i++) {
				var child: any = Scene3DUtils._createSprite3DInstance(childData[i], spriteMap, outBatchSprites)
				node.addChild(child);
			}
		}

		spriteMap[nodeData.instanceID] = node;
		return node;
	}

	private static _createComponentInstance(nodeData: any, spriteMap: any): void {
		var node: Node = spriteMap[nodeData.instanceID];
		node._parse(nodeData.props, spriteMap);

		var childData: any[] = nodeData.child;
		if (childData) {
			for (var i: number = 0, n: number = childData.length; i < n; i++)
				Scene3DUtils._createComponentInstance(childData[i], spriteMap)
		}

		var componentsData: any[] = nodeData.components;
		if (componentsData) {
			for (var j: number = 0, m: number = componentsData.length; j < m; j++) {
				var data: any = componentsData[j];
				var clas: any = ClassUtils.getRegClass(data.type);
				if (clas) {
					var component: Component = node.addComponent(clas);
					component._parse(data);
				} else {
					console.warn("Unkown component type.");
				}
			}
		}
	}



	/**
	 * @internal
	 */
	static _createNodeByJson02(nodeData: any, outBatchSprites: RenderableSprite3D[]): Node {
		var spriteMap: any = {};
		var node: Node = Scene3DUtils._createSprite3DInstance(nodeData, spriteMap, outBatchSprites);
		Scene3DUtils._createComponentInstance(nodeData, spriteMap);
		return node;
	}


	/**
	 *@internal
	 */
	static _parse(data: any, propertyParams: any = null, constructParams: any[] = null): Sprite3D {
		var json: any = data.data;
		var outBatchSprits: RenderableSprite3D[] = [];
		var sprite: Sprite3D;
		switch (data.version) {
			case "LAYAHIERARCHY:02":
				sprite = (<Sprite3D>Scene3DUtils._createNodeByJson02(json, outBatchSprits));
				break;
			default:
				sprite = (<Sprite3D>Scene3DUtils._createNodeByJson(json, outBatchSprits));
		}

		StaticBatchManager.combine(sprite, outBatchSprits);
		return sprite;
	}

	/**
	 *@internal
	 */
	static _parseScene(data: any, propertyParams: any = null, constructParams: any[] = null): Scene3D {
		var json: any = data.data;
		var outBatchSprits: RenderableSprite3D[] = [];
		var scene: Scene3D;
		switch (data.version) {
			case "LAYASCENE3D:02":
				scene = <Scene3D>Scene3DUtils._createNodeByJson02(json, outBatchSprits);
				break;
			default:
				scene = <Scene3D>Scene3DUtils._createNodeByJson(json, outBatchSprits);
		}

		StaticBatchManager.combine(null, outBatchSprits);
		return scene;
	}

	//--------------------------------------------------------------------------------------------------------------------------------

	/**
	 * @internal
	 */
	static _createNodeByJson(nodeData: any, outBatchSprites: RenderableSprite3D[]): Node {//兼容代码
		var node: Node;
		switch (nodeData.type) {
			case "Scene3D":
				node = new Scene3D();
				break;
			case "Sprite3D":
				node = new Sprite3D();
				break;
			case "MeshSprite3D":
				node = new MeshSprite3D();
				(outBatchSprites && nodeData.props.isStatic) && (outBatchSprites.push(<MeshSprite3D>node));
				break;
			case "SkinnedMeshSprite3D":
				node = new SkinnedMeshSprite3D();
				break;
			case "ShuriKenParticle3D":
				node = new ShuriKenParticle3D();
				break;
			case "Camera":
				node = new Camera();
				break;
			case "DirectionLight":
				node = new DirectionLight();
				break;
			case "PointLight":
				node = new PointLight();
				break;
			case "SpotLight":
				node = new SpotLight();
				break;
			case "TrailSprite3D":
				node = new TrailSprite3D();
				break;
			default:
				throw new Error("Utils3D:unidentified class type in (.lh) file.");
		}

		var childData: any[] = nodeData.child;
		if (childData) {
			for (var i: number = 0, n: number = childData.length; i < n; i++) {
				var child: any = Scene3DUtils._createNodeByJson(childData[i], outBatchSprites)
				node.addChild(child);
			}
		}

		var componentsData: any[] = nodeData.components;
		if (componentsData) {
			for (var j: number = 0, m: number = componentsData.length; j < m; j++) {
				var data: any = componentsData[j];
				var clas: any = ClassUtils.getRegClass(data.type);
				if (clas) {
					var component: Component = node.addComponent(clas);
					component._parse(data);
				} else {
					console.warn("Unkown component type.");
				}
			}
		}
		node._parse(nodeData.props, null);
		return node;
	}
}