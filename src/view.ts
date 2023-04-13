export interface View {
    // Create scales, axes, and append static elements
    initVis(): void;
    // Prepare the data before we render it.
    updateVis(): void;
    // Bind data to visual elements (enter-update-exit) and update axes
    renderVis(): void;
}

export interface ViewConfig {
    parentElement: string;
    containerWidth?: number;
    containerHeight?: number;
    margin?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    }
    tooltipPadding?: number;
}

export interface RecordFilter {
    state?: string;
    companies: string[];
    roles: string[];
    salaryRange?: [number, number];
    experienceRange?: [number, number];
    tenureRange?: [number, number];
}

export interface SalaryRecord {
    company: string;
    title: string;
    state: string;
    baseSalary: number;
    yearsOfExperience: number;
    yearsAtCompany: number;
}

export type RecordKey = keyof SalaryRecord;

/**
 * Filters records by given record attribute filters for attributes not included in omitKeys
 * @param records
 * @param filter
 * @param omitKeys
 */
export function filterRecords(records: SalaryRecord[], filter: RecordFilter, omitKeys: Set<RecordKey>): SalaryRecord[] {
    return records.filter((record: SalaryRecord) => {
        if (!omitKeys.has("state") && filter.state && filter.state !== record.state) {
            return false;
        }
        if (!omitKeys.has("company") && filter.companies.length !== 0 && !filter.companies.includes(record.company)) {
            return false;
        }
        if (!omitKeys.has("title") && filter.roles.length !== 0 && !filter.roles.includes(record.title)) {
            return false;
        }
        if (!omitKeys.has("baseSalary") && filter.salaryRange &&
            (record.baseSalary < filter.salaryRange[0] || record.baseSalary > filter.salaryRange[1])) {
            return false;
        }
        if (!omitKeys.has("yearsOfExperience") && filter.experienceRange &&
            (record.yearsOfExperience < filter.experienceRange[0] || record.yearsOfExperience > filter.experienceRange[1])) {
            return false;
        }
        if (!omitKeys.has("yearsAtCompany") && filter.tenureRange &&
            (record.yearsAtCompany < filter.tenureRange[0] || record.yearsAtCompany > filter.tenureRange[1])) {
            return false;
        }
        return true;
    });
}

export function toSalaryRecord(json: any): SalaryRecord {
    return {
        company: json['company'],
        title: json['title'],
        state: json['state'],
        baseSalary: +json['baseSalary'],
        yearsOfExperience: +json['yearsOfExperience'],
        yearsAtCompany: +json['yearsAtCompany']
    };
}

export const titleColourMap = new Map([
    ["Software Engineer", "#F35461"],
    ["Product Manager", "#FFBE72"],
    ["Software Engineering Manager", "#FFF372"],
    ["Data Scientist", "#A4EB41"],
    ["Hardware Engineer", "#10942D"],
    ["Solution Architect", "#81E1FF"],
    ["Product Designer", "#3D6EEF"],
    ["Technical Program Manager", "#7B40E0"],
    ["Management Consultant", "#D14FEB"],
    ["Business Analyst", "#FFA0F4"]
]);
