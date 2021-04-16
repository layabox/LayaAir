import * as glTF from "./glTFInterface";
import { Sprite3D } from "../d3/core/Sprite3D";
import { Texture2D } from "../resource/Texture2D";
import { Mesh, skinnedMatrixCache } from "../d3/resource/models/Mesh";
import { Loader } from "../net/Loader";
import { Material } from "../d3/core/material/Material";
import { PBRStandardMaterial } from "../d3/core/material/PBRStandardMaterial";
import { PBRRenderMode } from "../d3/core/material/PBRMaterial";
import { RenderState } from "../d3/core/material/RenderState";
import { Matrix4x4 } from "../d3/math/Matrix4x4";
import { Vector3 } from "../d3/math/Vector3";
import { Quaternion } from "../d3/math/Quaternion";
import { SkinnedMeshSprite3D } from "../d3/core/SkinnedMeshSprite3D";
import { MeshSprite3D } from "../d3/core/MeshSprite3D";
import { VertexDeclaration } from "../d3/graphics/VertexDeclaration";
import { VertexMesh } from "../d3/graphics/Vertex/VertexMesh";
import { IndexFormat } from "../d3/graphics/IndexFormat";
import { LayaGL } from "../layagl/LayaGL";
import { VertexBuffer3D } from "../d3/graphics/VertexBuffer3D";
import { IndexBuffer3D } from "../d3/graphics/IndexBuffer3D";
import { SubMesh } from "../d3/resource/models/SubMesh";
import { SkinnedMeshRenderer } from "../d3/core/SkinnedMeshRenderer";
import { Vector4 } from "../d3/math/Vector4";
import { Animator } from "../d3/component/Animator";
import { AnimatorControllerLayer } from "../d3/component/AnimatorControllerLayer";
import { AnimationClip } from "../d3/animation/AnimationClip";
import { KeyframeNodeList } from "../d3/animation/KeyframeNodeList";
import { Vector3Keyframe } from "../d3/core/Vector3Keyframe";
import { QuaternionKeyframe } from "../d3/core/QuaternionKeyframe";
import { KeyframeNode } from "../d3/animation/KeyframeNode";
import { AnimatorState } from "../d3/component/AnimatorState";
import { Handler } from "../utils/Handler";
import { glTFTextureEditor } from "./glTFTextureEditor";


/**
 * @internal
 * 辅助记录 submesh 所需数据
 */
class PrimitiveSubMesh {

    attributeMap: Map<string, Float32Array>;
    indices: Uint32Array;
    vertexDecler: string;
    vertexCount: number;
    boneIndicesList: Uint16Array[];
    subIndexStartArray: number[];
    subIndexCountArray: number[];

    constructor() {

    }
}

/**
 * @internal
 * 辅助记录 animator clip 所需数据
 */
class ClipNode {
    paths: string[];
    propertyOwner: string;
    propertyLength: number;
    propertise: string[];
    timeArray: Float32Array;
    valueArray: Float32Array;

    // 
    duration: number;
    type: number;
    constructor() {

    }
}

/**
 * <code>glTFUtils<code> 用于解析 glTF 2.0 对象
 */
export class glTFUtils {

    /** @internal */
    static NAMEID: number = 0;

    /** @internal 单次提交最大骨骼数量*/
    static maxSubBoneCount: number = 24;

    // todo extension function
    static Extensions: { [name: string]: Handler } = {};

    /**
     * 保存 extra 处理函数对象
     */
    static Extras: { [name: string]: { [name: string]: Handler } } = {};// todo change context from string to enum ?

    /** @internal glTF 数据对象 */
    private static _glTF: glTF.glTF;

    /** @internal glTF buffer Array */
    private static _glTFBuffers: ArrayBuffer[] = [];
    /** @internal glTF Texture2D Array */
    private static _glTFTextures: Texture2D[] = [];
    /** @internal glTF Material Array */
    private static _glTFMaterials: Material[] = [];
    /** @internal glTF node Array */
    private static _glTFNodes: Sprite3D[] = [];
    /** @internal glTF Scene node Array */
    private static _glTFScenes: Sprite3D[] = [];

    /**
     * @internal
     * 解析 glTF 对象
     * @param data 
     */
    static _parse(glTFData: glTF.glTF, propertyParams: any = null, constructParams: any[] = null): Sprite3D {

        glTFUtils._initData(glTFData);

        if (!glTFUtils._checkglTFVersion(this._glTF.asset)) {
            // todo 版本号 不符 警告 内容
            console.warn("glTF version wrong!");
            return new Sprite3D();;
        }

        // buffer and texture recourse
        glTFUtils._initBufferData(glTFData.buffers);
        glTFUtils._initTextureData(glTFData.images);

        glTFUtils._loadMaterials(glTFData.materials);
        glTFUtils._loadNodes(glTFData.nodes);
        glTFUtils.buildHierarchy(glTFData.nodes);

        glTFUtils._loadScenes(glTFData.scenes);

        glTFUtils._loadAnimations(glTFData.animations);

        let defaultSceneIndex = (glTFData.scene != undefined) ? glTFData.scene : 0;
        let defaultScene: Sprite3D = glTFUtils._glTFScenes[defaultSceneIndex];

        glTFUtils._clearData();
        return defaultScene;
    }

    /**
     * @internal
     * 初始化解析数据
     * @param glTFData 
     */
    static _initData(glTFData: glTF.glTF): void {
        glTFUtils._glTF = glTFData;
        (glTFData.buffers) && (glTFUtils._glTFBuffers.length = glTFData.buffers.length);
        (glTFData.textures) && (glTFUtils._glTFTextures.length = glTFData.textures.length);
        (glTFData.materials) && (glTFUtils._glTFMaterials.length = glTFData.materials.length);
        (glTFData.nodes) && (glTFUtils._glTFNodes.length = glTFData.nodes.length);
        (glTFData.scenes) && (glTFUtils._glTFScenes.length = glTFData.scenes.length);
    }

    /**
     * @internal
     * 解析完成清除残留数据
     */
    static _clearData(): void {
        glTFUtils._glTF = null;
        glTFUtils._glTFBuffers.length = 0;
        glTFUtils._glTFTextures.length = 0;
        glTFUtils._glTFMaterials.length = 0;
        glTFUtils._glTFNodes.length = 0;
        glTFUtils._glTFScenes.length = 0;
        glTFUtils.NAMEID = 0;
    }

    /**
     * @internal
     * 检查 glTF 版本
     * @param asset 
     */
    static _checkglTFVersion(asset: glTF.glTFAsset): boolean {
        if (asset.version !== "2.0") {
            return false;
        }
        return true;
    }

    /**
     * 注册 extra 处理函数
     * @param context 
     * @param extraName 
     * @param handler 
     */
    static RegisterExtra(context: string, extraName: string, handler: Handler) {
        let extra: { [name: string]: Handler } = glTFUtils.Extras[context] || (glTFUtils.Extras[context] = {});
        extra[extraName] = handler;
    }

    /**
     * 取消注册 extra 处理函数
     * @param context 
     * @param extraName 
     * @param recoverHandler 
     */
    static UnRegisterExtra(context: string, extraName: string, recoverHandler: boolean = true) {
        let extra: { [name: string]: Handler } = glTFUtils.Extras[context] || (glTFUtils.Extras[context] = {});
        if (recoverHandler) {
            let extraHandler: Handler = extra[extraName];
            extraHandler && extraHandler.recover();
        }
        delete extra[extraName];
    }

    /**
     * @internal
     * 执行 extra 处理函数
     * @param context 
     * @param glTFExtra 
     * @param createHandler 
     * @param params 
     */
    static ExecuteExtras(context: string, glTFExtra: glTF.glTFNodeProperty, createHandler: Handler, params?: any): any {
        let contextExtra: any = glTFUtils.Extras[context];
        let extraRes: any = null;

        if (contextExtra) {
            for (const key in glTFExtra) {
                let extraHandler: Handler = contextExtra[key];
                extraRes = extraHandler ? extraHandler.runWith([...params, createHandler]) : extraRes;
            }
        }

        extraRes = extraRes || createHandler.runWith(params);
        createHandler.recover();
        return extraRes;
    }

