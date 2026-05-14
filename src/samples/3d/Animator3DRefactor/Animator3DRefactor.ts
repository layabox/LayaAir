/**
 * Animator 重构回归示例 — 主入口
 *
 * 由 `src/samples/index.ts` 临时改 `new Main(true, false, Animator3DRefactor)` 启动。
 *
 * 模式：
 *   ?auto=1  → Auto 模式：串行跑全部 case，console 输出 PASS/FAIL/SKIP + 屏幕浮层
 *   不带参   → Interactive 模式：UI 按钮单跑
 *
 * 该示例是 P0-P4 Animator 重构每个阶段的回归基线，行为不应因重构改变。
 */

import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
import { TestRunner } from "./core/TestRunner";
import { AutoLog } from "./core/AutoLog";
import { SceneRig } from "./scene/SceneRig";
import { InteractiveUI } from "./ui/InteractiveUI";
import { allResourceUrls } from "./scene/ResourceManifest";
import { registerPlaybackTests } from "./tests/A_PlaybackTests";
import { registerCrossFadeTests } from "./tests/B_CrossFadeTests";
import { registerLayerBlendTests } from "./tests/C_LayerBlendTests";
import { registerAvatarMaskTests } from "./tests/D_AvatarMaskTests";
import { registerControllerParamsTests } from "./tests/E_ControllerParamsTests";
import { registerEventScriptTests } from "./tests/F_EventScriptTests";
import { registerKeyframeTypeTests } from "./tests/G_KeyframeTypeTests";
import { registerCullingUpdateTests } from "./tests/H_CullingUpdateTests";
import { registerBoneLinkTests } from "./tests/I_BoneLinkTests";
import { registerBatchTests } from "./tests/J_BatchTests";

export class Animator3DRefactor {
    private _runner: TestRunner;
    private _log: AutoLog;
    private _rig!: SceneRig;
    private _autoMode: boolean;

    constructor() {
        // [临时] 强制 Auto 模式，便于跑回归。需要 Interactive 模式时改回：
        //   /[?&]auto=1\b/.test(globalThis.location?.search ?? "")
        this._autoMode = true;
        this._runner = new TestRunner();
        this._log = new AutoLog();
        this._log.setHeader(this._autoMode ? "Auto 模式 — 加载资源中..." : "Interactive 模式 — 加载资源中...");
        this._init();
    }

    private async _init(): Promise<void> {
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Laya.stage.bgColor = "#202124";
        //Stat.show();

        try {
            await Laya.loader.load(allResourceUrls());
        } catch (err) {
            this._log.setHeader(`资源加载失败：${err}`);
            console.error(err);
            return;
        }

        this._rig = new SceneRig();

        // 注册测试组（A-J 全部实装；G9/G10 标 SKIP）
        // [临时] 单测 J 组 3000 创建压测 —— 恢复全套回归时取消下面 A-I 的注释
        registerPlaybackTests(this._runner, this._rig);
        registerCrossFadeTests(this._runner, this._rig);
        registerLayerBlendTests(this._runner, this._rig);
        registerAvatarMaskTests(this._runner, this._rig);
        registerControllerParamsTests(this._runner, this._rig);
        registerEventScriptTests(this._runner, this._rig);
        registerKeyframeTypeTests(this._runner, this._rig);
        registerCullingUpdateTests(this._runner, this._rig);
        registerBoneLinkTests(this._runner, this._rig);
        registerBatchTests(this._runner, this._rig);

        this._runner.setLog(this._log);

        if (this._autoMode) {
            await this._runner.runAll();
        } else {
            new InteractiveUI(this._runner);
            this._log.setHeader(`Interactive 模式 — ${this._runner.cases.length} cases registered`);
        }
    }

}
