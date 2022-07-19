import * as glTF from "./glTFInterface";
import { Material } from "../d3/core/material/Material";
import { Texture2D, TexturePropertyParams } from "../resource/Texture2D";
import { glTFBase64Tool } from "./glTFBase64Tool";
import { URL } from "../net/URL";
import { PBRStandardMaterial } from "../d3/core/material/PBRStandardMaterial";
import { PBRRenderMode } from "../d3/core/material/PBRMaterial";
import { RenderState } from "../d3/core/material/RenderState";
import { glTFTextureEditor } from "./glTFTextureEditor";
import { Mesh, skinnedMatrixCache } from "../d3/resource/models/Mesh";
import { AnimationClip } from "../d3/animation/AnimationClip";
import { KeyframeNode } from "../d3/animation/KeyframeNode";
import { KeyframeNodeList } from "../d3/animation/KeyframeNodeList";
import { Animator } from "../d3/component/Animator";
import { AnimatorControllerLayer } from "../d3/component/AnimatorControllerLayer";
import { AnimatorState } from "../d3/component/AnimatorState";
import { MeshSprite3D } from "../d3/core/MeshSprite3D";
import { QuaternionKeyframe } from "../d3/core/QuaternionKeyframe";
import { SkinnedMeshRenderer } from "../d3/core/SkinnedMeshRenderer";
import { SkinnedMeshSprite3D } from "../d3/core/SkinnedMeshSprite3D";
import { Sprite3D } from "../d3/core/Sprite3D";
import { Vector3Keyframe } from "../d3/core/Vector3Keyframe";
import { IndexBuffer3D } from "../d3/graphics/IndexBuffer3D";
import { IndexFormat } from "../d3/graphics/IndexFormat";
import { VertexMesh } from "../d3/graphics/Vertex/VertexMesh";
import { VertexBuffer3D } from "../d3/graphics/VertexBuffer3D";
import { Matrix4x4 } from "../d3/math/Matrix4x4";
import { Quaternion } from "../d3/math/Quaternion";
import { Vector3 } from "../d3/math/Vector3";
import { Vector4 } from "../d3/math/Vector4";
import { SubMesh } from "../d3/resource/models/SubMesh";
import { LayaGL } from "../layagl/LayaGL";
import { Handler } from "../utils/Handler";
import { IBatchProgress } from "../net/BatchProgress";
import { ILaya } from "../../ILaya";
import { Loader } from "../net/Loader";
import { Node } from "../display/Node";
import { HierarchyResource } from "../resource/HierarchyResource";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { BufferUsage } from "../RenderEngine/RenderEnum/BufferTargetType";

const maxSubBoneCount = 24;

export class glTFResource extends HierarchyResource {
    private _glTF: glTF.glTF;
    private _buffers: Record<string, ArrayBuffer>;
    private _textures: Texture2D[];
    private _materials: Material[];
    private _meshes: Record<string, Mesh>;

    private _scenes: Array<Sprite3D>;
    private _nodes: Array<Sprite3D>;

    /** @internal */
    private _nameID: number;

    /**
     * 保存 extra 处理函数对象
     */
    private _extras: { [name: string]: { [name: string]: Handler } } = {};// todo change context from string to enum ?

    static _parse(glTF: glTF.glTF, createURL: string, progress?: IBatchProgress): Promise<glTFResource> {
        let res = new glTFResource();
        res._setCreateURL(createURL);
        return res._parse(glTF, progress).then(() => res);
    }

    constructor() {
        super();

        this._buffers = {};
        this._textures = [];
        this._materials = [];
        this._meshes = {};
        this._scenes = [];
        this._nodes = [];
    }

