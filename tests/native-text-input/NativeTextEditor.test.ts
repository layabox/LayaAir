import test from "node:test";
import assert from "node:assert/strict";
import { NativeTextEditor } from "../../src/layaAir/platforms/native/NativeTextEditor";
import { NativeTextInputState } from "../../src/layaAir/platforms/native/NativeTextInputTypes";

test("rejects stale platform callbacks by session id", () => {
    const editor = new NativeTextEditor();
    editor.begin(7, "abc", 3, 3);

    assert.equal(editor.commitText(6, "x"), null);
    assert.equal(editor.committedText, "abc");
    assert.equal(editor.snapshot().sessionId, 7);
});

test("keeps composition separate until commit", () => {
    const editor = new NativeTextEditor();
    editor.begin(1, "hello", 1, 4);
    const composing = editor.setComposition(1, "中", 1, 1)!;

    assert.equal(editor.committedText, "hello");
    assert.equal(editor.displayText, "h中o");
    assert.equal(composing.state, NativeTextInputState.Composing);
    assert.equal(composing.compositionStart, 1);
    assert.equal(composing.compositionEnd, 2);
    assert.equal(composing.selectionStart, 2);

    const committed = editor.finishComposition(1)!;
    assert.equal(editor.committedText, "h中o");
    assert.equal(committed.compositionStart, -1);
    assert.equal(committed.selectionStart, 2);
    assert.equal(committed.state, NativeTextInputState.Active);
});

test("can cancel composition without mutating committed text", () => {
    const editor = new NativeTextEditor();
    editor.begin(2, "abcdef", 2, 5);
    editor.setComposition(2, "候选", 2, 2);
    const snapshot = editor.cancelComposition(2)!;

    assert.equal(editor.committedText, "abcdef");
    assert.equal(snapshot.text, "abcdef");
    assert.equal(snapshot.selectionStart, 2);
    assert.equal(snapshot.selectionEnd, 5);
});

test("normalizes ranges and replaces the active selection", () => {
    const editor = new NativeTextEditor();
    editor.begin(3, "abcdef", 5, 2);
    assert.deepEqual(
        [editor.snapshot().selectionStart, editor.snapshot().selectionEnd],
        [2, 5]);

    const snapshot = editor.commitText(3, "X")!;
    assert.equal(snapshot.text, "abXf");
    assert.equal(snapshot.selectionStart, 3);
    assert.equal(snapshot.selectionEnd, 3);
});

test("suspend preserves logical editing state", () => {
    const editor = new NativeTextEditor();
    editor.begin(4, "abc", 1, 1);
    editor.setComposition(4, "拼", 1, 1);

    assert.equal(editor.suspend(4)!.state, NativeTextInputState.Suspended);
    const resumed = editor.resume(4)!;
    assert.equal(resumed.state, NativeTextInputState.Composing);
    assert.equal(resumed.text, "a拼bc");
});

test("end can commit or cancel pending composition", () => {
    const commitEditor = new NativeTextEditor();
    commitEditor.begin(5, "ab", 1, 1);
    commitEditor.setComposition(5, "中");
    const committed = commitEditor.end(5, true)!;
    assert.equal(commitEditor.committedText, "a中b");
    assert.equal(committed.state, NativeTextInputState.Inactive);
    assert.equal(committed.sessionId, 0);

    const cancelEditor = new NativeTextEditor();
    cancelEditor.begin(6, "ab", 1, 1);
    cancelEditor.setComposition(6, "中");
    cancelEditor.end(6, false);
    assert.equal(cancelEditor.committedText, "ab");
});

test("deleteSurroundingText deletes selection or caret surroundings", () => {
    const editor = new NativeTextEditor();
    editor.begin(8, "abcdef", 2, 4);
    assert.equal(editor.deleteSurroundingText(8, 1, 1)!.text, "abef");

    editor.setSelection(8, 2, 2);
    assert.equal(editor.deleteSurroundingText(8, 1, 2)!.text, "a");
});

test("an empty first composition still enters composing state", () => {
    const editor = new NativeTextEditor();
    editor.begin(9, "abc", 1, 1);
    const revision = editor.revision;

    const snapshot = editor.setComposition(9, "", 0, 0)!;
    assert.equal(snapshot.state, NativeTextInputState.Composing);
    assert.equal(snapshot.compositionStart, 1);
    assert.equal(snapshot.compositionEnd, 1);
    assert.equal(snapshot.revision, revision + 1);
});

