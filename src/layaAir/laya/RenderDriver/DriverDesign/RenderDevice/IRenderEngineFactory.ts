import { Config } from "../../../../Config";

export interface IRenderEngineFactory {
    createEngine(config: Config, canvas: any): Promise<void>;
}