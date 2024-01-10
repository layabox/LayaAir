import { WGPUBindGroupHelper } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WGPUBindGroupHelper";
import { WGPUShaderVariable } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WGPUShaderVariable";
import { WebGPUBuffer } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WebGPUBuffer";
import { WebGPUEngine } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WebGPUEngine";
import { WebGPUInternalTex } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WebGPUInternalTex";
import { InternalRenderTarget } from "../../../RenderEngine/RenderInterface/InternalRenderTarget";
import { ShaderData } from "../../../RenderEngine/RenderShader/ShaderData";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Resource } from "../../../resource/Resource";
import { SingletonList } from "../../../utils/SingletonList";
export interface BindGroupResourceMap { [key: number]: WebGPUBuffer | WebGPUInternalTex };
/**
 * WGPU着色器数据类
 */
export class WGPUShaderData extends ShaderData {
    static arrayOne: Float32Array = new Float32Array(1);
    static arrayVec2: Float32Array = new Float32Array(2);
    static arrayVec3: Float32Array = new Float32Array(3);
    static arrayVec4: Float32Array = new Float32Array(4);

    /**@internal 反向找Material*/
    protected _ownerResource: Resource = null;
    protected _device: GPUDevice;
    /**@internal */
    protected _gammaColorMap: Map<number, Color>;
    /**@internal */
    _dataBindGroupResourceMap: BindGroupResourceMap = {};
    /**@internal key WebGPUShaderVariable */
    _dataBindGroupCacheMap: { [key: number]: ShaderDataCacheNode } = {};

    /**@internal */
    private changeList: SingletonList<number> = new SingletonList<number>();
    /**@internal ShaderProperty index 需要重新创建的bindGroup resource*/
    private reBindResourceList: SingletonList<number> = new SingletonList();
    /**@internal 需要重新创建BIndGroup的ShaderDataCacheNode*/
    private needReBuildDataCacheNode: SingletonList<ShaderDataCacheNode> = new SingletonList<ShaderDataCacheNode>();
    constructor(){
        super();
        this._device = (LayaGL.renderEngine as WebGPUEngine)._device;
    }
    private _setChangeFlag(index: number) {
        this.changeList.add(index);
    }

    private uploadUniformOneValue(value: number | boolean, index: number) {
        let gpubuffer = this._dataBindGroupResourceMap[index];
        if (typeof value == "boolean") {
            value = value ? 1 : 0;
        }
        // 更新number Buffer
        if (!gpubuffer || !(gpubuffer instanceof WebGPUBuffer) || (gpubuffer as WebGPUBuffer)._size != 4) {
            if (gpubuffer && gpubuffer instanceof WebGPUBuffer) {
                gpubuffer.destroy();
            }
            gpubuffer = this._dataBindGroupResourceMap[index] = (LayaGL.renderEngine as WebGPUEngine).createUniformBuffer(4);
            this.reBindResourceList.add(index);
        }
        WGPUShaderData.arrayOne[0] = value;
        this._device.queue.writeBuffer(gpubuffer._gpuBuffer, 0, WGPUShaderData.arrayOne.buffer, 0, 4);
    }

    private uploadUniformVec2Value(value: Vector2, index: number) {
        let gpubuffer = this._dataBindGroupResourceMap[index];
        let size = 8;
        // 更新number Buffer
        if (!gpubuffer || !(gpubuffer instanceof WebGPUBuffer) || (gpubuffer as WebGPUBuffer)._size != size) {
            if (gpubuffer && gpubuffer instanceof WebGPUBuffer) {
                gpubuffer.destroy();
            }
            gpubuffer = this._dataBindGroupResourceMap[index] = (LayaGL.renderEngine as WebGPUEngine).createUniformBuffer(size);
            this.reBindResourceList.add(index);
        }
        WGPUShaderData.arrayVec2[0] = value.x;
        WGPUShaderData.arrayVec2[1] = value.y;
        this._device.queue.writeBuffer(gpubuffer._gpuBuffer, 0, WGPUShaderData.arrayVec2.buffer, 0, size);
    }

    private uploadUniformVec3Value(value: Vector3, index: number) {
        let gpubuffer = this._dataBindGroupResourceMap[index];
        let size = 12;
        // 更新number Buffer
        if (!gpubuffer || !(gpubuffer instanceof WebGPUBuffer) || (gpubuffer as WebGPUBuffer)._size != size) {
            if (gpubuffer && gpubuffer instanceof WebGPUBuffer) {
                gpubuffer.destroy();
            }
            gpubuffer = this._dataBindGroupResourceMap[index] = (LayaGL.renderEngine as WebGPUEngine).createUniformBuffer(size);
            this.reBindResourceList.add(index);
        }
        WGPUShaderData.arrayVec3[0] = value.x;
        WGPUShaderData.arrayVec3[1] = value.y;
        WGPUShaderData.arrayVec3[2] = value.z;
        this._device.queue.writeBuffer(gpubuffer._gpuBuffer, 0, WGPUShaderData.arrayVec3.buffer, 0, size);
    }