    private _parse(glTF: glTF.glTF, progress?: IBatchProgress): Promise<void> {
        this._glTF = glTF;
        let basePath = URL.getPath(this.url);
        let promise: Promise<any>;

        if (glTF.buffers) {
            let promises: Array<Promise<any>> = [];
            let i = 0;
            for (let buffer of glTF.buffers) {
                if (glTFBase64Tool.isBase64String(buffer.uri)) {
                    let bin = glTFBase64Tool.decode(buffer.uri.replace(glTFBase64Tool.reghead, ""));
                    this._buffers[i] = bin;
                }
                else {
                    let j = i;
                    promises.push(ILaya.loader.fetch(URL.join(basePath, buffer.uri), "arraybuffer", progress?.createCallback(0.2))
                        .then(bin => {
                            this._buffers[j] = bin;
                        }));
                }
                i++;
            }
            promise = Promise.all(promises);
        }
        else
            promise = Promise.resolve();

        promise = promise.then(() => {
            //load images
            if (glTF.images) {
                for (let glTFImg of glTF.images) {
                    if (glTFImg.bufferView != undefined || glTFImg.bufferView != null) {
                        let bufferView: glTF.glTFBufferView = glTF.bufferViews[glTFImg.bufferView];
                        let buffer: ArrayBuffer = this._buffers[bufferView.buffer];
                        let byteOffset: number = (bufferView.byteOffset || 0);
                        let byteLength: number = bufferView.byteLength;
                        let arraybuffer: ArrayBuffer = buffer.slice(byteOffset, byteOffset + byteLength);
                        let base64: string = glTFBase64Tool.encode(arraybuffer);
                        let base64url: string = `data:${glTFImg.mimeType};base64,${base64}`;

                        glTFImg.uri = base64url;
                    }
                }
            }

            //load textuers
            if (glTF.textures) {
                let promises: Array<Promise<Texture2D>> = [];
                for (let tex of glTF.textures) {
                    let imgSource = tex.source;
                    let glTFImg = glTF.images[imgSource];
                    let samplerSource = tex.sampler;
                    let glTFSampler = glTF.samplers ? glTF.samplers[samplerSource] : undefined;
                    let constructParams = this.getTextureConstructParams(glTFImg, glTFSampler);
                    let propertyParams = this.getTexturePropertyParams(glTFSampler);
                    if (glTFBase64Tool.isBase64String(glTFImg.uri)) {
                        //base64编码的图片不需要缓存
                        promises.push(ILaya.loader.load({
                            url: URL.join(basePath, glTFImg.uri),
                            constructParams: constructParams,
                            propertyParams: propertyParams,
                            cache: false
                        }, Loader.TEXTURE2D, progress?.createCallback()));
                    }
                    else {
                        promises.push(ILaya.loader.load({
                            url: URL.join(basePath, glTFImg.uri),
                            constructParams: constructParams,
                            propertyParams: propertyParams
                        }, Loader.TEXTURE2D, progress?.createCallback()));
                    }
                }

                return Promise.all(promises).then(textures => {
                    this._textures.push(...textures);
                });
            }
            else
                return Promise.resolve();
        });

        return promise.then(() => {
            //create materials
            if (glTF.materials) {
                let index = 0;
                for (let glTFMaterial of glTF.materials) {
                    let mat: Material;
                    // todo extension
                    if (glTFMaterial.extras) {
                        let createHandler = Handler.create(this, this.createDefaultMaterial, null, false);
                        mat = this.executeExtras("MATERIAL", glTFMaterial.extras, createHandler, [glTFMaterial]);
                    }
                    else
                        mat = this.createDefaultMaterial(glTFMaterial);
                    this._materials[index++] = mat;
                }
            }

            //create meshes
            if (glTF.meshes && glTF.nodes) {
                for (let glTFNode of glTF.nodes) {
                    if (glTFNode.mesh != null) {
                        let glTFMesh = this._glTF.meshes[glTFNode.mesh];
                        let glTFSkin = this._glTF.skins?.[glTFNode.skin];
                        let key = glTFNode.mesh + (glTFNode.skin != null ? ("_" + glTFNode.skin) : "");
                        let mesh = this._meshes[key];
                        if (mesh)
                            continue;

                        if (glTFMesh.extras) {
                            let createHandler = Handler.create(this, this.createMesh, null, false);
                            mesh = this.executeExtras("MESH", glTFMesh.extras, createHandler, [glTFMesh, glTFSkin]);
                        }
                        else
                            mesh = this.createMesh(glTFMesh, glTFSkin);
                        this._meshes[key] = mesh;
                    }
                }
            }
        });
    }

    public createNodes(multipleNodesReceiver?: Array<Node>): Node {
        let glTF = this._glTF;

        this._scenes.length = 0;
        this._nodes.length = 0;
        this._nameID = 0;

        this.loadNodes(glTF.nodes);
        this.buildHierarchy(glTF.nodes);
        this.loadScenes(glTF.scenes);
        this.loadAnimations(glTF.animations);

        let defaultSceneIndex = (glTF.scene != undefined) ? glTF.scene : 0;
        let defaultScene: Sprite3D = this._scenes[defaultSceneIndex];
        this._scenes.length = 0;
        this._nodes.length = 0;

        if (multipleNodesReceiver)
            multipleNodesReceiver.push(defaultScene);
        return defaultScene;
    }

    /**
     * 注册 extra 处理函数
     * @param context 
     * @param extraName 
     * @param handler 
     */
    public registerExtra(context: string, extraName: string, handler: Handler) {
        let extra: { [name: string]: Handler } = this._extras[context] || (this._extras[context] = {});
        extra[extraName] = handler;
    }

