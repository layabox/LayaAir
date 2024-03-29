import { AnimationClip } from "../d3/animation/AnimationClip";
import { KeyframeNode } from "../d3/animation/KeyframeNode";
import { KeyframeNodeList } from "../d3/animation/KeyframeNodeList";
import { Material, MaterialRenderMode } from "../resource/Material";
import { PBRStandardMaterial } from "../d3/core/material/PBRStandardMaterial";
import { Mesh, skinnedMatrixCache } from "../d3/resource/models/Mesh";
import { URL } from "../net/URL";
import { Texture2D, TextureConstructParams, TexturePropertyParams } from "../resource/Texture2D";
import * as glTF from "./glTFInterface";
import { ILaya } from "../../ILaya";
import { BufferUsage } from "../RenderEngine/RenderEnum/BufferTargetType";
import { HDREncodeFormat } from "../RenderEngine/RenderEnum/HDREncodeFormat";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { VertexMesh } from "../RenderEngine/RenderShader/VertexMesh";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { Animator } from "../d3/component/Animator/Animator";
import { AnimatorControllerLayer } from "../d3/component/Animator/AnimatorControllerLayer";
import { AnimatorState } from "../d3/component/Animator/AnimatorState";
import { FloatKeyframe } from "../d3/core/FloatKeyframe";
import { MeshFilter } from "../d3/core/MeshFilter";
import { QuaternionKeyframe } from "../d3/core/QuaternionKeyframe";
import { SkinnedMeshRenderer } from "../d3/core/SkinnedMeshRenderer";
import { Sprite3D } from "../d3/core/Sprite3D";
import { Vector3Keyframe } from "../d3/core/Vector3Keyframe";
import { IndexBuffer3D } from "../d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../d3/graphics/VertexBuffer3D";
import { MorphTarget, MorphTargetChannel } from "../d3/resource/models/MorphTarget";
import { MorphTargetData } from "../d3/resource/models/MorphTargetData";
import { SubMesh } from "../d3/resource/models/SubMesh";
import { Node } from "../display/Node";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Quaternion } from "../maths/Quaternion";
import { Vector3 } from "../maths/Vector3";
import { Vector4 } from "../maths/Vector4";
import { IBatchProgress } from "../net/BatchProgress";
import { Loader } from "../net/Loader";
import { Prefab } from "../resource/HierarchyResource";
import { Base64Tool } from "../utils/Base64Tool";
import { Byte } from "../utils/Byte";
import { glTFExtension } from "./extensions/glTFExtension";
import { glTFShader } from "./shader/glTFShader";
import { PBRShaderLib } from "../d3/shader/pbr/PBRShaderLib";
import { Laya } from "../../Laya";
import { WrapMode } from "../RenderEngine/RenderEnum/WrapMode";
import { Laya3DRender } from "../d3/RenderObjs/Laya3DRender";
import { RenderState } from "../RenderDriver/RenderModuleData/Design/RenderState";
import { ShaderDefine } from "../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { MeshRenderer } from "../d3/core/MeshRenderer";

const maxSubBoneCount = 24;

/**
 * @internal
 */
export class glTFResource extends Prefab {

    private static _Extensions: { [name: string]: (resource: glTFResource) => glTFExtension } = {};

    static registerExtension(name: string, factory: (resource: glTFResource) => glTFExtension) {
        this._Extensions[name] = factory;
    }

    protected _data: glTF.glTF;

    get data(): Readonly<glTF.glTF> {
        return this._data;
    }

    protected _buffers: Record<string, ArrayBuffer>;
    protected _textures: Texture2D[];
    protected _materials: Material[];
    protected _meshes: Record<string, Mesh>;

    protected _extensions: Map<string, glTFExtension>;

    protected _pendingOps: Array<Promise<any>>;

    private _scenes: Array<Sprite3D>;
    private _nodes: Array<Sprite3D>;

    /** @internal */
    private _idCounter: Record<string, number>;

    constructor() {
        super(3);

        this._buffers = {};
        this._textures = [];
        this._materials = [];
        this._meshes = {};
        this._extensions = new Map();
        this._pendingOps = [];
        this._scenes = [];
        this._nodes = [];
    }

    /**
     * @internal
     * @param basePath 
     * @param progress 
     * @returns 
     */
    loadBinary(basePath: string, progress?: IBatchProgress) {
        let data = this._data;
        if (data.buffers) {
            let promises: Array<Promise<any>> = [];
            data.buffers.forEach((buffer, i) => {
                if (Base64Tool.isBase64String(buffer.uri)) {
                    let bin = Base64Tool.decode(buffer.uri.replace(Base64Tool.reghead, ""));
                    this._buffers[i] = bin;
                }
                else {
                    let j = i;
                    promises.push(ILaya.loader.fetch(URL.join(basePath, buffer.uri), "arraybuffer", progress?.createCallback(0.2))
                        .then(bin => {
                            this._buffers[j] = bin;
                        }));
                }
            });
            return Promise.all(promises);
        }
        else {
            return Promise.resolve();
        }
    }

    loadTextureFromInfo(info: glTF.glTFTextureInfo, sRGB: boolean, basePath: string, progress?: IBatchProgress): Promise<Texture2D> {
        let data = this._data;

        let index = info.index;
        let tex = data.textures[index];
        let imgSource = tex.source;
        let glTFImg = data.images[imgSource];
        let samplerSource = tex.sampler;
        let glTFSampler = data.samplers ? data.samplers[samplerSource] : undefined;

        let constructParams = this.getTextureConstructParams(glTFImg, glTFSampler, sRGB);
        let propertyParams = this.getTexturePropertyParams(glTFSampler);

        if (glTFImg.bufferView != null) {
            let bufferView = data.bufferViews[glTFImg.bufferView];
            let buffer = this._buffers[bufferView.buffer];
            let byteOffset = bufferView.byteOffset || 0;
            let byteLength = bufferView.byteLength;

            let arraybuffer = buffer.slice(byteOffset, byteOffset + byteLength);

            return this.loadTextureFromBuffer(arraybuffer, glTFImg.mimeType, constructParams, propertyParams, progress).then(res => {
                this._textures[index] = res;
                this.addDep(res);
                return res;
            });
        }
        else {
            return this.loadTexture(URL.join(basePath, glTFImg.uri), constructParams, propertyParams, progress).then(res => {
                this._textures[index] = res;
                this.addDep(res);
                return res;
            });
        }
    }

    /**
     * @internal
     * @param basePath 
     * @param progress 
     * @returns 
     */
    loadTextures(basePath: string, progress?: IBatchProgress): Promise<any> {
        let data = this._data;
        let materials = data.materials;
        let textures = data.textures;
        let promises: Array<Promise<Texture2D> | Promise<Texture2D[]>> = [];
        if (materials && textures) {
            for (let glTFMaterial of data.materials) {
                let pbrMetallicRoughness = glTFMaterial.pbrMetallicRoughness;
                if (pbrMetallicRoughness) {
                    if (pbrMetallicRoughness.baseColorTexture) {
                        let sRGB = true;
                        let promise = this.loadTextureFromInfo(pbrMetallicRoughness.baseColorTexture, sRGB, basePath, progress);
                        promises.push(promise);
                    }
                    if (pbrMetallicRoughness.metallicRoughnessTexture) {
                        let sRGB = false;
                        let promise = this.loadTextureFromInfo(pbrMetallicRoughness.metallicRoughnessTexture, sRGB, basePath, progress);
                        promises.push(promise);
                    }
                }
                if (glTFMaterial.normalTexture) {
                    let sRGB = false;
                    let promise = this.loadTextureFromInfo(glTFMaterial.normalTexture, sRGB, basePath, progress);
                    promises.push(promise);
                }
                if (glTFMaterial.occlusionTexture) {
                    let sRGB = false;
                    let promise = this.loadTextureFromInfo(glTFMaterial.occlusionTexture, sRGB, basePath, progress);
                    promises.push(promise);
                }
                if (glTFMaterial.emissiveTexture) {
                    let sRGB = true;
                    let promise = this.loadTextureFromInfo(glTFMaterial.emissiveTexture, sRGB, basePath, progress);
                    promises.push(promise);
                }
            }
        }
        this._extensions.forEach(extension => {
            if (extension.loadAdditionTextures) {
                let promise = extension.loadAdditionTextures(basePath, progress);
                promises.push(promise);
            }

        });
        return Promise.all(promises);
    }