    /**
     * @internal
     * 获取 node name
     */
    static getNodeRandomName(context: string): string {
        return `${context}_${glTFUtils.NAMEID++}`;
    }

    /**
     * @internal
     * 初始化 buffer 对象 数组
     */
    static _initBufferData(buffers?: glTF.glTFBuffer[]): void {
        if (!buffers)
            return;

        buffers.forEach((buffer: glTF.glTFBuffer, index: number) => {
            glTFUtils._glTFBuffers[index] = Loader.getRes(buffer.uri);
        });
    }

    /**
     * 根据数据类型获取分量
     * @param type 
     */
    static getAccessorComponentsNum(type: glTF.glTFAccessorType): number {
        switch (type) {
            case "SCALAR": return 1;
            case "VEC2": return 2;
            case "VEC3": return 3;
            case "VEC4": return 4;
            case "MAT2": return 4;
            case "MAT3": return 9;
            case "MAT4": return 16;
            default: return 0;
        }
    }

    /**
     * 获取 attribute 分量
     * @param attriStr 
     */
    static getAttributeNum(attriStr: string): number {
        switch (attriStr) {
            case "POSITION": return 3;
            case "NORMAL": return 3;
            case "COLOR": return 4;
            case "UV": return 2;
            case "UV1": return 2;
            case "BLENDWEIGHT": return 4;
            case "BLENDINDICES": return 4;
            case "TANGENT": return 4;
            default: return 0;
        }
    }

    /**
     * @internal
     * 获取 buffer constructor
     * @param componentType 
     */
    static _getTypedArrayConstructor(componentType: glTF.glTFAccessorComponentType) {
        switch (componentType) {
            case glTF.glTFAccessorComponentType.BYTE: return Int8Array;
            case glTF.glTFAccessorComponentType.UNSIGNED_BYTE: return Uint8Array;
            case glTF.glTFAccessorComponentType.SHORT: return Int16Array;
            case glTF.glTFAccessorComponentType.UNSIGNED_SHORT: return Uint16Array;
            case glTF.glTFAccessorComponentType.UNSIGNED_INT: return Uint32Array;
            case glTF.glTFAccessorComponentType.FLOAT: return Float32Array;
        }
    }

    /**
     * 获取 accessor buffer 数据
     * @param accessorIndex 
     */
    static getBufferwithAccessorIndex(accessorIndex: number) {
        let accessor: glTF.glTFAccessor = glTFUtils._glTF.accessors[accessorIndex];
        if (!accessor)
            return null;

        let bufferView: glTF.glTFBufferView = glTFUtils._glTF.bufferViews[accessor.bufferView];
        let buffer: ArrayBuffer = glTFUtils._glTFBuffers[bufferView.buffer];

        let count: number = accessor.count;
        let contentStride: number = glTFUtils.getAccessorComponentsNum(accessor.type);
        let byteOffset: number = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
        let byteLength: number = count * contentStride;

        const constructor = glTFUtils._getTypedArrayConstructor(accessor.componentType);
        return new constructor(buffer, byteOffset, byteLength);
    }

    /**
     * @internal
     * 初始化 texture 对象 数组
     * @param images 
     */
    static _initTextureData(images?: glTF.glTFImage[]): void {
        if (!images)
            return;

        images.forEach((image: glTF.glTFImage, index: number) => {
            glTFUtils._glTFTextures[index] = Loader.getRes(image.uri);
        });
    }

    /**
     * 判断 Texture 是否需要 mipmap
     * @param glTFImage 
     * @param glTFSampler 
     */
    static getTextureMipmap(glTFSampler: glTF.glTFSampler): boolean {
        if (glTFSampler)
            return glTFSampler.minFilter === glTF.glTFTextureMinFilter.LINEAR ||
                glTFSampler.minFilter === glTF.glTFTextureMinFilter.NEAREST;
        else
            return true;
    }

    /**
     * 获取 Texture format
     * @param glTFImage 
     */
    static getTextureFormat(glTFImage: glTF.glTFImage): number {
        if (glTFImage.mimeType === glTF.glTFImageMimeType.PNG) {
            return 1;   // R8G8B8A8
        }
        else {
            return 0;   // R8G8B8
        }
    }

    /**
     * 获取 Texture filter mode
     * @param glTFSampler 
     */
    static getTextureFilterMode(glTFSampler: glTF.glTFSampler): number {

        if (!glTFSampler) {
            return 1;
        }

        if (glTFSampler.magFilter === glTF.glTFTextureMagFilter.NEAREST) {
            return 0;   // FilterMode.Point
        }
        else if (glTFUtils.getTextureMipmap(glTFSampler)) {
            if (glTFSampler.minFilter === glTF.glTFTextureMinFilter.LINEAR_MIPMAP_LINEAR)
                return 2;   // FilterMode.Trilinear

            return 1;   // FilterMode.Bilinear
        }

        return 1;
    }

    /**
     * 获取 Texture warp mode
     * @param mode 
     */
    static getTextureWrapMode(mode: glTF.glTFTextureWrapMode): number {
        if (mode === glTF.glTFTextureWrapMode.CLAMP_TO_EDGE) {
            return 1;   // WarpMode.Clamp
        }
        return 0;   // WarpMode.Repeat
    }

    /**
     * 获取 Texture 初始化参数
     * @param glTFImage 
     * @param glTFSampler 
     */
    static getTextureConstructParams(glTFImage: glTF.glTFImage, glTFSampler: glTF.glTFSampler): any[] {
        let constructParams: any[] = [];
        constructParams[0] = 0; // width
        constructParams[1] = 0; // height
        constructParams[2] = glTFUtils.getTextureFormat(glTFImage); // format
        constructParams[3] = glTFUtils.getTextureMipmap(glTFSampler);  // mipmap
        constructParams[4] = true;
        return constructParams;
    }

    /**
     * 获取 Texture 属性参数
     * @param glTFImage 
     * @param glTFSampler 
     */
    static getTexturePropertyParams(glTFSampler: glTF.glTFSampler): any {
        let propertyParams: any = {};
        if (!glTFSampler) {
            return null;
        }
        propertyParams.filterMode = glTFUtils.getTextureFilterMode(glTFSampler);
        propertyParams.wrapModeU = glTFUtils.getTextureWrapMode(glTFSampler.wrapS);
        propertyParams.wrapModeV = glTFUtils.getTextureWrapMode(glTFSampler.wrapT);
        // todo aniso值 设置 默认值 ?
        propertyParams.anisoLevel = 16;
        return propertyParams;
    }

    /**
     * 根据 glTFTextureInfo 获取 Texture2D
     * @param glTFTextureInfo 
     */
    static getTexturewithInfo(glTFTextureInfo: glTF.glTFTextureInfo): Texture2D {

        // uv 非 0 
        if (glTFTextureInfo.texCoord) {
            // todo 非0 uv 
            console.warn("glTF Loader: non 0 uv channel unsupported.");
        }

        let glTFImage: glTF.glTFTexture = glTFUtils._glTF.textures[glTFTextureInfo.index];
        return glTFUtils._glTFTextures[glTFImage.source];
    }

    /**
     * @internal
     * 加载 material
     * @param glTFMaterials 
     */
    static _loadMaterials(glTFMaterials?: glTF.glTFMaterial[]): void {
        if (!glTFMaterials)
            return;
        glTFMaterials.forEach((glTFMaterial: glTF.glTFMaterial, index: number) => {
            glTFUtils._glTFMaterials[index] = glTFUtils._loadMaterial(glTFMaterial);
        });
    }

    /**
     * @internal
     * 加载 material
     * @param glTFMaterial 
     */
    static _loadMaterial(glTFMaterial: glTF.glTFMaterial): Material {
        // todo extension
        if (glTFMaterial.extras) {
            let createHandler: Handler = Handler.create(this, glTFUtils._createdefaultMaterial, null, false);
            return glTFUtils.ExecuteExtras("MATERIAL", glTFMaterial.extras, createHandler, [glTFMaterial]);
        }

        return glTFUtils._createdefaultMaterial(glTFMaterial);
    }

