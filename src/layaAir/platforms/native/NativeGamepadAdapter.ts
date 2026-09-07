import { type GamepadSnapshot, type IGamepadAdapter } from "../../laya/platform/IGamepadAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";

interface NativeGamepadSnapshot {
    index: number;
    id: string;
    mapping: string;
    connected: boolean;
    timestamp: number;
    buttons: number[];
    axes: number[];
}

/**
 * @en Adapts LayaNative's conch.getGamepadState() snapshots to the unified input interface.
 * @zh 将 LayaNative 的 conch.getGamepadState() 快照转换为统一输入接口。
 */
export class NativeGamepadAdapter implements IGamepadAdapter {
    private _reportedError = false;

    get supported(): boolean {
        return typeof PAL.g?.getGamepadState === "function";
    }

    getSnapshots(): ReadonlyArray<GamepadSnapshot> | null {
        if (!this.supported)
            return [];
        try {
            const nativeSnapshots = JSON.parse(PAL.g.getGamepadState()) as NativeGamepadSnapshot[];
            if (!Array.isArray(nativeSnapshots))
                throw new Error("Expected an array of native gamepad snapshots");
            const result = nativeSnapshots
                .filter(gamepad => gamepad && gamepad.connected !== false)
                .map(gamepad => ({
                    index: gamepad.index,
                    id: gamepad.id || "Gamepad",
                    mapping: gamepad.mapping || "standard",
                    timestamp: gamepad.timestamp || 0,
                    buttons: (gamepad.buttons || []).map(value => ({ value: Number(value) || 0 })),
                    axes: (gamepad.axes || []).map(value => Number(value) || 0)
                }));
            this._reportedError = false;
            return result;
        }
        catch (error) {
            if (!this._reportedError) {
                this._reportedError = true;
                console.warn("Failed to read LayaNative gamepad state", error);
            }
            return null;
        }
    }
}

PAL.register("gamepad", NativeGamepadAdapter);
