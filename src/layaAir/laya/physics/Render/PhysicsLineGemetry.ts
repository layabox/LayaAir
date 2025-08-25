import { LayaGL } from "../../layagl/LayaGL";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { PhysicsLineShader } from "./shader/PhysicsLineShader";

/**
 * @en Physics line geometry class
 * @zh 物理线段几何体类
 */
export class PhysicsLineGemetry {
    
    private _positions: number[] = []; // 缓存线段位置数据
    
    private _needUpdate: boolean = true;
    
    private _maxLineNumer: number = 200; // 最大线段数量
    
    private _enLarge: number = 100; // 扩展线段数量
    
    private _renderGeometry: IRenderGeometryElement;
    
    private _positionInstansBufferData: Float32Array;
    
    private _positionVertexBuffer: IVertexBuffer;
    
    private _lineLengthBufferData: Float32Array;
    
    private _lineLengthVertexBuffer: IVertexBuffer;
    
    /**
     * @en Set the line segment data in the format [beginX, beginY, endX, endY, beginX, beginY, endX, endY, ...]. Data must be in multiples of 4
     * @zh 设置线段数据，格式为[beginX,beginY,endX,endY,beginX,beginY,endX,endY,...]，数据必须是4的倍数
     */
    get positions(): number[] {
        return this._positions;
    }
    
    set positions(value: number[]) {
        if ((value.length / 4) != ((value.length / 4) | 0)) // 不是4的倍数直接返回
            return;
        this._positions = value;
        this._needUpdate = true;
    }
    
    /**
     * @en Get the render geometry
     * @zh 获取渲染几何体
     */
    get renderGeometry(): IRenderGeometryElement {
        return this._renderGeometry;
    }
    
    /**
     * @en Clear all line segments
     * @zh 清空所有线段
     */
    clear(): void {
        this._positions.length = 0;
        this._needUpdate = true;
    }
    
    /**
     * @en Update geometry data
     * @zh 更新几何体数据
     */
    updateGeometry(): void {
        if (!this._needUpdate) return;
        this._needUpdate = false;
        this._changeGeometry();
    }
    
    /**
     * @en Initialize render geometry
     * @zh 初始化渲染几何体
     */
    initRender(): void {
        let lineNums = this._maxLineNumer;
        
        // 创建位置缓冲区
        let positionBuffer = this._positionVertexBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        positionBuffer.instanceBuffer = true;
        positionBuffer.vertexDeclaration = PhysicsLineShader.linePoisitionDesc;
        positionBuffer.setDataLength(lineNums * 16);
        this._positionInstansBufferData = new Float32Array(lineNums * 4);
        positionBuffer.setData(this._positionInstansBufferData.buffer, 0, 0, this._positionInstansBufferData.byteLength);
        
        // 创建线段长度缓冲区
        let lineLengthBuffer = this._lineLengthVertexBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        lineLengthBuffer.instanceBuffer = true;
        lineLengthBuffer.vertexDeclaration = PhysicsLineShader.lineLengthDesc;
        lineLengthBuffer.setDataLength(lineNums * 4);
        this._lineLengthBufferData = new Float32Array(lineNums * 1);
        lineLengthBuffer.setData(this._lineLengthBufferData.buffer, 0, 0, this._lineLengthBufferData.byteLength);
        
        // 初始化几何体
        let geometry = this._renderGeometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElementInstance);
        geometry.bufferState = LayaGL.renderDeviceFactory.createBufferState();
        geometry.setDrawElemenParams(6, 0);
        geometry.indexFormat = IndexFormat.UInt16;
        geometry.instanceCount = 0;
        
        // 设置缓冲区状态
        let buffers = [];
        buffers.push(PhysicsLineShader._vbs);
        buffers.push(this._positionVertexBuffer);
        buffers.push(this._lineLengthVertexBuffer);
        geometry.bufferState.applyState(buffers, PhysicsLineShader._ibs);
    }
    
    /**
     * @en Change geometry data
     * @zh 改变几何体数据
     */
    private _changeGeometry(): void {
        let lineLength = this._positions.length / 4;
        if (lineLength > this._maxLineNumer) {
            // 重新创建缓冲区
            this._maxLineNumer = (((lineLength / this._enLarge) | 0) + 1) * this._enLarge;
            this._positionInstansBufferData = new Float32Array(this._maxLineNumer * 4);
            this._positionVertexBuffer.setDataLength(this._maxLineNumer * 16);
            this._lineLengthBufferData = new Float32Array(this._maxLineNumer * 1);
            this._lineLengthVertexBuffer.setDataLength(this._maxLineNumer * 4);
            this._renderGeometry.bufferState.applyState([PhysicsLineShader._vbs, this._positionVertexBuffer, this._lineLengthVertexBuffer], PhysicsLineShader._ibs);
        }
        
        // 更新位置数据
        this._positionInstansBufferData.set(this._positions, 0);
        this._positionVertexBuffer.setData(this._positionInstansBufferData.buffer, 0, 0, this._positionInstansBufferData.byteLength);
        
        // 计算线段长度数据（用于UV纹理）
        if (true) { // add uv texture
            let totalLength = 0;
            for (var i = 0; i < lineLength; i++) {
                const dataIndex = i * 4;
                this._lineLengthBufferData[i] = totalLength;
                totalLength += Math.hypot(this._positions[dataIndex + 2] - this._positions[dataIndex], this._positions[dataIndex + 3] - this._positions[dataIndex + 1]);
            }
            this._lineLengthVertexBuffer.setData(this._lineLengthBufferData.buffer, 0, 0, this._lineLengthBufferData.byteLength);
        }
        
        // 设置实例数量
        this._renderGeometry.instanceCount = lineLength;
    }
    
    /**
     * @en Constructor
     * @zh 构造函数
     */
    constructor() {
        this.initRender();
    }
}
