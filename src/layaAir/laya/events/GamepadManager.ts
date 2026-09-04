import { ILaya } from "../../ILaya";
import { Browser } from "../utils/Browser";
import { EventDispatcher } from "./EventDispatcher";

/**
 * @en Standard-layout gamepad button indices, matching the Web Gamepad API.
 * @zh 标准布局的手柄按键索引，与 Web Gamepad API 保持一致。
 */
export enum GamepadButton {
    South = 0,
    East = 1,
    West = 2,
    North = 3,
    LeftShoulder = 4,
    RightShoulder = 5,
    LeftTrigger = 6,
    RightTrigger = 7,
    Select = 8,
    Start = 9,
    LeftStick = 10,
    RightStick = 11,
    DpadUp = 12,
    DpadDown = 13,
    DpadLeft = 14,
    DpadRight = 15,
    Home = 16
}

/**
 * @en Standard-layout gamepad axis indices.
 * @zh 标准布局的手柄摇杆轴索引。
 */
export enum GamepadAxis {
    LeftX = 0,
    LeftY = 1,
    RightX = 2,
    RightY = 3
}

export class GamepadButtonInfo {
    private _value: number;
    private _pressed: boolean;
    private _touched: boolean;

    /** @en Analog button value in the range [0, 1]. @zh 模拟按键值，范围为 [0, 1]。 */
    get value(): number {
        return this._value;
    }

    get pressed(): boolean {
        return this._pressed;
    }

    get touched(): boolean {
        return this._touched;
    }

    constructor(value: number, pressed: boolean, touched: boolean) {
        this._update(value, pressed, touched);
    }

    /** @internal */
    _update(value: number, pressed: boolean, touched: boolean): void {
        this._value = value;
        this._pressed = pressed;
        this._touched = touched;
    }
}

export class GamepadInfo {
    readonly index: number;
    private _id: string;
    private _mapping: string;
    private _connected: boolean;
    private _timestamp: number;
    private _buttons: GamepadButtonInfo[] = [];
    private _axes: number[] = [];

    get id(): string {
        return this._id;
    }

    get mapping(): string {
        return this._mapping;
    }

    get connected(): boolean {
        return this._connected;
    }

    get timestamp(): number {
        return this._timestamp;
    }

    get buttons(): ReadonlyArray<GamepadButtonInfo> {
        return this._buttons;
    }

    get axes(): ReadonlyArray<number> {
        return this._axes;
    }

    /** @internal */
    constructor(snapshot: GamepadSnapshot, pressThreshold: number) {
        this.index = snapshot.index;
        this._update(snapshot, pressThreshold);
    }

    /** @internal */
    _update(snapshot: GamepadSnapshot, pressThreshold: number): void {
        this._id = snapshot.id;
        this._mapping = snapshot.mapping;
        this._connected = true;
        this._timestamp = snapshot.timestamp;
        this._buttons.length = snapshot.buttons.length;
        snapshot.buttons.forEach((button, index) => {
            const value = button.value;
            const pressed = button.pressed ?? value >= pressThreshold;
            const touched = button.touched ?? false;
            const current = this._buttons[index];
            if (current)
                current._update(value, pressed, touched);
            else
                this._buttons[index] = new GamepadButtonInfo(value, pressed, touched);
        });
        this._axes.length = snapshot.axes.length;
        snapshot.axes.forEach((value, index) => this._axes[index] = value);
    }

    /** @internal */
    _setConnected(value: boolean): void {
        this._connected = value;
    }

    /**
     * @en Returns an axis value with an independent dead zone applied.
     * @zh 返回应用独立死区后的摇杆轴值。
     */
    getAxis(axis: GamepadAxis | number, deadZone = GamepadManager.axisDeadZone): number {
        const value = this.axes[axis] ?? 0;
        const magnitude = Math.abs(value);
        if (magnitude <= deadZone)
            return 0;
        if (deadZone >= 1)
            return 0;
        return Math.sign(value) * (magnitude - deadZone) / (1 - deadZone);
    }

    getButton(button: GamepadButton | number): GamepadButtonInfo {
        return this.buttons[button] ?? EMPTY_BUTTON;
    }
}

