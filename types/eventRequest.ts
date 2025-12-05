import { PublicSpace } from "@/lib/events/fetchEventRequests";
import { Group } from "./group";

export type EventRequest = {
    id: number;
    name: string;
    goal: string;
    description: string;
    status: string;
    day: string;
    module: string;
    group: Group;
    public_space: PublicSpace | null;
    createdAt: string;
    updatedAt: string;
};