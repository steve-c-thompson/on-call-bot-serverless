import {ScheduleData} from "../model/ScheduleData";

export interface ScheduleDataLoader<T extends ScheduleData> {
    init(opts?: any) : Promise<T>;
}