    /**
     * 根据 glTFMaterial 节点数据创建 default Material
     * @param glTFMaterial 
     */
    static _createdefaultMaterial(glTFMaterial: glTF.glTFMaterial): PBRStandardMaterial {
        let layaPBRMaterial: PBRStandardMaterial = new PBRStandardMaterial();

        // apply glTF Material property
        layaPBRMaterial.name = glTFMaterial.name ? glTFMaterial.name : "";

        if (glTFMaterial.pbrMetallicRoughness) {
            glTFUtils.applyPBRMetallicRoughness(glTFMaterial.pbrMetallicRoughness, layaPBRMaterial);
        }

        if (glTFMaterial.normalTexture) {
            layaPBRMaterial.normalTexture = glTFUtils.getTexturewithInfo(glTFMaterial.normalTexture);
            if (glTFMaterial.normalTexture.scale != undefined) {
                layaPBRMaterial.normalTextureScale = glTFMaterial.normalTexture.scale;
            }
        }

        if (glTFMaterial.occlusionTexture) {
            let occlusionTexture: Texture2D = glTFUtils.getTexturewithInfo(glTFMaterial.occlusionTexture);
            layaPBRMaterial.occlusionTexture = glTFTextureEditor.glTFOcclusionTrans(occlusionTexture);
            if (glTFMaterial.occlusionTexture.strength != undefined) {
                layaPBRMaterial.occlusionTextureStrength = glTFMaterial.occlusionTexture.strength;
            }
        }

        if (glTFMaterial.emissiveTexture) {
            layaPBRMaterial.emissionTexture = glTFUtils.getTexturewithInfo(glTFMaterial.emissiveTexture);
            if (layaPBRMaterial.emissionTexture) {
                layaPBRMaterial.enableEmission = true;
            }
        }

        if (glTFMaterial.emissiveFactor) {
            layaPBRMaterial.emissionColor.fromArray(glTFMaterial.emissiveFactor);
            layaPBRMaterial.emissionColor.w = 1.0;
            layaPBRMaterial.enableEmission = true;
        }

        let renderMode: glTF.glTFMaterialAlphaMode = glTFMaterial.alphaMode || glTF.glTFMaterialAlphaMode.OPAQUE;
        switch (renderMode) {
            case glTF.glTFMaterialAlphaMode.OPAQUE: {
                layaPBRMaterial.renderMode = PBRRenderMode.Opaque;
                break;
            }
            case glTF.glTFMaterialAlphaMode.BLEND: {
                layaPBRMaterial.renderMode = PBRRenderMode.Transparent;
                break;
            }
            case glTF.glTFMaterialAlphaMode.MASK: {
                layaPBRMaterial.renderMode = PBRRenderMode.Cutout;
                break;
            }
            default: {
                // todo
            }
        }

        if (glTFMaterial.alphaCutoff != undefined) {
            layaPBRMaterial.alphaTestValue = glTFMaterial.alphaCutoff;
        }

        if (glTFMaterial.doubleSided) {
            layaPBRMaterial.cull = RenderState.CULL_NONE;
        }

        return layaPBRMaterial;
    }

    /**
     * 应用 pbrMetallicRoughness 数据
     * @param pbrMetallicRoughness 
     * @param layaPBRMaterial 
     */
    static applyPBRMetallicRoughness(pbrMetallicRoughness: glTF.glTFMaterialPbrMetallicRoughness, layaPBRMaterial: PBRStandardMaterial): void {
        if (pbrMetallicRoughness.baseColorFactor) {
            layaPBRMaterial.albedoColor.fromArray(pbrMetallicRoughness.baseColorFactor);
        }

        if (pbrMetallicRoughness.baseColorTexture) {
            layaPBRMaterial.albedoTexture = glTFUtils.getTexturewithInfo(pbrMetallicRoughness.baseColorTexture);
        }

        let metallicFactor: number = layaPBRMaterial.metallic = 1.0;
        if (pbrMetallicRoughness.metallicFactor != undefined) {
            metallicFactor = layaPBRMaterial.metallic = pbrMetallicRoughness.metallicFactor;
        }

        let roughnessFactor = 1.0;
        layaPBRMaterial.smoothness = 0.0;
        if (pbrMetallicRoughness.roughnessFactor != undefined) {
            roughnessFactor = pbrMetallicRoughness.roughnessFactor;
            layaPBRMaterial.smoothness = 1.0 - pbrMetallicRoughness.roughnessFactor;
        }

        if (pbrMetallicRoughness.metallicRoughnessTexture) {
            let metallicGlossTexture: Texture2D = glTFUtils.getTexturewithInfo(pbrMetallicRoughness.metallicRoughnessTexture);
            layaPBRMaterial.metallicGlossTexture = glTFTextureEditor.glTFMetallicGlossTrans(metallicGlossTexture, metallicFactor, roughnessFactor);
        }

    }

    /**
     * 获取 gltf mesh 中 material 
     * @param glTFMesh 
     */
    static pickMeshMaterials(glTFMesh: glTF.glTFMesh): Material[] {
        let materials: Material[] = [];

        glTFMesh.primitives.forEach(primitive => {
            if (primitive.material != undefined) {
                let material: Material = glTFUtils._glTFMaterials[primitive.material];
                materials.push(material);
            }
            else {
                let material: Material = new PBRStandardMaterial();
                materials.push(material);
                glTFUtils._glTFMaterials.push(material);
                primitive.material = glTFUtils._glTFMaterials.indexOf(material);
            }
        });

        return materials;
    }

    /**
     * @internal
     * 加载场景节点
     * @param glTFScene 
     */
    static _loadScenes(glTFScenes?: glTF.glTFScene[]): void {
        if (!glTFScenes)
            return;

        glTFScenes.forEach((glTFScene, index) => {
            glTFUtils._glTFScenes[index] = glTFUtils._loadScene(glTFScene);
        });
    }

    /**
     * @internal
     * 加载场景节点
     * @param glTFScene 
     */
    static _loadScene(glTFScene: glTF.glTFScene): Sprite3D {
        // todo extension and extra

        return glTFUtils._createSceneNode(glTFScene);
    }

    /**
     * 创建 glTFScene 节点
     * @param glTFScene 
     */
    static _createSceneNode(glTFScene: glTF.glTFScene): Sprite3D {
        let glTFSceneNode: Sprite3D = new Sprite3D(glTFScene.name || "glTF_Scene_node");
        glTFScene.nodes.forEach(nodeIndex => {
            let sprite: Sprite3D = glTFUtils._glTFNodes[nodeIndex];
            glTFSceneNode.addChild(sprite);
        });

        return glTFSceneNode;
    }

    /**
     * 应用 Transform 信息
     * @param glTFNode 
     * @param sprite 
     */
    static applyTransform(glTFNode: glTF.glTFNode, sprite: Sprite3D): void {
        if (glTFNode.matrix) {
            let localMatrix: Matrix4x4 = sprite.transform.localMatrix;
            localMatrix.elements.set(glTFNode.matrix);
            sprite.transform.localMatrix = localMatrix;
        }
        else {
            let localPosition: Vector3 = sprite.transform.localPosition;
            let localRotation: Quaternion = sprite.transform.localRotation;
            let localScale: Vector3 = sprite.transform.localScale;
            glTFNode.translation && localPosition.fromArray(glTFNode.translation);
            glTFNode.rotation && localRotation.fromArray(glTFNode.rotation);
            glTFNode.scale && localScale.fromArray(glTFNode.scale);
            sprite.transform.localPosition = localPosition;
            sprite.transform.localRotation = localRotation;
            sprite.transform.localScale = localScale;
        }
    }

    /**
     * @internal
     * 构建 当前 glTF 对象 节点树
     * @param glTFNodes 
     */
    static buildHierarchy(glTFNodes: glTF.glTFNode[]): void {
        glTFNodes.forEach((glTFNode: glTF.glTFNode, index: number) => {
            let sprite: Sprite3D = glTFUtils._glTFNodes[index];
            if (glTFNode.children) {
                glTFNode.children.forEach((childIndex: number) => {
                    let child: Sprite3D = glTFUtils._glTFNodes[childIndex];
                    sprite.addChild(child);
                });
            }
        });

        glTFNodes.forEach((glTFNode: glTF.glTFNode, index: number) => {
            let sprite: Sprite3D = glTFUtils._glTFNodes[index];
            if (sprite instanceof SkinnedMeshSprite3D) {
                glTFUtils.fixSkinnedSprite(glTFNode, sprite);
            }
        });
    }