test("moving selection commits composition even when the target caret is unchanged", () => {
    const editor = new NativeTextEditor();
    editor.begin(10, "ab", 1, 1);
    editor.setComposition(10, "X", 1, 1);
    const revision = editor.revision;

    const snapshot = editor.setSelection(10, 2, 2)!;
    assert.equal(editor.committedText, "aXb");
    assert.equal(snapshot.state, NativeTextInputState.Active);
    assert.equal(snapshot.compositionStart, -1);
    assert.equal(snapshot.revision, revision + 1);
});

test("selection end -1 keeps the existing select-all convention", () => {
    const editor = new NativeTextEditor();
    editor.begin(11, "select me", 0, 0);

    const snapshot = editor.setSelection(11, 0, -1)!;
    assert.equal(snapshot.selectionStart, 0);
    assert.equal(snapshot.selectionEnd, 9);
});

test("deleting a select-all range publishes an empty snapshot", () => {
    const editor = new NativeTextEditor();
    editor.begin(16, "delete me", 0, 0);
    editor.setSelection(16, 0, -1);

    const snapshot = editor.deleteSurroundingText(16, 0, 1)!;
    assert.equal(editor.committedText, "");
    assert.equal(snapshot.text, "");
    assert.deepEqual([snapshot.selectionStart, snapshot.selectionEnd], [0, 0]);
});

test("undo and redo restore both text and selection", () => {
    const editor = new NativeTextEditor();
    editor.begin(12, "abc", 3, 3);
    editor.commitText(12, "d");
    editor.deleteSurroundingText(12, 1, 0);

    let snapshot = editor.undo(12)!;
    assert.equal(snapshot.text, "abcd");
    assert.deepEqual([snapshot.selectionStart, snapshot.selectionEnd], [4, 4]);

    snapshot = editor.undo(12)!;
    assert.equal(snapshot.text, "abc");
    assert.deepEqual([snapshot.selectionStart, snapshot.selectionEnd], [3, 3]);

    snapshot = editor.redo(12)!;
    assert.equal(snapshot.text, "abcd");
    assert.deepEqual([snapshot.selectionStart, snapshot.selectionEnd], [4, 4]);
});

test("a new edit clears redo history", () => {
    const editor = new NativeTextEditor();
    editor.begin(13, "a", 1, 1);
    editor.commitText(13, "b");
    editor.undo(13);
    editor.commitText(13, "c");

    assert.equal(editor.snapshot().text, "ac");
    assert.equal(editor.redo(13), null);
});

test("an IME commit is one undoable edit", () => {
    const editor = new NativeTextEditor();
    editor.begin(14, "ab", 1, 1);
    editor.setComposition(14, "input", 5, 5);
    editor.commitText(14, "result");

    assert.equal(editor.snapshot().text, "aresultb");
    const snapshot = editor.undo(14)!;
    assert.equal(snapshot.text, "ab");
    assert.deepEqual([snapshot.selectionStart, snapshot.selectionEnd], [1, 1]);
});

test("programmatic text replacement starts a new history", () => {
    const editor = new NativeTextEditor();
    editor.begin(15, "a", 1, 1);
    editor.commitText(15, "b");
    editor.setText(15, "external", 8, 8);

    assert.equal(editor.undo(15), null);
    assert.equal(editor.snapshot().text, "external");
});

test("maxLength limits raw inserted text before adapter restriction", () => {
    const editor = new NativeTextEditor();
    editor.begin(17, "", 0, 0, 5);

    const snapshot = editor.commitText(17, "abc123456")!;
    assert.equal(snapshot.text, "abc12");
    assert.deepEqual([snapshot.selectionStart, snapshot.selectionEnd], [5, 5]);
});

test("maxLength truncates only replacement text and retains the suffix", () => {
    const editor = new NativeTextEditor();
    editor.begin(18, "12345", 1, 4, 5);

    const snapshot = editor.commitText(18, "abcdef")!;
    assert.equal(snapshot.text, "1abc5");
    assert.deepEqual([snapshot.selectionStart, snapshot.selectionEnd], [4, 4]);
});

test("maxLength limits an IME commit as one replacement", () => {
    const editor = new NativeTextEditor();
    editor.begin(19, "12", 2, 2, 5);
    editor.setComposition(19, "abcdef", 6, 6);

    const snapshot = editor.commitText(19, "abcdef")!;
    assert.equal(snapshot.text, "12abc");
    assert.deepEqual([snapshot.selectionStart, snapshot.selectionEnd], [5, 5]);
    assert.deepEqual([snapshot.compositionStart, snapshot.compositionEnd], [-1, -1]);
});
