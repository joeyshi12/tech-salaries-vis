export interface View {
    initVis(): void;
    updateVis(): void;
    renderVis(): void;
}

export interface ViewConfig {
    parentElement: string;
    containerWidth: number;
    containerHeight: number;
    margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    }
}

export interface SalaryRecord {
    company: string;
    title: string;
    state: string;
    baseSalary: number;
    yearsOfExperience: number;
    yearsAtCompany: number;
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
