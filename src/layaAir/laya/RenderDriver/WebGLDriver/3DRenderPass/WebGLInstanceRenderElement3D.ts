import { MeshSprite3DShaderDeclaration } from "../../../d3/core/MeshSprite3DShaderDeclaration";
import { VertexBuffer3D } from "../../../d3/graphics/VertexBuffer3D";
import { SingletonList } from "../../../utils/SingletonList";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { WebGLShaderInstance } from "../RenderDevice/WebGLShaderInstance";
import { WebGLRenderContext3D } from "./WebGLRenderContext3D";
import { WebGLRenderElement3D } from "./WebGLRenderElement3D";

export class WebGLInstanceRenderElement3D extends WebGLRenderElement3D {

    static MaxInstanceCount: number = 1024;

    /**
     * @internal
     */
    private static _pool: WebGLInstanceRenderElement3D[] = [];

    static create(): WebGLInstanceRenderElement3D {
        let element = this._pool.pop() || new WebGLInstanceRenderElement3D();
        return element;
    }

    _instanceElementList: SingletonList<WebGLRenderElement3D>;

    private _vertexBuffers: Array<VertexBuffer3D> = [];
    private _updateData: Array<Float32Array> = [];
    private _updateDataNum: Array<number> = [];

    _invertFrontFace: boolean = true;

    protected _getInvertFront(): boolean {
        return this._invertFrontFace;
    }

    drawCount: number;
    updateNums: number;

    constructor() {
        super();
        this._instanceElementList = new SingletonList();
        this.drawCount = 0;
        this.updateNums = 0;
    }

    updateInstanceData() {
        this.geometry._id;
    }

    addUpdateBuffer(vb: VertexBuffer3D, length: number) {
        this._vertexBuffers[this.updateNums] = vb;
        this._updateDataNum[this.updateNums] = length;
        this.updateNums++;
    }

    getUpdateData(index: number, length: number): Float32Array {
        let data = this._updateData[index];
        if (!data || data.length < length) {
            data = this._updateData[index] = new Float32Array(length);
        }
        return data;
    }

    protected _compileShader(context: WebGLRenderContext3D) {
        let passes = this.subShader._passes;
        for (let i = 0; i < passes.length; i++) {
            let pass = passes[i];
            if (pass.pipelineMode != context.pipelineMode)
                continue;

            let comDef = WebGLRenderElement3D._compileDefine;
            if (context.sceneData) {
                context.sceneData._defineDatas.cloneTo(comDef);
            }
            else {
                context._globalConfigShaderData.cloneTo(comDef);
            }

            context.cameraData && comDef.addDefineDatas(context.cameraData._defineDatas);

            if (this.renderShaderData) {
                comDef.addDefineDatas(this.renderShaderData.getDefineData());
                pass.nodeCommonMap = this.owner._commonUniformMap;
            }
            else {
                pass.nodeCommonMap = null;
            }

            comDef.addDefineDatas(this.materialShaderData._defineDatas);

            comDef.add(MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE);

            let shaderIns = <WebGLShaderInstance>pass.withCompile(comDef);
            this._addShaderInstance(shaderIns);
        }
    }

    drawGeometry(shaderIns: WebGLShaderInstance): void {
        for (let i = 0; i < this.updateNums; i++) {
            let buffer = this._vertexBuffers[i];
            if (buffer)
                break;
            let data = this._updateData[i];
            buffer.setData(data.buffer, 0, 0, this.drawCount * this._updateDataNum[i] * 4);
        }
        WebGLEngine.instance.getDrawContext().drawGeometryElement(this.geometry);
    }

    clear() {
        this.updateNums = 0;
        this._instanceElementList.clean();

    }

    recover() {
        WebGLInstanceRenderElement3D._pool.push(this);
    }

    destroy(): void {
        super.destroy();
        // todo
    }
}