import test from "node:test";
import assert from "node:assert/strict";
import { DesktopNativeTextInputContext } from "../../src/layaAir/platforms/native/DesktopNativeTextInputContext";
import { NativeTextInputBridge } from "../../src/layaAir/platforms/native/NativeTextInputBridge";
import {
    NativeTextInputAction,
    NativeTextInputEndPolicy,
    NativeTextInputSessionConfig
} from "../../src/layaAir/platforms/native/NativeTextInputContext";
import { NativeTextInputState } from "../../src/layaAir/platforms/native/NativeTextInputTypes";

class FakeConchTextInputAPI {
    callback!: (sessionId: number, eventType: number, text: string, start: number, length: number) => void;
    starts: number[] = [];
    stops: number[] = [];
    rects: number[][] = [];
    clipboard: string = "";

    setTextInputEvtFunction(callback: (sessionId: number, eventType: number, text: string, start: number, length: number) => void): void {
        this.callback = callback;
    }
    startTextInput(sessionId: number): boolean {
        this.starts.push(sessionId);
        return true;
    }
    stopTextInput(sessionId: number): void {
        this.stops.push(sessionId);
    }
    setTextInputRect(sessionId: number, x: number, y: number, width: number, height: number): void {
        this.rects.push([sessionId, x, y, width, height]);
    }
    getClipboardText(): string {
        return this.clipboard;
    }
    setClipboardText(text: string): boolean {
        this.clipboard = text;
        return true;
    }
}

const config: NativeTextInputSessionConfig = {
    multiline: false,
    editable: true,
    password: false,
    wordWrap: false,
    inputType: "text",
    action: NativeTextInputAction.Done,
    maxLength: 10000
};

test("canvas native input is selected only for Windows with a complete bridge", () => {
    const api = new FakeConchTextInputAPI();
    assert.equal(DesktopNativeTextInputContext.isSupported({
        conchConfig: { getOS: () => "Conch-window" },
        conch: api
    }), true);
    assert.equal(DesktopNativeTextInputContext.isSupported({
        conchConfig: { getOS: () => "Conch-window" },
        conch: { startTextInput() { return true; } }
    }), false);
    for (const os of ["Conch-linux", "Conch-android", "Conch-ios", "Conch-mac"]) {
        assert.equal(DesktopNativeTextInputContext.isSupported({
            conchConfig: { getOS: () => os },
            conch: api
        }), false, `${os} must keep the legacy native input adapter`);
    }
});

test("SDL editing and input events update the authoritative TS editor", () => {
    const api = new FakeConchTextInputAPI();
    const bridge = new NativeTextInputBridge(new DesktopNativeTextInputContext(api));
    const sessionId = bridge.begin(config, "ab", 1, 1).sessionId;

    api.callback(sessionId, 1, "候选", 1, 0);
    assert.equal(bridge.editor.displayText, "a候选b");
    assert.equal(bridge.editor.committedText, "ab");

    api.callback(sessionId, 2, "中", 0, 0);
    assert.equal(bridge.editor.committedText, "a中b");
    assert.deepEqual(api.starts, [sessionId]);
});

test("idle empty SDL editing events do not create a composition feedback loop", () => {
    const api = new FakeConchTextInputAPI();
    const bridge = new NativeTextInputBridge(new DesktopNativeTextInputContext(api));
    const sessionId = bridge.begin(config, "abcdef", 1, 4).sessionId;
    const initial = bridge.editor.snapshot();

    // Windows IMEs may emit this event repeatedly before producing preedit
    // text. It must preserve both the selected text and editor revision.
    for (let index = 0; index < 20; index++)
        api.callback(sessionId, 1, "", 0, 0);

    const idle = bridge.editor.snapshot();
    assert.equal(idle.revision, initial.revision);
    assert.equal(idle.state, NativeTextInputState.Active);
    assert.equal(idle.text, "abcdef");
    assert.equal(idle.selectionStart, 1);
    assert.equal(idle.selectionEnd, 4);

    // A non-empty event starts composition over the selection. A subsequent
    // empty event still retains its valid SDL meaning: cancel that composition.
    api.callback(sessionId, 1, "nihao", 5, 0);
    assert.equal(bridge.editor.state, NativeTextInputState.Composing);
    assert.equal(bridge.editor.displayText, "anihaoef");
    api.callback(sessionId, 1, "", 0, 0);

    const cancelled = bridge.editor.snapshot();
    assert.equal(cancelled.state, NativeTextInputState.Active);
    assert.equal(cancelled.text, "abcdef");
    assert.equal(cancelled.selectionStart, 1);
    assert.equal(cancelled.selectionEnd, 4);
});

