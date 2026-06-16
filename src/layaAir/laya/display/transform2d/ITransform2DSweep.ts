import { Transform2DStore } from "./Transform2DStore";

/**
 * @zh 节点树计算(sweep)的下沉边界 —— 整个 Transform2D SoA 系统里**唯一**可放到 native 的部分。
 *
 * 上层 {@link Transform2DStore} 负责一切结构与 IO：创建 chunk、alloc/free、setParent、写 local、读 world、置脏位，
 * 全在 JS、操作 memoryFactory 给的列 buffer(Web=JS array / RT=native 共享 view)。
 * 下层只把"遍历节点树算 world"这步实现一份：读共享 buffer 的 local/parent/children/脏位 → 算 → 写回 world+frame 列、
 * 清脏位、产出 changed。Web 用 {@link Transform2DStore} 内置的 JS sweep；RT 装上 native 实现(委托 conch)。
 */
export interface ITransform2DSweep {
    /**
     * @zh 帧末 sweep。读 store(及其共享 buffer)的 local/parent/脏位,把每个脏子树的 world(矩阵/alpha/culling)
     * 与 *Frame 列算好写回,清脏位,并把"world 真变"的节点写进 `store.changedSlots/changedMasks`、复位 `store.dirtyM/A/C`。
     * @param store 上层 store(持有 chunk 列 buffer;native 实现据此/经共享 buffer 拿数据并回写)。
     * @param frameId 当前帧号(world 真变时盖到 *Frame 列)。
     */
    update(store: Transform2DStore, frameId: number): void;
}
