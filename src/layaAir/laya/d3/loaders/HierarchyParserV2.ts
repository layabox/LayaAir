import { Component } from "../../components/Component";
import { Node } from "../../display/Node";
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
import { ClassUtils } from "../../utils/ClassUtils";
import { SimpleSkinnedMeshSprite3D } from "../core/SimpleSkinnedMeshSprite3D";
import { ILoadURL, Loader } from "../../net/Loader";
import { URL } from "../../net/URL";
import { HierarchyLoader } from "../../loaders/HierarchyLoader";
import { ReflectionProbe } from "../component/Volume/reflectionProbe/ReflectionProbe";

/**
 * @internal
 * <code>Utils3D</code> 类用于创建3D工具。
 */
class HierarchyParserV2 {
    /**
     * @internal
     * @param nodeData 创建数据
     * @param spriteMap 精灵集合
     * @param outBatchSprites 渲染精灵集合
     */
    private static _createSprite3DInstance(nodeData: any, spriteMap: any, outBatchSprites: RenderableSprite3D[]): Node {
        let node: Node;
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
            case "SimpleSkinnedMeshSprite3D":
                node = new SimpleSkinnedMeshSprite3D();
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
            case "ReflectionProbe":
                node = new Sprite3D();
                node.addComponent(ReflectionProbe);
                break;
            default:
                throw new Error("Utils3D:unidentified class type in (.lh) file.");
        }

        let childData: any[] = nodeData.child;
        if (childData) {
            for (let i: number = 0, n: number = childData.length; i < n; i++) {
                let child: any = HierarchyParserV2._createSprite3DInstance(childData[i], spriteMap, outBatchSprites)
                node.addChild(child);
            }
        }

