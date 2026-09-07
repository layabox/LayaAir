import { Browser } from "../utils/Browser";
import { type GamepadSnapshot, type IGamepadAdapter } from "./IGamepadAdapter";
import { PAL } from "./PlatformAdapters";

/**
 * @en Gamepad adapter backed by the Web Gamepad API.
 * @zh 基于 Web Gamepad API 的手柄适配器。
 */
export class WebGamepadAdapter implements IGamepadAdapter {
    private _reportedError = false;

    get supported(): boolean {
        return typeof Browser.window.navigator?.getGamepads === "function";
    }

    getSnapshots(): ReadonlyArray<GamepadSnapshot> | null {
        if (!this.supported)
            return [];
        try {
            const result: GamepadSnapshot[] = [];
            for (const gamepad of Browser.window.navigator.getGamepads()) {
                if (!gamepad || !gamepad.connected)
                    continue;
                result.push({
                    index: gamepad.index,
                    id: gamepad.id,
                    mapping: gamepad.mapping,
                    timestamp: gamepad.timestamp,
                    buttons: Array.from(gamepad.buttons, button => ({
                        value: button.value,
                        pressed: button.pressed,
                        touched: button.touched
                    })),
                    axes: Array.from(gamepad.axes)
                });
            }
            this._reportedError = false;
            return result;
        }
        catch (error) {
            if (!this._reportedError) {
                this._reportedError = true;
                console.warn("Failed to read Web gamepad state", error);
            }
            return null;
        }
    }
}

PAL.register("gamepad", WebGamepadAdapter);
