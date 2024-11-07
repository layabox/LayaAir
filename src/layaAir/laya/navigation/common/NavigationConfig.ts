/**
* 数据分块算法
*/
export enum PartitionType {
    PARTITION_WATERSHED,
    PARTITION_MONOTONE,
    PARTITION_LAYERS
};

export enum UpdateFlags {
    DT_CROWD_ANTICIPATE_TURNS = 1,
    DT_CROWD_OBSTACLE_AVOIDANCE = 2,
    DT_CROWD_SEPARATION = 4,
    DT_CROWD_OPTIMIZE_VIS = 8,	///< Use #dtPathCorridor::optimizePathVisibility() to optimize the agent path.
    DT_CROWD_OPTIMIZE_TOPO = 16 ///< Use dtPathCorridor::optimizePathTopology() to optimize the agent path.
};

export enum CrowdAgentState {
    DT_CROWDAGENT_STATE_INVALID, ///< The agent is not in a valid state.
    DT_CROWDAGENT_STATE_WALKING, ///< The agent is traversing a normal navigation mesh polygon.
    DT_CROWDAGENT_STATE_OFFMESH	 ///< The agent is traversing an off-mesh connection.
};

export enum ObstacleAvoidanceType {
    NoObstacle,
    LowQuality,
    MedQuality,
    GoodQuality,
    HighQuality
}

export enum NavigationConfig {
    defaltAgentName = "humanoid",
    defaltUnWalk = "unwalk",
    defaltWalk = "walk",
    defaltJump = "jump",
}

export class NavAreaFlag {
    index: number;
    cost: number;
    name: string;

    get flag(): number {
        return 1 << this.index;
    }
}


