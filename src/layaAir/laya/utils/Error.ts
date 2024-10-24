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