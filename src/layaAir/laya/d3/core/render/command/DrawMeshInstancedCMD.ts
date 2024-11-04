import { BufferUsage } from "../../../../RenderEngine/RenderEnum/BufferTargetType";
import { VertexBuffer3D } from "../../../graphics/VertexBuffer3D";
import { Mesh } from "../../../resource/models/Mesh";
import { Material } from "../../../../resource/Material";
import { Command } from "./Command";
import { CommandBuffer } from "./CommandBuffer";
import { MaterialInstancePropertyBlock } from "./MaterialInstancePropertyBlock";
import { RenderElement } from "../RenderElement";
import { MeshInstanceGeometry } from "../../../graphics/MeshInstanceGeometry";
import { RenderContext3D } from "../RenderContext3D";
import { BaseRender } from "../../../core/render/BaseRender";
import { MeshSprite3DShaderDeclaration } from "../../MeshSprite3DShaderDeclaration";
import { Camera } from "../../Camera";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { BufferState } from "../../../../webgl/utils/BufferState";
import { VertexMesh } from "../../../../RenderEngine/RenderShader/VertexMesh";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";
import { Transform3D } from "../../Transform3D";
import { DrawElementCMDData } from "../../../../RenderDriver/DriverDesign/3DRenderPass/IRender3DCMD";
import { IRenderElement3D } from "../../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";

/**
 * @en DrawMeshInstancedCMD class for instanced mesh drawing command.
 * @zh DrawMeshInstancedCMD 类，用于实例化网格绘制命令。
 */
export class DrawMeshInstancedCMD extends Command {
    /**@internal */
    private static _pool: DrawMeshInstancedCMD[] = [];
    /**
     * @en Maximum number of draw instances.
     * @zh 设置最大DrawInstance数。
     */
    static maxInstanceCount = 1024;

    /**
     * @internal
     * @en Create a command stream.
     * @param mesh The mesh to be drawn.
     * @param subMeshIndex The index of the sub-mesh.
     * @param matrixs Array of transformation matrices.
     * @param material The material to be used.
     * @param subShaderIndex The index of the sub-shader.
     * @param instanceProperty Material instance property block.
     * @param drawnums Number of instances to be drawn.
     * @param commandBuffer The command buffer.
     * @returns A new DrawMeshInstancedCMD instance.
     * @zh 创建一个命令流。
     * @param mesh 要绘制的网格。
     * @param subMeshIndex 子网格索引。
     * @param matrixs 变换矩阵数组。
     * @param material 要使用的材质。
     * @param subShaderIndex 子着色器索引。
     * @param instanceProperty 材质实例属性块。
     * @param drawnums 要绘制的实例数量。
     * @param commandBuffer 命令缓冲区。
     * @return 一个新的 DrawMeshInstancedCMD 实例。
     */
    static create(mesh: Mesh, subMeshIndex: number, matrixs: Matrix4x4[], material: Material, subShaderIndex: number, instanceProperty: MaterialInstancePropertyBlock, drawnums: number, commandBuffer: CommandBuffer): DrawMeshInstancedCMD {
        var cmd: DrawMeshInstancedCMD;
        if ((matrixs && matrixs.length > DrawMeshInstancedCMD.maxInstanceCount) || drawnums > DrawMeshInstancedCMD.maxInstanceCount) {
            throw "the number of renderings exceeds the maximum number of merges";
        }
        cmd = DrawMeshInstancedCMD._pool.length > 0 ? DrawMeshInstancedCMD._pool.pop() : new DrawMeshInstancedCMD();
        cmd._matrixs = matrixs;
        cmd.material = material;
        cmd._subMeshIndex = subMeshIndex;
        cmd._subShaderIndex = subShaderIndex;
        cmd._commandBuffer = commandBuffer;
        cmd._instanceProperty = instanceProperty;
        cmd._drawnums = drawnums;
        cmd.mesh = mesh;
        matrixs && cmd._updateWorldMatrixBuffer();
        cmd._setInstanceBuffer();
        return cmd;
    }

    /**@internal */
    private _material: Material;
    /**@internal */
    private _matrixs: Matrix4x4[];
    /**@internal */
    private _subMeshIndex: number;
    /**@internal */
    private _subShaderIndex: number = 0;
    /**@internal */
    private _mesh: Mesh;
    /**@internal */
    private _instanceProperty: MaterialInstancePropertyBlock;
    /** @internal */
    private _instanceBufferState: BufferState;
    /** @internal */
    private _drawnums: number;
    /**@internal 世界矩阵数据*/
    private _instanceWorldMatrixData: Float32Array;
    /**@internal 世界矩阵buffer*/
    private _instanceWorldMatrixBuffer: VertexBuffer3D;
    /**@internal */
    private _instanceGeometryArray: MeshInstanceGeometry[];
    /**@internal */
    private _instanceRenderElementArray: RenderElement[];
    /**@internal */
    _byteCount: number;
    /**@internal */
    _transform: Transform3D;
    /**@internal */
    _render: BaseRender;
    /**@internal */
    _drawElementCMDData: DrawElementCMDData;

