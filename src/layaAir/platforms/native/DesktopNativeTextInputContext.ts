import {
    INativeTextInputClient,
    INativeTextInputContext,
    NativeTextInputCapabilities,
    NativeTextInputEndPolicy,
    NativeTextInputRect,
    NativeTextInputSessionConfig
} from "./NativeTextInputContext";
import { NativeTextInputSnapshot } from "./NativeTextInputTypes";

interface ConchTextInputAPI {
    setTextInputEvtFunction(callback: (sessionId: number, eventType: number, text: string, start: number, length: number) => void): void;
    startTextInput(sessionId: number): boolean;
    stopTextInput(sessionId: number): void;
    setTextInputRect(sessionId: number, x: number, y: number, width: number, height: number): void;
    getClipboardText?(): string;
    setClipboardText?(text: string): boolean;
}

const enum DesktopTextInputEventType {
    Editing = 1,
    Input = 2,
    Suspended = 3,
    Resumed = 4,
    Copy = 5,
    Cut = 6,
    Paste = 7,
    SelectAll = 8,
    Undo = 9,
    Redo = 10
}

/**
 * Windows SDL IME context. SDL owns only the invisible input-method
 * connection and candidate positioning; LayaAir owns all visible rendering.
 * Other native platforms continue to use NativeTextInputAdapter.
 * @internal
 */
export class DesktopNativeTextInputContext implements INativeTextInputContext {
    readonly capabilities: NativeTextInputCapabilities = {
        composition: true,
        surroundingText: false,
        selection: false,
        candidateRect: true,
        virtualKeyboard: false,
        clipboard: false
    };

    private readonly _api: ConchTextInputAPI;
    private _client: INativeTextInputClient | null = null;
    private _sessionId: number = 0;
    private _platformActive: boolean = false;
    private _editable: boolean = false;

    constructor(api: ConchTextInputAPI = (window as any).conch) {
        this._api = api;
        this.capabilities.clipboard = typeof api?.getClipboardText === "function"
            && typeof api?.setClipboardText === "function";
    }

    static isSupported(host: any = window): boolean {
        const os = host?.conchConfig?.getOS?.();
        const api = host?.conch;
        return os === "Conch-window"
            && typeof api?.setTextInputEvtFunction === "function"
            && typeof api?.startTextInput === "function"
            && typeof api?.stopTextInput === "function"
            && typeof api?.setTextInputRect === "function";
    }

    initialize(client: INativeTextInputClient): boolean {
        if (!this._api || !client)
            return false;
        this._client = client;
        this._api.setTextInputEvtFunction(this.onNativeEvent);
        return true;
    }

    shutdown(): void {
        this.stopPlatformSession(this._sessionId);
        this._client = null;
    }

    beginSession(sessionId: number, config: NativeTextInputSessionConfig, _snapshot: NativeTextInputSnapshot): void {
        if (this._sessionId && this._sessionId !== sessionId)
            this.stopPlatformSession(this._sessionId);
        this._sessionId = sessionId;
        this._editable = config.editable;
        if (this._editable)
            this.startPlatformSession(sessionId);
    }

    updateState(_sessionId: number, _snapshot: NativeTextInputSnapshot): void {
        // SDL does not synchronously query surrounding text. TS remains the
        // authoritative state until a richer platform context is installed.
    }

    updateCaretRect(sessionId: number, rect: NativeTextInputRect): void {
        if (sessionId !== this._sessionId || !this._platformActive)
            return;
        this._api.setTextInputRect(
            sessionId,
            Math.round(rect.x),
            Math.round(rect.y),
            Math.max(1, Math.round(rect.width)),
            Math.max(1, Math.round(rect.height)));
    }

    suspendSession(sessionId: number): void {
        if (sessionId === this._sessionId)
            this.stopPlatformSession(sessionId);
    }

    resumeSession(sessionId: number): void {
        if (this._editable && sessionId === this._sessionId)
            this.startPlatformSession(sessionId);
    }

    endSession(sessionId: number, _policy: NativeTextInputEndPolicy): void {
        if (sessionId !== this._sessionId)
            return;
        this.stopPlatformSession(sessionId);
        this._sessionId = 0;
        this._editable = false;
    }

