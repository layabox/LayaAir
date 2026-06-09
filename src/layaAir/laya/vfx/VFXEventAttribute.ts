import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { Vector4 } from "../maths/Vector4";

export enum VFXEventAttributeType {
    Bool,
    Int,
    Uint,
    Float,
    Vector2,
    Vector3,
    Vector4,
}

// 每种属性类型的字节大小（均为 4 字节的整数倍）
const VFXEventAttributeTypeSize: Record<VFXEventAttributeType, number> = {
    [VFXEventAttributeType.Bool]: 4,
    [VFXEventAttributeType.Int]: 4,
    [VFXEventAttributeType.Uint]: 4,
    [VFXEventAttributeType.Float]: 4,
    [VFXEventAttributeType.Vector2]: 8,
    [VFXEventAttributeType.Vector3]: 12,
    [VFXEventAttributeType.Vector4]: 16,
};

// std430 对齐规则（与 size 的区别仅在于 Vector3: size=12, alignment=16）
const Std430Alignment: Record<VFXEventAttributeType, number> = {
    [VFXEventAttributeType.Bool]: 4,
    [VFXEventAttributeType.Int]: 4,
    [VFXEventAttributeType.Uint]: 4,
    [VFXEventAttributeType.Float]: 4,
    [VFXEventAttributeType.Vector2]: 8,
    [VFXEventAttributeType.Vector3]: 16,
    [VFXEventAttributeType.Vector4]: 16,
};

function alignTo(offset: number, alignment: number): number {
    return Math.ceil(offset / alignment) * alignment;
}

interface VFXEventAttributeEntry {
    type: VFXEventAttributeType;
    offset: number;
    size: number;
}

/**
 * Event Attribute 布局描述
 * 每个 VFXAsset 持有一个固定的布局，用于描述 EventAttribute 的内存结构
 * 构造时一次性传入所有属性定义，之后布局不可变
 * 运行时用 createBuffer 创建 ArrayBuffer，通过 offset 解释其中的值
 */
export class VFXEventAttributeDesc {

    private _entries: Map<string, VFXEventAttributeEntry> = new Map();

    /** 单个 EventAttribute 的总字节数 */
    private _stride: number = 0;

    /** 事件数据起始偏移（header 后，对齐到 maxAlign） */
    private _eventDataOffset: number = 0;

    /** 事件数据 stride（std430 struct array stride，对齐到 maxAlign） */
    private _eventDataStride: number = 0;

    get stride(): number {
        return this._stride;
    }

    get eventDataOffset(): number {
        return this._eventDataOffset;
    }

    get eventDataStride(): number {
        return this._eventDataStride;
    }

    get attributeCount(): number {
        return this._entries.size;
    }

    /** 默认布局：第一个位置固定为 spawnCount (Float)，其后为事件数据属性 */
    static readonly defaultAttributes: ReadonlyArray<{ name: string, type: VFXEventAttributeType }> = [
        { name: "spawnCount", type: VFXEventAttributeType.Float },
    ];

    /**
     * 使用 std430 对齐规则计算布局，使事件数据区域与 GPU SourceEventData 字节对齐
     * @param attributes 额外的属性定义列表，会追加在默认布局之后。为 null 时仅使用默认布局
     */
    constructor(attributes?: Array<{ name: string, type: VFXEventAttributeType }>) {
        // 合并默认属性和自定义属性
        const allAttrs = [...VFXEventAttributeDesc.defaultAttributes];
        if (attributes) {
            for (const attr of attributes) {
                if (!allAttrs.find(a => a.name === attr.name)) {
                    allAttrs.push(attr);
                }
            }
        }

        // Header: spawnCount（固定在 offset 0）
        const headerAttr = allAttrs[0];
        const headerSize = VFXEventAttributeTypeSize[headerAttr.type];
        this._entries.set(headerAttr.name, { type: headerAttr.type, offset: 0, size: headerSize });

        // 事件数据属性（spawnCount 之后的所有属性）
        const eventAttrs = allAttrs.slice(1);

        // 计算事件数据字段的最大 std430 对齐
        let maxAlign = 4;
        for (const attr of eventAttrs) {
            maxAlign = Math.max(maxAlign, Std430Alignment[attr.type]);
        }

        // 事件数据起始 offset = header 后对齐到 maxAlign
        this._eventDataOffset = alignTo(headerSize, maxAlign);
        let offset = this._eventDataOffset;

        // 逐字段布局（std430 对齐规则）
        for (const attr of eventAttrs) {
            const align = Std430Alignment[attr.type];
            const size = VFXEventAttributeTypeSize[attr.type];
            offset = alignTo(offset, align);
            this._entries.set(attr.name, { type: attr.type, offset, size });
            offset += size;
        }

        // 事件数据 stride = 对齐到 maxAlign（std430 struct array stride 规则）
        this._eventDataStride = alignTo(offset - this._eventDataOffset, maxAlign);

        // 总 stride = header + 事件数据
        this._stride = this._eventDataOffset + this._eventDataStride;
    }

    /**
     * 获取属性的字节偏移
     * @returns 偏移量，不存在返回 -1
     */
    getAttributeOffset(name: string): number {
        const entry = this._entries.get(name);
        if (!entry) return -1;
        return entry.offset;
    }

    /**
     * 获取属性类型
     */
    getAttributeType(name: string): VFXEventAttributeType | undefined {
        return this._entries.get(name)?.type;
    }

    /**
     * 获取属性字节大小
     */
    getAttributeSize(name: string): number {
        const entry = this._entries.get(name);
        if (!entry) return 0;
        return entry.size;
    }