    /**
     * @internal
     * 加载 glTF 节点
     * @param glTFNodes 
     */
    static _loadNodes(glTFNodes?: glTF.glTFNode[]): void {

        if (!glTFNodes) {
            return;
        }

        glTFNodes.forEach((glTFNode: glTF.glTFNode, index: number) => {
            glTFNode.name = glTFNode.name || glTFUtils.getNodeRandomName("node");
        });
        glTFNodes.forEach((glTFNode: glTF.glTFNode, index: number) => {
            glTFUtils._glTFNodes[index] = glTFUtils._loadNode(glTFNode);
        });
    }

    /**
     * @internal
     * 加载 glTF 节点
     * @param glTFNode 
     */
    static _loadNode(glTFNode: glTF.glTFNode): Sprite3D {
        // todo extension and extra

        return glTFUtils._createSprite3D(glTFNode);
    }

    /**
     * 创建 节点对象
     * @param glTFNode 
     */
    static _createSprite3D(glTFNode: glTF.glTFNode): Sprite3D {
        glTFNode.name = glTFNode.name;
        if (glTFNode.skin != undefined) {
            let sprite: SkinnedMeshSprite3D = glTFUtils._createSkinnedMeshSprite3D(glTFNode);
            glTFUtils.applyTransform(glTFNode, sprite);
            return sprite;
        }
        else if (glTFNode.mesh != undefined) {
            let sprite: Sprite3D = glTFUtils._createMeshSprite3D(glTFNode);
            glTFUtils.applyTransform(glTFNode, sprite);
            return sprite;
        }
        else {
            let sprite: Sprite3D = new Sprite3D(glTFNode.name);
            glTFUtils.applyTransform(glTFNode, sprite);
            return sprite;
        }
    }

    /**
     * 创建 MeshSprite3D 对象
     * @param glTFNode 
     */
    static _createMeshSprite3D(glTFNode: glTF.glTFNode): MeshSprite3D {
        let glTFMesh: glTF.glTFMesh = glTFUtils._glTF.meshes[glTFNode.mesh];
        let mesh: Mesh = glTFUtils._loadMesh(glTFMesh);
        let materials: Material[] = glTFUtils.pickMeshMaterials(glTFMesh);
        let sprite: MeshSprite3D = new MeshSprite3D(mesh, glTFNode.name);
        sprite.meshRenderer.sharedMaterials = materials;
        return sprite;
    }

    /**
     * 创建 MeshSprite3D 对象
     * @param glTFNode 
     */
    static _createSkinnedMeshSprite3D(glTFNode: glTF.glTFNode): SkinnedMeshSprite3D {
        let glTFMesh: glTF.glTFMesh = glTFUtils._glTF.meshes[glTFNode.mesh];
        let glTFSkin: glTF.glTFSkin = glTFUtils._glTF.skins[glTFNode.skin];
        let mesh: Mesh = glTFUtils._loadMesh(glTFMesh, glTFSkin);
        let materials: Material[] = glTFUtils.pickMeshMaterials(glTFMesh);
        let sprite: SkinnedMeshSprite3D = new SkinnedMeshSprite3D(mesh, glTFNode.name);
        sprite.skinnedMeshRenderer.sharedMaterials = materials;
        return sprite;
    }

    /**
     * @internal
     * 获取 attribute buffer 数据
     * @param attributeAccessorIndex 
     * @param layaDeclarStr 
     * @param attributes 
     * @param vertexDeclarArr 
     * @param func 
     */
    static getArrributeBuffer(attributeAccessorIndex: number, layaDeclarStr: string, attributeMap: Map<string, Float32Array>, vertexDeclarArr: string[]): Float32Array {
        let attributeBuffer: Float32Array = <Float32Array>glTFUtils.getBufferwithAccessorIndex(attributeAccessorIndex);
        if (!attributeBuffer)
            return null;
        vertexDeclarArr.push(layaDeclarStr);
        let res: Float32Array = attributeBuffer;
        attributeMap.set(layaDeclarStr, res);
        return res;
    }

    /**
     * @internal
     * 获取 glTFMeshPrimitive index buffer
     * @param attributeAccessorIndex 
     * @param vertexCount 
     */
    static getIndexBuffer(attributeAccessorIndex: number, vertexCount: number): Uint32Array {
        let indexBuffer: Uint32Array = <Uint32Array>glTFUtils.getBufferwithAccessorIndex(attributeAccessorIndex);
        if (indexBuffer) {
            return new Uint32Array(indexBuffer).reverse();
            // return indexBuffer;
        }
        else {
            let indices: Uint32Array = new Uint32Array(vertexCount);
            for (let i = 0; i < vertexCount; i++) {
                indices[i] = i;
            }
            return indices;
        }
    }

    /**
     * @internal
     * 解析 subData 记录数据
     * @param subDatas 
     * @param layaMesh 
     */
    static parseMeshwithSubMeshData(subDatas: PrimitiveSubMesh[], layaMesh: Mesh): void {
        let vertexCount: number = 0;
        let indexCount: number = 0;
        let vertexDecler: string = undefined;
        subDatas.forEach(subData => {
            vertexCount += subData.vertexCount;
            indexCount += subData.indices.length;

            vertexDecler = vertexDecler || subData.vertexDecler;
        });

        let vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration(vertexDecler, false);
        let vertexByteStride: number = vertexDeclaration.vertexStride;
        let vertexFloatStride: number = vertexByteStride / 4;

        let vertexArray: Float32Array = new Float32Array(vertexFloatStride * vertexCount);
        let indexArray: Uint16Array | Uint32Array;
        let ibFormat: IndexFormat = IndexFormat.UInt32;
        if (vertexCount < 65536) {
            indexArray = new Uint16Array(indexCount);
            ibFormat = IndexFormat.UInt16;
        }
        else {
            indexArray = new Uint32Array(indexCount);
        }

        glTFUtils.fillMeshBuffers(subDatas, vertexArray, indexArray, vertexFloatStride);
        glTFUtils.generatMesh(vertexArray, indexArray, vertexDeclaration, ibFormat, subDatas, layaMesh);

    }

    /**
     * @internal
     * 填充 mesh buffer 数据
     * @param subDatas 
     * @param vertexArray 
     * @param indexArray 
     * @param vertexFloatStride 
     */
    static fillMeshBuffers(subDatas: PrimitiveSubMesh[], vertexArray: Float32Array, indexArray: Uint16Array | Uint32Array, vertexFloatStride: number) {
        let ibPosOffset: number = 0;
        let ibVertexOffset: number = 0;
        let vbPosOffset: number = 0;
        subDatas.forEach((subData) => {

            let iAOffset: number = ibPosOffset;

            let vertexCount: number = subData.vertexCount;

            let subIb: Uint32Array = subData.indices;
            for (let index = 0; index < subIb.length; index++) {
                indexArray[iAOffset + index] = subIb[index] + ibVertexOffset;
            }
            ibPosOffset += subIb.length;
            ibVertexOffset += vertexCount;

            const fillAttributeBuffer = (value: Float32Array, attriOffset: number, attriFloatCount: number = 0) => {
                let startOffset: number = vbPosOffset + attriOffset;
                for (let index = 0; index < vertexCount; index++) {
                    for (let ac = 0; ac < attriFloatCount; ac++) {
                        vertexArray[startOffset + index * vertexFloatStride + ac] = value[index * attriFloatCount + ac];
                    }
                }
            };

            let attriOffset: number = 0;
            let attributeMap: Map<string, Float32Array> = subData.attributeMap;
            let position: Float32Array = attributeMap.get("POSITION");
            (position) && (fillAttributeBuffer(position, attriOffset, 3), attriOffset += 3);
            let normal: Float32Array = attributeMap.get("NORMAL");
            (normal) && (fillAttributeBuffer(normal, attriOffset, 3), attriOffset += 3);
            let color: Float32Array = attributeMap.get("COLOR");
            (color) && (fillAttributeBuffer(color, attriOffset, 4), attriOffset += 4);
            let uv: Float32Array = attributeMap.get("UV");
            (uv) && (fillAttributeBuffer(uv, attriOffset, 2), attriOffset += 2);
            let uv1: Float32Array = attributeMap.get("UV1");
            (uv1) && (fillAttributeBuffer(uv1, attriOffset, 2), attriOffset += 2);
            let blendWeight: Float32Array = attributeMap.get("BLENDWEIGHT");
            (blendWeight) && (fillAttributeBuffer(blendWeight, attriOffset, 4), attriOffset += 4);
            let blendIndices: Float32Array = attributeMap.get("BLENDINDICES");
            if (blendIndices) {
                let blendIndicesUint8: Uint8Array = new Uint8Array(blendIndices);
                let blendIndicesFloat32: Float32Array = new Float32Array(blendIndicesUint8.buffer);
                fillAttributeBuffer(blendIndicesFloat32, attriOffset, 1), attriOffset += 1;
            }
            let tangent: Float32Array = attributeMap.get("TANGENT");
            (tangent) && (fillAttributeBuffer(tangent, attriOffset, 4), attriOffset += 4);

            vbPosOffset += vertexCount * vertexFloatStride;
        });
    }

