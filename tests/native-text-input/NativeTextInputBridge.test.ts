import test from "node:test";
import assert from "node:assert/strict";
import { NativeTextInputBridge } from "../../src/layaAir/platforms/native/NativeTextInputBridge";
import {
    INativeTextInputClient,
    INativeTextInputContext,
    NativeTextInputAction,
    NativeTextInputCapabilities,
    NativeTextInputEndPolicy,
    NativeTextInputRect,
    NativeTextInputSessionConfig
} from "../../src/layaAir/platforms/native/NativeTextInputContext";
import { NativeTextInputSnapshot, NativeTextInputState } from "../../src/layaAir/platforms/native/NativeTextInputTypes";

class MockNativeTextInputContext implements INativeTextInputContext {
    readonly capabilities: NativeTextInputCapabilities = {
        composition: true,
        surroundingText: true,
        selection: true,
        candidateRect: true,
        virtualKeyboard: true,
        clipboard: true
    };
    client!: INativeTextInputClient;
    calls: Array<{ name: string; sessionId?: number; value?: unknown }> = [];

    initialize(client: INativeTextInputClient): boolean {
        this.client = client;
        this.calls.push({ name: "initialize" });
        return true;
    }

    shutdown(): void { this.calls.push({ name: "shutdown" }); }
    beginSession(sessionId: number, config: NativeTextInputSessionConfig, snapshot: NativeTextInputSnapshot): void {
        this.calls.push({ name: "begin", sessionId, value: { config, snapshot } });
    }
    updateState(sessionId: number, snapshot: NativeTextInputSnapshot): void {
        this.calls.push({ name: "update", sessionId, value: snapshot });
    }
    updateCaretRect(sessionId: number, rect: NativeTextInputRect): void {
        this.calls.push({ name: "caret", sessionId, value: rect });
    }
    suspendSession(sessionId: number): void { this.calls.push({ name: "suspend", sessionId }); }
    resumeSession(sessionId: number): void { this.calls.push({ name: "resume", sessionId }); }
    endSession(sessionId: number, policy: NativeTextInputEndPolicy): void {
        this.calls.push({ name: "end", sessionId, value: policy });
    }
    showKeyboard(sessionId: number): void { this.calls.push({ name: "showKeyboard", sessionId }); }
    hideKeyboard(sessionId: number): void { this.calls.push({ name: "hideKeyboard", sessionId }); }
    platformSuspended(sessionId: number): void { this.client.platformSuspended(sessionId); }
    platformResumed(sessionId: number): void { this.client.platformResumed(sessionId); }
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

test("bridge forwards a session and publishes IME editing commands", () => {
    const context = new MockNativeTextInputContext();
    const bridge = new NativeTextInputBridge(context);
    const notifications: string[] = [];
    bridge.onSnapshotChanged = snapshot => notifications.push(snapshot.text);

    const begun = bridge.begin(config, "ab", 1, 1);
    context.client.setComposition(begun.sessionId, "候选", { start: 2, end: 2 });
    context.client.commitText(begun.sessionId, "中");

    assert.equal(bridge.editor.committedText, "a中b");
    assert.deepEqual(notifications, ["ab", "a候选b", "a中b"]);
    assert.deepEqual(context.calls.map(call => call.name), ["initialize", "begin", "update", "update"]);
});

test("bridge drops commands from a previous native session", () => {
    const context = new MockNativeTextInputContext();
    const bridge = new NativeTextInputBridge(context);
    const first = bridge.begin(config, "first", 5, 5);
    const second = bridge.begin(config, "second", 6, 6);

    context.client.commitText(first.sessionId, " stale");
    assert.equal(bridge.editor.committedText, "second");
    assert.equal(context.client.querySnapshot(first.sessionId), null);
    assert.equal(context.client.querySnapshot(second.sessionId)!.text, "second");
});

test("suspend preserves logical session and resume republishes state", () => {
    const context = new MockNativeTextInputContext();
    const bridge = new NativeTextInputBridge(context);
    const sessionId = bridge.begin(config, "abc", 3, 3).sessionId;

    bridge.suspend();
    assert.equal(context.client.querySnapshot(sessionId)!.sessionId, sessionId);
    context.client.commitText(sessionId, "ignored while suspended");
    assert.equal(bridge.editor.committedText, "abc");
    bridge.resume();

    assert.deepEqual(
        context.calls.filter(call => call.name === "suspend" || call.name === "resume" || call.name === "update").map(call => call.name),
        ["suspend", "resume", "update"]);
});

test("actions and caret updates are routed only for the active session", () => {
    const context = new MockNativeTextInputContext();
    const bridge = new NativeTextInputBridge(context);
    const actions: NativeTextInputAction[] = [];
    bridge.onAction = action => actions.push(action);
    const sessionId = bridge.begin(config, "", 0, 0).sessionId;

    context.client.performAction(sessionId + 1, NativeTextInputAction.Search);
    context.client.performAction(sessionId, NativeTextInputAction.Done);
    bridge.updateCaretRect({ x: 10, y: 20, width: 1, height: 18 });
    bridge.end(NativeTextInputEndPolicy.CommitComposition);
    bridge.updateCaretRect({ x: 0, y: 0, width: 0, height: 0 });

    assert.deepEqual(actions, [NativeTextInputAction.Done]);
    assert.equal(context.calls.filter(call => call.name === "caret").length, 1);
    assert.equal(context.calls.filter(call => call.name === "end")[0].sessionId, sessionId);
});

test("platform lifecycle suspends without recursively controlling the platform context", () => {
    const context = new MockNativeTextInputContext();
    const bridge = new NativeTextInputBridge(context);
    const sessionId = bridge.begin(config, "ab", 1, 1).sessionId;
    bridge.setComposition(sessionId, "draft", { start: 5, end: 5 });

    context.client.platformSuspended(sessionId);
    assert.equal(bridge.editor.state, NativeTextInputState.Suspended);
    assert.equal(bridge.editor.composing, false);
    assert.equal(context.calls.filter(call => call.name === "suspend").length, 0);

    context.client.platformResumed(sessionId);
    assert.equal(bridge.editor.state, NativeTextInputState.Active);
    assert.equal(context.calls.filter(call => call.name === "resume").length, 0);
});

test("engine can finish pending composition before adapter teardown", () => {
    const context = new MockNativeTextInputContext();
    const bridge = new NativeTextInputBridge(context);
    const sessionId = bridge.begin(config, "ab", 1, 1).sessionId;
    bridge.setComposition(sessionId, "中", { start: 1, end: 1 });

    const snapshot = bridge.finishPendingComposition()!;
    assert.equal(snapshot.text, "a中b");
    assert.equal(bridge.editor.committedText, "a中b");
    assert.equal(bridge.editor.composing, false);
});

test("bridge publishes undo and redo snapshots", () => {
    const context = new MockNativeTextInputContext();
    const bridge = new NativeTextInputBridge(context);
    const notifications: string[] = [];
    bridge.onSnapshotChanged = snapshot => notifications.push(snapshot.text);
    bridge.begin(config, "a", 1, 1);
    bridge.insertText("b");
    bridge.undo();
    bridge.redo();

    assert.deepEqual(notifications, ["a", "ab", "a", "ab"]);
    assert.equal(context.calls.filter(call => call.name === "update").length, 3);
});