    /**
     * 检查属性是否存在
     */
    hasAttribute(name: string): boolean {
        return this._entries.has(name);
    }

    /**
     * 创建基于此布局的 ArrayBuffer
     */
    createBuffer(): ArrayBuffer {
        return new ArrayBuffer(this._stride);
    }
}

/**
 * Event Attribute 数据实例
 * 持有 VFXEventAttributeDesc 的引用和对应的 ArrayBuffer
 * 通过 desc 的布局信息解释 buffer 中的值
 */
export class VFXEventAttribute {

    private _desc: VFXEventAttributeDesc;

    private _buffer: ArrayBuffer;

    private _view: DataView;

    get view(): DataView {
        return this._view;
    }

    constructor(desc: VFXEventAttributeDesc) {
        this._desc = desc;
    }

    get desc(): VFXEventAttributeDesc {
        return this._desc;
    }

    get buffer(): ArrayBuffer {
        return this._buffer;
    }

    /**
     * 初始化 buffer，可指定 byteOffset 使用 ArrayBuffer 的一段
     * DataView 的读写偏移相对于 byteOffset，现有 get/set 方法无需改动
     */
    initBuffer(buffer: ArrayBuffer, byteOffset: number = 0, byteLength?: number): void {
        this._buffer = buffer;
        this._view = new DataView(buffer, byteOffset, byteLength ?? this._desc.stride);
    }

    // Bool

    setBool(name: string, value: boolean): void {
        const offset = this._desc.getAttributeOffset(name);
        if (offset < 0) return;
        this._view.setInt32(offset, value ? 1 : 0, true);
    }

    getBool(name: string): boolean {
        const offset = this._desc.getAttributeOffset(name);
        if (offset < 0) return false;
        return this._view.getInt32(offset, true) !== 0;
    }

    // Int

    setInt(name: string, value: number): void {
        const offset = this._desc.getAttributeOffset(name);
        if (offset < 0) return;
        this._view.setInt32(offset, value, true);
    }

    getInt(name: string): number {
        const offset = this._desc.getAttributeOffset(name);
        if (offset < 0) return 0;
        return this._view.getInt32(offset, true);
    }

    // Uint

    setUint(name: string, value: number): void {
        const offset = this._desc.getAttributeOffset(name);
        if (offset < 0) return;
        this._view.setUint32(offset, value, true);
    }

    getUint(name: string): number {
        const offset = this._desc.getAttributeOffset(name);
        if (offset < 0) return 0;
        return this._view.getUint32(offset, true);
    }

    // Float

    setFloat(name: string, value: number): void {
        const offset = this._desc.getAttributeOffset(name);
        if (offset < 0) return;
        this._view.setFloat32(offset, value, true);
    }

    getFloat(name: string): number {
        const offset = this._desc.getAttributeOffset(name);
        if (offset < 0) return 0;
        return this._view.getFloat32(offset, true);
    }

    // Vector2

    setVector2(name: string, x: number, y: number): void {
        const offset = this._desc.getAttributeOffset(name);
        if (offset < 0) return;
        this._view.setFloat32(offset, x, true);
        this._view.setFloat32(offset + 4, y, true);
    }

    getVector2(name: string, out: Vector2): Vector2 {
        const offset = this._desc.getAttributeOffset(name);
        if (offset < 0) return out;
        out.x = this._view.getFloat32(offset, true);
        out.y = this._view.getFloat32(offset + 4, true);
        return out;
    }

    // Vector3

    setVector3(name: string, x: number, y: number, z: number): void {
        const offset = this._desc.getAttributeOffset(name);
        if (offset < 0) return;
        this._view.setFloat32(offset, x, true);
        this._view.setFloat32(offset + 4, y, true);
        this._view.setFloat32(offset + 8, z, true);
    }

    getVector3(name: string, out: Vector3): Vector3 {
        const offset = this._desc.getAttributeOffset(name);
        if (offset < 0) return out;
        out.x = this._view.getFloat32(offset, true);
        out.y = this._view.getFloat32(offset + 4, true);
        out.z = this._view.getFloat32(offset + 8, true);
        return out;
    }

    // Vector4

    setVector4(name: string, x: number, y: number, z: number, w: number): void {
        const offset = this._desc.getAttributeOffset(name);
        if (offset < 0) return;
        this._view.setFloat32(offset, x, true);
        this._view.setFloat32(offset + 4, y, true);
        this._view.setFloat32(offset + 8, z, true);
        this._view.setFloat32(offset + 12, w, true);
    }

    getVector4(name: string, out: Vector4): Vector4 {
        const offset = this._desc.getAttributeOffset(name);
        if (offset < 0) return out;
        out.x = this._view.getFloat32(offset, true);
        out.y = this._view.getFloat32(offset + 4, true);
        out.z = this._view.getFloat32(offset + 8, true);
        out.w = this._view.getFloat32(offset + 12, true);
        return out;
    }

    /**
     * 将所有值归零
     */
    clear(): void {
        new Uint8Array(this._buffer, this._view.byteOffset, this._view.byteLength).fill(0);
    }

    /**
     * 从另一个同布局的 VFXEventAttribute 拷贝数据
     */
    copyFrom(other: VFXEventAttribute): void {
        const dst = new Uint8Array(this._buffer, this._view.byteOffset, this._view.byteLength);
        const src = new Uint8Array(other._buffer, other._view.byteOffset, other._view.byteLength);
        dst.set(src);
    }

    destroy(): void {
        this._buffer = null;
        this._view = null;
        this._desc = null;
    }

}
