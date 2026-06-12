/**
 * Animator 重构回归示例 — Interactive 模式 UI
 *
 * 按 group 渲染一列分组；每组下面是该组所有 case 的按钮。
 * 点击按钮 → runner.runOne(case)。
 */

import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Text } from "laya/display/Text";
import { Box } from "laya/ui/Box";
import { Button } from "laya/ui/Button";
import { Event } from "laya/events/Event";
import { TestCase } from "../core/TestCase";
import { TestRunner } from "../core/TestRunner";

const GROUP_TITLE: Record<string, string> = {
    A_Playback: "A 基础播放",
    B_CrossFade: "B CrossFade",
    C_LayerBlend: "C 多层混合",
    D_AvatarMask: "D AvatarMask",
    E_ControllerParams: "E Controller+参数",
    F_EventScript: "F 事件/脚本",
    G_KeyframeType: "G KeyFrame 类型",
    H_CullingUpdate: "H Culling/Update",
    I_BoneLink: "I BoneLink",
    J_Batch: "J 批量化",
};

export class InteractiveUI {
    private _root: Sprite;
    private _runner: TestRunner;

    constructor(runner: TestRunner) {
        this._runner = runner;
        this._root = new Sprite();
        this._root.zOrder = 9000;
        Laya.stage.addChild(this._root);
        this._render();
    }

    private _render(): void {
        const groups = this._runner.casesByGroup();
        const groupKeys = Array.from(groups.keys()).sort();

        const col = new Box();
        col.x = 8;
        col.y = 8;
        this._root.addChild(col);

        let y = 0;
        for (const key of groupKeys) {
            const groupTitle = new Text();
            groupTitle.text = GROUP_TITLE[key] ?? key;
            groupTitle.color = "#ffeb3b";
            groupTitle.fontSize = 16;
            groupTitle.bold = true;
            groupTitle.x = 0;
            groupTitle.y = y;
            col.addChild(groupTitle);
            y += 22;

            const cases = groups.get(key)!;
            // 每行 4 个按钮
            for (let i = 0; i < cases.length; i++) {
                const c = cases[i];
                const btn = this._makeButton(c);
                btn.x = (i % 4) * 130;
                btn.y = y + Math.floor(i / 4) * 30;
                col.addChild(btn);
            }
            y += Math.ceil(cases.length / 4) * 30 + 10;
        }

        // 顶部说明
        const hint = new Text();
        hint.text = "Interactive 模式 — 点击按钮单跑用例。Auto 模式请加 ?auto=1";
        hint.color = "#90caf9";
        hint.fontSize = 13;
        hint.x = 8;
        hint.y = Laya.stage.height - 24;
        this._root.addChild(hint);
    }

    private _makeButton(c: TestCase): Sprite {
        const btn = new Sprite();
        const bg = new Sprite();
        bg.graphics.drawRect(0, 0, 124, 26, c.skip ? "#555" : "#1976d2");
        btn.addChild(bg);

        const lbl = new Text();
        lbl.text = `[${c.id}] ${c.title}`;
        lbl.color = "#ffffff";
        lbl.fontSize = 12;
        lbl.x = 4;
        lbl.y = 5;
        lbl.width = 116;
        lbl.overflow = Text.HIDDEN;
        btn.addChild(lbl);

        btn.mouseEnabled = !c.skip;
        if (!c.skip) {
            btn.on(Event.CLICK, this, () => {
                this._runner.runOne(c);
            });
        }
        return btn;
    }
}
