import { Burst } from "././Burst";
import { IClone } from "../../IClone";
import { IDestroy } from "laya/resource/IDestroy";
/**
 * <code>Emission</code> 类用于粒子发射器。
 */
export declare class Emission implements IClone, IDestroy {
    /**@private */
    private _destroyed;
    /**@private 粒子发射速率,每秒发射的个数。*/
    private _emissionRate;
    /**@private 粒子的爆裂,不允许修改。*/
    _bursts: Burst[];
    /**是否启用。*/
    enbale: boolean;
    /**
     * 设置粒子发射速率。
     * @param emissionRate 粒子发射速率 (个/秒)。
     */
    /**
    * 获取粒子发射速率。
    * @return 粒子发射速率 (个/秒)。
    */
    emissionRate: number;
    /**
     * 获取是否已销毁。
     * @return 是否已销毁。
     */
    readonly destroyed: boolean;
    /**
     * 创建一个 <code>Emission</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    destroy(): void;
    /**
     * 获取粒子爆裂个数。
     * @return 粒子爆裂个数。
     */
    getBurstsCount(): number;
    /**
     * 通过索引获取粒子爆裂。
     * @param index 爆裂索引。
     * @return 粒子爆裂。
     */
    getBurstByIndex(index: number): Burst;
    /**
     * 增加粒子爆裂。
     * @param burst 爆裂。
     */
    addBurst(burst: Burst): void;
    /**
     * 移除粒子爆裂。
     * @param burst 爆裂。
     */
    removeBurst(burst: Burst): void;
    /**
     * 通过索引移除粒子爆裂。
     * @param index 爆裂索引。
     */
    removeBurstByIndex(index: number): void;
    /**
     * 清空粒子爆裂。
     */
    clearBurst(): void;
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
}