    /**
     * @internal
     * 根据 单次提交最大骨骼数量 划分 submesh 提交队列
     * @param attributeMap 
     * @param indexArray 
     * @param boneIndicesList 
     * @param subIndexStartArray 
     * @param subIndexCountArray 
     */
    static splitSubMeshByBonesCount(attributeMap: Map<string, Float32Array>, indexArray: Uint32Array, boneIndicesList: Array<Uint16Array>, subIndexStartArray: number[], subIndexCountArray: number[]): void {
        //  每次 提交 最大骨骼数量
        let maxSubBoneCount: number = glTFUtils.maxSubBoneCount;

        let start: number = 0;
        let subIndexSet: Set<number> = new Set();
        let boneIndexArray: Float32Array = attributeMap.get("BLENDINDICES");

        let vertexCount: number = boneIndexArray.length / 4;

        let resArray: Float32Array = new Float32Array(boneIndexArray.length);

        let flagArray: Array<boolean> = new Array(vertexCount).fill(false);

        // 遍历 ib
        for (let i: number = 0, n: number = indexArray.length; i < n; i += 3) {
            // 每三个顶点 一个三角形 一起判断
            // 三个顶点 ，12 个 bone index
            let triangleSet: Set<number> = new Set();
            for (let j: number = i; j < i + 3; j++) {
                let ibIndex: number = indexArray[j];
                let boneIndexOffset: number = ibIndex * 4;
                for (let k: number = 0; k < 4; k++) {
                    triangleSet.add(boneIndexArray[boneIndexOffset + k]);
                }
            }
            // 判断当前
            let tempSet: Set<number> = new Set([...subIndexSet, ...triangleSet]);
            if (tempSet.size > maxSubBoneCount) {
                // 当前批次不能加 添加 下一三角形
                // 保存当前数据
                let count: number = i - start;
                subIndexStartArray.push(start);
                subIndexCountArray.push(count);

                let curBoneList: number[] = Array.from(subIndexSet);
                boneIndicesList.push(new Uint16Array(curBoneList));
                // 更新 起始位置
                start = i;
                // 新建数据集， 添加未能添加到上一个节点的数据
                subIndexSet = new Set(triangleSet);
            }
            else {
                // 添加数据 到当前数据集
                subIndexSet = tempSet;
            }
            // 结尾 添加剩余数据
            if (i == n - 3) {
                let count: number = i - start + 3;
                subIndexStartArray.push(start);
                subIndexCountArray.push(count);
                start = i;
                let curBoneList: number[] = Array.from(subIndexSet);
                boneIndicesList.push(new Uint16Array(curBoneList));
            }
        }

        //根据分离出的范围 更改 biarray
        let drawCount: number = boneIndicesList.length;
        let newAttributeMap: Map<string, Array<number>> = new Map();
        attributeMap.forEach((value, key) => {
            let array: Array<number> = new Array();
            newAttributeMap.set(key, array);
        });
        let curMaxIndex: number = vertexCount - 1;
        for (let d: number = 0; d < drawCount; d++) {
            let k: number = subIndexStartArray[d];
            let l: number = subIndexCountArray[d];
            let bl: Uint16Array = boneIndicesList[d];

            let batchFlag: Array<boolean> = new Array(vertexCount).fill(false);
            let batchMap: Map<number, number> = new Map();
            for (let area: number = 0; area < l; area++) {
                let ci: number = indexArray[area + k];
                let biStart: number = 4 * ci;
                for (let cbi: number = biStart; cbi < biStart + 4; cbi++) {
                    let oldBoneIndex: number = boneIndexArray[cbi];
                    let newBoneIndex: number = bl.indexOf(oldBoneIndex);
                    newBoneIndex = newBoneIndex == -1 ? 0 : newBoneIndex;
                    // 其他batch 出现， 此batch 未出现 新增点数据
                    if (flagArray[ci] && !batchFlag[ci]) {
                        newAttributeMap.get("BLENDINDICES").push(newBoneIndex);
                    }
                    // 其他batch 出现， 此batch 出现, 修改过 跳过
                    else if (flagArray[ci] && batchFlag[ci]) {

                    }
                    else {
                        resArray[cbi] = newBoneIndex;
                    }
                }
                // 其他batch 未出现， 此batch 未出现 不处理
                if (!flagArray[ci] && !batchFlag[ci]) {
                    batchFlag[ci] = true;
                    batchMap.set(ci, ci);
                }
                // 其他btach 未出现， 此batch 已经出现 index 改为上次更新index
                else if (!flagArray[ci] && batchFlag[ci]) {
                    indexArray[area + k] = batchMap.get(ci);
                }
                //其他batch 出现， 此batch 未出现 新增点数据  更新index
                else if (flagArray[ci] && !batchFlag[ci]) {
                    batchFlag[ci] = true;
                    curMaxIndex++;
                    batchMap.set(ci, curMaxIndex);
                    indexArray[area + k] = curMaxIndex;
                    newAttributeMap.forEach((value: number[], key: string) => {
                        let attOffset: number = glTFUtils.getAttributeNum(key);
                        let oldArray: Float32Array = attributeMap.get(key);
                        if (key !== "BLENDINDICES") {
                            for (let index = 0; index < attOffset; index++) {
                                value.push(oldArray[index + ci * attOffset]);
                            }
                        }
                    });
                }
                //其他batch 出现， 此batch 出现
                else if (flagArray[ci] && batchFlag[ci]) {
                    indexArray[area + k] = batchMap.get(ci);
                }
            }
            // 将此batch 出现的index更新到flagarray
            batchFlag.forEach((value, index) => {
                flagArray[index] = value || flagArray[index];
            });
        }

        newAttributeMap.forEach((value: number[], key: string) => {
            let oldFloatArray: Float32Array = attributeMap.get(key);
            if (key == "BLENDINDICES") {
                oldFloatArray = resArray;
            }
            let newLength: number = oldFloatArray.length + value.length;
            let newFloatArray: Float32Array = new Float32Array(newLength);
            newFloatArray.set(oldFloatArray, 0);
            newFloatArray.set(value, oldFloatArray.length);
            attributeMap.set(key, newFloatArray);
        });
        boneIndexArray = null;
    }