    private uploadUniformVec4Value(value: Vector4, index: number) {
        let gpubuffer = this._dataBindGroupResourceMap[index];
        let size = 16;
        // 更新number Buffer
        if (gpubuffer || !(gpubuffer instanceof WebGPUBuffer) || (gpubuffer as WebGPUBuffer)._size != size) {
            if (gpubuffer && gpubuffer instanceof WebGPUBuffer) {
                gpubuffer.destroy();
            }
            gpubuffer = this._dataBindGroupResourceMap[index] = (LayaGL.renderEngine as WebGPUEngine).createUniformBuffer(size);
            this.reBindResourceList.add(index);
        }
        WGPUShaderData.arrayVec4[0] = value.x;
        WGPUShaderData.arrayVec4[1] = value.y;
        WGPUShaderData.arrayVec4[2] = value.z;
        WGPUShaderData.arrayVec4[3] = value.w;
        this._device.queue.writeBuffer(gpubuffer._gpuBuffer, 0, WGPUShaderData.arrayVec4.buffer, 0, size);
    }

    private uploadUniformMatValue(value: Matrix4x4, index: number) {
        let gpubuffer = this._dataBindGroupResourceMap[index];
        let size = 16 * 4;
        // 更新number Buffer
        if (gpubuffer || !(gpubuffer instanceof WebGPUBuffer) || (gpubuffer as WebGPUBuffer)._size != size) {
            if (gpubuffer && gpubuffer instanceof WebGPUBuffer) {
                gpubuffer.destroy();
            }
            gpubuffer = this._dataBindGroupResourceMap[index] = (LayaGL.renderEngine as WebGPUEngine).createUniformBuffer(size);
            this.reBindResourceList.add(index);
        }
        this._device.queue.writeBuffer(gpubuffer._gpuBuffer, 0, value.elements.buffer, 0, size);
    }

    private uploadUniformBufferValue(value: SharedArrayBuffer, index: number) {
        let gpubuffer = this._dataBindGroupResourceMap[index];
        let size = value.byteLength;
        // 更新number Buffer
        if (gpubuffer || !(gpubuffer instanceof WebGPUBuffer) || (gpubuffer as WebGPUBuffer)._size != size) {
            if (gpubuffer && gpubuffer instanceof WebGPUBuffer) {
                gpubuffer.destroy();
            }
            gpubuffer = this._dataBindGroupResourceMap[index] = (LayaGL.renderEngine as WebGPUEngine).createUniformBuffer(size);
            this.reBindResourceList.add(index);
        }
        this._device.queue.writeBuffer(gpubuffer._gpuBuffer, 0, value, 0, size);
    }

    private uploadUniformTexture(value: BaseTexture, index: number) {
        this.reBindResourceList.add(index);
        this._dataBindGroupResourceMap[index] = value._texture as WebGPUInternalTex;
    }

    /**
     * 重新绑定BindGroup
     */
    private rebindResource() {
        this.needReBuildDataCacheNode.length = 0;
        for (var i = 0, n = this.reBindResourceList.length; i < n; i++) {
            let propertyID = this.reBindResourceList.elements[i];//propertyID
            for (var cacheIndex in this._dataBindGroupCacheMap) {
                let cacheBindGroupData = this._dataBindGroupCacheMap[cacheIndex];
                if (cacheBindGroupData.needUpdate(propertyID)) {
                    this.needReBuildDataCacheNode.add(cacheBindGroupData);
                }
            }
        }
        //rebuild
        for (var i = 0, n = this.needReBuildDataCacheNode.length; i < n; i++) {
            let cacheNode = this.needReBuildDataCacheNode.elements[i];//cacheNode
            cacheNode.rebuild(this);
        }
    }

    /**
     * 设置整型。
     * @param	index shader索引。
     * @param	value 整形。
     */
    setInt(index: number, value: number): void {
        if (this._data[index] == value)
            return;
        super.setInt(index, value);
        this._setChangeFlag(index);
    }

    /**
     * 设置布尔。
     * @param	index shader索引。
     * @param	value 布尔。
     */
    setBool(index: number, value: boolean): void {
        if (this._data[index] == value)
            return;
        super.setBool(index, value);
        this._setChangeFlag(index);
    }

    /**
     * 设置浮点。
     * @param	index shader索引。
     * @param	value 浮点。
     */
    setNumber(index: number, value: number): void {
        if (this._data[index] == value)
            return;
        super.setNumber(index, value);
        this._setChangeFlag(index);
    }

