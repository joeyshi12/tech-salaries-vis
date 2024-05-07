import * as d3 from 'd3';
import { View, ViewConfig, SalaryRecord, RecordFilter } from './view';

interface CompanyInfo {
    name: string;
    averageSalary: number;
    recordCount: number;
}

export class BarChart implements View {
    private width: number;
    private height: number;
    private yScale: d3.ScaleLinear<number, number>;
    private xScale: d3.ScaleBand<string>;
    private xAxis: d3.Axis<string>;
    private yAxis: d3.Axis<d3.NumberValue>;
    private xValue: (d: CompanyInfo) => string;
    private yValue: (d: CompanyInfo) => number;
    private companyInfos: CompanyInfo[];

    private svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
    private chartArea: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private xAxisG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private yAxisG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

    public constructor(private _data: SalaryRecord[],
                       private config: ViewConfig,
                       private filter: RecordFilter,
                       private _dispatcher: d3.Dispatch<string[]>) {
        this.initVis();
    }

    public set data(val: SalaryRecord[]) {
        this._data = val;
    }

    public initVis() {
        let vis = this;

        // Create SVG area, initialize scales and axes
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // Append group element that will contain our actual chart
        // and position it according to the given margin config
        vis.chartArea = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0])

        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.2)
            .paddingOuter(0);

        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSize(0)
            .tickValues([]);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickSize(-vis.width - 10)
            .tickPadding(10)
            .tickSizeOuter(0);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chartArea.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        // Append y-axis group
        vis.yAxisG = vis.chartArea.append('g')
            .attr('class', 'axis y-axis');

        // Append axis title
        vis.svg.append('text')
            .attr('class', 'axis-title')
            .attr('font-weight', 'bold')
            .attr('font-size', '18')
            .attr('x', '12px')
            .attr('y', '30px')
            .text('Top 10 Average Company Salaries');

        vis.chartArea.append('text')
            .attr('class', 'axis-title')
            .attr('x', vis.config.containerWidth / 2 - 20)
            .attr('y', vis.height + 15)
            .attr('dy', '.71em')
            .attr('font-weight', 'bold')
            .style('text-anchor', 'end')
            .text('Company');

        vis.updateVis();
    }

    public updateVis() {
        let vis = this

        vis.xValue = (d): string => d.name;
        vis.yValue = (d): number => d.averageSalary;

        // Get the average base salary by company
        let companyData = d3.rollups(vis._data,
            (records: SalaryRecord[]) => ({
                recordCount: records.length,
                averageSalary: Math.round(d3.mean(records, (record: SalaryRecord) => record.baseSalary))
            }),
            (record: SalaryRecord) => record.company);
        // Sort average salary from highest to lowest and filter for the top 10
        vis.companyInfos = Array.from(companyData, ([name, {recordCount, averageSalary}]): CompanyInfo => ({name, averageSalary, recordCount}))
            .sort((a, b) => b.averageSalary - a.averageSalary);
        vis.companyInfos = vis.companyInfos.slice(0, 10);
        vis.xScale.domain(vis.companyInfos.map(vis.xValue));
        vis.yScale.domain([0, d3.max(vis.companyInfos, vis.yValue)]);

        vis.renderVis();
    }

    public renderVis() {
        let vis = this

        // Bind data to visual elements, update axes
        let bars = vis.chartArea.selectAll('.bar')
            .data(vis.companyInfos, vis.xValue)
            .join('rect')
            .attr('class', 'bar')
            .attr('x', (d: CompanyInfo) => vis.xScale(vis.xValue(d)))
            .attr('y', (d: CompanyInfo) => vis.yScale(vis.yValue(d)))
            .attr('width', vis.xScale.bandwidth())
            .attr('height', (d: CompanyInfo) => vis.height - vis.yScale(vis.yValue(d)))
            .on('mousemove', (event, d) => {
                d3.select('#tooltip')
                    .style('display', 'block')
                    .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
                    .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                    .html(`<div class="tooltip-title">${d.name}</div>
                          <ul>
                            <li>Average salary: ${Math.round(d.averageSalary)}</li>
                            <li>Number of records: ${d.recordCount}</li>
                          </ul>`);
            })
            .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
            })
            .on('click', function(event, d) {
                // Check if current company is active and toggle class
                const isActive = d3.select(this).classed('active');

                d3.select(this).classed('active', !isActive);

                // Get active companies
                const activeCompanies = vis.chartArea.selectAll('.bar.active').data().map((d: CompanyInfo) => d.name);

                // Trigger filter event and pass array with the selected gender
                vis._dispatcher.call('filterCompanies', event, activeCompanies);
              });

        bars.filter((d: CompanyInfo) => vis.filter.companies.includes(d.name))
            .attr('class', 'bar active');

        // Update the axes/gridlines
        vis.xAxisG
          .call(vis.xAxis)
          .call(g => g.select('.domain').remove());

        vis.yAxisG
          .call(vis.yAxis)
          .call(g => g.select('.domain').remove());
    }
}
