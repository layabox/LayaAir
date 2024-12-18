import type { ILogger } from "./ILogger";
import { ConsoleLogger } from "./ILogger";
import type { Vec3, Vec4 } from "./mmdTypes";
import type { VpdObject } from "./vpdObject";

/**
 * VpdReader is a static class that parses VPD data
 */
export class VpdReader {
    private static readonly _Signature = "Vocaloid Pose Data file";

    private constructor() { /* block constructor */ }

    /**
     * Parse VPD data
     * @param data VPD data
     * @param logger logger
     * @returns MMD animation data
     * @throws {Error} If validation fails
     */
    public static Parse(data: string, logger: ILogger = new ConsoleLogger()): VpdObject {
        if (!data.startsWith(VpdReader._Signature)) {
            throw new Error("VPD signature is not valid.");
        }

        const state: [number] = [VpdReader._Signature.length];

        // skip model name
        VpdReader._ConsumeStatement(data, state);
        // skip bone count
        VpdReader._ConsumeStatement(data, state);

        const bones: VpdObject["bones"] = {};
        const morphs: VpdObject["morphs"] = {};

        while (state[0] < data.length) {
            state[0] = VpdReader._ConsumeEmpty(data, state[0]);
            if (data.length <= state[0]) break;

            const typeAndIndex = VpdReader._ConsumeBeforeOpenBracket(data, state);
            if (typeAndIndex.startsWith("Bone")) {
                const id = VpdReader._ConsumeBeforeLineEnding(data, state);

                let position: Vec3 | undefined = undefined;
                let rotation: Vec4 | undefined = undefined;

                const positionStmt = VpdReader._ConsumeStatement(data, state);
                const positionComponents = positionStmt.split(",");
                if (positionComponents.length !== 3) {
                    logger.warn(`Position components are not 3: ${positionStmt}`);
                } else {
                    const x = Number(positionComponents[0]);
                    const y = Number(positionComponents[1]);
                    const z = Number(positionComponents[2]);
                    if (isNaN(x) || isNaN(y) || isNaN(x)) {
                        logger.warn(`Invalid position: ${positionStmt}`);
                    } else {
                        if (x !== 0 || y !== 0 || z !== 0) {
                            position = [x, y, z];
                        }
                    }
                }

                const rotationStmt = VpdReader._ConsumeStatement(data, state);
                const rotationComponents = rotationStmt.split(",");
                if (rotationComponents.length !== 4) {
                    logger.warn(`Rotation components are not 4: ${rotationStmt}`);
                } else {
                    const x = Number(rotationComponents[0]);
                    const y = Number(rotationComponents[1]);
                    const z = Number(rotationComponents[2]);
                    const w = Number(rotationComponents[3]);
                    if (isNaN(x) || isNaN(y) || isNaN(x) || isNaN(w)) {
                        logger.warn(`Invalid rotation: ${rotationStmt}`);
                    } else {
                        rotation = [x, y, z, w];
                    }
                }

                if (rotation !== undefined) {
                    if (bones[id] !== undefined) {
                        logger.warn(`Duplicate bone: ${id}. Use the last one.`);
                    }
                    bones[id] = {
                        position,
                        rotation
                    };
                }
            } else if (typeAndIndex.startsWith("Morph")) {
                const id = VpdReader._ConsumeBeforeLineEnding(data, state);

                const weightStmt = VpdReader._ConsumeStatement(data, state);
                const weight = Number(weightStmt);
                if (isNaN(weight)) {
                    logger.warn(`Invalid weight: ${weightStmt}`);
                } else {
                    if (morphs[id] !== undefined) {
                        logger.warn(`Duplicate morph: ${id}. Use the last one.`);
                    }
                    morphs[id] = weight;
                }
            } else {
                logger.warn(`Unknown type: ${typeAndIndex}`);
            }
            state[0] = VpdReader._ConsumeWhileCloseBracket(data, state[0]);
        }

        return { bones, morphs };
    }

    private static _ConsumeWhiteSpace(data: string, index: number): number {
        while (
            index < data.length &&
            (data[index] === " " || data[index] === "\t" || data[index] === "\r" || data[index] === "\n")
        ) {
            index += 1;
        }

        return index;
    }

    private static _ConsumeLine(data: string, index: number): number {
        while (index < data.length) {
            if (data[index] === "\r" || data[index] === "\n") {
                index += 1;
                break;
            }

            index += 1;
        }

        if (data[index - 1] === "\r" && data[index] === "\n") {
            index += 1;
        }

        return index;
    }

    private static _ConsumeEmpty(data: string, index: number): number {
        let oldIndex = index;
        while (index < data.length) {
            oldIndex = index;

            // consume white space
            index = VpdReader._ConsumeWhiteSpace(data, index);

            // consume comment
            if (data[index] === "/" && data[index + 1] === "/") {
                index = VpdReader._ConsumeLine(data, index);
            }

            if (oldIndex === index) {
                break;
            }
        }
        return index;
    }

    private static _ConsumeWhileCloseBracket(data: string, index: number): number {
        while (index < data.length) {
            if (data[index] === "}") {
                index += 1;
                break;
            }

            index += 1;
        }

        return index;
    }

    private static _ConsumeStatement(data: string, state: [number]): string {
        let index = state[0];

        let resultString = "";
        for (; ;) {
            // consume white space
            index = VpdReader._ConsumeWhiteSpace(data, index);

            // consume comment
            if (data[index] === "/" && data[index + 1] === "/") {
                index = VpdReader._ConsumeLine(data, index);
                continue;
            }

            if (data.length <= index) {
                break;
            }

            if (data[index] === ";") {
                index += 1;
                break;
            }

            resultString += data[index];
            index += 1;
        }
        state[0] = index;

        return resultString;
    }

    private static _ConsumeBeforeLineEnding(data: string, state: [number]): string {
        const startIndex = state[0];
        let index = state[0];

        while (index < data.length) {
            if (data[index] === "\r" || data[index] === "\n") break;
            index += 1;
        }

        state[0] = index;

        return data.substring(startIndex, index);
    }

    private static _ConsumeBeforeOpenBracket(data: string, state: [number]): string {
        let index = state[0];

        let resultString = "";
        while (index < data.length) {
            if (data[index] === "{") {
                index += 1;
                break;
            }

            resultString += data[index];
            index += 1;
        }
        state[0] = index;

        return resultString;
    }
}