test("desktop context rejects stale and suspended SDL events", () => {
    const api = new FakeConchTextInputAPI();
    const bridge = new NativeTextInputBridge(new DesktopNativeTextInputContext(api));
    const first = bridge.begin(config, "one", 3, 3).sessionId;
    const second = bridge.begin(config, "two", 3, 3).sessionId;

    api.callback(first, 2, " stale", 0, 0);
    bridge.suspend();
    api.callback(second, 2, " suspended", 0, 0);
    assert.equal(bridge.editor.committedText, "two");

    bridge.resume();
    api.callback(second, 2, "!", 0, 0);
    assert.equal(bridge.editor.committedText, "two!");
});

test("native window lifecycle drives the logical suspended state", () => {
    const api = new FakeConchTextInputAPI();
    const bridge = new NativeTextInputBridge(new DesktopNativeTextInputContext(api));
    const sessionId = bridge.begin(config, "active", 6, 6).sessionId;

    api.callback(sessionId, 3, "", 0, 0);
    assert.equal(bridge.editor.state, NativeTextInputState.Suspended);
    api.callback(sessionId, 2, " ignored", 0, 0);
    assert.equal(bridge.editor.committedText, "active");

    api.callback(sessionId, 4, "", 0, 0);
    assert.equal(bridge.editor.state, NativeTextInputState.Active);
});

test("caret rectangle is rounded and no platform input starts for readonly controls", () => {
    const api = new FakeConchTextInputAPI();
    const bridge = new NativeTextInputBridge(new DesktopNativeTextInputContext(api));
    const sessionId = bridge.begin(config, "", 0, 0).sessionId;
    bridge.updateCaretRect({ x: 10.4, y: 20.6, width: 0.2, height: 17.7 });
    bridge.end(NativeTextInputEndPolicy.CommitComposition);

    const readonlyConfig = { ...config, editable: false };
    bridge.begin(readonlyConfig, "readonly", 0, 0);

    assert.deepEqual(api.rects, [[sessionId, 10, 21, 1, 18]]);
    assert.equal(api.starts.length, 1);
});

test("desktop clipboard is exposed through the internal bridge", () => {
    const api = new FakeConchTextInputAPI();
    const bridge = new NativeTextInputBridge(new DesktopNativeTextInputContext(api));

    assert.equal(bridge.setClipboardText("copy me"), true);
    assert.equal(bridge.getClipboardText(), "copy me");
});

test("native copy cut paste and select-all commands edit the active session", () => {
    const api = new FakeConchTextInputAPI();
    const bridge = new NativeTextInputBridge(new DesktopNativeTextInputContext(api));
    const sessionId = bridge.begin(config, "copy target", 0, 4).sessionId;

    api.callback(sessionId, 5, "", 0, 0);
    assert.equal(api.clipboard, "copy");

    api.callback(sessionId, 6, "", 0, 0);
    assert.equal(bridge.editor.committedText, " target");

    api.clipboard = "paste";
    api.callback(sessionId, 7, "", 0, 0);
    assert.equal(bridge.editor.committedText, "paste target");

    api.callback(sessionId, 8, "", 0, 0);
    assert.deepEqual(bridge.editor.snapshot().selectionStart, 0);
    assert.deepEqual(bridge.editor.snapshot().selectionEnd, "paste target".length);

    api.callback(sessionId, 9, "", 0, 0);
    assert.equal(bridge.editor.committedText, " target");

    api.callback(sessionId, 10, "", 0, 0);
    assert.equal(bridge.editor.committedText, "paste target");
});
