/**
 * @blueprintable
 */
export class LayaEnv {
    /**
     * @en The version of the engine.
     * @zh 引擎的版本。
     * @readonly
     */
    static version: string = "3.3.0-beta.3";

    /**
     * @en Whether the engine is running in the editor. If it is false, it indicates that the engine is running in the scene view of the IDE, otherwise it is true.
     * @zh 区分引擎是在编辑模式还是播放模式，在IDE的场景视图编辑时，此值为 false，否则为 true。
     * @readonly
     */
    static isPlaying: boolean = true;

    /**
     * @en Whether the engine is running in the preview mode or the product mode. If it is false, it indicates that the engine is running after the release, otherwise it is true.
     * @zh 区分引擎是在预览模式还是产品模式。如果发布后运行，此值为 false，否则为 true。
     * @readonly
     */
    static isPreview: boolean = false;

    /**
     * @en Whether the engine is running in the native platform.
     * @zh 引擎是否正在运行在原生平台。
     * @readonly
     */
    static isConch: boolean = window ? ((<any>window).conch != null) : false;

    /**
     * @en Whether the engine is running in the editor. The engine may have two states in the editor, one is running in the scene view of the editor, and the other is running in the game view of the editor. Please distinguish these two states through isPlaying.
     * @zh 引擎是否正在运行在编辑器下。引擎在编辑器下可能有两种状态，一种是运行在编辑器的场景视图，一种是运行在编辑器的游戏视图，请通过isPlaying区别这两种情况。
     * @readonly
     */
    static isEditor: boolean = false;

    /** @deprecated Uses Laya.addBeforeInitCallback */
    static beforeInit: (stageConfig: IStageConfig) => void;
    /** @deprecated Use Laya.addAfterInitCallback */
    static afterInit: () => void;
}

export interface IStageConfig {
    designWidth?: number;
    designHeight?: number;
    scaleMode?: string;
    screenMode?: string;
    alignV?: string;
    alignH?: string;
    backgroundColor?: string;
}