import {ScheduleData} from "../model/ScheduleData";

export interface ScheduleDataWriter<T extends ScheduleData> {
    writeScheduleData(key: string, scheduleData: T) : void;
}