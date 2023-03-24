import { View, ViewConfig, SalaryRecord } from './view';

export class BarChart implements View {
    private records: SalaryRecord[];
    private config: ViewConfig;

    public constructor(records: SalaryRecord[], config: ViewConfig) {
        this.records = records;
        this.config = config;
    }

    public initVis() {
    }

    public updateVis() {
    }

    public renderVis() {
    }
}
