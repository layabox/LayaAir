import { ILaya } from "../../../../ILaya";
import { Loader } from "../../../net/Loader";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { Resource } from "../../../resource/Resource";
import { Handler } from "../../../utils/Handler";
import { IClone } from "../../../utils/IClone";
import { InstanceRenderElement } from "../../core/render/InstanceRenderElement";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { Bounds } from "../../math/Bounds";
import { SubMesh } from "./SubMesh";
import { Color } from "../../../maths/Color";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { VertexElement } from "../../../renders/VertexElement";
import { BufferState } from "../../../webgl/utils/BufferState";
import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";
import { MorphTargetData } from "./MorphTargetData";
import { Config } from "../../../../Config";
import { Laya3D } from "../../../../Laya3D";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { NotReadableError } from "../../../utils/Error";
/**
 * @internal
 */
export class skinnedMatrixCache {
    readonly subMeshIndex: number;
    readonly batchIndex: number;
    readonly batchBoneIndex: number;
    constructor(subMeshIndex: number, batchIndex: number, batchBoneIndex: number) {
        this.subMeshIndex = subMeshIndex;
        this.batchIndex = batchIndex;
        this.batchBoneIndex = batchBoneIndex;
    }
}

/**
 * @en Mesh class is used to create a template for file mesh data.
 * @zh Mesh 类用于创建文件网格数据模板。
 */
export class Mesh extends Resource implements IClone {
    /**@internal */
    static MESH_INSTANCEBUFFER_TYPE_NORMAL: number = 0;
    /**@internal */
    static MESH_INSTANCEBUFFER_TYPE_SIMPLEANIMATOR: number = 1;

    /**@internal */
    _convexMesh: any;
    /**@interanl */
    _triangleMesh: any;
    /**@internal */
    __convexMesh: Mesh;
    /**
      * @internal
      */
    static __init__(): void {
    }


    /**
     * @en Loads a mesh template from the specified URL and calls the complete callback upon completion.
     * @param url The URL of the mesh template.
     * @param complete The callback function to call when the mesh is loaded.
     * @zh 从指定的URL加载网格模板，并在加载完成后执行完成回调。
     * @param url 网格模板的URL。
     * @param complete 加载完成后的回调函数。
     */
    static load(url: string, complete: Handler): void {
        ILaya.loader.load(url, complete, null, Loader.MESH);
    }

    /** @internal */
    private _btTriangleMesh: number;
    /** @internal */
    private _minVerticesUpdate: number = -1;
    /** @internal */
    private _maxVerticesUpdate: number = -1;
    /** @internal */
    private _needUpdateBounds: boolean = true;
    /** @internal */
    private _bounds: Bounds;

    /** @internal */
    _isReadable: boolean;
    /** @internal */
    _bufferState: BufferState = new BufferState();
    /** @internal */
    _instanceBufferState: BufferState;
    /** @internal */
    _instanceBufferStateType: number = 0;
    /**@internal */
    _instanceWorldVertexBuffer: VertexBuffer3D
    /**@internal */
    _instanceSimpleAniVertexBuffer: VertexBuffer3D
    /**@internal */
    _instanceLightMapVertexBuffer: VertexBuffer3D
    /** @internal */
    _subMeshes: SubMesh[];
    /** @internal */
    _vertexBuffer: VertexBuffer3D = null;
    /** @internal */
    _indexBuffer: IndexBuffer3D = null;

    /** @internal */
    _boneNames: string[];
    /** @internal */
    _inverseBindPoses: Matrix4x4[];
    /** @internal */
    _skinnedMatrixCaches: skinnedMatrixCache[] = [];
    /** @internal */
    _vertexCount: number = 0;
    /** @internal */
    _indexFormat: IndexFormat = IndexFormat.UInt16;

    /** @internal */
    instanceLightMapScaleOffsetData: Float32Array;

    /**
     * @en Morph target data for the mesh.
     * @zh 网格的变形目标数据。
     */
    morphTargetData: MorphTargetData;

    /** @internal */
    _width: number;

    /** @internal */
    _height: number;

    /**
     * @en The array of inverse absolute bind poses for the mesh.
     * @zh 网格的全局默认绑定动作逆矩阵数组。
     */
    get inverseAbsoluteBindPoses(): Matrix4x4[] {
        return this._inverseBindPoses;
    }

    /**
     * @en The number of vertices in the mesh.
     * @zh 网格中的顶点数。
     */
    get vertexCount(): number {
        return this._vertexCount;
    }