    constructor() {
        super();
        this._transform = Laya3DRender.Render3DModuleDataFactory.createTransform(null);
        this._instanceRenderElementArray = [];
        this._instanceGeometryArray = [];
        this._instanceWorldMatrixData = new Float32Array(DrawMeshInstancedCMD.maxInstanceCount * 16);
        this._instanceWorldMatrixBuffer = Laya3DRender.renderOBJCreate.createVertexBuffer3D(this._instanceWorldMatrixData.length * 4, BufferUsage.Dynamic, false);
        this._instanceWorldMatrixBuffer.vertexDeclaration = VertexMesh.instanceWorldMatrixDeclaration;
        this._instanceWorldMatrixBuffer.instanceBuffer = true;
        this._render = new BaseRender();
        this._render._baseRenderNode.shaderData.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE);

        this._instanceBufferState = new BufferState();
        this._drawElementCMDData = Laya3DRender.Render3DPassFactory.createDrawElementCMDData();
    }
    /**
     * @en The material for the command.
     * @zh 命令的材质。
     */
    set material(value: Material) {
        this._material && this._material._removeReference(1);
        this._material = value;
        this._material && this._material._addReference(1);
    }

    /**
     * @en The buffer state.
     * @zh 缓冲状态。
     */
    get bufferState() {
        return this._instanceWorldMatrixBuffer;
    }

    /**
     * @en The mesh of the command.
     * @zh 命令的网格。
     */
    get mesh(): Mesh {
        return this._mesh;
    }

    set mesh(value: Mesh) {
        if (this._mesh == value)
            return;
        BaseRender.changeVertexDefine(this._mesh, value, this._render._baseRenderNode.shaderData);
        this._mesh = value;
        if (!this._mesh)
            return;
        let submeshs = this._mesh._subMeshes;
        if (this._subMeshIndex == -1) {
            for (let i = 0, n = submeshs.length; i < n; i++) {
                let element = this._instanceRenderElementArray[i] = this._instanceRenderElementArray[i] ? this._instanceRenderElementArray[i] : new RenderElement();
                let geometry = this._instanceGeometryArray[i] = this._instanceGeometryArray[i] ? this._instanceGeometryArray[i] : new MeshInstanceGeometry(submeshs[i]);
                element.setGeometry(geometry);
                element.transform = this._transform;
                element.material = this._material;
                // element.renderSubShader = this._material._shader.getSubShaderAt(this._subShaderIndex);
                element._subShaderIndex = this._subShaderIndex;
                element.render = this._render;
                element._renderElementOBJ.owner = this._render._baseRenderNode;

                geometry.bufferState = this._instanceBufferState;
                geometry.instanceCount = this._drawnums;
            }
        } else {
            let element = this._instanceRenderElementArray[0] = this._instanceRenderElementArray[0] ? this._instanceRenderElementArray[0] : new RenderElement();
            let geometry = this._instanceGeometryArray[0] = this._instanceGeometryArray[0] ? this._instanceGeometryArray[0] : new MeshInstanceGeometry(submeshs[this._subMeshIndex]);
            element.setGeometry(geometry);
            element.transform = this._transform;
            element.material = this._material;
            element.render = this._render;
            //element.renderSubShader = this._material._shader.getSubShaderAt(this._subShaderIndex);
            geometry.bufferState = this._instanceBufferState;
            geometry.instanceCount = this._drawnums;

            element._renderElementOBJ.owner = this._render._baseRenderNode

        }
    }


    /**
     * @internal
     */
    private _setInstanceBuffer(): void {
        let instanceBufferState = this._instanceBufferState;
        let vertexArray: Array<VertexBuffer3D> = [];
        let meshVertexBuffer = this._mesh._bufferState._vertexBuffers as VertexBuffer3D[];
        meshVertexBuffer.forEach(element => {
            vertexArray.push(element);
        });
        vertexArray.push(this._instanceWorldMatrixBuffer);
        let propertyMap = this._instanceProperty._propertyMap;
        for (let i in propertyMap) {
            vertexArray.push(propertyMap[i]._vertexBuffer);
        }
        instanceBufferState.applyState(vertexArray, this._mesh._indexBuffer);
        this._instanceGeometryArray.forEach(element => {
            element.bufferState = instanceBufferState;
        });
    }

    /**
     * 更新世界矩阵buffer
     * @internal
     */
    private _updateWorldMatrixBuffer() {
        let worldMatrixData: Float32Array = this._instanceWorldMatrixData;
        let count: number = this._drawnums;
        for (let i = 0; i < count; i++) {
            worldMatrixData.set(this._matrixs[i].elements, i * 16);
        }
        let worldBuffer: VertexBuffer3D = this._instanceWorldMatrixBuffer;
        //worldBuffer.setData();
        worldBuffer.setData(worldMatrixData.buffer, 0, 0, count * 64);
    }

    /**
     * @en Reset the world matrix array for DrawInstance.
     * @param worldMatrixArray Array of world matrices.
     * @zh 重置DrawInstance的世界矩阵数组。
     * @param worldMatrixArray 世界矩阵数组
     */
    setWorldMatrix(worldMatrixArray: Matrix4x4[]): void {
        if (worldMatrixArray.length < this._drawnums)
            throw "worldMatrixArray length is less then drawnums";
        this._matrixs = worldMatrixArray;
        this._matrixs && this._updateWorldMatrixBuffer();
    }

    /**
     * @en Reset the number of instances to draw.
     * @param drawNums Number of instances to draw.
     * @zh 重置渲染个数。
     * @param drawNums 渲染个数。
     */
    setDrawNums(drawNums: number): void {
        if (this._matrixs && this._matrixs.length < drawNums)
            throw "worldMatrixArray length is less then drawnums";
        this._drawnums = drawNums;
        let submeshs = this._mesh._subMeshes;
        if (this._subMeshIndex == -1) {
            for (let i = 0, n = submeshs.length; i < n; i++) {
                let geometry = this._instanceGeometryArray[i] ? this._instanceGeometryArray[i] : new MeshInstanceGeometry(submeshs[i]);
                geometry.instanceCount = this._drawnums;
            }
        } else {
            let geometry = this._instanceGeometryArray[0] ? this._instanceGeometryArray[0] : new MeshInstanceGeometry(submeshs[0]);
            geometry.instanceCount = this._drawnums;
        }
        this._matrixs && this._updateWorldMatrixBuffer();
    }

    /**
     * @override
     * @internal
     * @returns 
     */
    getRenderCMD(): DrawElementCMDData {
        return this._drawElementCMDData
    }

    /**
     * @en Update the render element.
     * @param renderElement The render element to update.
     * @param context The render context.
     * @returns The updated IRenderElement3D.
     * @zh 更新渲染元素。
     * @param renderElement 要更新的渲染元素。
     * @param context 渲染上下文。
     * @return 更新后的IRenderElement3D。
     */
    renderUpdateElement(renderElement: RenderElement, context: RenderContext3D): IRenderElement3D {
        let renderObj = renderElement._renderElementOBJ;
        renderObj.isRender = renderElement._geometry._prepareRender(context);
        renderElement._geometry._updateRenderParams(context);
        return renderObj;
    }

    /**
     * @en Execute the command.
     * @zh 执行命令。
     */
    run(): void {
        //update blockData
        let context = RenderContext3D._instance;
        context._contextOBJ.cameraUpdateMask = Camera._updateMark;
        let propertyMap = this._instanceProperty._propertyMap;
        for (let i in propertyMap) {
            //更新自定义Instancebuffer
            propertyMap[i].updateVertexBufferData(this._drawnums);
        }
        let submeshs = this.mesh._subMeshes;
        if (this._subMeshIndex == -1) {
            let arrayElement: IRenderElement3D[] = [];
            for (let i = 0, n = submeshs.length; i < n; i++) {
                let renderElement = this._instanceRenderElementArray[i];
                let renderObj = this.renderUpdateElement(renderElement, context);
                arrayElement.push(renderObj);
            }
            this._drawElementCMDData.setRenderelements(arrayElement);
        } else {
            let renderElement = this._instanceRenderElementArray[this._subMeshIndex];
            let renderObj = this.renderUpdateElement(renderElement, context);
            this._drawElementCMDData.setRenderelements([renderObj]);
        }
    }

    /**
     * @inheritDoc
     * @override
     * @en Recycle the command.
     * @zh 回收命令。
     */
    recover(): void {
        DrawMeshInstancedCMD._pool.push(this);
        super.recover();
        this._material && this._material._removeReference(1);
        this._material = null;
        this._instanceBufferState.destroy();
        this._instanceBufferState = null;
        delete this._instanceRenderElementArray;
        this._instanceRenderElementArray = [];
        delete this._instanceGeometryArray;
        this._instanceGeometryArray = [];
        this.mesh = null;

    }

    /**
     * @internal
     * @en Destroy the command.
     * @zh 销毁命令。
     */
    destroy(): void {
        super.destroy();
        this._material && this._material._removeReference(1);
        this._material = null;
        this._instanceBufferState.destroy();
        this._instanceBufferState = null;
        delete this._instanceRenderElementArray;
        this._instanceRenderElementArray = [];
        delete this._instanceGeometryArray;
        this._instanceGeometryArray = [];
        this.mesh = null;
    }

}