    /**
     * 设置Vector2向量。
     * @param	index shader索引。
     * @param	value Vector2向量。
     */
    setVector2(index: number, value: Vector2): void {
        let v2 = this._data[index] as Vector2;
        if (v2 && v2 instanceof Vector2 && Vector2.equals(v2, value))
            return;
        super.setVector2(index, value);
        this._setChangeFlag(index);
    }

    /**
     * 设置Vector3向量。
     * @param	index shader索引。
     * @param	value Vector3向量。
     */
    setVector3(index: number, value: Vector3): void {
        let v3 = this._data[index] as Vector3;
        if (v3 && v3 instanceof Vector3 && Vector3.equals(v3, value))
            return;
        super.setVector3(index, value);
        this._setChangeFlag(index);
    }

    /**
     * 设置向量。
     * @param	index shader索引。
     * @param	value 向量。
     */
    setVector(index: number, value: Vector4): void {
        let v4 = this._data[index] as Vector4;
        if (v4 && v4 instanceof Vector4 && Vector4.equals(v4, value))
            return;
        super.setVector(index, value);
        this._setChangeFlag(index);
    }

    /**
     * 设置颜色
     * @param index 索引
     * @param value 颜色值
     */
    setColor(index: number, value: Color): void {
        let color = this.getColor(index);
        if (color && color instanceof Color && color.equal(value))
            return;
        super.setColor(index, value);
        this._setChangeFlag(index);
    }

    /**
     * 设置矩阵。
     * @param	index shader索引。
     * @param	value  矩阵。
     */
    setMatrix4x4(index: number, value: Matrix4x4): void {
        let mat = this._data[index] as Matrix4x4;
        if (mat && mat instanceof Matrix4x4 && value.equalsOtherMatrix(mat))
            return;
        super.setMatrix4x4(index, value);
        this._setChangeFlag(index);
    }

    /**
     * set Buffer
     * @param index 
     * @param value 
     */
    setBuffer(index: number, value: Float32Array): void {
        super.setBuffer(index, value);
        this._setChangeFlag(index);
    }

    setTexture(index: number, value: BaseTexture): void {
        super.setTexture(index, value);
        this._setChangeFlag(index);
    }

    /**
     * 更新_dataBindGroupResourceMap，bufferUpdate，textureResource change
     */
    updateBindGroup() {
        if(!this.changeList.length)
            return;
        this.reBindResourceList.length = 0;
        //needUpdataBindGroup
        for (var i = 0, n = this.changeList.length; i < n; i++) {
            let index = this.changeList.elements[i];
            let value = this._data[index];
            //number update
            if (typeof value == "number" || typeof value == "number" || typeof value == "boolean") {
                this.uploadUniformOneValue(value, index);
            } else if (value instanceof Vector2) {
                this.uploadUniformVec2Value(value, index);
            } else if (value instanceof Vector3) {
                this.uploadUniformVec3Value(value, index);
            } else if (value instanceof Vector4) {
                this.uploadUniformVec4Value(value, index);
            } else if (value instanceof Matrix4x4) {
                this.uploadUniformMatValue(value, index);
            } else if (value instanceof BaseTexture) {
                this.uploadUniformTexture(value, index);
            } else if (value instanceof SharedArrayBuffer) {
                this.uploadUniformBufferValue(value, index);
            }
            else if (value instanceof Resource) {
                //TODO?
            }
        }
        this.changeList.length = 0;

        this.rebindResource();
    }

    clearBindGroup() {
        //TODO
    }

    getBindGroup(shaderVariable: WGPUShaderVariable): GPUBindGroup {
        //根据ShaderVaribale，获得GPUBindGroup
        //this._dataBindGroupResourceMap
        let cacheNode = this._dataBindGroupCacheMap[shaderVariable.onID];
        if (!cacheNode) {
           cacheNode = this._dataBindGroupCacheMap[shaderVariable.onID] = new ShaderDataCacheNode(shaderVariable,this);
        }
        return cacheNode.bindGroup;
    }

    destroy(): void {
        super.destroy();
        //TODO destroy GPU Resource
    }
}

export class ShaderDataCacheNode {
    /**@internal */
    bindGroup: GPUBindGroup;
    /**@internal */
    shaderVariable: WGPUShaderVariable;

    constructor(variable: WGPUShaderVariable, shaderData: WGPUShaderData) {
        this.shaderVariable = variable;
        this.rebuild(shaderData);
    }

    /**needUpdata */
    needUpdate(propertyIndex: number) {
        //遍历判断有没有这个BindGroup
        return this.shaderVariable.containProperty(propertyIndex);
    }

    /**rebuild */
    rebuild(shaderData: WGPUShaderData) {
        if (this.bindGroup)
            delete this.bindGroup;
        this.bindGroup = WGPUBindGroupHelper.getBindGroupbyUniformMap(this.shaderVariable, shaderData);
    }

    /**release */
    destroy() {
        delete this.bindGroup;
    }


}