    /**
     * @en The number of indices in the mesh.
     * @zh 网格中的索引个数。
     */
    get indexCount(): number {
        return this._indexBuffer.indexCount;
    }

    /**
     * @en The number of SubMeshes in the mesh.
     * @zh 子网格的个数。
     */
    get subMeshCount(): number {
        return this._subMeshes.length;
    }

    /**
     * @en The bounds of the mesh.
     * @zh 网格的边界
     */
    get bounds(): Bounds {
        return this._bounds;
    }

    set bounds(value: Bounds) {
        if (this._bounds !== value)
            value.cloneTo(this._bounds);
    }

    /**
     * @en The index format of the mesh.
     * @zh 网格的索引格式。
     */
    get indexFormat(): IndexFormat {
        return this._indexFormat;
    }

    set indexFormat(value: IndexFormat) {
        this._indexFormat = value
        this._subMeshes.forEach(element => {
            element.indexFormat = value;
        });
    }

    /**
     * @en Constructor method, do not use.
     * @param isReadable 是否可读。
     * @zh 构造方法，禁止使用。
     * @param isReadable 是否可读。
     */
    constructor(isReadable: boolean = true) {
        super();
        this._bounds = new Bounds(new Vector3(), new Vector3());
        this._isReadable = isReadable;
        this._subMeshes = [];
        this.destroyedImmediately = Config.destroyResourceImmediatelyDefault;
    }

    /**
     * @internal
     */
    private _getPositionElement(vertexBuffer: VertexBuffer3D): VertexElement {
        var vertexElements: any[] = vertexBuffer.vertexDeclaration._vertexElements;
        for (var i: number = 0, n: number = vertexElements.length; i < n; i++) {
            var vertexElement: VertexElement = vertexElements[i];
            if (vertexElement._elementFormat === VertexElementFormat.Vector3 && vertexElement._elementUsage === VertexMesh.MESH_POSITION0)
                return vertexElement;
        }
        return null;
    }


    /**
     * @internal
     */
    private _getVerticeElementData(data: Array<Vector2 | Vector3 | Vector4 | Color>, elementUsage: number): void {
        data.length = this._vertexCount;
        var verDec: VertexDeclaration = this._vertexBuffer.vertexDeclaration;
        var element: VertexElement = verDec.getVertexElementByUsage(elementUsage);
        if (element) {
            var uint8Vertices: Uint8Array = this._vertexBuffer.getUint8Data();
            var floatVertices: Float32Array = this._vertexBuffer.getFloat32Data();
            var uint8VerStr: number = verDec.vertexStride;
            var floatVerStr: number = uint8VerStr / 4;
            var uint8EleOffset: number = element._offset;
            var floatEleOffset: number = uint8EleOffset / 4;

            switch (elementUsage) {
                case VertexMesh.MESH_TEXTURECOORDINATE0:
                case VertexMesh.MESH_TEXTURECOORDINATE1:
                    for (var i: number = 0; i < this._vertexCount; i++) {
                        var offset: number = floatVerStr * i + floatEleOffset;
                        data[i] = new Vector2(floatVertices[offset], floatVertices[offset + 1]);
                    }
                    break;
                case VertexMesh.MESH_POSITION0:
                case VertexMesh.MESH_NORMAL0:
                    for (var i: number = 0; i < this._vertexCount; i++) {
                        var offset: number = floatVerStr * i + floatEleOffset;
                        data[i] = new Vector3(floatVertices[offset], floatVertices[offset + 1], floatVertices[offset + 2]);
                    }
                    break;
                case VertexMesh.MESH_TANGENT0:
                case VertexMesh.MESH_BLENDWEIGHT0:
                    for (var i: number = 0; i < this._vertexCount; i++) {
                        var offset: number = floatVerStr * i + floatEleOffset;
                        data[i] = new Vector4(floatVertices[offset], floatVertices[offset + 1], floatVertices[offset + 2], floatVertices[offset + 3]);
                    }
                    break;
                case VertexMesh.MESH_COLOR0:
                    for (var i: number = 0; i < this._vertexCount; i++) {
                        var offset: number = floatVerStr * i + floatEleOffset;
                        data[i] = new Color(floatVertices[offset], floatVertices[offset + 1], floatVertices[offset + 2], floatVertices[offset + 3]);
                    }
                    break;
                case VertexMesh.MESH_BLENDINDICES0:
                    for (var i: number = 0; i < this._vertexCount; i++) {
                        var offset: number = uint8VerStr * i + uint8EleOffset;
                        data[i] = new Vector4(uint8Vertices[offset], uint8Vertices[offset + 1], uint8Vertices[offset + 2], uint8Vertices[offset + 3]);
                    }
                    break;
                default:
                    throw "Mesh:Unknown elementUsage.";
            }
        }
    }

