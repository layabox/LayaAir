export class LayaEnv {
    static version: string = "3.0.2";
    static isPlaying: boolean = true;
    static isPreview: boolean = false;
    static isConch: boolean = (<any>window).conch != null;

    static beforeInit: (stageConfig: IStageConfig) => void;
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