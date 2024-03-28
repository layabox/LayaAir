export class LayaEnv {
    static version: string = "3.1.2";
    static isPlaying: boolean = true;
    static isPreview: boolean = false;
    static isConch: boolean = (<any>window).conch != null;

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