export interface GamepadConnectionEvent {
    gamepad: GamepadInfo;
}

export interface GamepadButtonEvent {
    gamepad: GamepadInfo;
    index: number;
    button: GamepadButtonInfo;
}

export interface GamepadAxisEvent {
    gamepad: GamepadInfo;
    index: number;
    value: number;
}

interface GamepadButtonSnapshot {
    value: number;
    pressed?: boolean;
    touched?: boolean;
}

interface GamepadSnapshot {
    index: number;
    id: string;
    mapping: string;
    timestamp: number;
    buttons: GamepadButtonSnapshot[];
    axes: number[];
}

interface NativeGamepadSnapshot {
    index: number;
    id: string;
    mapping: string;
    connected: boolean;
    timestamp: number;
    buttons: number[];
    axes: number[];
}

const EMPTY_BUTTON = new GamepadButtonInfo(0, false, false);
let _instance: GamepadManager;

/**
 * @en Cross-platform gamepad input manager. Web builds use the Web Gamepad API;
 * LayaNative builds use the Windows/Linux SDL, Android InputDevice, or iOS
 * GameController backend.
 * @zh 跨平台手柄输入管理器。Web 端使用 Web Gamepad API；LayaNative 端分别使用
 * Windows/Linux SDL、Android InputDevice 或 iOS GameController 后端。
 */
export class GamepadManager extends EventDispatcher {
    static readonly CONNECTED = "gamepadconnected";
    static readonly DISCONNECTED = "gamepaddisconnected";
    static readonly BUTTON_DOWN = "gamepadbuttondown";
    static readonly BUTTON_UP = "gamepadbuttonup";
    static readonly BUTTON_CHANGED = "gamepadbuttonchanged";
    static readonly AXIS_CHANGED = "gamepadaxischanged";

    /** Default dead zone used by GamepadInfo.getAxis(). */
    static axisDeadZone = 0.1;
    /** Analog value at which a button is considered pressed. */
    static buttonPressThreshold = 0.5;

    private _gamepads = new Map<number, GamepadInfo>();
    private _orderedGamepads: GamepadInfo[] = [];
    private _started = false;
    private _nativeConch: { getGamepadState(): string };
    private _reportedNativeError = false;

    static get instance(): GamepadManager {
        return _instance ??= new GamepadManager();
    }

    /**
     * @en Connected gamepads, ordered by platform device index.
     * @zh 当前已连接的手柄，按平台设备索引排序。
     */
    get gamepads(): ReadonlyArray<GamepadInfo> {
        return this._orderedGamepads;
    }

    get supported(): boolean {
        return this._nativeConch != null || typeof Browser.window.navigator?.getGamepads === "function";
    }

    getGamepad(index: number): GamepadInfo | null {
        return this._gamepads.get(index) ?? null;
    }

    /** @internal */
    static __init__(): void {
        GamepadManager.instance.start();
    }

    /**
     * @en Starts polling the platform backend. Called automatically by Laya.init().
     * @zh 开始轮询平台手柄后端。Laya.init() 会自动调用。
     */
    start(): void {
        if (this._started)
            return;
        this._started = true;
        const conch = (Browser.window as any).conch;
        if (conch && typeof conch.getGamepadState === "function")
            this._nativeConch = conch;
        ILaya.systemTimer.frameLoop(1, this, this._update);
        this._update();
    }

    /**
     * @en Stops polling and disconnects all known devices.
     * @zh 停止轮询，并将所有已知手柄标记为断开。
     */
    stop(): void {
        if (!this._started)
            return;
        this._started = false;
        ILaya.systemTimer.clear(this, this._update);
        const disconnected = this._orderedGamepads.slice();
        for (const gamepad of disconnected)
            gamepad._setConnected(false);
        this._gamepads.clear();
        this._orderedGamepads.length = 0;
        for (const gamepad of disconnected)
            this.event(GamepadManager.DISCONNECTED, <GamepadConnectionEvent>{ gamepad });
    }

    private _update(): void {
        const snapshots = this._nativeConch
            ? this._readNativeSnapshots()
            : this._readWebSnapshots();
        if (snapshots)
            this._applySnapshots(snapshots);
    }

