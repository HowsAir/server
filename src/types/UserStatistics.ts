export interface UserStatistics {
    id: number;
    name: string;
    surnames: string;
    phone: string;
    nodeId: number | null;
    averageDailyActiveHours: number;
    averageDailyDistance: number;
}
