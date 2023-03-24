import { SalaryRecord, View, ViewConfig } from './view';

export class Histogram implements View {
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
