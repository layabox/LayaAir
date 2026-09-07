/**
 * @en Platform-neutral state of a gamepad button.
 * @zh 平台无关的手柄按键状态。
 */
export interface GamepadButtonSnapshot {
    readonly value: number;
    /** @en Omit to use the manager's press threshold. @zh 未提供时使用管理器的按下阈值。 */
    readonly pressed?: boolean;
    readonly touched?: boolean;
}

/**
 * @en Snapshot of a connected gamepad. Indices must remain stable while connected.
 * @zh 已连接手柄的状态快照。连接期间设备索引必须保持稳定。
 */
export interface GamepadSnapshot {
    readonly index: number;
    readonly id: string;
    readonly mapping: string;
    readonly timestamp: number;
    readonly buttons: ReadonlyArray<GamepadButtonSnapshot>;
    readonly axes: ReadonlyArray<number>;
}

/**
 * @en Unified platform interface for gamepad input. Register with PAL.register("gamepad", Adapter).
 * @zh 统一的手柄输入平台接口，通过 PAL.register("gamepad", Adapter) 注册。
 */
export interface IGamepadAdapter {
    readonly supported: boolean;

    /**
     * @en Returns all connected devices, [] if unsupported or none are connected,
     * or null on a transient read failure to preserve the manager's previous state.
     * @zh 返回所有已连接设备；不支持或没有设备时返回 []；暂时读取失败时返回 null，
     * 让管理器保留上一帧状态，避免误报断开连接。
     */
    getSnapshots(): ReadonlyArray<GamepadSnapshot> | null;
}
