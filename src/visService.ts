import { filterRecords, RecordFilter, SalaryRecord, toSalaryRecord } from "./view";
import * as d3 from "d3";
import { ChoroplethMap } from "./choroplethMap";
import { BarChart } from "./barChart";
import { Histogram } from "./histogram";

export class VisService {
    private readonly records: SalaryRecord[];
    // Initialize dispatcher that is used to orchestrate events
    private readonly dispatcher: d3.Dispatch<string[]>;
    // State of active filters
    private readonly filter: RecordFilter;
    // Views
    private choroplethMap: ChoroplethMap;
    private barChart: BarChart;
    private baseSalaryHistogram: Histogram;
    private yearsOfExperienceHistogram: Histogram;
    private yearsAtCompanyHistogram: Histogram;

    constructor(data: any, geoData: any) {
        this.records = data.map(toSalaryRecord);
        this.filter = {companies: [], roles: []};
        this.dispatcher = d3.dispatch('filterCompanies', 'filterState', 'filterHistogram');
        const mapInfoType = d3.select('#map-info-selector').property('value');
        this.choroplethMap = new ChoroplethMap(this.records, geoData, {
            parentElement: '#choropleth-map',
            containerWidth: 955,
            containerHeight: 640,
            margin: { top: 10, right: 25, bottom: 0, left: 40 },
            tooltipPadding: 15,
            scale: 0.9,
            legendWidth: 200,
            legendHeight: 20
        }, mapInfoType, this.filter, this.dispatcher);
        this.barChart = new BarChart(this.records, {
            parentElement: '#bar-chart',
            containerWidth: 470,
            containerHeight: 640,
            margin: { top: 60, right: 40, bottom: 50, left: 70 },
            tooltipPadding: 15
        }, this.filter, this.dispatcher);
        this.baseSalaryHistogram = new Histogram(this.records, {
            parentElement: '#base-salary-histogram',
        }, this.filter, this.dispatcher, (d): number => d.baseSalary, 'Base Salary (Thousand USD)', (val): string => String(val / 1000));
        this.yearsOfExperienceHistogram = new Histogram(this.records, {
            parentElement: '#years-of-experience-histogram',
        }, this.filter, this.dispatcher, (d): number => d.yearsOfExperience, 'Years of Experience');
        this.yearsAtCompanyHistogram = new Histogram(this.records, {
            parentElement: '#years-at-company-histogram',
        }, this.filter, this.dispatcher, (d): number => d.yearsAtCompany, 'Years of Tenure');
    }

    /**
     * Bind event listeners to interactive views
     */
    public start() {
        d3.selectAll('#map-info-selector').on('change', this.updateMapInfoType.bind(this));
        d3.selectAll('.legend-btn').on('click', this.filterByRoles.bind(this));
        this.dispatcher.on('filterCompanies', this.filterByCompanies.bind(this));
        this.dispatcher.on('filterState', this.filterByState.bind(this))
        this.dispatcher.on('filterHistogram', this.filterByRange.bind(this))
    }

    /**
     * Update encoding in choropleth map by selected mapInfoType
     * @param event
     * @private
     */
    private updateMapInfoType(event) {
        let vis = this;
        vis.choroplethMap.mapInfoType = d3.select(event.target).property('value');
        vis.choroplethMap.updateVis();
    }

    /**
     * Filter records by selected role
     * @param event
     * @private
     */
    private filterByRoles(event) {
        // Check which categories are active
        let selectedCategories = [];
        d3.selectAll('.legend-btn:is(.active)').each(function() {
            selectedCategories.push(d3.select(<Window>this).attr('data-category'));
        });

        // Toggle categories while making sure only at most 2 is active
        const selectedRole = d3.select(event.target).attr('data-category');
        console.log(selectedRole)
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
     * @private
     */
    private filterByCompanies(selectedCompanies: string[]) {
        this.filter.companies = selectedCompanies;
        this.updateViews();
    }

    /**
     * Filter records by state on 'filterState' event
     * @param state state to filter by
     * @private
     */
    private filterByState(state: string) {
        this.filter.companies = [];
        this.filter.state = state;
        this.updateViews();
    }

    /**
     * Filters records by the given recordKey on 'filterHistogram' event
     * @param range range to filter by
     * @param parentElement parent id for the histogram
     * @private
     */
    private filterByRange(range: [number, number], parentElement: string) {
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
     * @private
     */
    private updateViews() {
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