    /**
     * 取消注册 extra 处理函数
     * @param context 
     * @param extraName 
     * @param recoverHandler 
     */
    public unregisterExtra(context: string, extraName: string, recoverHandler: boolean = true) {
        let extra: { [name: string]: Handler } = this._extras[context] || (this._extras[context] = {});
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
    private executeExtras(context: string, glTFExtra: glTF.glTFNodeProperty, createHandler: Handler, params?: any): any {
        let contextExtra: any = this._extras[context];
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
    private getNodeRandomName(context: string): string {
        return `${context}_${this._nameID++}`;
    }

    /**
     * 根据数据类型获取分量
     * @param type 
     */
    private getAccessorComponentsNum(type: glTF.glTFAccessorType): number {
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
    private getAttributeNum(attriStr: string): number {
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
    private _getTypedArrayConstructor(componentType: glTF.glTFAccessorComponentType) {
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
     * @internal
     * 获取 accessor data Type byte stride
     * @param componentType 
     */
    _getAccessorDateByteStride(componentType: glTF.glTFAccessorComponentType) {
        switch (componentType) {
            case glTF.glTFAccessorComponentType.BYTE: return 1;
            case glTF.glTFAccessorComponentType.UNSIGNED_BYTE: return 1;
            case glTF.glTFAccessorComponentType.SHORT: return 2;
            case glTF.glTFAccessorComponentType.UNSIGNED_SHORT: return 2;
            case glTF.glTFAccessorComponentType.UNSIGNED_INT: return 4;
            case glTF.glTFAccessorComponentType.FLOAT: return 4;
        }
    }
    
    /**
     * 获取 accessor buffer 数据
     * @param accessorIndex 
     */
    private getBufferwithAccessorIndex(accessorIndex: number) {
        let accessor: glTF.glTFAccessor = this._glTF.accessors[accessorIndex];
        if (!accessor)
            return null;

        let bufferView: glTF.glTFBufferView = this._glTF.bufferViews[accessor.bufferView];
        let buffer: ArrayBuffer = this._buffers[bufferView.buffer];

        let count: number = accessor.count;
        let componentCount: number = this.getAccessorComponentsNum(accessor.type);
        let accessorDataCount: number = count * componentCount;

        const constructor = this._getTypedArrayConstructor(accessor.componentType);

        if (bufferView.byteStride) {

            let vertexStride = bufferView.byteStride;
            let dataByteStride = this._getAccessorDateByteStride(accessor.componentType);
            let dataStride = vertexStride / dataByteStride;

            let elementByteOffset = accessor.byteOffset || 0;
            let elementOffset = elementByteOffset / dataByteStride;

            // let d = new ArrayBuffer(dataStride * accessorDataCount);
            let dataReader = new constructor(buffer, bufferView.byteOffset || 0, bufferView.byteLength / dataByteStride);
            let res = new constructor(accessorDataCount);
            let resIndex = 0;
            for (let index = 0; index < count; index++) {
                let componentOffset = index * dataStride;
                for (let i = 0; i < componentCount; i++) {
                    res[resIndex++] = dataReader[componentOffset + elementOffset + i];
                }
            }
            return res;
        }
        else {
            let byteOffset: number = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
            return new constructor(buffer, byteOffset, accessorDataCount);
        }
    }

    /**
     * 判断 Texture 是否需要 mipmap
     * @param glTFImage 
     * @param glTFSampler 
     */
    private getTextureMipmap(glTFSampler: glTF.glTFSampler): boolean {
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
    private getTextureFormat(glTFImage: glTF.glTFImage): number {
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
    private getTextureFilterMode(glTFSampler: glTF.glTFSampler): number {

        if (!glTFSampler) {
            return 1;
        }

        if (glTFSampler.magFilter === glTF.glTFTextureMagFilter.NEAREST) {
            return 0;   // FilterMode.Point
        }
        else if (this.getTextureMipmap(glTFSampler)) {
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
    private getTextureWrapMode(mode: glTF.glTFTextureWrapMode): number {
        if (mode === glTF.glTFTextureWrapMode.CLAMP_TO_EDGE) {
            return 1;   // WrapMode.Clamp
        }
        return 0;   // WrapMode.Repeat
    }

    /**
    * 获取 Texture 初始化参数
    * @param glTFImage 
    * @param glTFSampler 
    */
    private getTextureConstructParams(glTFImage: glTF.glTFImage, glTFSampler: glTF.glTFSampler): ConstructorParameters<typeof Texture2D> {
        let constructParams: ConstructorParameters<typeof Texture2D> = [
            0, // width
            0, // height
            this.getTextureFormat(glTFImage), // format
            this.getTextureMipmap(glTFSampler),  // mipmap
            true //can read
        ];
        return constructParams;
    }

    /**
     * 获取 Texture 属性参数
     * @param glTFImage 
     * @param glTFSampler 
     */
    private getTexturePropertyParams(glTFSampler: glTF.glTFSampler): TexturePropertyParams {
        if (!glTFSampler) {
            return null;
        }

        let propertyParams: TexturePropertyParams = {
            filterMode: this.getTextureFilterMode(glTFSampler),
            wrapModeU: this.getTextureWrapMode(glTFSampler.wrapS),
            wrapModeV: this.getTextureWrapMode(glTFSampler.wrapT),
            // todo aniso值 设置 默认值 ?
            anisoLevel: 16
        };
        return propertyParams;
    }

    /**
     * 根据 glTFTextureInfo 获取 Texture2D
     * @param glTFTextureInfo 
     */
    private getTexturewithInfo(glTFTextureInfo: glTF.glTFTextureInfo): Texture2D {

        // uv 非 0 
        if (glTFTextureInfo.texCoord) {
            // todo 非0 uv 
            console.warn("glTF Loader: non 0 uv channel unsupported.");
        }

        // let glTFImage: glTF.glTFTexture = this._glTF.textures[glTFTextureInfo.index];
        return this._textures[glTFTextureInfo.index];
    }

    /**
     * 根据 glTFMaterial 节点数据创建 default Material
     * @param glTFMaterial 
     */
    private createDefaultMaterial(glTFMaterial: glTF.glTFMaterial): PBRStandardMaterial {
        let layaPBRMaterial: PBRStandardMaterial = new PBRStandardMaterial();

        // apply glTF Material property
        layaPBRMaterial.name = glTFMaterial.name ? glTFMaterial.name : "";

        if (glTFMaterial.pbrMetallicRoughness) {
            this.applyPBRMetallicRoughness(glTFMaterial.pbrMetallicRoughness, layaPBRMaterial);
        }

        if (glTFMaterial.normalTexture) {
            layaPBRMaterial.normalTexture = this.getTexturewithInfo(glTFMaterial.normalTexture);
            if (glTFMaterial.normalTexture.scale != undefined) {
                layaPBRMaterial.normalTextureScale = glTFMaterial.normalTexture.scale;
            }
        }

        if (glTFMaterial.occlusionTexture) {
            let occlusionTexture = this.getTexturewithInfo(glTFMaterial.occlusionTexture);
            layaPBRMaterial.occlusionTexture = glTFTextureEditor.glTFOcclusionTrans(occlusionTexture);
            if (glTFMaterial.occlusionTexture.strength != undefined) {
                layaPBRMaterial.occlusionTextureStrength = glTFMaterial.occlusionTexture.strength;
            }
        }

        if (glTFMaterial.emissiveTexture) {
            layaPBRMaterial.emissionTexture = this.getTexturewithInfo(glTFMaterial.emissiveTexture);
            if (layaPBRMaterial.emissionTexture) {
                layaPBRMaterial.enableEmission = true;
            }
        }

        if (glTFMaterial.emissiveFactor) {
            layaPBRMaterial.emissionColor.fromArray(glTFMaterial.emissiveFactor);
            layaPBRMaterial.emissionColor.a = 1.0;
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
    private applyPBRMetallicRoughness(pbrMetallicRoughness: glTF.glTFMaterialPbrMetallicRoughness, layaPBRMaterial: PBRStandardMaterial): void {
        if (pbrMetallicRoughness.baseColorFactor) {
            layaPBRMaterial.albedoColor.fromArray(pbrMetallicRoughness.baseColorFactor);
        }

        if (pbrMetallicRoughness.baseColorTexture) {
            layaPBRMaterial.albedoTexture = this.getTexturewithInfo(pbrMetallicRoughness.baseColorTexture);
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
            let metallicGlossTexture: Texture2D = this.getTexturewithInfo(pbrMetallicRoughness.metallicRoughnessTexture);
            layaPBRMaterial.metallicGlossTexture = glTFTextureEditor.glTFMetallicGlossTrans(metallicGlossTexture, metallicFactor, roughnessFactor);
        }

    }

    /**
     * 获取 gltf mesh 中 material 
     * @param glTFMesh 
     */
    private pickMeshMaterials(glTFMesh: glTF.glTFMesh): Material[] {
        let materials: Material[] = [];

        glTFMesh.primitives.forEach(primitive => {
            if (primitive.material != undefined) {
                let material: Material = this._materials[primitive.material];
                materials.push(material);
            }
            else {
                let material: Material = new PBRStandardMaterial();
                materials.push(material);
                this._materials.push(material);
                primitive.material = this._materials.indexOf(material);
            }
        });

        return materials;
    }

    /**
     * @internal
     * 加载场景节点
     * @param glTFScene 
     */
    private loadScenes(glTFScenes?: glTF.glTFScene[]): void {
        if (!glTFScenes)
            return;

        glTFScenes.forEach((glTFScene, index) => {
            this._scenes[index] = this._loadScene(glTFScene);
        });
    }

    /**
     * @internal
     * 加载场景节点
     * @param glTFScene 
     */
    private _loadScene(glTFScene: glTF.glTFScene): Sprite3D {
        // todo extension and extra

        return this._createSceneNode(glTFScene);
    }

    /**
     * 创建 glTFScene 节点
     * @param glTFScene 
     */
    private _createSceneNode(glTFScene: glTF.glTFScene): Sprite3D {
        let glTFSceneNode: Sprite3D = new Sprite3D(glTFScene.name || "glTF_Scene_node");
        glTFScene.nodes.forEach(nodeIndex => {
            let sprite: Sprite3D = this._nodes[nodeIndex];
            glTFSceneNode.addChild(sprite);
        });

        return glTFSceneNode;
    }

    /**
     * 应用 Transform 信息
     * @param glTFNode 
     * @param sprite 
     */
    private applyTransform(glTFNode: glTF.glTFNode, sprite: Sprite3D): void {
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
    private buildHierarchy(glTFNodes: glTF.glTFNode[]): void {
        glTFNodes.forEach((glTFNode: glTF.glTFNode, index: number) => {
            let sprite: Sprite3D = this._nodes[index];
            if (glTFNode.children) {
                glTFNode.children.forEach((childIndex: number) => {
                    let child: Sprite3D = this._nodes[childIndex];
                    sprite.addChild(child);
                });
            }
        });

        glTFNodes.forEach((glTFNode: glTF.glTFNode, index: number) => {
            let sprite: Sprite3D = this._nodes[index];
            if (sprite instanceof SkinnedMeshSprite3D) {
                this.fixSkinnedSprite(glTFNode, sprite);
            }
        });
    }

    /**
     * @internal
     * 加载 glTF 节点
     * @param glTFNodes 
     */
    private loadNodes(glTFNodes?: glTF.glTFNode[]): void {

        if (!glTFNodes) {
            return;
        }

        glTFNodes.forEach((glTFNode: glTF.glTFNode, index: number) => {
            glTFNode.name = glTFNode.name || this.getNodeRandomName("node");
        });
        glTFNodes.forEach((glTFNode: glTF.glTFNode, index: number) => {
            this._nodes[index] = this.loadNode(glTFNode);
        });
    }

    /**
     * @internal
     * 加载 glTF 节点
     * @param glTFNode 
     */
    private loadNode(glTFNode: glTF.glTFNode): Sprite3D {
        // todo extension and extra

        return this.createSprite3D(glTFNode);
    }

    /**
     * 创建 节点对象
     * @param glTFNode 
     */
    private createSprite3D(glTFNode: glTF.glTFNode): Sprite3D {
        glTFNode.name = glTFNode.name;
        if (glTFNode.skin != null) {
            let sprite: SkinnedMeshSprite3D = this.createSkinnedMeshSprite3D(glTFNode);
            this.applyTransform(glTFNode, sprite);
            return sprite;
        }
        else if (glTFNode.mesh != null) {
            let sprite: Sprite3D = this.createMeshSprite3D(glTFNode);
            this.applyTransform(glTFNode, sprite);
            return sprite;
        }
        else {
            let sprite: Sprite3D = new Sprite3D(glTFNode.name);
            this.applyTransform(glTFNode, sprite);
            return sprite;
        }
    }

    /**
     * 创建 MeshSprite3D 对象
     * @param glTFNode 
     */
    private createMeshSprite3D(glTFNode: glTF.glTFNode): MeshSprite3D {
        let glTFMesh: glTF.glTFMesh = this._glTF.meshes[glTFNode.mesh];
        let mesh = this._meshes[glTFNode.mesh];
        let materials: Material[] = this.pickMeshMaterials(glTFMesh);
        let sprite: MeshSprite3D = new MeshSprite3D(mesh, glTFNode.name);
        sprite.meshRenderer.sharedMaterials = materials;
        return sprite;
    }

    /**
     * 创建 MeshSprite3D 对象
     * @param glTFNode 
     */
    private createSkinnedMeshSprite3D(glTFNode: glTF.glTFNode): SkinnedMeshSprite3D {
        let glTFMesh: glTF.glTFMesh = this._glTF.meshes[glTFNode.mesh];
        let mesh: Mesh = this._meshes[glTFNode.mesh + "_" + glTFNode.skin];
        let materials: Material[] = this.pickMeshMaterials(glTFMesh);
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
    private getArrributeBuffer(attributeAccessorIndex: number, layaDeclarStr: string, attributeMap: Map<string, Float32Array>, vertexDeclarArr: string[]): Float32Array {
        let attributeBuffer: Float32Array = <Float32Array>this.getBufferwithAccessorIndex(attributeAccessorIndex);
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
    private getIndexBuffer(attributeAccessorIndex: number, vertexCount: number): Uint32Array {
        let indexBuffer: Uint32Array = <Uint32Array>this.getBufferwithAccessorIndex(attributeAccessorIndex);
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
    private parseMeshwithSubMeshData(subDatas: PrimitiveSubMesh[], layaMesh: Mesh): void {
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

        this.fillMeshBuffers(subDatas, vertexArray, indexArray, vertexFloatStride);
        this.generateMesh(vertexArray, indexArray, vertexDeclaration, ibFormat, subDatas, layaMesh);
    }

    /**
     * @internal
     * 填充 mesh buffer 数据
     * @param subDatas 
     * @param vertexArray 
     * @param indexArray 
     * @param vertexFloatStride 
     */
    private fillMeshBuffers(subDatas: PrimitiveSubMesh[], vertexArray: Float32Array, indexArray: Uint16Array | Uint32Array, vertexFloatStride: number) {
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
    private splitSubMeshByBonesCount(attributeMap: Map<string, Float32Array>, indexArray: Uint32Array, boneIndicesList: Array<Uint16Array>, subIndexStartArray: number[], subIndexCountArray: number[]): void {
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
                        let attOffset: number = this.getAttributeNum(key);
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
    private generateMesh(vertexArray: Float32Array, indexArray: Uint16Array | Uint32Array, vertexDeclaration: VertexDeclaration, ibFormat: IndexFormat, subDatas: PrimitiveSubMesh[], layaMesh: Mesh): void {
        let vertexBuffer: VertexBuffer3D = LayaGL.renderOBJCreate.createVertexBuffer3D(vertexArray.byteLength, BufferUsage.Static, true);
        vertexBuffer.vertexDeclaration = vertexDeclaration;
        vertexBuffer.setData(vertexArray.buffer);

        let indexBuffer: IndexBuffer3D =LayaGL.renderOBJCreate.createIndexBuffer3D(ibFormat, indexArray.length, BufferUsage.Static, true);
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

        //layaMesh._setInstanceBuffer(Mesh.MESH_INSTANCEBUFFER_TYPE_NORMAL);

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
    private applyglTFSkinData(mesh: Mesh, subDatas: PrimitiveSubMesh[], glTFSkin?: glTF.glTFSkin): void {
        if (!glTFSkin)
            return;

        let joints: number[] = glTFSkin.joints;

        let inverseBindMatricesArray: Float32Array = new Float32Array(this.getBufferwithAccessorIndex(glTFSkin.inverseBindMatrices));

        let boneCount: number = joints.length;
        let boneNames: string[] = mesh._boneNames = [];
        joints.forEach(nodeIndex => {
            let node: glTF.glTFNode = this._glTF.nodes[nodeIndex];
            boneNames.push(node.name);
        })

        mesh._inverseBindPoses = [];
        mesh._inverseBindPosesBuffer = inverseBindMatricesArray.buffer;
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
     * 创建 Mesh
     * @param mesh 
     */
    private createMesh(glTFMesh: glTF.glTFMesh, glTFSkin?: glTF.glTFSkin): Mesh {
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

            let position: Float32Array = this.getArrributeBuffer(attributes.POSITION, "POSITION", attributeMap, vertexDeclarArr);
            let normal: Float32Array = this.getArrributeBuffer(attributes.NORMAL, "NORMAL", attributeMap, vertexDeclarArr);
            let color: Float32Array = this.getArrributeBuffer(attributes.COLOR_0, "COLOR", attributeMap, vertexDeclarArr);
            let uv: Float32Array = this.getArrributeBuffer(attributes.TEXCOORD_0, "UV", attributeMap, vertexDeclarArr);
            let uv1: Float32Array = this.getArrributeBuffer(attributes.TEXCOORD_1, "UV1", attributeMap, vertexDeclarArr);
            let blendWeight: Float32Array = this.getArrributeBuffer(attributes.WEIGHTS_0, "BLENDWEIGHT", attributeMap, vertexDeclarArr);
            let blendIndices: Float32Array = this.getArrributeBuffer(attributes.JOINTS_0, "BLENDINDICES", attributeMap, vertexDeclarArr);
            let tangent: Float32Array = this.getArrributeBuffer(attributes.TANGENT, "TANGENT", attributeMap, vertexDeclarArr);

            // todo  vertex color
            // if (color) {
            //     let material = glTFUtils._glTFMaterials[glTFMeshPrimitive.material];
            //     material.enableVertexColor = true;
            // }

            let targets: { [name: string]: number }[] = glTFMeshPrimitive.targets;
            (targets) && targets.forEach((target, index) => {
                let weight: number = morphWeights[index];
                let morphPosition: Float32Array = <Float32Array>this.getBufferwithAccessorIndex(target.POSITION);
                let morphNormal: Float32Array = <Float32Array>this.getBufferwithAccessorIndex(target.NORMAL);
                let morphTangent: Float32Array = <Float32Array>this.getBufferwithAccessorIndex(target.TANGENT);

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

            let indexArray: Uint32Array = this.getIndexBuffer(glTFMeshPrimitive.indices, vertexCount);
            let boneIndicesList: Array<Uint16Array> = new Array<Uint16Array>();
            let subIndexStartArray: number[] = [];
            let subIndexCountArray: number[] = [];

            if (glTFSkin) {
                if (boneCount > maxSubBoneCount) {
                    // todo 划分 subMesh
                    this.splitSubMeshByBonesCount(attributeMap, indexArray, boneIndicesList, subIndexStartArray, subIndexCountArray);
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

        this.parseMeshwithSubMeshData(subDatas, layaMesh);
        this.applyglTFSkinData(layaMesh, subDatas, glTFSkin);

        return layaMesh;
    }

    /**
     * 计算 SkinnedMeshSprite3D local bounds
     * @param skinned 
     */
    private calSkinnedSpriteLocalBounds(skinned: SkinnedMeshSprite3D): void {
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

        for (let index = 0; index < positions.length; index++) {
            let pos: Vector3 = positions[index];
            let boneIndex: Vector4 = oriBoneIndeices[index];
            let boneWeight: Vector4 = boneWeights[index];

            if (!(boneIndex && boneWeight)) {
                continue;
            }

            for (let ei = 0; ei < 16; ei++) {
                skinTransform.elements[ei] = ubones[boneIndex.x].elements[ei] * boneWeight.x;
                skinTransform.elements[ei] += ubones[boneIndex.y].elements[ei] * boneWeight.y;
                skinTransform.elements[ei] += ubones[boneIndex.z].elements[ei] * boneWeight.z;
                skinTransform.elements[ei] += ubones[boneIndex.w].elements[ei] * boneWeight.w;
            }
            Vector3.transformV3ToV3(pos, skinTransform, resPos);
            Vector3.min(min, resPos, min);
            Vector3.max(max, resPos, max);

        }

        // positions.forEach((pos: Vector3, index: number) => {
        //     let boneIndex: Vector4 = oriBoneIndeices[index];
        //     let boneWeight: Vector4 = boneWeights[index];

        //     for (let ei = 0; ei < 16; ei++) {
        //         skinTransform.elements[ei] = ubones[boneIndex.x].elements[ei] * boneWeight.x;
        //         skinTransform.elements[ei] += ubones[boneIndex.y].elements[ei] * boneWeight.y;
        //         skinTransform.elements[ei] += ubones[boneIndex.z].elements[ei] * boneWeight.z;
        //         skinTransform.elements[ei] += ubones[boneIndex.w].elements[ei] * boneWeight.w;
        //     }
        //     Vector3.transformV3ToV3(pos, skinTransform, resPos);
        //     Vector3.min(min, resPos, min);
        //     Vector3.max(max, resPos, max);
        // });

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
    private fixSkinnedSprite(glTFNode: glTF.glTFNode, skinned: SkinnedMeshSprite3D): void {
        let skin: glTF.glTFSkin = this._glTF.skins[glTFNode.skin];
        let skinnedMeshRenderer: SkinnedMeshRenderer = skinned.skinnedMeshRenderer;
        skin.joints.forEach(nodeIndex => {
            let bone: Sprite3D = this._nodes[nodeIndex];
            skinnedMeshRenderer.bones.push(bone);
        });
        if (skin.skeleton == undefined) {
            skin.skeleton = skin.joints[0];
        }
        skinnedMeshRenderer.rootBone = this._nodes[skin.skeleton];

        this.calSkinnedSpriteLocalBounds(skinned);
    }

    /**
     * @interna
     * 获取 Animator 根节点
     */
    private getAnimationRoot(channels: glTF.glTFAnimationChannel[]): Sprite3D {
        const isContainNode = (nodeArr: number[], findNodeIndex: number): boolean => {
            if (!nodeArr)
                return false;
            if (nodeArr.indexOf(findNodeIndex) == -1) {
                for (let index = 0; index < nodeArr.length; index++) {
                    let glTFNode: glTF.glTFNode = this._glTF.nodes[nodeArr[index]];
                    if (isContainNode(glTFNode.children, findNodeIndex)) {
                        return true;
                    }
                }
            }
            return true;
        }

        let target: glTF.glTFAnimationChannelTarget = channels[0].target;
        let spriteIndex: number = target.node;
        for (let index = 0; index < this._glTF.scenes.length; index++) {
            let glTFScene: glTF.glTFScene = this._glTF.scenes[index];
            if (isContainNode(glTFScene.nodes, spriteIndex)) {
                return this._scenes[index];
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
    private getAnimationPath(root: Sprite3D, curSprite: Sprite3D): string[] {
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
    private loadAnimations(animations?: glTF.glTFAnimation[]): void {
        if (!animations)
            return;

        animations.forEach((animation: glTF.glTFAnimation, index: number) => {
            // todo 
            this.loadAnimation(animation);
        });
    }

    /**
     * @internal
     * 加载 Animation
     * @param animation 
     */
    private loadAnimation(animation: glTF.glTFAnimation): Animator {
        // todo extension and extra

        return this.createAnimator(animation);
    }

    /**
     * @internal
     * 创建 Animator 组件
     * @param animation 
     */
    private createAnimator(animation: glTF.glTFAnimation): Animator {

        let channels: glTF.glTFAnimationChannel[] = animation.channels;
        let samplers: glTF.glTFAnimationSampler[] = animation.samplers;

        let animatorRoot: Sprite3D = this.getAnimationRoot(channels);

        if (!animatorRoot) {
            return null;
        }

        let animator: Animator = animatorRoot.getComponent(Animator);
        if (!animator) {
            animator = animatorRoot.addComponent(Animator);
            let animatorLayer: AnimatorControllerLayer = new AnimatorControllerLayer("glTF_AnimatorLayer");
            animator.addControllerLayer(animatorLayer);
            animatorLayer.defaultWeight = 1.0;
        }

        let clip: AnimationClip = this._createAnimatorClip(animation, animatorRoot);
        let animatorLayer: AnimatorControllerLayer = animator.getControllerLayer();

        let animationName: string = clip.name;

        let stateMap: { [stateName: string]: AnimatorState } = animatorLayer._statesMap;
        if (stateMap[animationName]) {
            animationName = clip.name = this.getNodeRandomName(animationName);
        }

        let animatorState: AnimatorState = new AnimatorState();
        // todo  state name
        animatorState.name = animationName;
        animatorState.clip = clip;
        animatorLayer.addState(animatorState);
        animatorLayer.defaultState = animatorState;
        animatorLayer.playOnWake = true;

        return animator;
    }

    /**
     * @internal
     * 创建 AnimationClip
     * @param animation 
     * @param animatorRoot 
     * @returns 
     */
    private _createAnimatorClip(animation: glTF.glTFAnimation, animatorRoot: Sprite3D): AnimationClip {
        let clip: AnimationClip = new AnimationClip();

        let duration: number = 0;

        let channels: glTF.glTFAnimationChannel[] = animation.channels;
        let samplers: glTF.glTFAnimationSampler[] = animation.samplers;

        let clipNodes: ClipNode[] = new Array<ClipNode>(channels.length);
        channels.forEach((channel: glTF.glTFAnimationChannel, index: number) => {
            let target: glTF.glTFAnimationChannelTarget = channel.target;
            let sampler: glTF.glTFAnimationSampler = samplers[channel.sampler];

            let clipNode: ClipNode = clipNodes[index] = new ClipNode();

            let sprite: Sprite3D = this._nodes[target.node];

            let timeBuffer = this.getBufferwithAccessorIndex(sampler.input);
            let outBuffer = this.getBufferwithAccessorIndex(sampler.output);
            clipNode.timeArray = new Float32Array(timeBuffer);
            clipNode.valueArray = new Float32Array(outBuffer);
            // todo sampler.interpolation

            clipNode.paths = this.getAnimationPath(animatorRoot, sprite);
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

        clip.name = animation.name ? animation.name : this.getNodeRandomName("glTF_Animation");
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

        return clip;
    }

}

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