    /**
     * @internal
     */
    private _setVerticeElementData(data: Array<Vector2 | Vector3 | Vector4 | Color>, elementUsage: number): void {
        var verDec: VertexDeclaration = this._vertexBuffer.vertexDeclaration;
        var element: VertexElement = verDec.getVertexElementByUsage(elementUsage);
        if (element) {
            var uint8Vertices: Uint8Array = this._vertexBuffer.getUint8Data();
            var floatVertices: Float32Array = this._vertexBuffer.getFloat32Data();
            var uint8VerStr: number = verDec.vertexStride;
            var float8VerStr: number = uint8VerStr / 4;
            var uint8EleOffset: number = element._offset;
            var floatEleOffset: number = uint8EleOffset / 4;
            switch (elementUsage) {
                case VertexMesh.MESH_TEXTURECOORDINATE0:
                case VertexMesh.MESH_TEXTURECOORDINATE1:
                    for (var i: number = 0, n: number = data.length; i < n; i++) {
                        var offset: number = float8VerStr * i + floatEleOffset;
                        var vec2: Vector2 = <Vector2>data[i];
                        floatVertices[offset] = vec2.x;
                        floatVertices[offset + 1] = vec2.y;
                    }
                    break;
                case VertexMesh.MESH_POSITION0:
                case VertexMesh.MESH_NORMAL0:
                    for (var i: number = 0, n: number = data.length; i < n; i++) {
                        var offset: number = float8VerStr * i + floatEleOffset;
                        var vec3: Vector3 = <Vector3>data[i];
                        floatVertices[offset] = vec3.x;
                        floatVertices[offset + 1] = vec3.y;
                        floatVertices[offset + 2] = vec3.z;
                    }
                    break;
                case VertexMesh.MESH_TANGENT0:
                case VertexMesh.MESH_BLENDWEIGHT0:
                    for (var i: number = 0, n: number = data.length; i < n; i++) {
                        var offset: number = float8VerStr * i + floatEleOffset;
                        var vec4: Vector4 = <Vector4>data[i];
                        floatVertices[offset] = vec4.x;
                        floatVertices[offset + 1] = vec4.y;
                        floatVertices[offset + 2] = vec4.z;
                        floatVertices[offset + 3] = vec4.w;
                    }
                    break;
                case VertexMesh.MESH_COLOR0:
                    for (var i: number = 0, n: number = data.length; i < n; i++) {
                        var offset: number = float8VerStr * i + floatEleOffset;
                        var cor: Color = <Color>data[i];
                        floatVertices[offset] = cor.r;
                        floatVertices[offset + 1] = cor.g;
                        floatVertices[offset + 2] = cor.b;
                        floatVertices[offset + 3] = cor.a;
                    }
                    break;
                case VertexMesh.MESH_BLENDINDICES0:
                    for (var i: number = 0, n: number = data.length; i < n; i++) {
                        var offset: number = uint8VerStr * i + uint8EleOffset;
                        var vec4: Vector4 = <Vector4>data[i];
                        uint8Vertices[offset] = vec4.x;
                        uint8Vertices[offset + 1] = vec4.y;
                        uint8Vertices[offset + 2] = vec4.z;
                        uint8Vertices[offset + 3] = vec4.w;
                    }
                    break;
                default:
                    throw "Mesh:Unknown elementUsage.";
            }
            this._minVerticesUpdate = 0;
            this._maxVerticesUpdate = Number.MAX_SAFE_INTEGER;
        }
        else {
            console.warn("Mesh: the mesh don't have  this VertexElement.");
            //TODO:vertexBuffer结构发生变化
        }
    }