    /**
     * @internal
     * @returns 
     */
    importMaterials() {
        return Promise.resolve().then(() => {
            let data = this._data;
            if (data.materials) {
                data.materials.forEach((glTFMat, index) => {
                    let mat = this.createMaterial(glTFMat);
                    this._materials[index++] = mat;
                    this.addDep(mat);
                })
            }
        });
    }

    /**
     * @internal
     * @returns 
     */
    importMeshes() {
        return Promise.resolve().then(() => {
            let data = this._data;
            if (data.meshes && data.nodes) {
                data.nodes.forEach((glTFNode) => {
                    if (glTFNode.mesh != null) {
                        let glTFMesh = this._data.meshes[glTFNode.mesh];
                        let glTFSkin = this._data.skins?.[glTFNode.skin];
                        let key = glTFNode.mesh + (glTFNode.skin != null ? ("_" + glTFNode.skin) : "");
                        let mesh = this._meshes[key];
                        if (!mesh) {
                            mesh = this.createMesh(glTFMesh, glTFSkin);
                            this._meshes[key] = mesh;
                            this.addDep(mesh);
                        }
                    }
                });
            }
        });
    }

    /**
     * @param data 
     * @param createURL 
     * @param progress 
     * @returns 
     */
    _parse(data: glTF.glTF, createURL: string, progress?: IBatchProgress): Promise<void> {
        if (!data.asset || data.asset.version !== "2.0") {
            throw new Error("glTF version wrong!");
        }

        this._data = data;
        let basePath = URL.getPath(createURL);
        this._idCounter = {};

        data.extensionsUsed?.forEach(value => {
            let extensionFactory = glTFResource._Extensions[value];
            if (!extensionFactory) {
                console.warn(`glTF: unsupported used extension: ${value}`);
            }
            else {
                this._extensions.set(value, extensionFactory(this));
            }
        });

        data.extensionsRequired?.forEach(value => {
            let extensionFactory = glTFResource._Extensions[value];
            if (!extensionFactory) {
                console.warn(`glTF: unsupported required extension: ${value}`);
            }
        });

        let promise: Promise<any> = this.loadBinary(basePath, progress);

        promise = promise.then(() => {
            return this.loadTextures(basePath, progress);
        });

        promise = promise.then(() => {
            return this.importMeshes();
        });

        promise = promise.then(() => {
            return this.importMaterials();
        });

        return promise.then(() => {
            if (this._pendingOps.length > 0) {
                return Promise.all(this._pendingOps).then(() => {
                    this._idCounter = null;
                });
            }
            else {
                this._idCounter = null;
                return Promise.resolve();
            }
        });
    }

    /**
     * 
     * @param data 
     * @param createURL 
     * @param progress 
     */
    _parseglb(data: ArrayBuffer, createURL: string, progress?: IBatchProgress): Promise<void> {
        let basePath = URL.getPath(createURL);
        // let promise: Promise<any>;
        this._idCounter = {};

        let byte = new Byte(data);
        let magic = byte.readUint32();
        //  ASCII string glTF
        if (magic != 0x46546C67) {
            throw new Error("glb fromat wrong!");
        }

        let version = byte.readUint32();
        if (version != 2) {
            throw new Error("glb version wrong!");
        }

        // total length of the Binary glTF, including header and all chunks, in bytes.
        let length = byte.readUint32();

        /**
         * first chunk: json 
         * second chunk: buffer
         * other chunk: ignore
         */

        // first chunk json
        let firstChunkLength = byte.readUint32();
        let firstChunkType = byte.readUint32();
        if (firstChunkType != 0x4E4F534A) {
            throw new Error("glb json chunk data wrong!");
        }

        let firstChunkData = byte.readArrayBuffer(firstChunkLength);
        let texDecoder = new TextDecoder();
        let jsonStr = texDecoder.decode(firstChunkData);
        let glTFObj: glTF.glTF = JSON.parse(jsonStr);
        this._data = glTFObj;

        // binary data json
        let chunkLength = byte.readUint32();
        let chunkType = byte.readUint32();
        if (chunkType != 0x004E4942) {
            throw new Error("glb bin chunk data wrong!");
        }
        let firstBuffer = glTFObj.buffers?.[0];
        firstBuffer.byteLength = firstBuffer.byteLength ? (Math.min(firstBuffer.byteLength, chunkLength)) : chunkLength;

        this._buffers[0] = byte.readArrayBuffer(firstBuffer.byteLength);

        glTFObj.extensionsUsed?.forEach(value => {
            let extensionFactory = glTFResource._Extensions[value];
            if (!extensionFactory) {
                console.warn(`glTF: unsupported used extension: ${value}`);
            }
            else {
                this._extensions.set(value, extensionFactory(this));
            }
            // this._extensions.sort((a, b) => )
        });

        glTFObj.extensionsRequired?.forEach(value => {
            let extensionFactory = glTFResource._Extensions[value];
            if (!extensionFactory) {
                console.warn(`glTF: unsupported required extension: ${value}`);
            }
        });

        let promise: Promise<any> = this.loadTextures(basePath, progress);
        promise = promise.then(() => {
            return this.importMeshes();
        });

        promise = promise.then(() => {
            return this.importMaterials();
        });

        return promise.then(() => {
            if (this._pendingOps.length > 0) {
                return Promise.all(this._pendingOps).then(() => {
                    this._idCounter = null;
                });
            }
            else {
                this._idCounter = null;
                return Promise.resolve();
            }
        });
    }

    public create(): Node {
        let data = this._data;

        this._scenes.length = 0;
        this._nodes.length = 0;
        this._idCounter = {};

        this.loadNodes(data.nodes);
        this.buildHierarchy(data.nodes);
        this.loadScenes(data.scenes);
        this.loadAnimations(data.animations);

        let defaultSceneIndex = (data.scene != undefined) ? data.scene : 0;
        let defaultScene: Sprite3D = this._scenes[defaultSceneIndex];
        this._scenes.length = 0;
        this._nodes.length = 0;
        this._idCounter = null;

        return defaultScene;
    }

    protected loadTextureFromBuffer(buffer: ArrayBuffer, mimeType: glTF.glTFImageMimeType, constructParams: TextureConstructParams, propertyParams: TexturePropertyParams, progress?: IBatchProgress): Promise<Texture2D> {
        let base64: string = Base64Tool.encode(buffer);
        let url: string = `data:${mimeType};base64,${base64}`;

        return ILaya.loader.load({ url: url, constructParams: constructParams, propertyParams: propertyParams },
            Loader.TEXTURE2D, progress?.createCallback());
    }

    protected loadTexture(url: string, constructParams: TextureConstructParams, propertyParams: TexturePropertyParams, progress?: IBatchProgress): Promise<Texture2D> {
        return ILaya.loader.load({ url: url, constructParams: constructParams, propertyParams: propertyParams },
            Loader.TEXTURE2D, progress?.createCallback());
    }

