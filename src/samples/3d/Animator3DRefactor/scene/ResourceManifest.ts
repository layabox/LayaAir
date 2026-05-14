/**
 * Animator 重构回归示例 — 资源 URL 常量
 *
 * 所有路径以 bin/sample-resource/ 为根（Main.ts 已配置 URL.basePath += "sample-resource/"）。
 */

export const Resources = {
    // danding 角色（A/B/E/F/H/I/J 主载体）
    danding: {
        prefab: "res/danding/danding.lh",
        controller: "res/danding/AnimationControllerAll.controller",
        // 子动画 clip（独立加载，供程序化测试用）
        clipStand:  "res/danding/Stand/Take 001.lani",
        clipAttack: "res/danding/Attack/Take 001.lani",
        clipRun:    "res/danding/Run/Take 001.lani",
        clipSkill1: "res/danding/Skill1/Take 001.lani",
        clipSkill2: "res/danding/Skill2/Take 001.lani",
        clipSuper:  "res/danding/Super/Take 001.lani",
        clipStun:   "res/danding/Stun/Take 001.lani",
        // controller 内已包含的 state 名（用于 play()/crossFade()）
        states: ["Stand", "Attack", "Run", "Skill1", "Skill2", "Super", "Stun"],
    },

    // Drunk Walk 角色（C/D 主载体）
    maskWalk: {
        prefab: "res/threeDimen/LayaScene_MaskModelTest/Drunk Walk@0.lh",
        clip:   "res/threeDimen/LayaScene_MaskModelTest/Drunk Walk/mixamo.com.lani",
        // 三种 controller（全身 / 上半身 mask / 下半身 mask）
        controllerFull: "res/threeDimen/LayaScene_MaskModelTest/walkAniCon.controller",
        controllerUp:   "res/threeDimen/LayaScene_MaskModelTest/walkAniCon_up.controller",
        controllerDown: "res/threeDimen/LayaScene_MaskModelTest/walkAniCon_Down.controller",
        // mask 资源（已在 controller 里引用，单独列在这里供反查）
        maskUp:   "res/threeDimen/LayaScene_MaskModelTest/maskUp.lavm",
        maskDown: "res/threeDimen/LayaScene_MaskModelTest/maskDown.lavm",
    },
} as const;

/**
 * Auto 模式预加载列表（启动时一次性 Laya.loader.load）。
 *
 * 只预加载 prefab（.lh）—— 引擎会自动级联加载 prefab 引用的 controller / lavm。
 * 单独的 .controller / .lavm 资源（如 walkAniCon_up）由具体 case 现用现加载（用 Loader.load + type）。
 */
export function allResourceUrls(): string[] {
    return [
        Resources.danding.prefab,
        Resources.maskWalk.prefab,
    ];
}