    /**
     * 销毁资源
     * @internal
     * @inheritDoc
     * @override
     */
    protected _disposeResource(): void {
        for (var i: number = 0, n: number = this._subMeshes.length; i < n; i++)
            this._subMeshes[i].destroy();
        //this._btTriangleMesh && Physics3D._bullet.btStridingMeshInterface_destroy(this._btTriangleMesh);
        this._vertexBuffer && this._vertexBuffer.destroy();
        this._indexBuffer && this._indexBuffer.destroy();
        this._bufferState.destroy();
        this._instanceBufferState && this._instanceBufferState.destroy();
        this._instanceWorldVertexBuffer && this._instanceWorldVertexBuffer.destroy();
        this._instanceSimpleAniVertexBuffer && this._instanceSimpleAniVertexBuffer.destroy();
        this._instanceLightMapVertexBuffer && this._instanceLightMapVertexBuffer.destroy();
        this.instanceLightMapScaleOffsetData && (this.instanceLightMapScaleOffsetData = null);
        this._setCPUMemory(0);
        this._setGPUMemory(0);
        this._bufferState = null;
        this._instanceBufferState = null;
        this._vertexBuffer = null;
        this._indexBuffer = null;
        this._subMeshes = null;
        this._btTriangleMesh = null;
        this._indexBuffer = null;
        this._boneNames = null;
        this._inverseBindPoses = null;
        this.morphTargetData && (this.morphTargetData.destroy());
        this.__convexMesh && this.__convexMesh.destroy();
    }

    /**
     *@internal
     */
    _setSubMeshes(subMeshes: SubMesh[]): void {
        this._subMeshes = subMeshes
        for (var i: number = 0, n: number = subMeshes.length; i < n; i++)
            subMeshes[i]._indexInMesh = i;
    }


    /**
     * @internal
     */
    _setBuffer(vertexBuffer: VertexBuffer3D, indexBuffer: IndexBuffer3D): void {
        var bufferState: BufferState = this._bufferState;
        bufferState.applyState([vertexBuffer], indexBuffer);
    }

    /**
     * @internal
     */
    _setInstanceBuffer() {
        if (this._instanceBufferState)
            return;
        var instanceBufferState: BufferState = this._instanceBufferState = new BufferState();
        var instanceBufferStateType = this._instanceBufferStateType;
        let vertexArray = [];
        vertexArray.push(this._vertexBuffer);
        //new Instance VertexBuffer3D
        let instanceBuffer3D: VertexBuffer3D = this._instanceWorldVertexBuffer = Laya3DRender.renderOBJCreate.createVertexBuffer3D(InstanceRenderElement.maxInstanceCount * 16 * 4, BufferUsage.Dynamic, false);;
        instanceBuffer3D.vertexDeclaration = VertexMesh.instanceWorldMatrixDeclaration;
        instanceBuffer3D.instanceBuffer = true;
        vertexArray.push(instanceBuffer3D);
        switch (instanceBufferStateType) {
            case Mesh.MESH_INSTANCEBUFFER_TYPE_SIMPLEANIMATOR:
                //new SimpleVertexBuffer3D
                let instanceSimpleAnimatorBuffer = this._instanceSimpleAniVertexBuffer = Laya3DRender.renderOBJCreate.createVertexBuffer3D(InstanceRenderElement.maxInstanceCount * 4 * 4, BufferUsage.Dynamic, false);
                instanceSimpleAnimatorBuffer.vertexDeclaration = VertexMesh.instanceSimpleAnimatorDeclaration;
                instanceSimpleAnimatorBuffer.instanceBuffer = true;
                vertexArray.push(instanceSimpleAnimatorBuffer);
                break;
            case Mesh.MESH_INSTANCEBUFFER_TYPE_NORMAL:
                //have uv1
                if (this.getVertexDeclaration().getVertexElementByUsage(VertexMesh.MESH_TEXTURECOORDINATE1)) {
                    let instanceLightMapVertexBuffer = this._instanceLightMapVertexBuffer = Laya3DRender.renderOBJCreate.createVertexBuffer3D(InstanceRenderElement.maxInstanceCount * 4 * 4, BufferUsage.Dynamic, false);
                    instanceLightMapVertexBuffer.vertexDeclaration = VertexMesh.instanceLightMapScaleOffsetDeclaration;
                    instanceLightMapVertexBuffer.instanceBuffer = true;
                    this.instanceLightMapScaleOffsetData = new Float32Array(InstanceRenderElement.maxInstanceCount * 4);
                    vertexArray.push(instanceLightMapVertexBuffer);
                }
                break;
        }
        instanceBufferState.applyState(vertexArray, this._indexBuffer);
    }

    /**
     * @internal
     */
    _uploadVerticesData(): void {
        var min: number = this._minVerticesUpdate;
        var max: number = this._maxVerticesUpdate;
        if (min !== -1 && max !== -1) {
            var offset: number = min;
            this._vertexBuffer.setData(this._vertexBuffer.getUint8Data().buffer, offset, offset, max - min);
            this._minVerticesUpdate = -1;
            this._maxVerticesUpdate = -1;
        }
    }