    /**
     * @internal
     * 生成 mesh
     * @param vertexArray 
     * @param indexArray 
     * @param vertexDeclaration 
     * @param ibFormat 
     * @param subDatas 
     * @param layaMesh 
     */
    static generatMesh(vertexArray: Float32Array, indexArray: Uint16Array | Uint32Array, vertexDeclaration: VertexDeclaration, ibFormat: IndexFormat, subDatas: PrimitiveSubMesh[], layaMesh: Mesh): void {
        let gl: WebGLRenderingContext = LayaGL.instance;

        let vertexBuffer: VertexBuffer3D = new VertexBuffer3D(vertexArray.byteLength, gl.STATIC_DRAW, true);
        vertexBuffer.vertexDeclaration = vertexDeclaration;
        vertexBuffer.setData(vertexArray.buffer);

        let indexBuffer: IndexBuffer3D = new IndexBuffer3D(ibFormat, indexArray.length, gl.STATIC_DRAW, true);
        indexBuffer.setData(indexArray);

        layaMesh._indexFormat = ibFormat;
        layaMesh._indexBuffer = indexBuffer;
        layaMesh._vertexBuffer = vertexBuffer;
        layaMesh._setBuffer(vertexBuffer, indexBuffer);
        layaMesh._vertexCount = vertexBuffer._byteLength / vertexDeclaration.vertexStride;

        // subMesh
        let subMeshOffset: number = 0;
        let subMeshCount: number = subDatas.length;
        let subMeshes: SubMesh[] = new Array<SubMesh>(subMeshCount);
        for (let index = 0; index < subMeshCount; index++) {
            let subData: PrimitiveSubMesh = subDatas[index];

            let subMesh: SubMesh = new SubMesh(layaMesh);
            subMeshes[index] = subMesh;

            subMesh._vertexBuffer = vertexBuffer;
            subMesh._indexBuffer = indexBuffer;

            let subIndexStart: number = subMeshOffset;
            subMeshOffset += subData.indices.length;
            let subIndexCount: number = subData.indices.length;
            subMesh._setIndexRange(subIndexStart, subIndexCount, ibFormat);

            subMesh._boneIndicesList = subData.boneIndicesList;
            subMesh._subIndexBufferStart = subData.subIndexStartArray;
            subMesh._subIndexBufferCount = subData.subIndexCountArray;

            for (let subIndex = 0; subIndex < subMesh._subIndexBufferStart.length; subIndex++) {
                subMesh._subIndexBufferStart[subIndex] += subIndexStart;
            }

        }

        layaMesh._setSubMeshes(subMeshes);
        layaMesh.calculateBounds();

        // 资源面板
        // todo mesh.read = flase ? 
        let memorySize: number = vertexBuffer._byteLength + indexBuffer._byteLength;
        layaMesh._setCPUMemory(memorySize);
        layaMesh._setGPUMemory(memorySize);
    }

    /**
     * @internal
     * mesh 应用蒙皮数据
     * @param mesh 
     * @param glTFSkin 
     */
    static applyglTFSkinData(mesh: Mesh, subDatas: PrimitiveSubMesh[], glTFSkin?: glTF.glTFSkin): void {
        if (!glTFSkin)
            return;

        let joints: number[] = glTFSkin.joints;

        let inverseBindMatricesArray: Float32Array = new Float32Array(glTFUtils.getBufferwithAccessorIndex(glTFSkin.inverseBindMatrices));

        let boneCount: number = joints.length;
        let boneNames: string[] = mesh._boneNames = [];
        joints.forEach(nodeIndex => {
            let node: glTF.glTFNode = glTFUtils._glTF.nodes[nodeIndex];
            boneNames.push(node.name);
        })

        mesh._inverseBindPoses = [];
        mesh._inverseBindPosesBuffer = inverseBindMatricesArray.buffer;
        mesh._setInstanceBuffer(Mesh.MESH_INSTANCEBUFFER_TYPE_NORMAL);
        for (let index = 0; index < boneCount; index++) {
            let bindPosesArrayOffset: number = 16 * index;
            let matElement: Float32Array = inverseBindMatricesArray.slice(bindPosesArrayOffset, bindPosesArrayOffset + 16);
            mesh._inverseBindPoses[index] = new Matrix4x4(
                matElement[0], matElement[1], matElement[2], matElement[3],
                matElement[4], matElement[5], matElement[6], matElement[7],
                matElement[8], matElement[9], matElement[10], matElement[11],
                matElement[12], matElement[13], matElement[14], matElement[15],
                matElement
            );
        }

        let subCount: number = subDatas.length;
        let skinnedCache: skinnedMatrixCache[] = mesh._skinnedMatrixCaches;
        skinnedCache.length = mesh._inverseBindPoses.length;
        for (let subIndex: number = 0; subIndex < subCount; subIndex++) {
            let submesh: SubMesh = mesh.getSubMesh(subIndex);
            let drawCount: number = submesh._subIndexBufferStart.length;
            for (let drawIndex: number = 0; drawIndex < drawCount; drawIndex++) {
                let boneIndices: Uint16Array = submesh._boneIndicesList[drawIndex];
                for (let bni: number = 0; bni < boneIndices.length; bni++) {
                    let bn: number = boneIndices[bni];
                    skinnedCache[bn] || (skinnedCache[bn] = new skinnedMatrixCache(subIndex, drawIndex, bni));
                }
            }
        }

        for (let index = 0; index < skinnedCache.length; index++) {
            if (!skinnedCache[index]) {
                skinnedCache[index] = new skinnedMatrixCache(0, 0, 0);
            }
        }

    }

    /**
     * @internal
     * 加载 Mesh
     * @param mesh 
     */
    static _loadMesh(glTFMesh: glTF.glTFMesh, glTFSkin?: glTF.glTFSkin): Mesh {

        // todo extension
        if (glTFMesh.extras) {
            let createHandler: Handler = Handler.create(this, glTFUtils._createMesh, null, false);
            return glTFUtils.ExecuteExtras("MESH", glTFMesh.extras, createHandler, [glTFMesh, glTFSkin]);
        }

        let mesh: Mesh = glTFUtils._createMesh(glTFMesh, glTFSkin);
        return mesh;
    }

