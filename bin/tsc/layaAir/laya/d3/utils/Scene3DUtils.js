import { Camera } from "../core/Camera";
import { DirectionLight } from "../core/light/DirectionLight";
import { PointLight } from "../core/light/PointLight";
import { SpotLight } from "../core/light/SpotLight";
import { MeshSprite3D } from "../core/MeshSprite3D";
import { ShuriKenParticle3D } from "../core/particleShuriKen/ShuriKenParticle3D";
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
    /**
* @private
*/
    static _createSprite3DInstance(nodeData, spriteMap, outBatchSprites) {
        var node;
        switch (nodeData.type) {
            case "Scene3D":
                node = new Scene3D();
                break;
            case "Sprite3D":
                node = new Sprite3D();
                break;
            case "MeshSprite3D":
                node = new MeshSprite3D();
                (outBatchSprites) && (outBatchSprites.push(node));
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
        var childData = nodeData.child;
        if (childData) {
            for (var i = 0, n = childData.length; i < n; i++) {
                var child = Scene3DUtils._createSprite3DInstance(childData[i], spriteMap, outBatchSprites);
                node.addChild(child);
            }
        }
        spriteMap[nodeData.instanceID] = node;
        return node;
    }
    /**
     * @private
     */
    static _createComponentInstance(nodeData, spriteMap) {
        var node = spriteMap[nodeData.instanceID];
        node._parse(nodeData.props, spriteMap);
        var childData = nodeData.child;
        if (childData) {
            for (var i = 0, n = childData.length; i < n; i++)
                Scene3DUtils._createComponentInstance(childData[i], spriteMap);
        }
        var componentsData = nodeData.components;
        if (componentsData) {
            for (var j = 0, m = componentsData.length; j < m; j++) {
                var data = componentsData[j];
                var clas = ClassUtils.getRegClass(data.type);
                if (clas) {
                    var component = node.addComponent(clas);
                    component._parse(data);
                }
                else {
                    console.warn("Unkown component type.");
                }
            }
        }
    }
    /**
     * @private
     */
    static _createNodeByJson02(nodeData, outBatchSprites) {
        var spriteMap = {};
        var node = Scene3DUtils._createSprite3DInstance(nodeData, spriteMap, outBatchSprites);
        Scene3DUtils._createComponentInstance(nodeData, spriteMap);
        return node;
    }
    /**
     *@private
     */
    static _parse(data, propertyParams = null, constructParams = null) {
        var json = data.data;
        var outBatchSprits = [];
        var sprite;
        switch (data.version) {
            case "LAYAHIERARCHY:02":
                sprite = Scene3DUtils._createNodeByJson02(json, outBatchSprits);
                break;
            default:
                sprite = Scene3DUtils._createNodeByJson(json, outBatchSprits);
        }
        StaticBatchManager.combine(sprite, outBatchSprits);
        return sprite;
    }
    /**
     *@private
     */
    static _parseScene(data, propertyParams = null, constructParams = null) {
        var json = data.data;
        var outBatchSprits = [];
        var scene;
        switch (data.version) {
            case "LAYASCENE3D:02":
                scene = Scene3DUtils._createNodeByJson02(json, outBatchSprits);
                break;
            default:
                scene = Scene3DUtils._createNodeByJson(json, outBatchSprits);
        }
        StaticBatchManager.combine(null, outBatchSprits);
        return scene;
    }
    //--------------------------------------------------------------------------------------------------------------------------------
    /**
     * @private
     */
    static _createNodeByJson(nodeData, outBatchSprites) {
        var node;
        switch (nodeData.type) {
            case "Scene3D":
                node = new Scene3D();
                break;
            case "Sprite3D":
                node = new Sprite3D();
                break;
            case "MeshSprite3D":
                node = new MeshSprite3D();
                (outBatchSprites) && (outBatchSprites.push(node));
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
        var childData = nodeData.child;
        if (childData) {
            for (var i = 0, n = childData.length; i < n; i++) {
                var child = Scene3DUtils._createNodeByJson(childData[i], outBatchSprites);
                node.addChild(child);
            }
        }
        var componentsData = nodeData.components;
        if (componentsData) {
            for (var j = 0, m = componentsData.length; j < m; j++) {
                var data = componentsData[j];
                var clas = ClassUtils.getRegClass(data.type);
                if (clas) {
                    var component = node.addComponent(clas);
                    component._parse(data);
                }
                else {
                    console.warn("Unkown component type.");
                }
            }
        }
        node._parse(nodeData.props, null);
        return node;
    }
}
