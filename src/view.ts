export interface View {
    initVis(): void;
    updateVis(): void;
    renderVis(): void;
};

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
    baseSalary: number;
    yearsOfExperience: number;
};

export function toSalaryRecord(json: any): SalaryRecord {
    return {
        company: json['company'],
        title: json['title'],
        baseSalary: +json['basesalary'],
        yearsOfExperience: +json['yearsofexperience']
    };
};