    /**
     * 创建 Mesh
     * @param mesh 
     */
    static _createMesh(glTFMesh: glTF.glTFMesh, glTFSkin?: glTF.glTFSkin): Mesh {
        let layaMesh: Mesh = new Mesh();

        let glTFMeshPrimitives: glTF.glTFMeshPrimitive[] = glTFMesh.primitives;
        let morphWeights: number[] = glTFMesh.weights;

        let boneCount: number = (glTFSkin) ? glTFSkin.joints.length : 0;
        let subDatas: PrimitiveSubMesh[] = [];

        glTFMeshPrimitives.forEach((glTFMeshPrimitive: glTF.glTFMeshPrimitive) => {

            let mode: glTF.glTFMeshPrimitiveMode = glTFMeshPrimitive.mode;
            if (mode == undefined)
                mode = glTF.glTFMeshPrimitiveMode.TRIANGLES;
            if (glTF.glTFMeshPrimitiveMode.TRIANGLES != mode) {
                // todo  只支持 gl.TRIANGLES 模式
                console.warn("glTF Loader: only support gl.TRIANGLES.");
                debugger;
            }

            let vertexDeclarArr: string[] = [];
            let attributeMap: Map<string, Float32Array> = new Map();
            let attributes: { [name: string]: number } = glTFMeshPrimitive.attributes;

            let position: Float32Array = glTFUtils.getArrributeBuffer(attributes.POSITION, "POSITION", attributeMap, vertexDeclarArr);
            let normal: Float32Array = glTFUtils.getArrributeBuffer(attributes.NORMAL, "NORMAL", attributeMap, vertexDeclarArr);
            let color: Float32Array = glTFUtils.getArrributeBuffer(attributes.COLOR_0, "COLOR", attributeMap, vertexDeclarArr);
            let uv: Float32Array = glTFUtils.getArrributeBuffer(attributes.TEXCOORD_0, "UV", attributeMap, vertexDeclarArr);
            let uv1: Float32Array = glTFUtils.getArrributeBuffer(attributes.TEXCOORD_1, "UV1", attributeMap, vertexDeclarArr);
            let blendWeight: Float32Array = glTFUtils.getArrributeBuffer(attributes.WEIGHTS_0, "BLENDWEIGHT", attributeMap, vertexDeclarArr);
            let blendIndices: Float32Array = glTFUtils.getArrributeBuffer(attributes.JOINTS_0, "BLENDINDICES", attributeMap, vertexDeclarArr);
            let tangent: Float32Array = glTFUtils.getArrributeBuffer(attributes.TANGENT, "TANGENT", attributeMap, vertexDeclarArr);

            // todo  vertex color
            // if (color) {
            //     let material = glTFUtils._glTFMaterials[glTFMeshPrimitive.material];
            //     material.enableVertexColor = true;
            // }

            let targets: { [name: string]: number }[] = glTFMeshPrimitive.targets;
            (targets) && targets.forEach((target, index) => {
                let weight: number = morphWeights[index];
                let morphPosition: Float32Array = <Float32Array>glTFUtils.getBufferwithAccessorIndex(target.POSITION);
                let morphNormal: Float32Array = <Float32Array>glTFUtils.getBufferwithAccessorIndex(target.NORMAL);
                let morphTangent: Float32Array = <Float32Array>glTFUtils.getBufferwithAccessorIndex(target.TANGENT);

                (morphPosition) && morphPosition.forEach((value, index) => {
                    position[index] += value * weight;
                });
                (morphNormal) && morphNormal.forEach((value, index) => {
                    normal[index] += value * weight;
                });
                (morphTangent) && morphTangent.forEach((value, index) => {
                    tangent[index] += value * weight;
                });
            });

            let vertexCount: number = position.length / 3;

            let indexArray: Uint32Array = glTFUtils.getIndexBuffer(glTFMeshPrimitive.indices, vertexCount);
            let boneIndicesList: Array<Uint16Array> = new Array<Uint16Array>();
            let subIndexStartArray: number[] = [];
            let subIndexCountArray: number[] = [];

            if (glTFSkin) {
                if (boneCount > glTFUtils.maxSubBoneCount) {
                    // todo 划分 subMesh
                    glTFUtils.splitSubMeshByBonesCount(attributeMap, indexArray, boneIndicesList, subIndexStartArray, subIndexCountArray);
                    vertexCount = attributeMap.get("POSITION").length / 3;
                }
                else {
                    subIndexStartArray[0] = 0;
                    subIndexCountArray[0] = indexArray.length;
                    boneIndicesList[0] = new Uint16Array(boneCount);
                    for (let bi = 0; bi < boneCount; bi++) {
                        boneIndicesList[0][bi] = bi;
                    }
                }
            }
            else {
                subIndexStartArray[0] = 0;
                subIndexCountArray[0] = indexArray.length;
            }
            let vertexDeclaration: string = vertexDeclarArr.toString();

            let subData: PrimitiveSubMesh = new PrimitiveSubMesh();
            subDatas.push(subData);

            subData.attributeMap = attributeMap;
            subData.indices = indexArray;
            subData.vertexCount = vertexCount;
            subData.vertexDecler = vertexDeclaration;
            subData.boneIndicesList = boneIndicesList;
            subData.subIndexStartArray = subIndexStartArray;
            subData.subIndexCountArray = subIndexCountArray;
        });

        glTFUtils.parseMeshwithSubMeshData(subDatas, layaMesh);
        glTFUtils.applyglTFSkinData(layaMesh, subDatas, glTFSkin);

        return layaMesh;
    }

    /**
     * 计算 SkinnedMeshSprite3D local bounds
     * @param skinned 
     */
    static calSkinnedSpriteLocalBounds(skinned: SkinnedMeshSprite3D): void {
        let render: SkinnedMeshRenderer = skinned.skinnedMeshRenderer;
        let mesh: Mesh = skinned.meshFilter.sharedMesh;
        let rootBone: Sprite3D = render.rootBone;

        let oriRootMatrix: Matrix4x4 = rootBone.transform.worldMatrix;
        let invertRootMatrix: Matrix4x4 = new Matrix4x4();
        oriRootMatrix.invert(invertRootMatrix);

        let indices = mesh.getIndices();

        let positions: Vector3[] = [];
        let boneIndices: Vector4[] = [];
        let boneWeights: Vector4[] = [];
        mesh.getPositions(positions);
        mesh.getBoneIndices(boneIndices);
        mesh.getBoneWeights(boneWeights);

        let oriBoneIndeices: Vector4[] = [];
        mesh._subMeshes.forEach((subMesh: SubMesh, index: number) => {
            let bonelists: Uint16Array[] = subMesh._boneIndicesList;
            bonelists.forEach((bonelist: Uint16Array, listIndex: number) => {
                let start: number = subMesh._subIndexBufferStart[listIndex];
                let count: number = subMesh._subIndexBufferCount[listIndex];
                let endIndex: number = count + start;
                for (let iindex = start; iindex < endIndex; iindex++) {
                    let ii: number = indices[iindex];
                    let boneIndex: Vector4 = boneIndices[ii];
                    let x: number = bonelist[boneIndex.x];
                    let y: number = bonelist[boneIndex.y];
                    let z: number = bonelist[boneIndex.z];
                    let w: number = bonelist[boneIndex.w];
                    oriBoneIndeices[ii] = new Vector4(x, y, z, w);
                }
            });
        });

        let inverseBindPoses: Matrix4x4[] = mesh._inverseBindPoses;
        let bones: Sprite3D[] = render.bones;
        let ubones: Matrix4x4[] = [];
        let tempMat: Matrix4x4 = new Matrix4x4();
        bones.forEach((bone, index) => {
            ubones[index] = new Matrix4x4();
            Matrix4x4.multiply(invertRootMatrix, bone.transform.worldMatrix, tempMat);
            Matrix4x4.multiply(tempMat, inverseBindPoses[index], ubones[index]);
        });

        let skinTransform: Matrix4x4 = new Matrix4x4;
        let resPos: Vector3 = new Vector3();
        let min: Vector3 = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        let max: Vector3 = new Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

        positions.forEach((pos: Vector3, index: number) => {
            let boneIndex: Vector4 = oriBoneIndeices[index];
            let boneWeight: Vector4 = boneWeights[index];

            for (let ei = 0; ei < 16; ei++) {
                skinTransform.elements[ei] = ubones[boneIndex.x].elements[ei] * boneWeight.x;
                skinTransform.elements[ei] += ubones[boneIndex.y].elements[ei] * boneWeight.y;
                skinTransform.elements[ei] += ubones[boneIndex.z].elements[ei] * boneWeight.z;
                skinTransform.elements[ei] += ubones[boneIndex.w].elements[ei] * boneWeight.w;
            }
            Vector3.transformV3ToV3(pos, skinTransform, resPos);
            Vector3.min(min, resPos, min);
            Vector3.max(max, resPos, max);
        });

        positions = null;
        boneIndices = boneWeights = oriBoneIndeices = null;
        indices = null;
        ubones = null;

        render.localBounds.setMin(min);
        render.localBounds.setMax(max);

    }

    /**
     * @internal
     * 补全 skinnedMeshSprite 所需数据
     * @param glTFNode 
     * @param skinned 
     */
    static fixSkinnedSprite(glTFNode: glTF.glTFNode, skinned: SkinnedMeshSprite3D): void {

        let skin: glTF.glTFSkin = glTFUtils._glTF.skins[glTFNode.skin];
        let skinnedMeshRenderer: SkinnedMeshRenderer = skinned.skinnedMeshRenderer;
        skin.joints.forEach(nodeIndex => {
            let bone: Sprite3D = glTFUtils._glTFNodes[nodeIndex];
            skinnedMeshRenderer.bones.push(bone);
        });
        if (skin.skeleton == undefined) {
            skin.skeleton = skin.joints[0];
        }
        skinnedMeshRenderer.rootBone = glTFUtils._glTFNodes[skin.skeleton];

        glTFUtils.calSkinnedSpriteLocalBounds(skinned);

    }

    /**
     * @interna
     * 获取 Animator 根节点
     */
    static getAnimationRoot(channels: glTF.glTFAnimationChannel[]): Sprite3D {

        const isContainNode = (nodeArr: number[], findNodeIndex: number): boolean => {
            if (!nodeArr)
                return false;
            if (nodeArr.indexOf(findNodeIndex) == -1) {
                for (let index = 0; index < nodeArr.length; index++) {
                    let glTFNode: glTF.glTFNode = glTFUtils._glTF.nodes[nodeArr[index]];
                    if (isContainNode(glTFNode.children, findNodeIndex)) {
                        return true;
                    }
                }
            }
            return true;
        }

        let target: glTF.glTFAnimationChannelTarget = channels[0].target;
        let spriteIndex: number = target.node;
        for (let index = 0; index < glTFUtils._glTF.scenes.length; index++) {
            let glTFScene: glTF.glTFScene = glTFUtils._glTF.scenes[index];
            if (isContainNode(glTFScene.nodes, spriteIndex)) {
                return glTFUtils._glTFScenes[index];
            }
        }
        return null;
    }