    /**
     * @en Retrieves a sub-mesh based on the index.
     * @param index The index of the sub-mesh.
     * @returns The sub-mesh at the specified index.
     * @zh 根据索引获取子网格。
     * @param index 子网格的索引。
     * @returns 索引处的子网格。
     */
    getSubMesh(index: number): SubMesh {
        return this._subMeshes[index];
    }

    /**
     * @en Copies and fills position data into an array.
     * @param positions The array to fill with position data.
     * @remark This method is a copy operation, which may be time-consuming.
     * @zh 拷贝并填充位置数据至数组。
     * @param positions 用于填充位置数据的数组。
     * @remark 该方法为拷贝操作，比较耗费性能。
     */
    getPositions(positions: Vector3[]): void {
        if (this._isReadable)
            this._getVerticeElementData(positions, VertexMesh.MESH_POSITION0);
        else
            throw new NotReadableError();
    }

    /**
     * @en Sets the position data.
     * @param positions The new position data to set.
     * @zh 设置位置数据。
     * @param positions 要设置的新位置数据。
     */
    setPositions(positions: Vector3[]): void {
        if (this._isReadable) {
            this._setVerticeElementData(positions, VertexMesh.MESH_POSITION0);
            this._needUpdateBounds = true;
        }
        else {
            throw new NotReadableError();
        }
    }

    /**
     * @en Copies and fills color data into an array.
     * @param colors The array to fill with color data.
     * @remark This method is a copy operation, which may be time-consuming.
     * @zh 拷贝并填充颜色数据至数组。
     * @param colors 用于填充颜色数据的数组。
     * @remark 该方法为拷贝操作，比较耗费性
     */
    getColors(colors: Color[]): void {
        if (this._isReadable)
            this._getVerticeElementData(colors, VertexMesh.MESH_COLOR0);
        else
            throw new NotReadableError();
    }

    /**
     * @en Sets the color data.
     * @param colors The new color data to set.
     * @zh 设置颜色数据。
     * @param colors 要设置的新颜色数据。
     */
    setColors(colors: Color[]): void {
        if (this._isReadable)
            this._setVerticeElementData(colors, VertexMesh.MESH_COLOR0);
        else
            throw new NotReadableError();
    }

    /**
     * @en Copies and fills texture coordinate data into an array.
     * @param uvs The array to fill with texture coordinate data.
     * @param channel The texture coordinate channel.
     * @remark This method is a copy operation, which may be time-consuming.
     * @zh 拷贝并填充纹理坐标数据至数组。
     * @param uvs 纹理坐标数组。
     * @param channel 纹理坐标通道。
     * @remark 该方法为拷贝操作，比较耗费性能。
     */
    getUVs(uvs: Vector2[], channel: number = 0): void {
        if (this._isReadable) {
            switch (channel) {
                case 0:
                    this._getVerticeElementData(uvs, VertexMesh.MESH_TEXTURECOORDINATE0);
                    break;
                case 1:
                    this._getVerticeElementData(uvs, VertexMesh.MESH_TEXTURECOORDINATE1);
                    break;
                default:
                    throw "Mesh:Invalid channel.";
            }
        }
        else {
            throw new NotReadableError();
        }
    }

    /**
     * @en Sets the texture coordinate data.
     * @param uvs The new texture coordinate data to set.
     * @param channel The texture coordinate channel.
     * @zh 设置纹理坐标数据。
     * @param uvs 要设置的新纹理坐标数据。
     * @param channel 纹理坐标通道。
     */
    setUVs(uvs: Vector2[], channel: number = 0): void {
        if (this._isReadable) {
            switch (channel) {
                case 0:
                    this._setVerticeElementData(uvs, VertexMesh.MESH_TEXTURECOORDINATE0);
                    break;
                case 1:
                    this._setVerticeElementData(uvs, VertexMesh.MESH_TEXTURECOORDINATE1);
                    break;
                default:
                    throw "Mesh:Invalid channel.";
            }
        }
        else {
            throw new NotReadableError();
        }
    }