    showKeyboard(sessionId: number): void {
        if (this._editable && sessionId === this._sessionId)
            this.startPlatformSession(sessionId);
    }

    hideKeyboard(sessionId: number): void {
        if (sessionId === this._sessionId)
            this.stopPlatformSession(sessionId);
    }

    getClipboardText(): string {
        if (!this.capabilities.clipboard)
            return "";
        return String(this._api.getClipboardText!() ?? "");
    }

    setClipboardText(text: string): boolean {
        return this.capabilities.clipboard
            && this._api.setClipboardText!(text == null ? "" : String(text)) !== false;
    }

    private readonly onNativeEvent = (sessionId: number, eventType: number, text: string, start: number, length: number): void => {
        if (!this._client || sessionId !== this._sessionId)
            return;

        if (eventType === DesktopTextInputEventType.Suspended) {
            this._platformActive = false;
            this._client.platformSuspended(sessionId);
            return;
        }
        if (eventType === DesktopTextInputEventType.Resumed) {
            this._platformActive = true;
            this._client.platformResumed(sessionId);
            return;
        }
        if (!this._platformActive)
            return;

        if (eventType >= DesktopTextInputEventType.Copy
            && eventType <= DesktopTextInputEventType.Redo) {
            this.handleClipboardCommand(sessionId, eventType);
            return;
        }

        const value = text == null ? "" : String(text);
        if (eventType === DesktopTextInputEventType.Editing) {
            const snapshot = this._client.querySnapshot(sessionId);
            if (!value && snapshot && snapshot.compositionStart >= 0) {
                this._client.cancelComposition(sessionId);
                return;
            }

            const selectionStart = this.codePointIndexToUtf16(value, start);
            const selectionEnd = this.codePointIndexToUtf16(value, Math.max(0, start) + Math.max(0, length));
            this._client.setComposition(sessionId, value, {
                start: selectionStart,
                end: selectionEnd
            });
        }
        else if (eventType === DesktopTextInputEventType.Input) {
            this._client.commitText(sessionId, value);
        }
    };

    private startPlatformSession(sessionId: number): void {
        if (this._platformActive || sessionId <= 0)
            return;
        this._platformActive = this._api.startTextInput(sessionId) !== false;
    }

    private handleClipboardCommand(sessionId: number, command: DesktopTextInputEventType): void {
        const client = this._client;
        if (!client)
            return;
        if (command === DesktopTextInputEventType.Undo) {
            client.undo(sessionId);
            return;
        }
        if (command === DesktopTextInputEventType.Redo) {
            client.redo(sessionId);
            return;
        }
        const snapshot = client.querySnapshot(sessionId);
        if (!snapshot)
            return;

        if (command === DesktopTextInputEventType.SelectAll) {
            client.setSelection(sessionId, { start: 0, end: snapshot.text.length });
            return;
        }
        if (command === DesktopTextInputEventType.Paste) {
            const text = this.getClipboardText();
            if (text) {
                client.replaceText(sessionId, {
                    start: snapshot.selectionStart,
                    end: snapshot.selectionEnd
                }, text);
            }
            return;
        }

        if (snapshot.selectionStart === snapshot.selectionEnd)
            return;
        const start = Math.min(snapshot.selectionStart, snapshot.selectionEnd);
        const end = Math.max(snapshot.selectionStart, snapshot.selectionEnd);
        if (!this.setClipboardText(snapshot.text.substring(start, end)))
            return;
        if (command === DesktopTextInputEventType.Cut)
            client.replaceText(sessionId, { start, end }, "");
    }

    private stopPlatformSession(sessionId: number): void {
        if (!this._platformActive || sessionId <= 0)
            return;
        this._platformActive = false;
        this._api.stopTextInput(sessionId);
    }

    private codePointIndexToUtf16(value: string, index: number): number {
        let utf16Index = 0;
        let remaining = Math.max(0, Math.trunc(index));
        for (const character of value) {
            if (remaining-- <= 0)
                break;
            utf16Index += character.length;
        }
        return utf16Index;
    }
}