    /**
     * @internal
     * 获取 动画路径信息
     * @param root 
     * @param curSprite 
     */
    static getAnimationPath(root: Sprite3D, curSprite: Sprite3D): string[] {
        let paths: string[] = [];
        if (root == curSprite)
            return paths;

        let sprite: Sprite3D = curSprite;
        while (sprite.parent != root) {
            sprite = <Sprite3D>sprite.parent;
            paths.push(sprite.name);
        }
        paths = paths.reverse();
        paths.push(curSprite.name);
        return paths;
    }

    /**
     * @internal
     * 加载 Animation
     * @param animations 
     */
    static _loadAnimations(animations?: glTF.glTFAnimation[]): void {
        if (!animations)
            return;

        animations.forEach((animation: glTF.glTFAnimation, index: number) => {
            // todo 
            glTFUtils._loadAnimation(animation);
        });
    }

    /**
     * @internal
     * 加载 Animation
     * @param animation 
     */
    static _loadAnimation(animation: glTF.glTFAnimation): Animator {
        // todo extension and extra

        return glTFUtils._createAnimator(animation);
    }

    /**
     * @internal
     * 创建 Animator 组件
     * @param animation 
     */
    static _createAnimator(animation: glTF.glTFAnimation): Animator {

        let animator: Animator = new Animator();

        let channels: glTF.glTFAnimationChannel[] = animation.channels;
        let samplers: glTF.glTFAnimationSampler[] = animation.samplers;

        let animatorRoot: Sprite3D = glTFUtils.getAnimationRoot(channels);

        if (!animatorRoot) {
            return animator;
        }

        animatorRoot.addComponentIntance(animator);

        let duration: number = 0;

        let clipNodes: ClipNode[] = new Array<ClipNode>(channels.length);
        channels.forEach((channel: glTF.glTFAnimationChannel, index: number) => {
            let target: glTF.glTFAnimationChannelTarget = channel.target;
            let sampler: glTF.glTFAnimationSampler = samplers[channel.sampler];

            let clipNode: ClipNode = clipNodes[index] = new ClipNode();

            let sprite: Sprite3D = glTFUtils._glTFNodes[target.node];

            let timeBuffer = glTFUtils.getBufferwithAccessorIndex(sampler.input);
            let outBuffer = glTFUtils.getBufferwithAccessorIndex(sampler.output);
            clipNode.timeArray = new Float32Array(timeBuffer);
            clipNode.valueArray = new Float32Array(outBuffer);
            // todo sampler.interpolation

            clipNode.paths = glTFUtils.getAnimationPath(animatorRoot, sprite);
            clipNode.propertyOwner = "transform";
            clipNode.propertyLength = 1;
            clipNode.propertise = [];

            let targetPath: glTF.glTFAnimationChannelTargetPath = target.path;
            switch (targetPath) {
                case glTF.glTFAnimationChannelTargetPath.TRANSLATION:
                    clipNode.propertise.push("localPosition");
                    clipNode.type = 1;
                    break;
                case glTF.glTFAnimationChannelTargetPath.ROTATION:
                    clipNode.propertise.push("localRotation");
                    clipNode.type = 2;
                    break;
                case glTF.glTFAnimationChannelTargetPath.SCALE:
                    clipNode.propertise.push("localScale");
                    clipNode.type = 3;
                    break;
                default:
                    break;
            }

            clipNode.duration = clipNode.timeArray[clipNode.timeArray.length - 1];
            duration = Math.max(duration, clipNode.duration);
        });

        let layerName: string = animation.name ? animation.name : "Aniamtor";
        let animatorLayer: AnimatorControllerLayer = new AnimatorControllerLayer(layerName);

        let clip: AnimationClip = new AnimationClip();
        clip.name = "clip name";
        clip._duration = duration;
        clip.islooping = true;
        clip._frameRate = 30;
        let nodeCount: number = clipNodes.length;
        let nodes: KeyframeNodeList = clip._nodes;
        nodes.count = nodeCount;
        let nodesMap: any = clip._nodesMap = {};
        let nodesDic: any = clip._nodesDic = {};
        for (let i: number = 0; i < nodeCount; i++) {
            let node: KeyframeNode = new KeyframeNode();

            let gLTFClipNode: ClipNode = clipNodes[i];

            nodes.setNodeByIndex(i, node);
            node._indexInList = i;
            // todo type
            let type: number = node.type = gLTFClipNode.type;
            let pathLength: number = gLTFClipNode.paths.length;
            node._setOwnerPathCount(pathLength);
            let tempPath: string[] = gLTFClipNode.paths;
            for (let j: number = 0; j < pathLength; j++) {
                node._setOwnerPathByIndex(j, tempPath[j]);
            }
            let nodePath: string = node._joinOwnerPath("/");
            let mapArray: KeyframeNode[] = nodesMap[nodePath];
            (mapArray) || (nodesMap[nodePath] = mapArray = []);
            mapArray.push(node);
            node.propertyOwner = gLTFClipNode.propertyOwner;
            let propertyLength: number = gLTFClipNode.propertyLength;
            node._setPropertyCount(propertyLength);
            for (let j: number = 0; j < propertyLength; j++) {
                node._setPropertyByIndex(j, gLTFClipNode.propertise[j]);
            }
            let fullPath: string = nodePath + "." + node.propertyOwner + "." + node._joinProperty(".");
            nodesDic[fullPath] = fullPath;
            node.fullPath = fullPath;

            let keyframeCount: number = gLTFClipNode.timeArray.length;

            // laya animation version "LAYAANIMATION:04"
            for (let j: number = 0; j < keyframeCount; j++) {
                switch (type) {
                    case 0:
                        break;
                    case 1: // local position
                    case 3: // local scale
                    case 4: // local euler angler raw
                        let floatArrayKeyframe: Vector3Keyframe = new Vector3Keyframe();
                        node._setKeyframeByIndex(j, floatArrayKeyframe);
                        let startTimev3: number = floatArrayKeyframe.time = gLTFClipNode.timeArray[j];
                        let inTangent: Vector3 = floatArrayKeyframe.inTangent;
                        let outTangent: Vector3 = floatArrayKeyframe.outTangent;
                        let value: Vector3 = floatArrayKeyframe.value;
                        // todo tangent
                        inTangent.setValue(0, 0, 0);
                        outTangent.setValue(0, 0, 0);
                        value.setValue(gLTFClipNode.valueArray[3 * j], gLTFClipNode.valueArray[3 * j + 1], gLTFClipNode.valueArray[3 * j + 2]);
                        break;
                    case 2: // local rotation
                        let quaternionKeyframe: QuaternionKeyframe = new QuaternionKeyframe();
                        node._setKeyframeByIndex(j, quaternionKeyframe);
                        let startTimeQu: number = quaternionKeyframe.time = gLTFClipNode.timeArray[j];
                        let inTangentQua: Vector4 = quaternionKeyframe.inTangent;
                        let outTangentQua: Vector4 = quaternionKeyframe.outTangent;
                        let valueQua: Quaternion = quaternionKeyframe.value;
                        // todo tangent
                        inTangentQua.setValue(0, 0, 0, 0);
                        outTangentQua.setValue(0, 0, 0, 0);
                        valueQua.x = gLTFClipNode.valueArray[4 * j];
                        valueQua.y = gLTFClipNode.valueArray[4 * j + 1];
                        valueQua.z = gLTFClipNode.valueArray[4 * j + 2];
                        valueQua.w = gLTFClipNode.valueArray[4 * j + 3];
                        break;
                }
            }
        }

        let animatorState: AnimatorState = new AnimatorState();
        // todo  state name
        animatorState.name = "state name";
        animatorState.clip = clip;
        animatorLayer.addState(animatorState);
        animatorLayer.defaultState = animatorState;
        animatorLayer.playOnWake = true;

        animator.addControllerLayer(animatorLayer);
        animatorLayer.defaultWeight = 1.0;

        return animator;
    }

}