    /**
     * @en Copies and fills normal data into an array.
     * @param normals The array to fill with normal data.
     * @remark This method is a copy operation, which may be time-consuming.
     * @zh 拷贝并填充法线数据至数组。
     * @param normals 用于填充法线数据的数组。
     * @remark 该方法为拷贝操作，比较耗费性能。
     */
    getNormals(normals: Vector3[]): void {
        if (this._isReadable)
            this._getVerticeElementData(normals, VertexMesh.MESH_NORMAL0);
        else
            throw new NotReadableError();
    }

    /**
     * @en Sets the normal data.
     * @param normals The new normal data to set.
     * @zh 设置法线数据。
     * @param normals 要设置的新法线数据。
     */
    setNormals(normals: Vector3[]): void {
        if (this._isReadable)
            this._setVerticeElementData(normals, VertexMesh.MESH_NORMAL0);
        else
            throw new NotReadableError();
    }

    /**
     * @en Copies and fills tangent data into an array.
     * @param tangents The array to fill with tangent data.
     * @zh 拷贝并填充切线数据至数组。
     * @param tangents 用于填充切线数据的数组。
     */
    getTangents(tangents: Vector4[]): void {
        if (this._isReadable)
            this._getVerticeElementData(tangents, VertexMesh.MESH_TANGENT0);
        else
            throw new NotReadableError();
    }

    /**
     * @en Sets the tangent data.
     * @param tangents The new tangent data to set.
     * @zh 设置切线数据。
     * @param tangents 要设置的新切线数据。
     */
    setTangents(tangents: Vector4[]): void {
        if (this._isReadable)
            this._setVerticeElementData(tangents, VertexMesh.MESH_TANGENT0);
        else
            throw new NotReadableError();
    }

    /**
     * @en Copies and fills bone weight data into an array.
     * @param boneWeights The array to fill with bone weight data.
     * @zh 拷贝并填充骨骼权重数据至数组。
     * @param boneWeights 用于填充骨骼权重数据的数组。
     */
    getBoneWeights(boneWeights: Vector4[]): void {
        if (this._isReadable)
            this._getVerticeElementData(boneWeights, VertexMesh.MESH_BLENDWEIGHT0);
        else
            throw new NotReadableError();
    }

    /**
     * @en Copy and fill the bone weight data into the array.
     * @param boneWeights Bone weight data.
     * @zh 拷贝并填充骨骼权重数据至数组。
     * @param boneWeights 骨骼权重。
     */
    setBoneWeights(boneWeights: Vector4[]): void {
        if (this._isReadable)
            this._setVerticeElementData(boneWeights, VertexMesh.MESH_BLENDWEIGHT0);
        else
            throw new NotReadableError();
    }

    /**
     * @en Gets the bone indices.
     * @param boneIndices The bone indices
     * @zh 获取骨骼索引。
     * @param boneIndices 骨骼索引。
     */
    getBoneIndices(boneIndices: Vector4[]): void {
        if (this._isReadable)
            this._getVerticeElementData(boneIndices, VertexMesh.MESH_BLENDINDICES0);
        else
            throw new NotReadableError();
    }

    /**
     * @en Sets the bone index data.
     * @param boneIndices The new bone index data to set.
     * @zh 设置骨骼索引数据。
     * @param boneIndices 要设置的新骨骼索引数据。
     */
    setBoneIndices(boneIndices: Vector4[]): void {
        if (this._isReadable)
            this._setVerticeElementData(boneIndices, VertexMesh.MESH_BLENDINDICES0);
        else
            throw new NotReadableError();
    }


    /**
     * @en Marks the Mesh as non-readable, which can reduce memory usage. Once marked, no read methods can be called.
     * @zh 将Mesh标记为不可读，可以减少内存使用。标记后，不能再调用任何读取方法。
     */
    markAsUnreadbale(): void {
        this._uploadVerticesData();
        this._vertexBuffer.markAsUnreadbale();
        this._isReadable = false;
    }

    /**
     * @en Gets the vertex declaration.
     * @zh 获取顶点声明。
     */
    getVertexDeclaration(): VertexDeclaration {
        return this._vertexBuffer.vertexDeclaration;
    }

    /**
     * @en Copies and retrieves a copy of the vertex data.
     * @returns A copy of the vertex data.
     * @zh 拷贝并获取顶点数据的副本。
     * @returns 顶点数据副本。
     */
    getVertices(): ArrayBuffer {
        if (this._isReadable)
            return this._vertexBuffer.getUint8Data().buffer.slice(0);
        else
            throw new NotReadableError();
    }

