export enum PhysicsShape {
    BoxShape,
    CircleShape,
    PolygonShape,
    ChainShape,
    EdgeShape,
}

export class FixtureBox2DDef {
    density: number;
    friction: number;
    isSensor: boolean;
    restitution: number;
    shape: PhysicsShape;//Box2D Shape
    groupIndex: number;
}