        spriteMap[nodeData.instanceID] = node;
        return node;
    }

    /**
     * @internal
     * @param nodeData 
     * @param spriteMap 
     * @param interactMap 
     */
    private static _createComponentInstance(nodeData: any, spriteMap: any, interactMap: any): void {
        let node: Node = spriteMap[nodeData.instanceID];
        node._parse(nodeData.props, spriteMap);

        let childData: any[] = nodeData.child;
        if (childData) {
            for (let i: number = 0, n: number = childData.length; i < n; i++)
                HierarchyParserV2._createComponentInstance(childData[i], spriteMap, interactMap)
        }

        let componentsData: any[] = nodeData.components;
        if (componentsData) {
            for (let j: number = 0, m: number = componentsData.length; j < m; j++) {
                let data: any = componentsData[j];
                let cls: any = ClassUtils.getClass(data.type);
                if (cls) {
                    let component: Component = node.addComponent(cls);
                    component._parse(data, interactMap);
                } else {
                    console.warn(`Unidentified component type: ${data.type}.`);
                }
            }
        }
    }



    /**
     * @internal
     */
    static _createNodeByJson02(nodeData: any, outBatchSprites: RenderableSprite3D[]): Node {
        let spriteMap: any = {};
        let interactMap: any = { component: [], data: [] };
        let node: Node = HierarchyParserV2._createSprite3DInstance(nodeData, spriteMap, outBatchSprites);
        HierarchyParserV2._createComponentInstance(nodeData, spriteMap, interactMap);
        HierarchyParserV2._createInteractInstance(interactMap, spriteMap);
        return node;
    }

    /**
     * @internal
     */
    static _createInteractInstance(interatMap: any, spriteMap: any) {
        let components: Component[] = interatMap.component;
        let data = interatMap.data;
        for (let i = 0, n = components.length; i < n; i++) {
            components[i]._parseInteractive(data[i], spriteMap);
        }
    }

    /**
     *@internal
     */
    static parse(data: any) {
        let json: any = data.data;
        let outBatchSprits: RenderableSprite3D[] = [];
        let sprite: Sprite3D | Scene3D;
        switch (data.version) {
            case "LAYAHIERARCHY:02":
            case "LAYASCENE3D:02":
                sprite = (<Sprite3D | Scene3D>HierarchyParserV2._createNodeByJson02(json, outBatchSprits));
                break;
            default:
                sprite = (<Sprite3D | Scene3D>HierarchyParserV2._createNodeByJson(json, outBatchSprits));
        }

        //StaticBatchManager.combine((sprite instanceof Sprite3D) ? sprite : null, outBatchSprits);
        return sprite;
    }

    //--------------------------------------------------------------------------------------------------------------------------------

    /**
     * @internal
     */
    static _createNodeByJson(nodeData: any, outBatchSprites: RenderableSprite3D[]): Node {//兼容代码
        let node: Node;
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
                throw new Error(`Unidentified node type ${nodeData.type}`);
        }

        let childData: any[] = nodeData.child;
        if (childData) {
            for (let i: number = 0, n: number = childData.length; i < n; i++) {
                let child: any = HierarchyParserV2._createNodeByJson(childData[i], outBatchSprites)
                node.addChild(child);
            }
        }

        let componentsData: any[] = nodeData.components;
        if (componentsData) {
            for (let j: number = 0, m: number = componentsData.length; j < m; j++) {
                let data: any = componentsData[j];
                let clas: any = ClassUtils.getClass(data.type);
                if (clas) {
                    let component: Component = node.addComponent(clas);
                    component._parse(data);
                } else {
                    console.warn(`Unidentified component type: ${data.type}.`);
                }
            }
        }
        node._parse(nodeData.props, null);
        return node;
    }

    public static collectResourceLinks(data: any, basePath: string): (string | ILoadURL)[] {
        let test: Record<string, ILoadURL> = {};
        let innerUrls: ILoadURL[] = [];

        function addInnerUrl(url: string, type: string, constructParams?: any, propertyParams?: any) {
            let entry: ILoadURL = test[url];
            if (!entry) {
                entry = { url: URL.join(basePath, url), type: type, constructParams: constructParams, propertyParams: propertyParams };
                test[url] = entry;
                innerUrls.push(entry);
            }
            return entry.url;
        }

        function check(nodeData: any) {
            let props: any = nodeData.props;
            switch (nodeData.type) {
                case "Scene3D":
                    let lightmaps: any[] = props.lightmaps;
                    if (lightmaps) {
                        for (let i = 0, n = lightmaps.length; i < n; i++) {
                            let lightMap: any = lightmaps[i];
                            if (lightMap.path) {
                                lightMap.path = addInnerUrl(lightMap.path, Loader.TEXTURE2D, lightMap.constructParams, lightMap.propertyParams);
                            }
                            else {
                                let lightmapColorData: any = lightMap.color;
                                lightmapColorData.path = addInnerUrl(lightmapColorData.path, Loader.TEXTURE2D, lightmapColorData.constructParams, lightmapColorData.propertyParams);
                                let lightmapDirectionData: any = lightMap.direction;
                                if (lightmapDirectionData)
                                    lightmapDirectionData.path = addInnerUrl(lightmapDirectionData.path, Loader.TEXTURE2D, lightmapDirectionData.constructParams, lightmapDirectionData.propertyParams);
                            }
                        }
                    }

                    //兼容
                    let reflectionTextureData: string = props.reflectionTexture;
                    (reflectionTextureData) && (props.reflection = addInnerUrl(reflectionTextureData, Loader.TEXTURECUBE));

                    let reflectionData: string = props.reflection;
                    (reflectionData) && (props.reflection = addInnerUrl(reflectionData, Loader.TEXTURECUBE));
                    if (props.sky) {
                        let skyboxMaterial: any = props.sky.material;
                        (skyboxMaterial) && (skyboxMaterial.path = addInnerUrl(skyboxMaterial.path, Loader.MATERIAL));
                    }
                    break;
                case "Camera":
                    let skyboxMatData: any = props.skyboxMaterial;
                    (skyboxMatData) && (skyboxMatData.path = addInnerUrl(skyboxMatData.path, Loader.MATERIAL));
                    break;
                case "TrailSprite3D":
                case "MeshSprite3D":
                case "SkinnedMeshSprite3D":
                case "SimpleSkinnedMeshSprite3D":
                    let meshPath: string = props.meshPath;
                    (meshPath) && (props.meshPath = addInnerUrl(meshPath, Loader.MESH));
                    let materials: any[] = props.materials;
                    if (materials)
                        for (let i = 0, n = materials.length; i < n; i++)
                            materials[i].path = addInnerUrl(materials[i].path, Loader.MATERIAL);
                    if (nodeData.type == "SimpleSkinnedMeshSprite3D")
                        if (props.animatorTexture)
                            props.animatorTexture = addInnerUrl(props.animatorTexture, Loader.SIMPLEANIMATORBIN)
                    break;

                case "ShuriKenParticle3D":
                    if (props.main) {
                        let resources: any = props.renderer.resources;
                        let mesh: string = resources.mesh;
                        let material: string = resources.material;
                        (mesh) && (resources.mesh = addInnerUrl(mesh, Loader.MESH));
                        (material) && (resources.material = addInnerUrl(material, Loader.MATERIAL));
                    }
                    else {//兼容代码
                        let parMeshPath: string = props.meshPath;
                        (parMeshPath) && (props.meshPath = addInnerUrl(parMeshPath, Loader.MESH));
                        props.material.path = addInnerUrl(props.material.path, Loader.MATERIAL);
                    }
                    break;
                case "Terrain":
                    addInnerUrl(props.dataPath, Loader.TERRAINRES);
                    break;
                case "ReflectionProbe":
                    let reflection = props.reflection;
                    (reflection) && (props.reflection = addInnerUrl(reflection, Loader.TEXTURECUBE));
                    break;
            }

            let components: any[] = nodeData.components;
            if (components) {
                for (let k: number = 0, p: number = components.length; k < p; k++) {
                    let component: any = components[k];
                    switch (component.type) {
                        case "Animator":
                            // let avatarData: any = component.avatar;
                            // (avatarData) && (avatarData.path = addInnerUrl(avatarData.path, Loader.AVATAR));
                            let clipPaths: string[] = component.clipPaths;
                            if (!clipPaths) {
                                let layersData: any[] = component.layers;
                                for (let i = 0; i < layersData.length; i++) {
                                    let states: any[] = layersData[i].states;
                                    for (let j: number = 0, m: number = states.length; j < m; j++) {
                                        let clipPath: string = states[j].clipPath;
                                        (clipPath) && (states[j].clipPath = addInnerUrl(clipPath, Loader.ANIMATIONCLIP));
                                    }
                                }
                            } else {
                                for (let i = 0, n = clipPaths.length; i < n; i++)
                                    clipPaths[i] = addInnerUrl(clipPaths[i], Loader.ANIMATIONCLIP);
                            }
                            break;
                        case "PhysicsCollider":
                        case "Rigidbody3D":
                        case "CharacterController":
                            let shapes: any[] = component.shapes;
                            for (let i = 0; i < shapes.length; i++) {
                                let shape: any = shapes[i];
                                if (shape.type === "MeshColliderShape") {
                                    let mesh: string = shape.mesh;
                                    (mesh) && (shape.mesh = addInnerUrl(mesh, Loader.MESH));
                                }
                            }
                            break;
                    }
                }
            }

            let children: any[] = nodeData.child;
            if (!children) return;
            for (let i = 0, n = children.length; i < n; i++)
                check(children[i]);
        }

        check(data.data);

        return innerUrls;
    }
}

HierarchyLoader.v2 = HierarchyParserV2;