import { ILaya } from "../../../ILaya";
import { EPhysicsStatisticsInfo } from "../physicsEnum/EPhysicsStatisticsInfo";

export class Physics3DStatInfo {
    private static _PhysicsStatisticsInfo: Map<EPhysicsStatisticsInfo, number> = new Map();

    /**
     * @en enable Physics Statistics
     * @zh 启动物理统计信息
     */
    static enableStatistics: boolean = true;

    /**
     * @en Initialize Physical Statistics Map
     * @zh 初始化物理统计信息表
     */
    static initStatisticsInfo(): void {
        for (let i = 0; i < EPhysicsStatisticsInfo.Count; i++) {
            this._PhysicsStatisticsInfo.set(i, 0);
        }
        if (Physics3DStatInfo.enableStatistics) {
            ILaya.timer.frameLoop(1, null, Physics3DStatInfo.clearStatisticsInfo);
        }
    }

    /**
     * @en Set Physical Statistics Values
     * @param info Physical Statistics Enumeration
     * @param value value
     * @zh 设置物理统计信息值
     * @param info 物理统计信息枚举
     * @param value 值
     */
    static addStatisticsInfo(info: EPhysicsStatisticsInfo, value: number): void {
        Physics3DStatInfo.enableStatistics && (Physics3DStatInfo._PhysicsStatisticsInfo.set(info, Physics3DStatInfo._PhysicsStatisticsInfo.get(info) + value))
    }

    /**
     * @en Get Physical Statistics Values
     * @param info Physical Statistics Enumeration
     * @returns Physical Statistics value
     * @zh 获取物理统计信息值
     * @param info 物理统计信息枚举
     * @returns 物理统计信息值
     */
    static getStatisticsInfo(info: EPhysicsStatisticsInfo): number {
        let value = 0;
        if (Physics3DStatInfo.enableStatistics) {
            value = Physics3DStatInfo._PhysicsStatisticsInfo.get(info)
        }
        return value;
    }

    /**
     * @en Per Frame Cleanup of Physical Statistics
     * @zh 每帧清理物理统计信息
     */
    static clearStatisticsInfo(): void {
        if (Physics3DStatInfo.enableStatistics) {
            for (let i = 0; i < EPhysicsStatisticsInfo.FrameClearCount; i++) {
                Physics3DStatInfo._PhysicsStatisticsInfo.set(i, 0);
            }
        }
    }

    /**
     * @en Stop Statistics
     * @zh 停止统计信息
     */
    static stopAndClearAllStatisticsInfo(): void {
        for (let i = 0; i < EPhysicsStatisticsInfo.Count; i++) {
            this._PhysicsStatisticsInfo.set(i, 0);
        }
        if (Physics3DStatInfo.enableStatistics) {
            ILaya.timer.clear(null, Physics3DStatInfo.clearStatisticsInfo);
        }
    }
}