    /**
     * @en Sets the vertex data.
     * @param vertices The vertex data to set.
     * @zh 设置顶点数据。
     * @param vertices 要设置的顶点数据。
     */
    setVertices(vertices: ArrayBuffer): void {
        this._vertexBuffer.setData(vertices);
        this._needUpdateBounds = true;
    }

    /**
     * @en Copies and retrieves a copy of the mesh indices.
     * @returns A copy of the mesh indices.
     * @zh 拷贝并获取网格索引的副本。
     * @returns 网格索引的副本。
     */
    getIndices(): Uint8Array | Uint16Array | Uint32Array {
        if (this._isReadable)
            return this._indexBuffer.getData().slice();
        else
            throw new NotReadableError();
    }

    /**
     * @en Sets the mesh indices.
     * @param indices The mesh indices to set.
     * @zh 设置网格索引。
     * @param indices 要设置的网格索引。
     */
    setIndices(indices: Uint8Array | Uint16Array | Uint32Array): void {
        var format: IndexFormat;
        if (indices instanceof Uint32Array)
            format = IndexFormat.UInt32;
        else if (indices instanceof Uint16Array)
            format = IndexFormat.UInt16;
        else if (indices instanceof Uint8Array)
            format = IndexFormat.UInt8;

        var indexBuffer: IndexBuffer3D = this._indexBuffer;
        if (this._indexFormat !== format || indexBuffer.indexCount !== indices.length) {//format chang and length chang will recreate the indexBuffer
            indexBuffer.destroy();
            this._indexBuffer = indexBuffer = Laya3DRender.renderOBJCreate.createIndexBuffer3D(format, indices.length, BufferUsage.Static, this._isReadable);
        }
        indexBuffer.setData(indices);
        this.indexFormat = format;

    }


    /**
     * @en Generates a bounding box from the model's position data.
     * @zh 从模型位置数据生成包围盒。
     */
    calculateBounds(): void {
        if (this._isReadable) {
            if (this._needUpdateBounds) {
                var min: Vector3 = _tempVector30;
                var max: Vector3 = _tempVector31;
                min.x = min.y = min.z = Number.MAX_VALUE;
                max.x = max.y = max.z = -Number.MAX_VALUE;

                var vertexBuffer: VertexBuffer3D = this._vertexBuffer;
                var positionElement: VertexElement = this._getPositionElement(vertexBuffer);
                var verticesData: Float32Array = vertexBuffer.getFloat32Data();
                var floatCount: number = vertexBuffer.vertexDeclaration.vertexStride / 4;
                var posOffset: number = positionElement._offset / 4;
                for (var j: number = 0, m: number = verticesData.length; j < m; j += floatCount) {
                    var ofset: number = j + posOffset;
                    var pX: number = verticesData[ofset];
                    var pY: number = verticesData[ofset + 1];
                    var pZ: number = verticesData[ofset + 2];
                    min.x = Math.min(min.x, pX);
                    min.y = Math.min(min.y, pY);
                    min.z = Math.min(min.z, pZ);
                    max.x = Math.max(max.x, pX);
                    max.y = Math.max(max.y, pY);
                    max.z = Math.max(max.z, pZ);
                }
                this._bounds.setMin(min);
                this._bounds.setMax(max);
                this._needUpdateBounds = false;
            }
        }
        else {
            throw new NotReadableError();
        }
    }

