export class LayaEnv {
    static version: string = "3.2.0-beta.3";
    static isPlaying: boolean = true;
    static isPreview: boolean = false;
    static isConch: boolean = window ? ((<any>window).conch != null) : false;

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