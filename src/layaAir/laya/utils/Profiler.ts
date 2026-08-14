/**
 * @internal
 */
export class Profiler {
    private static _profiler: any;
    private static _inited: boolean = false;

    static start(name: string): boolean {
        let profiler = Profiler._getProfiler();
        if (!profiler)
            return false;

        profiler.ZoneStart(name);
        return true;
    }

    static end(active: boolean): void {
        if (active)
            Profiler._profiler.ZoneEnd();
    }

    static get enabled(): boolean {
        return !!Profiler._getProfiler();
    }

    private static _getProfiler(): any {
        if (!Profiler._inited) {
            let g: any = typeof window !== "undefined" ? window : globalThis;
            let profiler = g && g.conchProfiler;
            Profiler._profiler = profiler && profiler.ZoneStart && profiler.ZoneEnd && (!profiler.isEnabled || profiler.isEnabled()) ? profiler : null;
            Profiler._inited = true;
        }
        return Profiler._profiler;
    }
}