    private _readNativeSnapshots(): GamepadSnapshot[] {
        try {
            const nativeSnapshots = JSON.parse(this._nativeConch.getGamepadState()) as NativeGamepadSnapshot[];
            if (!Array.isArray(nativeSnapshots))
                return [];
            this._reportedNativeError = false;
            return nativeSnapshots
                .filter(gamepad => gamepad && gamepad.connected !== false)
                .map(gamepad => ({
                    index: gamepad.index,
                    id: gamepad.id || "Gamepad",
                    mapping: gamepad.mapping || "standard",
                    timestamp: gamepad.timestamp || 0,
                    buttons: (gamepad.buttons || []).map(value => ({ value: Number(value) || 0 })),
                    axes: (gamepad.axes || []).map(value => Number(value) || 0)
                }));
        }
        catch (error) {
            if (!this._reportedNativeError) {
                this._reportedNativeError = true;
                console.warn("Failed to read LayaNative gamepad state", error);
            }
            return null;
        }
    }

    private _readWebSnapshots(): GamepadSnapshot[] {
        const navigator = Browser.window.navigator;
        if (typeof navigator?.getGamepads !== "function")
            return [];
        const result: GamepadSnapshot[] = [];
        for (const gamepad of navigator.getGamepads()) {
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
        return result;
    }

    private _applySnapshots(snapshots: GamepadSnapshot[]): void {
        const seen = new Set<number>();
        const connected: GamepadInfo[] = [];
        const disconnected: GamepadInfo[] = [];
        for (const snapshot of snapshots) {
            if (!Number.isInteger(snapshot.index) || seen.has(snapshot.index))
                continue;
            seen.add(snapshot.index);
            const previous = this._gamepads.get(snapshot.index);
            if (!previous) {
                const current = new GamepadInfo(snapshot, GamepadManager.buttonPressThreshold);
                this._gamepads.set(snapshot.index, current);
                connected.push(current);
                continue;
            }
            const oldButtons = previous.buttons.map(button => new GamepadButtonInfo(
                button.value, button.pressed, button.touched));
            const oldAxes = previous.axes.slice();
            previous._update(snapshot, GamepadManager.buttonPressThreshold);
            this._dispatchChanges(oldButtons, oldAxes, previous);
        }

        for (const [index, gamepad] of this._gamepads) {
            if (seen.has(index))
                continue;
            this._gamepads.delete(index);
            gamepad._setConnected(false);
            disconnected.push(gamepad);
        }

        this._orderedGamepads = Array.from(this._gamepads.values())
            .sort((left, right) => left.index - right.index);
        for (const gamepad of connected)
            this.event(GamepadManager.CONNECTED, <GamepadConnectionEvent>{ gamepad });
        for (const gamepad of disconnected)
            this.event(GamepadManager.DISCONNECTED, <GamepadConnectionEvent>{ gamepad });
    }

    private _dispatchChanges(oldButtons: ReadonlyArray<GamepadButtonInfo>, oldAxes: ReadonlyArray<number>, current: GamepadInfo): void {
        const buttonCount = Math.max(oldButtons.length, current.buttons.length);
        for (let index = 0; index < buttonCount; index++) {
            const oldButton = oldButtons[index] ?? EMPTY_BUTTON;
            const button = current.buttons[index] ?? EMPTY_BUTTON;
            if (oldButton.value !== button.value || oldButton.pressed !== button.pressed
                || oldButton.touched !== button.touched) {
                this.event(GamepadManager.BUTTON_CHANGED,
                    <GamepadButtonEvent>{ gamepad: current, index, button });
            }
            if (oldButton.pressed !== button.pressed) {
                this.event(button.pressed ? GamepadManager.BUTTON_DOWN : GamepadManager.BUTTON_UP,
                    <GamepadButtonEvent>{ gamepad: current, index, button });
            }
        }

        const axisCount = Math.max(oldAxes.length, current.axes.length);
        for (let index = 0; index < axisCount; index++) {
            const oldValue = oldAxes[index] ?? 0;
            const value = current.axes[index] ?? 0;
            if (oldValue !== value) {
                this.event(GamepadManager.AXIS_CHANGED,
                    <GamepadAxisEvent>{ gamepad: current, index, value });
            }
        }
    }
}
