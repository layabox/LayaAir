export class NotImplementedError extends Error {
    constructor() {
        super('Not implemented.');
    }
}

export class OutOfRangeError extends Error {
    constructor(index: number) {
        super(`Index out of range: ${index}`);
    }
}

export class NotReadableError extends Error {
    constructor() {
        super("readable flag need to be true.");
    }
}

/**
 * @en The error return information format is different on each platform. Here is a common way to get the error message.
 * @param err The error object.
 * @return The error message.
 * @zh 在各个平台上，错误的返回信息格式不一样，这里提供一个通用的方式获取错误信息。
 * @param err 错误对象。
 * @return 错误信息。
 */
export function getErrorMsg(err: any): string {
    if (err != null && typeof err === "object") {
        let str: any;
        for (let k in errorFields) {
            str = err[errorFields[k]];
            if (str != null)
                return parseError(str);
        }
    }
    return parseError(err);
}

function parseError(err: any): string {
    if (typeof (err) === "number")
        return `error code=${err}`;
    else if (typeof (err) !== "string")
        return "error! " + err;
    else
        return err;
}

const errorFields = ["errMsg", "errorMessage", "message", "reason", "error", "errCode", "statusCode"];