    /**
     * @internal
     * 获取 node name
     */
    protected generateId(context: string): string {
        let i = this._idCounter[context];
        if (i == null)
            i = 0;
        else
            i++;
        this._idCounter[context] = i;
        return i.toString();
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

    private getBufferFormBufferView(bufferView: glTF.glTFBufferView, byteOffset: number, accessorType: glTF.glTFAccessorType, componentType: glTF.glTFAccessorComponentType, count: number) {
        let buffer: ArrayBuffer = this._buffers[bufferView.buffer];

        const constructor = this._getTypedArrayConstructor(componentType);
        let componentCount: number = this.getAccessorComponentsNum(accessorType);
        let res;
        if (bufferView.byteStride) {
            let vertexStride = bufferView.byteStride;
            let dataByteStride = this._getAccessorDateByteStride(componentType);
            let dataStride = vertexStride / dataByteStride;

            let elementByteOffset = byteOffset || 0;
            let elementOffset = elementByteOffset / dataByteStride;

            // let d = new ArrayBuffer(dataStride * accessorDataCount);
            let dataReader = new constructor(buffer, bufferView.byteOffset || 0, bufferView.byteLength / dataByteStride);
            res = new constructor(count);
            let resIndex = 0;
            for (let index = 0; index < count; index++) {
                let componentOffset = index * dataStride;
                for (let i = 0; i < componentCount; i++) {
                    res[resIndex++] = dataReader[componentOffset + elementOffset + i];
                }
            }
        }
        else {
            let bufferOffset: number = (bufferView.byteOffset || 0) + (byteOffset || 0);
            res = new constructor(buffer, bufferOffset, count);
        }

        return res;
    }

    /**
     * 获取 accessor buffer 数据
     * @param accessorIndex 
     */
    private getBufferwithAccessorIndex(accessorIndex: number) {
        let accessor: glTF.glTFAccessor = this._data.accessors[accessorIndex];
        if (!accessor)
            return null;

        let count: number = accessor.count;
        let componentCount: number = this.getAccessorComponentsNum(accessor.type);
        let accessorDataCount: number = count * componentCount;

        let res;

        let bufferView: glTF.glTFBufferView = this._data.bufferViews[accessor.bufferView];
        if (bufferView) {
            res = this.getBufferFormBufferView(bufferView, accessor.byteOffset, accessor.type, accessor.componentType, accessorDataCount);
        }
        else {
            const constructor = this._getTypedArrayConstructor(accessor.componentType);
            res = new constructor(accessorDataCount).fill(0);
        }

        if (accessor.sparse) {
            let sparseCount = accessor.sparse.count;
            let sparseIndices = accessor.sparse.indices;
            let sparseIndicesBufferView = this._data.bufferViews[sparseIndices.bufferView];
            let sparseIndicesData = this.getBufferFormBufferView(sparseIndicesBufferView, sparseIndices.byteOffset, accessor.type, sparseIndices.componentType, sparseCount);

            let sparseValues = accessor.sparse.values;
            let sparseValuesBufferView = this._data.bufferViews[sparseValues.bufferView];
            let sparseValuesData = this.getBufferFormBufferView(sparseValuesBufferView, sparseValues.byteOffset, accessor.type, accessor.componentType, sparseCount * componentCount);

            for (let index = 0; index < sparseCount; index++) {
                let i = sparseIndicesData[index];
                for (let componentIndex = 0; componentIndex < componentCount; componentIndex++) {
                    res[i * componentCount + componentIndex] = sparseValuesData[index * componentCount + componentIndex];
                }
            }
        }

        return res;
    }

    /**
     * 判断 Texture 是否需要 mipmap
     * @param glTFImage 
     * @param glTFSampler 
     */
    private getTextureMipmap(glTFSampler: glTF.glTFSampler): boolean {
        if (glTFSampler)
            return glTFSampler.minFilter != glTF.glTFTextureMinFilter.LINEAR &&
                glTFSampler.minFilter != glTF.glTFTextureMinFilter.NEAREST;
        else
            return true;
    }

    /**
     * 获取 Texture format
     * @param glTFImage 
     */
    private getTextureFormat(glTFImage: glTF.glTFImage): number {
        if (glTFImage.mimeType === glTF.glTFImageMimeType.JPEG) {
            return 0;   // R8G8B8
        }
        else {
            return 1;   // R8G8B8A8
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
        mode = mode ?? glTF.glTFTextureWrapMode.REPEAT;
        switch (mode) {
            case glTF.glTFTextureWrapMode.REPEAT:
                return WrapMode.Repeat;
            case glTF.glTFTextureWrapMode.CLAMP_TO_EDGE:
                return WrapMode.Clamp;
            case glTF.glTFTextureWrapMode.MIRRORED_REPEAT:
                return WrapMode.Mirrored;
            default:
                return WrapMode.Repeat;
        }

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
    private getTextureConstructParams(glTFImage: glTF.glTFImage, glTFSampler: glTF.glTFSampler, sRGB: boolean): ConstructorParameters<typeof Texture2D> {
        let constructParams: ConstructorParameters<typeof Texture2D> = [
            0, // width
            0, // height
            this.getTextureFormat(glTFImage), // format
            this.getTextureMipmap(glTFSampler),  // mipmap
            false, //can read
            sRGB // sRGB

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
            anisoLevel: 1,
            hdrEncodeFormat: HDREncodeFormat.NONE
        };
        return propertyParams;
    }

    /**
     * 根据 glTFTextureInfo 获取 Texture2D
     * @param glTFTextureInfo 
     */
    getTextureWithInfo(glTFTextureInfo: glTF.glTFTextureInfo): Texture2D {
        // uv 非 0 
        if (glTFTextureInfo.texCoord) {
            // todo 非0 uv 
            console.warn("glTF Loader: non 0 uv channel unsupported.");
        }

        return this._textures[glTFTextureInfo.index];
    }

    getExtensionTextureInfo(info: glTF.glTFTextureInfo, extensionName: string): any {
        let extension = this._extensions.get(extensionName);
        if (info.extensions && info.extensions[extensionName] && extension) {
            if (extension.loadExtensionTextureInfo) {
                return extension.loadExtensionTextureInfo(info);
            }
        }
        else {
            return null;
        }
    }

    /**
     * 
     * @param glTFMaterial 
     * @param material 
     */
    applyMaterialRenderState(glTFMaterial: glTF.glTFMaterial, material: Material) {
        // material render state
        let renderMode: glTF.glTFMaterialAlphaMode = glTFMaterial.alphaMode || glTF.glTFMaterialAlphaMode.OPAQUE;
        switch (renderMode) {
            case glTF.glTFMaterialAlphaMode.OPAQUE: {
                material.materialRenderMode = MaterialRenderMode.RENDERMODE_OPAQUE;
                break;
            }
            case glTF.glTFMaterialAlphaMode.BLEND: {
                material.materialRenderMode = MaterialRenderMode.RENDERMODE_TRANSPARENT;
                break;
            }
            case glTF.glTFMaterialAlphaMode.MASK: {
                material.materialRenderMode = MaterialRenderMode.RENDERMODE_CUTOUT;
                break;
            }
            default: {
                break;
            }
        }

        material.alphaTestValue = glTFMaterial.alphaCutoff ?? 0.5;

        if (glTFMaterial.doubleSided) {
            material.cull = RenderState.CULL_NONE;
        }

    }

    setMaterialTextureProperty(material: Material, texInfo: glTF.glTFTextureInfo, name: string, define: ShaderDefine, transformName: string, transformDefine: ShaderDefine) {
        let tex = this.getTextureWithInfo(texInfo);
        material.setTexture(name, tex);
        if (define) {
            material.setDefine(define, true);
        }

        // transform info
        if (transformDefine) {
            let transformInfo = this.getExtensionTextureInfo(texInfo, "KHR_texture_transform");
            if (transformInfo) {
                material.setDefine(transformDefine, true);
                material.setMatrix3x3(transformName, transformInfo.transform);
            }
        }
    }

    /**
     * @param glTFMaterial 
     * @param material 
     */
    applyDefaultMaterialProperties(glTFMaterial: glTF.glTFMaterial, material: Material) {
        let pbrMetallicRoughness = glTFMaterial.pbrMetallicRoughness;
        if (pbrMetallicRoughness) {
            if (pbrMetallicRoughness.baseColorFactor) {
                let baseColorFactor = material.getVector4("u_BaseColorFactor");
                baseColorFactor.fromArray(pbrMetallicRoughness.baseColorFactor);
                material.setVector4("u_BaseColorFactor", baseColorFactor);
            }
            if (pbrMetallicRoughness.baseColorTexture) {
                this.setMaterialTextureProperty(material, pbrMetallicRoughness.baseColorTexture, "u_BaseColorTexture", glTFShader.Define_BaseColorMap, "u_BaseColorMapTransform", glTFShader.Define_BaseColorMapTransform);
            }

            let metallicFactor = pbrMetallicRoughness.metallicFactor ?? 1.0;
            material.setFloat("u_MetallicFactor", metallicFactor);

            let roughnessFactor = pbrMetallicRoughness.roughnessFactor ?? 1.0;
            material.setFloat("u_RoughnessFactor", roughnessFactor);

            if (pbrMetallicRoughness.metallicRoughnessTexture) {
                this.setMaterialTextureProperty(material, pbrMetallicRoughness.metallicRoughnessTexture, "u_MetallicRoughnessTexture", glTFShader.Define_MetallicRoughnessMap, "u_MetallicRoughnessMapTransform", glTFShader.Define_MetallicRoughnessMapTransform);
            }
        }

        if (glTFMaterial.normalTexture) {
            this.setMaterialTextureProperty(material, glTFMaterial.normalTexture, "u_NormalTexture", glTFShader.Define_NormalMap, "u_NormalMapTransform", glTFShader.Define_NormalMapTransform);

            let normalScale = glTFMaterial.normalTexture.scale ?? 1.0;
            material.setFloat("u_NormalScale", normalScale);
        }

        if (glTFMaterial.occlusionTexture) {
            this.setMaterialTextureProperty(material, glTFMaterial.occlusionTexture, "u_OcclusionTexture", glTFShader.Define_OcclusionMap, "u_OcclusionMapTransform", glTFShader.Define_OcclusionMapTransform);

            let strength = glTFMaterial.occlusionTexture.strength ?? 1.0;
            material.setFloat("u_OcclusionStrength", strength);
        }

        if (glTFMaterial.emissiveFactor) {
            let emissionFactor = material.getVector3("u_EmissionFactor");
            emissionFactor.fromArray(glTFMaterial.emissiveFactor);
            material.setVector3("u_EmissionFactor", emissionFactor);
            material.setDefine(PBRShaderLib.DEFINE_EMISSION, true);
        }

        if (glTFMaterial.emissiveTexture) {
            material.setDefine(PBRShaderLib.DEFINE_EMISSION, true);

            this.setMaterialTextureProperty(material, glTFMaterial.emissiveTexture, "u_EmissionTexture", glTFShader.Define_EmissionMap, "u_EmissionMapTransform", glTFShader.Define_EmissionMapTransform);
        }

        this.applyMaterialRenderState(glTFMaterial, material);

        return;
    }

    /**
     * 根据 glTFMaterial 节点数据创建 default Material
     * @param glTFMaterial 
     */
    createDefaultMaterial(glTFMaterial: glTF.glTFMaterial): Material {
        let material = new Material();
        material.setShaderName(glTFShader.ShaderName);

        // apply glTF Material property
        material.name = glTFMaterial.name ? glTFMaterial.name : "";

        this.applyDefaultMaterialProperties(glTFMaterial, material);

        return material;
    }

    protected createMaterial(glTFMaterial: glTF.glTFMaterial) {
        let mat: Material = null;
        let propertiesExts = [];
        for (const key in glTFMaterial.extensions) {
            let extension = this._extensions.get(key);
            if (extension) {
                if (extension.createMaterial) {
                    mat = extension.createMaterial(glTFMaterial);
                }
                if (extension.additionMaterialProperties) {
                    propertiesExts.push(extension);
                }
            }
        }

        if (!mat) {
            mat = this.createDefaultMaterial(glTFMaterial);
        }
        propertiesExts.forEach(extension => {
            extension.additionMaterialProperties(glTFMaterial, mat);
        });

        return mat;
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
        let glTFSceneNode: Sprite3D = new Sprite3D(glTFScene.name || "Scene");
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
            if (glTFNode.skin) {
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
        if (!glTFNodes)
            return;

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
        let sprite: Sprite3D;
        if (glTFNode.skin != null) {
            sprite = this.createSkinnedMeshSprite3D(glTFNode);
            this.applyTransform(glTFNode, sprite);
        }
        else if (glTFNode.mesh != null) {
            sprite = this.createMeshSprite3D(glTFNode);
            this.applyTransform(glTFNode, sprite);
        }
        else {
            sprite = new Sprite3D(glTFNode.name);
            this.applyTransform(glTFNode, sprite);
        }

        let storeId = this.generateId("node");
        sprite.name = glTFNode.name || `node_${storeId}`;
        (<any>sprite._extra).storeId = "#" + storeId;

        return sprite;
    }

    /**
     * 创建 MeshSprite3D 对象
     * @param glTFNode 
     */
    private createMeshSprite3D(glTFNode: glTF.glTFNode): Sprite3D {
        let glTFMesh: glTF.glTFMesh = this._data.meshes[glTFNode.mesh];
        let mesh = this._meshes[glTFNode.mesh];
        let materials: Material[] = this.pickMeshMaterials(glTFMesh);
        let sprite = new Sprite3D(glTFNode.name);
        let filter = sprite.addComponent(MeshFilter);
        let render = sprite.addComponent(MeshRenderer);
        filter.sharedMesh = mesh;
        render.sharedMaterials = materials;
        render.receiveShadow = true;
        render.castShadow = true;

        if (glTFMesh.weights) {
            glTFMesh.weights.forEach((weight, index) => {
                let target = mesh.morphTargetData.getMorphChannelbyIndex(index);
                render.setMorphChannelWeight(target.name, weight);
            });
        }

        return sprite;
    }

    /**
     * 创建 MeshSprite3D 对象
     * @param glTFNode 
     */
    private createSkinnedMeshSprite3D(glTFNode: glTF.glTFNode): Sprite3D {
        let glTFMesh: glTF.glTFMesh = this._data.meshes[glTFNode.mesh];
        let mesh: Mesh = this._meshes[glTFNode.mesh + "_" + glTFNode.skin];
        let materials: Material[] = this.pickMeshMaterials(glTFMesh);
        let sprite = new Sprite3D(glTFNode.name);
        let filter = sprite.addComponent(MeshFilter);
        let render = sprite.addComponent(SkinnedMeshRenderer);
        filter.sharedMesh = mesh;
        render.sharedMaterials = materials;
        render.receiveShadow = true;
        render.castShadow = true;

        if (glTFMesh.weights) {
            glTFMesh.weights.forEach((weight, index) => {
                let target = mesh.morphTargetData.getMorphChannelbyIndex(index);
                render.setMorphChannelWeight(target.name, weight);
            });
        }

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
                indices[i] = vertexCount - 1 - i;
            }
            return indices;
        }
    }

    private calculateFlatNormal(positions: Float32Array, indexArray: Uint32Array): Float32Array {
        let normal = new Float32Array(positions.length);

        for (let index = 0; index < indexArray.length; index += 3) {
            // todo
            let i0 = indexArray[index];
            let i1 = indexArray[index + 1];
            let i2 = indexArray[index + 2];

            let p0x = positions[i0 * 3];
            let p0y = positions[i0 * 3 + 1];
            let p0z = positions[i0 * 3 + 2];

            let p1x = positions[i1 * 3];
            let p1y = positions[i1 * 3 + 1];
            let p1z = positions[i1 * 3 + 2];

            let p2x = positions[i2 * 3];
            let p2y = positions[i2 * 3 + 1];
            let p2z = positions[i2 * 3 + 2];

            let x1 = p1x - p0x;
            let y1 = p1y - p0y;
            let z1 = p1z - p0z;

            let x2 = p2x - p0x;
            let y2 = p2y - p0y;
            let z2 = p2z - p0z;

            let yz = y1 * z2 - z1 * y2;
            let xz = z1 * x2 - x1 * z2;
            let xy = x1 * y2 - y1 * x2;

            let invPyth = -1.0 / (Math.sqrt((yz * yz) + (xz * xz) + (xy * xy)));
            let nx = yz * invPyth;
            let ny = xz * invPyth;
            let nz = xy * invPyth;

            normal[i0 * 3] = nx;
            normal[i1 * 3] = nx;
            normal[i2 * 3] = nx;

            normal[i0 * 3 + 1] = ny;
            normal[i1 * 3 + 1] = ny;
            normal[i2 * 3 + 1] = ny;

            normal[i0 * 3 + 2] = nz;
            normal[i1 * 3 + 2] = nz;
            normal[i2 * 3 + 2] = nz;
        }

        return normal;
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
    private splitSubMeshByBonesCount(attributeMap: Map<string, Float32Array>, morphtargets: SubMorphData, indexArray: Uint32Array, boneIndicesList: Array<Uint16Array>, subIndexStartArray: number[], subIndexCountArray: number[]): void {
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

        let newTargetMap: { [name: string]: Map<string, Array<number>> } = {};
        for (const key in morphtargets.targets) {
            let newMap = newTargetMap[key] = new Map();

            let target = morphtargets.targets[key];
            target.forEach((value, attri) => {
                newMap.set(attri, new Array<number>());
            });
        }

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

                    for (const key in newTargetMap) {
                        let newMap = newTargetMap[key];
                        let oldMap = morphtargets.targets[key];
                        newMap.forEach((value, attri) => {
                            let attOffset = this.getAttributeNum(attri);
                            let oldArray = oldMap.get(attri);

                            for (let index = 0; index < attOffset; index++) {
                                value.push(oldArray[index + ci * attOffset]);
                            }

                        });
                    }


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

        for (const key in newTargetMap) {
            let newMap = newTargetMap[key];
            let oldMap = morphtargets.targets[key];

            newMap.forEach((value, attri) => {
                let oldArray = oldMap.get(attri);
                let newLength = value.length + oldArray.length;

                let newFloatArray = new Float32Array(newLength);
                newFloatArray.set(oldArray, 0);
                newFloatArray.set(value, oldArray.length);
                oldMap.set(attri, newFloatArray);
            });
        }

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
        let vertexBuffer: VertexBuffer3D = Laya3DRender.renderOBJCreate.createVertexBuffer3D(vertexArray.byteLength, BufferUsage.Static, true);
        vertexBuffer.vertexDeclaration = vertexDeclaration;
        vertexBuffer.setData(vertexArray.buffer);

        let indexBuffer: IndexBuffer3D = Laya3DRender.renderOBJCreate.createIndexBuffer3D(ibFormat, indexArray.length, BufferUsage.Static, true);
        indexBuffer.setData(indexArray);

        layaMesh._indexFormat = ibFormat;
        layaMesh._indexBuffer = indexBuffer;
        layaMesh._vertexBuffer = vertexBuffer;
        layaMesh._setBuffer(vertexBuffer, indexBuffer);
        layaMesh._vertexCount = vertexBuffer._byteLength / vertexDeclaration.vertexStride;

        let reCalculateBounds = false;
        let min = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        let max = new Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

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

            if (subData.boundMax && subData.boundMin) {
                min.x = Math.min(subData.boundMin[0], min.x);
                min.y = Math.min(subData.boundMin[1], min.y);
                min.z = Math.min(subData.boundMin[2], min.z);

                max.x = Math.max(subData.boundMax[0], max.x);
                max.y = Math.max(subData.boundMax[1], max.y);
                max.z = Math.max(subData.boundMax[2], max.z);
            }
            else {
                reCalculateBounds = true;
            }
        }

        layaMesh._setSubMeshes(subMeshes);
        if (reCalculateBounds) {
            layaMesh.calculateBounds();
        }
        else {
            layaMesh.bounds.setMin(min);
            layaMesh.bounds.setMax(max);
        }

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
            let node: glTF.glTFNode = this._data.nodes[nodeIndex];
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

    private applyMorphTarget(mesh: Mesh, subDatas: PrimitiveSubMesh[]) {

        let hasPosition = false;
        let hasNormal = false;
        let hasTangent = false;

        subDatas.forEach(subData => {
            hasPosition = subData.morphtargets.position || hasPosition;
            hasNormal = subData.morphtargets.normal || hasNormal;
            hasTangent = subData.morphtargets.tangent || hasTangent;
        });

        if (!(hasPosition || hasTangent || hasTangent)) {
            return;
        }

        let vertexCount = mesh.vertexCount;

        let morphData = new MorphTargetData();
        morphData.vertexCount = vertexCount;

        let decStr = [];
        if (hasPosition)
            decStr.push("POSITION");
        if (hasNormal)
            decStr.push("NORMAL");
        if (hasTangent)
            decStr.push("TANGENT");

        let morphVertexDec = VertexMesh.getVertexDeclaration(decStr.toLocaleString());
        let targetVertexFloatStride = morphVertexDec.vertexStride / 4;

        morphData.vertexDec = morphVertexDec;

        let bounds = morphData.bounds;
        let min = bounds.getMin();
        let max = bounds.getMax();
        min.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        max.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

        let subVertexOffset = 0;
        for (let index = 0; index < subDatas.length; index++) {
            let subData = subDatas[index];

            min.x = Math.min(min.x, subData.morphtargets.boundMin[0]);
            min.y = Math.min(min.y, subData.morphtargets.boundMin[1]);
            min.z = Math.min(min.z, subData.morphtargets.boundMin[2]);

            max.x = Math.max(max.x, subData.morphtargets.boundMax[0]);
            max.y = Math.max(max.y, subData.morphtargets.boundMax[1]);
            max.z = Math.max(max.z, subData.morphtargets.boundMax[2]);

            let targets = subData.morphtargets.targets;
            // glTF do not support in-between blendshape
            for (const targetName in targets) {

                let channel = morphData.getMorphChannel(targetName);
                if (!channel) {
                    channel = new MorphTargetChannel();
                    channel.name = targetName;

                    let target = new MorphTarget();
                    target.name = targetName;
                    target.data = new Float32Array(vertexCount * targetVertexFloatStride).fill(0);

                    channel.addTarget(target);
                    morphData.addMorphChannel(channel);
                }

                let target = channel.getTargetByIndex(0);
                let morphMap = targets[targetName];

                for (let vertexIndex = 0; vertexIndex < subData.vertexCount; vertexIndex++) {
                    let morphPosition = morphMap.get("POSITION");
                    if (morphPosition) {
                        let posElement = morphVertexDec.getVertexElementByUsage(VertexMesh.MESH_POSITION0);
                        let offset = posElement.offset / 4;
                        target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset] = morphPosition[vertexIndex * 3];
                        target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset + 1] = morphPosition[vertexIndex * 3 + 1];
                        target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset + 2] = morphPosition[vertexIndex * 3 + 2];
                    }

                    let morphNormal = morphMap.get("NORMAL");
                    if (morphNormal) {
                        let normalElement = morphVertexDec.getVertexElementByUsage(VertexMesh.MESH_NORMAL0);
                        let offset = normalElement.offset / 4;
                        target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset] = morphNormal[vertexIndex * 3];
                        target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset + 1] = morphNormal[vertexIndex * 3 + 1];
                        target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset + 2] = morphNormal[vertexIndex * 3 + 2];
                    }
                    let morphTangent = morphMap.get("TANGENT");
                    if (morphTangent) {
                        let tangentElement = morphVertexDec.getVertexElementByUsage(VertexMesh.MESH_TANGENT0);
                        let offset = tangentElement.offset / 4;
                        target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset] = morphTangent[vertexIndex * 3];
                        target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset + 1] = morphTangent[vertexIndex * 3 + 1];
                        target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset + 2] = morphTangent[vertexIndex * 3 + 2];
                        target.data[(vertexIndex + subVertexOffset) * targetVertexFloatStride + offset + 3] = subData.attributeMap.get("TANGENT")[vertexIndex * 4 + 3];
                    }
                }
            }

            subVertexOffset += subData.vertexCount;
        }

        bounds.setMin(min);
        bounds.setMax(max);

        mesh.morphTargetData = morphData;
        morphData.initData();
    }

    /**
     * 创建 Mesh
     * @param mesh 
     */
    protected createMesh(glTFMesh: glTF.glTFMesh, glTFSkin?: glTF.glTFSkin): Mesh {
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
            let vertexCount: number = position.length / 3;
            let indexArray: Uint32Array = this.getIndexBuffer(glTFMeshPrimitive.indices, vertexCount);
            let positionAccessor = this._data.accessors[attributes.POSITION];

            let normal: Float32Array = this.getArrributeBuffer(attributes.NORMAL, "NORMAL", attributeMap, vertexDeclarArr);
            /**
             * When normals are not specified, client implementations MUST calculate flat normals and the provided tangents (if present) MUST be ignored.
             */
            if (!normal) {
                normal = this.calculateFlatNormal(position, indexArray);
                vertexDeclarArr.push("NORMAL");
                attributeMap.set("NORMAL", normal);
            }

            let color: Float32Array = this.getArrributeBuffer(attributes.COLOR_0, "COLOR", attributeMap, vertexDeclarArr);
            let uv: Float32Array = this.getArrributeBuffer(attributes.TEXCOORD_0, "UV", attributeMap, vertexDeclarArr);
            let uv1: Float32Array = this.getArrributeBuffer(attributes.TEXCOORD_1, "UV1", attributeMap, vertexDeclarArr);
            let blendWeight: Float32Array = this.getArrributeBuffer(attributes.WEIGHTS_0, "BLENDWEIGHT", attributeMap, vertexDeclarArr);
            let blendIndices: Float32Array = this.getArrributeBuffer(attributes.JOINTS_0, "BLENDINDICES", attributeMap, vertexDeclarArr);

            let tangent: Float32Array;
            tangent = this.getArrributeBuffer(attributes.TANGENT, "TANGENT", attributeMap, vertexDeclarArr);
            // :(
            if (tangent) {
                for (let tangentIndex = 0; tangentIndex < tangent.length; tangentIndex += 4) {
                    tangent[tangentIndex + 3] *= -1;
                }
            }

            // todo  vertex color
            // if (color) {
            //     let material = glTFUtils._glTFMaterials[glTFMeshPrimitive.material];
            //     material.enableVertexColor = true;
            // }

            let targets: { [name: string]: number }[] = glTFMeshPrimitive.targets;
            let morphtargets: SubMorphData = { weights: morphWeights, position: false, normal: false, tangent: false, targets: {}, boundMin: [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE], boundMax: [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE] };
            if (targets) {

                let morphtargetMap: { [name: string]: Map<string, Float32Array> };
                let targetNames = glTFMesh.extras?.targetNames || [];
                morphtargetMap = morphtargets.targets;

                targets.forEach((target, index) => {
                    let targetName = targetNames[index] || `target_${index}`;
                    let morph = new Map<string, Float32Array>();
                    morphtargetMap[targetName] = morph;

                    let morphPosition = <Float32Array>this.getBufferwithAccessorIndex(target.POSITION);
                    let morphNormal = <Float32Array>this.getBufferwithAccessorIndex(target.NORMAL);
                    let morphTangent = <Float32Array>this.getBufferwithAccessorIndex(target.TANGENT);

                    if (morphPosition) {
                        morph.set("POSITION", morphPosition);
                        morphtargets.position = true;

                        if (position) {
                            let vertexCount: number = position.length / 3;

                            for (let i = 0; i < vertexCount; i++) {
                                let offset = i * 3;

                                let morphX = position[offset] + morphPosition[offset];
                                let morphY = position[offset + 1] + morphPosition[offset + 1];
                                let morphZ = position[offset + 2] + morphPosition[offset + 2];

                                morphtargets.boundMin[0] = Math.min(morphX, morphtargets.boundMin[0]);
                                morphtargets.boundMin[1] = Math.min(morphY, morphtargets.boundMin[1]);
                                morphtargets.boundMin[2] = Math.min(morphZ, morphtargets.boundMin[2]);

                                morphtargets.boundMax[0] = Math.max(morphX, morphtargets.boundMax[0]);
                                morphtargets.boundMax[1] = Math.max(morphY, morphtargets.boundMax[1]);
                                morphtargets.boundMax[2] = Math.max(morphZ, morphtargets.boundMax[2]);
                            }
                        }

                    }
                    if (morphNormal) {
                        morph.set("NORMAL", morphNormal);
                        morphtargets.normal = true;
                    }
                    if (morphTangent) {
                        morph.set("TANGENT", morphTangent);
                        morphtargets.tangent = true;
                    }
                });
            }

            let boneIndicesList: Array<Uint16Array> = new Array<Uint16Array>();
            let subIndexStartArray: number[] = [];
            let subIndexCountArray: number[] = [];

            if (glTFSkin) {
                if (boneCount > maxSubBoneCount) {
                    // todo 划分 subMesh
                    this.splitSubMeshByBonesCount(attributeMap, morphtargets, indexArray, boneIndicesList, subIndexStartArray, subIndexCountArray);
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
            subData.boundMax = positionAccessor.max;
            subData.boundMin = positionAccessor.min;
            subData.morphtargets = morphtargets;
            subData.indices = indexArray;
            subData.vertexCount = vertexCount;
            subData.vertexDecler = vertexDeclaration;
            subData.boneIndicesList = boneIndicesList;
            subData.subIndexStartArray = subIndexStartArray;
            subData.subIndexCountArray = subIndexCountArray;
        });

        this.parseMeshwithSubMeshData(subDatas, layaMesh);
        this.applyglTFSkinData(layaMesh, subDatas, glTFSkin);
        this.applyMorphTarget(layaMesh, subDatas);
        return layaMesh;
    }

    /**
     * 计算 SkinnedMeshSprite3D local bounds
     * @param skinned 
     */
    private calSkinnedSpriteLocalBounds(skinned: Sprite3D): void {
        let render: SkinnedMeshRenderer = skinned.getComponent(SkinnedMeshRenderer);
        let mesh: Mesh = skinned.getComponent(MeshFilter).sharedMesh;
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
        render.localBounds = render.localBounds;
    }

    /**
     * @internal
     * 补全 skinnedMeshSprite 所需数据
     * @param glTFNode 
     * @param skinned 
     */
    private fixSkinnedSprite(glTFNode: glTF.glTFNode, skinned: Sprite3D): void {
        let skin: glTF.glTFSkin = this._data.skins[glTFNode.skin];
        let skinnedMeshRenderer: SkinnedMeshRenderer = skinned.getComponent(SkinnedMeshRenderer);
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
                    let glTFNode: glTF.glTFNode = this._data.nodes[nodeArr[index]];
                    if (isContainNode(glTFNode.children, findNodeIndex)) {
                        return true;
                    }
                }
            }
            return true;
        }

        let target: glTF.glTFAnimationChannelTarget = channels[0].target;
        let spriteIndex: number = target.node;
        for (let index = 0; index < this._data.scenes.length; index++) {
            let glTFScene: glTF.glTFScene = this._data.scenes[index];
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
            let animatorLayer: AnimatorControllerLayer = new AnimatorControllerLayer("AnimatorLayer");
            animator.addControllerLayer(animatorLayer);
            animatorLayer.defaultWeight = 1.0;
        }

        let clip: AnimationClip = this.createAnimatorClip(animation, animatorRoot);
        let animatorLayer: AnimatorControllerLayer = animator.getControllerLayer();

        let animationName: string = clip.name;

        if (animatorLayer.getAnimatorState(animationName)) {
            animationName = clip.name = `${animationName}_${this.generateId(animationName)}`;
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
    protected createAnimatorClip(animation: glTF.glTFAnimation, animatorRoot: Sprite3D): AnimationClip {
        let clip: AnimationClip = new AnimationClip();

        let duration: number = 0;

        let channels: glTF.glTFAnimationChannel[] = animation.channels;
        let samplers: glTF.glTFAnimationSampler[] = animation.samplers;

        let clipNodes: ClipNode[] = [];
        channels.forEach((channel: glTF.glTFAnimationChannel, index: number) => {
            let target: glTF.glTFAnimationChannelTarget = channel.target;
            let sampler: glTF.glTFAnimationSampler = samplers[channel.sampler];
            let targetPath: glTF.glTFAnimationChannelTargetPath = target.path;

            let timeBuffer = this.getBufferwithAccessorIndex(sampler.input);
            let outBuffer = this.getBufferwithAccessorIndex(sampler.output);

            let timeArray = new Float32Array(timeBuffer);
            let outArray = new Float32Array(outBuffer);

            let sprite: Sprite3D = this._nodes[target.node];

            let animaPaths = this.getAnimationPath(animatorRoot, sprite);

            if (targetPath == glTF.glTFAnimationChannelTargetPath.WEIGHTS) {

                let mesh = sprite.getComponent(MeshFilter)?.sharedMesh;
                if (mesh && mesh.morphTargetData) {

                    let ownerStr = sprite.getComponent(SkinnedMeshRenderer) ? "SkinnedMeshRenderer" : "MeshRenderer";

                    let morphData = mesh.morphTargetData;
                    let channelCount = morphData.channelCount;
                    // check data 
                    if (outArray.length / timeArray.length == channelCount) {
                        for (let channelIndex = 0; channelIndex < channelCount; channelIndex++) {
                            let morphChannel = morphData.getMorphChannelbyIndex(channelIndex);
                            let channelName = morphChannel.name;

                            let clipNode: ClipNode = {};
                            clipNodes.push(clipNode);
                            clipNode.paths = animaPaths;
                            clipNode.interpolation = sampler.interpolation;
                            clipNode.timeArray = timeArray;
                            clipNode.valueArray = new Float32Array(timeArray.length);
                            for (let i = 0; i < timeArray.length; i++) {
                                clipNode.valueArray[i] = outArray[i * channelCount + channelIndex];
                            }

                            clipNode.propertyOwner = ownerStr;
                            clipNode.propertise = [];
                            clipNode.propertise.push("morphTargetValues");
                            clipNode.propertise.push(channelName);
                            clipNode.propertyLength = clipNode.propertise.length;
                            clipNode.type = 0;
                            clipNode.callbackFunc = "_changeMorphTargetValue";
                            clipNode.callbackParams = [channelName];
                            clipNode.propertyChangePath = "morphTargetValues";

                            clipNode.duration = clipNode.timeArray[clipNode.timeArray.length - 1];
                            duration = Math.max(duration, clipNode.duration);
                        }
                    }
                }
            }
            else {
                let clipNode: ClipNode = {};
                clipNodes.push(clipNode);
                clipNode.timeArray = timeArray;
                clipNode.valueArray = outArray;
                let interpolation = sampler.interpolation;
                clipNode.interpolation = interpolation;

                clipNode.paths = animaPaths;

                switch (targetPath) {
                    case glTF.glTFAnimationChannelTargetPath.TRANSLATION:
                        clipNode.propertyOwner = "transform";
                        clipNode.propertyLength = 1;
                        clipNode.propertise = [];
                        clipNode.propertise.push("localPosition");
                        clipNode.type = 1;
                        break;
                    case glTF.glTFAnimationChannelTargetPath.ROTATION:
                        clipNode.propertyOwner = "transform";
                        clipNode.propertyLength = 1;
                        clipNode.propertise = [];
                        clipNode.propertise.push("localRotation");
                        clipNode.type = 2;
                        break;
                    case glTF.glTFAnimationChannelTargetPath.SCALE:
                        clipNode.propertyOwner = "transform";
                        clipNode.propertyLength = 1;
                        clipNode.propertise = [];
                        clipNode.propertise.push("localScale");
                        clipNode.type = 3;
                        break;
                    default:
                        break;
                }

                clipNode.duration = clipNode.timeArray[clipNode.timeArray.length - 1];
                duration = Math.max(duration, clipNode.duration);
            }
        });

        clip.name = animation.name ? animation.name : `Animation_${this.generateId("Animation")}`;
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

            let glTFClipNode: ClipNode = clipNodes[i];

            nodes.setNodeByIndex(i, node);
            node._indexInList = i;
            // todo type
            let type: number = node.type = glTFClipNode.type;
            let pathLength: number = glTFClipNode.paths.length;
            node._setOwnerPathCount(pathLength);
            let tempPath: string[] = glTFClipNode.paths;
            for (let j: number = 0; j < pathLength; j++) {
                node._setOwnerPathByIndex(j, tempPath[j]);
            }
            let nodePath: string = node._joinOwnerPath("/");
            let mapArray: KeyframeNode[] = nodesMap[nodePath];
            (mapArray) || (nodesMap[nodePath] = mapArray = []);
            mapArray.push(node);
            node.propertyOwner = glTFClipNode.propertyOwner;
            let propertyLength: number = glTFClipNode.propertyLength;
            node._setPropertyCount(propertyLength);
            for (let j: number = 0; j < propertyLength; j++) {
                node._setPropertyByIndex(j, glTFClipNode.propertise[j]);
            }
            let fullPath: string = nodePath + "." + node.propertyOwner + "." + node._joinProperty(".");
            nodesDic[fullPath] = fullPath;
            node.fullPath = fullPath;

            node.callbackFunData = glTFClipNode.callbackFunc;
            node.callParams = glTFClipNode.callbackParams;
            node.propertyChangePath = glTFClipNode.propertyChangePath;

            let keyframeCount: number = glTFClipNode.timeArray.length;

            // laya animation version "LAYAANIMATION:04"
            for (let j: number = 0; j < keyframeCount; j++) {
                switch (type) {
                    case 0:
                        let floatKeyFrame = new FloatKeyframe();
                        node._setKeyframeByIndex(j, floatKeyFrame);
                        floatKeyFrame.time = glTFClipNode.timeArray[j];

                        switch (glTFClipNode.interpolation) {
                            case glTF.glTFAnimationSamplerInterpolation.CUBICSPLINE:
                                {
                                    floatKeyFrame.value = glTFClipNode.valueArray[3 * j + 1];
                                    // todo
                                    floatKeyFrame.inTangent = glTFClipNode.valueArray[3 * j + 0];
                                    floatKeyFrame.outTangent = glTFClipNode.valueArray[3 * j + 2];
                                }
                                break;
                            case glTF.glTFAnimationSamplerInterpolation.STEP:
                                floatKeyFrame.value = glTFClipNode.valueArray[j];
                                floatKeyFrame.inTangent = Infinity;
                                floatKeyFrame.outTangent = Infinity;
                                break;
                            case glTF.glTFAnimationSamplerInterpolation.LINEAR:
                            default:
                                {
                                    floatKeyFrame.value = glTFClipNode.valueArray[j];

                                    let lastI = j == 0 ? j : j - 1;
                                    let lastTime = glTFClipNode.timeArray[lastI];
                                    let lastValue = glTFClipNode.valueArray[lastI];
                                    let lastTimeDet = lastI == j ? 1 : (floatKeyFrame.time - lastTime);

                                    floatKeyFrame.inTangent = (floatKeyFrame.value - lastValue) / lastTimeDet;

                                    let nextI = j == keyframeCount - 1 ? j : j + 1;
                                    let nextTime = glTFClipNode.timeArray[nextI];
                                    let nextValue = glTFClipNode.valueArray[nextI];
                                    let nextTimeDet = nextI == j ? 1 : (nextTime - floatKeyFrame.time);

                                    floatKeyFrame.outTangent = (nextValue - floatKeyFrame.value) / nextTimeDet;

                                    if (lastI == j) {
                                        floatKeyFrame.inTangent = floatKeyFrame.outTangent;
                                    }
                                    if (nextI == j) {
                                        floatKeyFrame.outTangent = floatKeyFrame.inTangent;
                                    }
                                }
                                break;
                        }

                        break;
                    case 1: // local position
                    case 3: // local scale
                    case 4: // local euler angler raw
                        let floatArrayKeyframe: Vector3Keyframe = new Vector3Keyframe();
                        node._setKeyframeByIndex(j, floatArrayKeyframe);
                        let startTimev3: number = floatArrayKeyframe.time = glTFClipNode.timeArray[j];
                        let inTangent: Vector3 = floatArrayKeyframe.inTangent;
                        let outTangent: Vector3 = floatArrayKeyframe.outTangent;
                        let value: Vector3 = floatArrayKeyframe.value;

                        switch (glTFClipNode.interpolation) {
                            case glTF.glTFAnimationSamplerInterpolation.CUBICSPLINE:
                                value.setValue(glTFClipNode.valueArray[9 * j + 3], glTFClipNode.valueArray[9 * j + 4], glTFClipNode.valueArray[9 * j + 5]);
                                inTangent.setValue(glTFClipNode.valueArray[9 * j + 0], glTFClipNode.valueArray[9 * j + 1], glTFClipNode.valueArray[9 * j + 2]);
                                outTangent.setValue(glTFClipNode.valueArray[9 * j + 6], glTFClipNode.valueArray[9 * j + 7], glTFClipNode.valueArray[9 * j + 8]);
                                break;
                            case glTF.glTFAnimationSamplerInterpolation.STEP:
                                value.setValue(glTFClipNode.valueArray[3 * j], glTFClipNode.valueArray[3 * j + 1], glTFClipNode.valueArray[3 * j + 2]);
                                inTangent.setValue(Infinity, Infinity, Infinity);
                                outTangent.setValue(Infinity, Infinity, Infinity);
                                break;
                            case glTF.glTFAnimationSamplerInterpolation.LINEAR:
                            default:
                                {
                                    value.setValue(glTFClipNode.valueArray[3 * j], glTFClipNode.valueArray[3 * j + 1], glTFClipNode.valueArray[3 * j + 2]);

                                    let lastI = j == 0 ? j : j - 1;
                                    let lastTime = glTFClipNode.timeArray[lastI];
                                    let lastX = glTFClipNode.valueArray[3 * lastI];
                                    let lastY = glTFClipNode.valueArray[3 * lastI + 1];
                                    let lastZ = glTFClipNode.valueArray[3 * lastI + 2];

                                    let lastTimeDet = lastI == j ? 1 : startTimev3 - lastTime;
                                    inTangent.x = (value.x - lastX) / lastTimeDet;
                                    inTangent.y = (value.y - lastY) / lastTimeDet;
                                    inTangent.z = (value.z - lastZ) / lastTimeDet;

                                    let nextI = j == keyframeCount - 1 ? j : j + 1;
                                    let nextTime = glTFClipNode.timeArray[nextI];
                                    let nextX = glTFClipNode.valueArray[3 * nextI];
                                    let nextY = glTFClipNode.valueArray[3 * nextI + 1];
                                    let nextZ = glTFClipNode.valueArray[3 * nextI + 2];

                                    let nestTimeDet = nextI == j ? 1 : nextTime - startTimev3;
                                    outTangent.x = (nextX - value.x) / nestTimeDet;
                                    outTangent.y = (nextY - value.y) / nestTimeDet;
                                    outTangent.z = (nextZ - value.z) / nestTimeDet;

                                    if (lastI == j) {
                                        outTangent.cloneTo(inTangent);
                                    }
                                    if (nextI == j) {
                                        inTangent.cloneTo(outTangent);
                                    }
                                }
                                break;
                        }
                        break;
                    case 2: // local rotation
                        let quaternionKeyframe: QuaternionKeyframe = new QuaternionKeyframe();
                        node._setKeyframeByIndex(j, quaternionKeyframe);
                        let startTimeQu: number = quaternionKeyframe.time = glTFClipNode.timeArray[j];
                        let inTangentQua: Vector4 = quaternionKeyframe.inTangent;
                        let outTangentQua: Vector4 = quaternionKeyframe.outTangent;
                        let valueQua: Quaternion = quaternionKeyframe.value;
                        switch (glTFClipNode.interpolation) {
                            case glTF.glTFAnimationSamplerInterpolation.CUBICSPLINE:
                                valueQua.set(glTFClipNode.valueArray[12 * j + 4], glTFClipNode.valueArray[12 * j + 5], glTFClipNode.valueArray[12 * j + 6], glTFClipNode.valueArray[12 * j + 7]);
                                inTangentQua.setValue(glTFClipNode.valueArray[12 * j + 0], glTFClipNode.valueArray[12 * j + 1], glTFClipNode.valueArray[12 * j + 2], glTFClipNode.valueArray[12 * j + 3]);
                                outTangentQua.setValue(glTFClipNode.valueArray[12 * j + 8], glTFClipNode.valueArray[12 * j + 9], glTFClipNode.valueArray[12 * j + 10], glTFClipNode.valueArray[12 * j + 11]);
                                break;
                            case glTF.glTFAnimationSamplerInterpolation.STEP:
                                valueQua.set(glTFClipNode.valueArray[4 * j + 0], glTFClipNode.valueArray[4 * j + 1], glTFClipNode.valueArray[4 * j + 2], glTFClipNode.valueArray[4 * j + 3]);
                                inTangentQua.setValue(Infinity, Infinity, Infinity, Infinity);
                                outTangentQua.setValue(Infinity, Infinity, Infinity, Infinity);
                                break;

                            case glTF.glTFAnimationSamplerInterpolation.LINEAR:
                            default:
                                {
                                    valueQua.set(glTFClipNode.valueArray[4 * j + 0], glTFClipNode.valueArray[4 * j + 1], glTFClipNode.valueArray[4 * j + 2], glTFClipNode.valueArray[4 * j + 3]);

                                    let lastI = j == 0 ? j : j - 1;
                                    let lastTime = glTFClipNode.timeArray[lastI];
                                    let lastX = glTFClipNode.valueArray[4 * lastI];
                                    let lastY = glTFClipNode.valueArray[4 * lastI + 1];
                                    let lastZ = glTFClipNode.valueArray[4 * lastI + 2];
                                    let lastW = glTFClipNode.valueArray[4 * lastI + 3];

                                    let lastTimeDet = lastI == j ? 1 : startTimeQu - lastTime;
                                    inTangentQua.x = (valueQua.x - lastX) / lastTimeDet;
                                    inTangentQua.y = (valueQua.y - lastY) / lastTimeDet;
                                    inTangentQua.z = (valueQua.z - lastZ) / lastTimeDet;
                                    inTangentQua.w = (valueQua.w - lastW) / lastTimeDet;

                                    let nextI = j == keyframeCount - 1 ? j : j + 1;
                                    let nextTime = glTFClipNode.timeArray[nextI];
                                    let nextX = glTFClipNode.valueArray[4 * nextI];
                                    let nextY = glTFClipNode.valueArray[4 * nextI + 1];
                                    let nextZ = glTFClipNode.valueArray[4 * nextI + 2];
                                    let nextW = glTFClipNode.valueArray[4 * nextI + 3];

                                    if ((valueQua.x * nextX + valueQua.y * nextY + valueQua.z * nextZ + valueQua.w * nextW) < 0) {
                                        nextX *= -1;
                                        nextY *= -1;
                                        nextZ *= -1;
                                        nextW *= -1;
                                        glTFClipNode.valueArray[4 * nextI] = nextX;
                                        glTFClipNode.valueArray[4 * nextI + 1] = nextY;
                                        glTFClipNode.valueArray[4 * nextI + 2] = nextZ;
                                        glTFClipNode.valueArray[4 * nextI + 3] = nextW;
                                    }

                                    let nestTimeDet = nextI == j ? 1 : nextTime - startTimeQu;
                                    outTangentQua.x = (nextX - valueQua.x) / nestTimeDet;
                                    outTangentQua.y = (nextY - valueQua.y) / nestTimeDet;
                                    outTangentQua.z = (nextZ - valueQua.z) / nestTimeDet;
                                    outTangentQua.w = (nextW - valueQua.w) / nestTimeDet;

                                    if (lastI == j) {
                                        outTangentQua.cloneTo(inTangentQua);
                                    }
                                    if (nextI == j) {
                                        inTangentQua.cloneTo(outTangentQua);
                                    }

                                }
                                break;
                        }
                        break;
                }
            }
        }

        clipNodes = null;

        return clip;
    }
}

