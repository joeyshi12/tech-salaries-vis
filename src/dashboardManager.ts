import { filterRecords, RecordFilter, SalaryRecord } from "./view";
import * as d3 from "d3";
import { ChoroplethMap } from "./choroplethMap";
import { BarChart } from "./barChart";
import { Histogram } from "./histogram";

export class DashboardManager {

    constructor(
        private readonly records: SalaryRecord[],
        private readonly filter: RecordFilter,
        private choroplethMap: ChoroplethMap,
        private barChart: BarChart,
        private baseSalaryHistogram: Histogram,
        private yearsOfExperienceHistogram: Histogram,
        private yearsAtCompanyHistogram: Histogram,
    ) {
    }

    /**
     * Update encoding in choropleth map by selected mapInfoType
     * @param event
     */
    public updateMapInfoType(event) {
        let vis = this;
        vis.choroplethMap.mapInfoType = d3.select(event.target).property('value');
        vis.choroplethMap.updateVis();
    }

    /**
     * Filter records by selected role
     * @param event
     */
    public filterByRoles(event) {
        // Check which categories are active
        let selectedCategories = [];
        d3.selectAll('.legend-btn:is(.active)').each(function() {
            selectedCategories.push(d3.select(<Window>this).attr('data-category'));
        });

        // Toggle categories while making sure only at most 2 is active
        const selectedRole = d3.select(event.target).attr('data-category');
        if (selectedCategories.includes(selectedRole)) {
            d3.select(event.target).classed('active', false);
            selectedCategories = selectedCategories.filter((category) => category !== selectedRole);
        } else if (selectedCategories.length >= 2) {
            return;
        } else {
            d3.select(event.target).classed('active', true);
            selectedCategories.push(selectedRole);
        }

        this.filter.companies = [];
        this.filter.roles = selectedCategories;
        this.updateViews();
    }

    /**
     * Filters records by companies on 'filterCompanies' event
     * @param selectedCompanies companies to filter by
     */
    public filterByCompanies(selectedCompanies: string[]) {
        this.filter.companies = selectedCompanies;
        this.updateViews();
    }

    /**
     * Filter records by state on 'filterState' event
     * @param state state to filter by
     */
    public filterByState(state: string) {
        this.filter.companies = [];
        this.filter.state = state;
        this.updateViews();
    }

    /**
     * Filters records by the given recordKey on 'filterHistogram' event
     * @param range range to filter by
     * @param parentElement parent id for the histogram
     */
    public filterByRange(range: [number, number], parentElement: string) {
        this.filter.companies = [];
        switch (parentElement) {
            case '#base-salary-histogram':
                this.filter.salaryRange = range;
                break;
            case '#years-of-experience-histogram':
                this.filter.experienceRange = range;
                break;
            case '#years-at-company-histogram':
                this.filter.tenureRange = range;
                break;
            default:
                throw new Error("Invalid histogram");
            }
        this.updateViews();
    }

    /**
     * Update all views by the current state of filter
     */
    public updateViews() {
        this.choroplethMap.data = filterRecords(this.records, this.filter, new Set(["state"]));
        this.barChart.data = filterRecords(this.records, this.filter, new Set(["company"]));
        this.baseSalaryHistogram.data = filterRecords(this.records, this.filter, new Set(["baseSalary"]));
        this.yearsOfExperienceHistogram.data = filterRecords(this.records, this.filter, new Set(["yearsOfExperience"]));
        this.yearsAtCompanyHistogram.data = filterRecords(this.records, this.filter, new Set(["yearsAtCompany"]));

        this.choroplethMap.updateVis();
        this.barChart.updateVis();
        this.baseSalaryHistogram.updateVis();
        this.yearsOfExperienceHistogram.updateVis();
        this.yearsAtCompanyHistogram.updateVis();
    }
}
