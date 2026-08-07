import type { Matrix3x3 } from "../../../../maths/Matrix3x3";
import type { Matrix4x4 } from "../../../../maths/Matrix4x4";
import type { Vector2 } from "../../../../maths/Vector2";
import type { Vector3 } from "../../../../maths/Vector3";
import type { Vector4 } from "../../../../maths/Vector4";
import type { ShaderData } from "../ShaderData";
import type { UniformLayoutItem } from "./IUniformLayout";
import type { UniformBufferBlock } from "./UniformBufferBlock";

/**
 * 预解析的 UBO 属性直写句柄(最优路径)。
 *
 * 持 uniform 布局项(其 .view 在块 _rebuildViews 时就地重绑,故读 uniform.view 始终最新且非 map 查找)
 * + 归属 ShaderData(用 _uboLayoutVersion 廉价校验句柄是否过期)。稳态每次写只做一次整数比较,零 map。
 *
 * 由调用方缓存复用,生命期跟绑定走。仅适用于被池化成 cluster 块、每帧重推、且不经 getXxx 回读的 uniform。
 *
 * 注意:field 只更新 UBO 内存 view,不会同步 ShaderData._data。通过 field 更新后,
 * ShaderData.getXxx / getShaderData / clone 等读取或复制路径取得的仍是上一次普通 ShaderData setter
 * 写入的值,可能是旧值或未初始化值。需要从 ShaderData 回读的属性不得使用 field 更新。
 *
 * setXxx 返回 false 表示该属性当前未池化成 cluster 块(如 WebGL 节点变换、独立 UBO)或句柄已失效,
 * 调用方据此回退 ShaderData.setXxx。
 */
export class UniformBufferField {
    /** @internal */ _owner: ShaderData;
    /** @internal */ _index: number;
    /** @internal */ _version: number = -1;
    /** @internal */ _block: UniformBufferBlock = null;
    /** @internal */ _uniform: UniformLayoutItem = null;

    /** 版本一致=有效(零 map);不一致才经归属 SD 重解析块+布局项(free/重建/换借统吃)。返回本次是否可写。 */
    private _revalidate(): boolean {
        const owner = this._owner;
        if (this._version === owner._uboLayoutVersion) return this._uniform != null;
        this._version = owner._uboLayoutVersion;
        const b = owner._getUniformBlockByProperty(this._index);
        this._block = b;
        this._uniform = b ? b.descriptor.uniforms.get(this._index) : null;
        return this._uniform != null;
    }

    setInt(value: number): boolean {
        if (!this._revalidate()) return false;
        this._block._writeInt(this._uniform, value); return true;
    }
    setFloat(value: number): boolean {
        if (!this._revalidate()) return false;
        this._block._writeFloat(this._uniform, value); return true;
    }
    setVector2(value: Vector2): boolean {
        if (!this._revalidate()) return false;
        this._block._writeVector2(this._uniform, value); return true;
    }
    setVector3(value: Vector3): boolean {
        if (!this._revalidate()) return false;
        this._block._writeVector3(this._uniform, value); return true;
    }
    setVector4(value: Vector4): boolean {
        if (!this._revalidate()) return false;
        this._block._writeVector4(this._uniform, value); return true;
    }
    setMatrix3x3(value: Matrix3x3): boolean {
        if (!this._revalidate()) return false;
        this._block._writeMatrix3x3(this._uniform, value); return true;
    }
    setMatrix4x4(value: Matrix4x4): boolean {
        if (!this._revalidate()) return false;
        this._block._writeMatrix4x4(this._uniform, value); return true;
    }
    setBuffer(value: Float32Array): boolean {
        if (!this._revalidate()) return false;
        this._block._writeBuffer(this._uniform, value); return true;
    }
    /** 数组类型(mat4[] / vec4[] 等,按 layout 的 stride 展开)。 */
    setArray(value: Float32Array): boolean {
        if (!this._revalidate()) return false;
        this._block._writeArrayBuffer(this._uniform, value); return true;
    }
}