/**
 * @internal
 * 辅助记录 sub morph data 所需数据
 */
class SubMorphData {
    weights: number[];
    position: boolean;
    boundMin: number[];
    boundMax: number[];
    normal: boolean;
    tangent: boolean;
    targets: { [name: string]: Map<string, Float32Array> }
}

/**
 * @internal
 * 辅助记录 submesh 所需数据
 */
class PrimitiveSubMesh {

    attributeMap: Map<string, Float32Array>;
    boundMin: number[];
    boundMax: number[];
    indices: Uint32Array;
    vertexDecler: string;
    vertexCount: number;
    boneIndicesList: Uint16Array[];
    subIndexStartArray: number[];
    subIndexCountArray: number[];

    morphtargets: SubMorphData;

    constructor() {

    }
}

/**
 * @internal
 * 辅助记录 animator clip 所需数据
 */
interface ClipNode {
    paths?: string[];
    propertyOwner?: string;
    propertyLength?: number;
    propertise?: string[];
    timeArray?: Float32Array;
    valueArray?: Float32Array;
    interpolation?: glTF.glTFAnimationSamplerInterpolation;
    duration?: number;
    type?: number;
    callbackFunc?: string;
    callbackParams?: any[];
    propertyChangePath?: string;
}

Laya.addInitCallback(() => glTFShader.init());
