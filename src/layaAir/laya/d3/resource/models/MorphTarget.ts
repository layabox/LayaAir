
/**
 * @en Represents a morph target in 3D modeling
 * @zh 表示3D建模中的变形目标
 */
export class MorphTarget {

    /** @internal */
    _index: number;

    /**
     * @en The name of the morph target
     * @zh 变形目标的名称
     */
    name: string;

    /**
     * @en The full weight of the morph target
     * @zh 变形目标的完整权重
     */
    fullWeight: number;

    /**
     * @en The data of the morph target
     * @zh 变形目标的数据
     */
    data: Float32Array;

    /** @ignore */
    constructor() {
        this.fullWeight = 1;
    }
}

// todo class name
/**
 * @en Represents a channel of morph targets
 * @zh 表示变形目标的通道
 */
export class MorphTargetChannel {

    /** @internal */
    _index: number;

    /**
     * @en The name of the morph target channel
     * @zh 变形目标通道的名称
     */
    name: string;

    /** 
     * @en The list of morph targets in this channel. 
     * @zh 此通道中的变形目标列表。
     */
    targets: Array<MorphTarget>;

    /**
     * @en The count of targets in this channel
     * @zh 此通道中目标的数量
     */
    targetCount: number = 0;

    constructor() {
        this.targets = new Array<MorphTarget>();
    }

    /**
     * @en Get a target by its index
     * @param index The index of the target
     * @returns The MorphTarget at the specified index
     * @zh 通过索引获取目标
     * @param index 目标的索引
     * @returns 指定索引处的MorphTarget
     */
    getTargetByIndex(index: number) {
        return this.targets[index];
    }

    /**
     * @en Add a target to this channel
     * @param target The MorphTarget to add
     * @zh 向此通道添加目标
     * @param target 要添加的MorphTarget
     */
    addTarget(target: MorphTarget) {
        this.targetCount++;
        this.targets.push(target);
        this.targets.sort((a, b) => {
            return a.fullWeight - b.fullWeight;
        })
    }

}