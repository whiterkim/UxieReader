export interface Voice {
    name: string; // LocalName
    value: string; // ShortName
    gender: string; // Gender
    styles?: string[]; // StyleList
    roles?: string[]; // RolePlayList
}
