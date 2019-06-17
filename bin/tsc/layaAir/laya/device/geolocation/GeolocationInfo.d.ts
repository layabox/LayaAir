export declare class GeolocationInfo {
    private pos;
    private coords;
    setPosition(pos: any): void;
    readonly latitude: number;
    readonly longitude: number;
    readonly altitude: number;
    readonly accuracy: number;
    readonly altitudeAccuracy: number;
    readonly heading: number;
    readonly speed: number;
    readonly timestamp: number;
}
