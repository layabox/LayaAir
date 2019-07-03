export declare class Path {
    paths: any[];
    private _curPath;
    constructor();
    beginPath(convex: boolean): void;
    closePath(): void;
    newPath(): void;
    addPoint(pointX: number, pointY: number): void;
    push(points: any[], convex: boolean): void;
    reset(): void;
}