    /**
     * @en Gets the convex model.
     * @returns The convex mesh.
     * @zh 获取凸包模型。
     * @returns 凸包网格。
     */
    getCorveMesh(): Mesh {
        if (this._convexMesh == null) {
            return null;
        }
        if (this.__convexMesh == null && Laya3D._PhysicsCreateUtil && Laya3D._PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_CreateCorveMesh)) {
            this.__convexMesh = Laya3D._PhysicsCreateUtil.createCorveMesh(this);
        }
        return this.__convexMesh;
    }

    /**
     * @en Clones this mesh to the destination object.
     * @param destObject The destination object to clone to.
     * @zh 克隆当前网格到目标对象。
     * @param destObject 克隆的目标对象。
     */
    cloneTo(destObject: Mesh): void {//[实现IClone接口]
        var vb: VertexBuffer3D = this._vertexBuffer;
        var destVB: VertexBuffer3D = Laya3DRender.renderOBJCreate.createVertexBuffer3D(vb._byteLength, vb.bufferUsage, vb.canRead);
        destVB.vertexDeclaration = vb.vertexDeclaration;
        destVB.setData(vb.getUint8Data().slice().buffer);
        destObject._vertexBuffer = destVB;
        destObject._vertexCount = this._vertexCount;
        var ib: IndexBuffer3D = this._indexBuffer;
        var destIB: IndexBuffer3D = Laya3DRender.renderOBJCreate.createIndexBuffer3D(IndexFormat.UInt16, ib.indexCount, ib.bufferUsage, ib.canRead);
        destIB.setData(ib.getData().slice());
        destObject._indexBuffer = destIB;

        destObject._setBuffer(destObject._vertexBuffer, destIB);
        destObject._instanceBufferStateType = this._instanceBufferStateType;

        destObject._setCPUMemory(this.cpuMemory);
        destObject._setGPUMemory(this.gpuMemory);

        var i: number;
        var boneNames: string[] = this._boneNames;
        if (boneNames) {
            var destBoneNames: string[] = destObject._boneNames = [];
            for (i = 0; i < boneNames.length; i++)
                destBoneNames[i] = boneNames[i];
        }

        var inverseBindPoses: Matrix4x4[] = this._inverseBindPoses;
        if (inverseBindPoses) {
            var destInverseBindPoses: Matrix4x4[] = destObject._inverseBindPoses = [];
            for (i = 0; i < inverseBindPoses.length; i++)
                destInverseBindPoses[i] = inverseBindPoses[i];
        }
        if (this._inverseBindPosesBuffer) {
            let length = this._inverseBindPosesBuffer.byteLength;
            destObject._inverseBindPosesBuffer = new ArrayBuffer(length);
            new Uint8Array(destObject._inverseBindPosesBuffer).set(new Uint8Array(this._inverseBindPosesBuffer));
        }

        var cacheLength: number = this._skinnedMatrixCaches.length;
        destObject._skinnedMatrixCaches.length = cacheLength;
        for (i = 0; i < cacheLength; i++) {
            var skinnedCache: skinnedMatrixCache = this._skinnedMatrixCaches[i];
            if (skinnedCache)
                destObject._skinnedMatrixCaches[i] = new skinnedMatrixCache(skinnedCache.subMeshIndex, skinnedCache.batchIndex, skinnedCache.batchBoneIndex);
        }

        for (i = 0; i < this.subMeshCount; i++) {
            var subMesh: SubMesh = this._subMeshes[i];
            var subIndexBufferStart: number[] = subMesh._subIndexBufferStart;
            var subIndexBufferCount: number[] = subMesh._subIndexBufferCount;
            var boneIndicesList: Uint16Array[] = subMesh._boneIndicesList;
            var destSubmesh: SubMesh = new SubMesh(destObject);

            destSubmesh._subIndexBufferStart.length = subIndexBufferStart.length;
            destSubmesh._subIndexBufferCount.length = subIndexBufferCount.length;
            destSubmesh._boneIndicesList.length = boneIndicesList.length;

            for (var j: number = 0; j < subIndexBufferStart.length; j++)
                destSubmesh._subIndexBufferStart[j] = subIndexBufferStart[j];
            for (j = 0; j < subIndexBufferCount.length; j++)
                destSubmesh._subIndexBufferCount[j] = subIndexBufferCount[j];
            for (j = 0; j < boneIndicesList.length; j++)
                destSubmesh._boneIndicesList[j] = new Uint16Array(boneIndicesList[j]);

            destSubmesh._indexBuffer = destIB;
            destSubmesh._indexStart = subMesh._indexStart;
            destSubmesh._indexCount = subMesh._indexCount;
            destSubmesh._indices = new Uint16Array(destIB.getData().buffer, subMesh._indexStart * 2, subMesh._indexCount);
            var vertexBuffer: VertexBuffer3D = destObject._vertexBuffer;
            destSubmesh._vertexBuffer = vertexBuffer;
            destObject._subMeshes.push(destSubmesh);
        }
        destObject._setSubMeshes(destObject._subMeshes);

        if (this.morphTargetData) {
            destObject.morphTargetData = this.morphTargetData.clone();
        }
    }

    /**
     * @en Clones this mesh.
     * @returns A clone of the current mesh.
     * @zh 克隆当前网格。
     * @return 当前网格的克隆副本。
     */
    clone(): any {//[实现IClone接口]
        var dest: Mesh = new Mesh();
        this.cloneTo(dest);
        return dest;
    }



    //------------------------------------------NATIVE----------------------------------------------------
    /** @internal */
    _inverseBindPosesBuffer: ArrayBuffer;
}

const _tempVector30: Vector3 = new Vector3()
const _tempVector31: Vector3 = new Vector3();