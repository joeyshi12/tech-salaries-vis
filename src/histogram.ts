import { SalaryRecord, View, ViewConfig, titleColourMap, RecordFilter } from './view';
import * as d3 from 'd3';
import { Dispatch } from "d3";

export class Histogram implements View {
    private config: ViewConfig;
    private width: number = 0;
    private height: number = 0;
    private xScale: d3.ScaleLinear<number, number>;
    private yScale: d3.ScaleLinear<number, number>;
    private xAxis: d3.Axis<d3.NumberValue>;
    private yAxis: d3.Axis<d3.NumberValue>;
    private yValue: (d: d3.Bin<SalaryRecord, number>) => number;
    private binnedData1: d3.Bin<SalaryRecord, number>[];
    private binnedData2: d3.Bin<SalaryRecord, number>[]

    private svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
    private chart: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private xAxisG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private yAxisG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private brushG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private brush: d3.BrushBehavior<unknown>;
    private bars2: d3.Selection<d3.BaseType, d3.Bin<SalaryRecord, number>, SVGGElement, unknown>;
    private filterRange: [number, number] = [0, 0];

    public constructor(private _data: SalaryRecord[],
                       config: ViewConfig,
                       private filter: RecordFilter,
                       private _dispatcher: Dispatch<string[]>,
                       private xValue: (d: SalaryRecord) => number,
                       private chartTitle: string,
                       private tickFormat?: (d: number) => string) {
        this.config = {
            parentElement: config.parentElement,
            containerWidth: config.containerWidth ?? 470,
            containerHeight: config.containerHeight ?? 400,
            margin: config.margin ?? { top: 60, right: 40, bottom: 50, left: 80 }
        }
        this.initVis();
    }

    public set data(val: SalaryRecord[]) {
        this._data = val;
    }

    public initVis() {
        let vis = this;
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.xScale = d3.scaleLinear()
            .range([0, vis.width])
            .domain(d3.extent(vis._data, vis.xValue));

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom<number>(vis.xScale)
            .ticks(10)
            .tickPadding(5)
            .tickSizeOuter(0);

        if (vis.tickFormat) {
            vis.xAxis.tickFormat(vis.tickFormat);
        }

        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickSize(-vis.width - 10)
            .tickPadding(10)
            .tickSizeOuter(0);

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        vis.brushG = vis.chart.append('g')
            .attr('class', 'brush x-brush');

        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.config.containerWidth, vis.config.containerHeight - 110]])
            .on('brush', function({selection}) {
                if (selection) vis.brushed(selection);
            })
            .on('end', function({selection}) {
                if (!selection) {
                    vis.brushed(null);
                }
                if (selection) {
                    if (vis.isSelectionEmpty(selection)) {
                        vis.brush.clear(d3.select(`${vis.config.parentElement} .x-brush`));
                    }
                }
                vis._dispatcher.call('filterHistogram', selection, vis.filterRange, vis.config.parentElement);
            });

        vis.svg.append('text')
            .attr('class', 'axis-title')
            .attr('font-weight', 'bold')
            .attr('font-size', '20')
            .attr('x', '10px')
            .attr('y', '30px')
            .text(`${vis.chartTitle}`);

        vis.svg.append('text')
            .attr('class', 'axis-title')
            .attr('font-weight', 'bold')
            .attr('x', -vis.config.containerHeight / 2)
            .attr('y', 10)
            .attr('transform', 'rotate(-90)')
            .attr('dy', '.71em')
            .text('Count');

        vis.brushG.call(vis.brush);
        vis.updateVis();
    }

    public updateVis() {
        let vis = this;

        const bin = d3.bin<SalaryRecord, number>()
            .domain(vis.xScale.domain() as [number, number])
            .value(vis.xValue)
            .thresholds(20);

        // Set binned data
        if (vis._data.length === 0) {
            vis.binnedData1 = bin([]);
        } else if (vis.filter.roles.length === 0) {
            vis.binnedData1 = bin(vis._data);
        } else {
            const groups = d3.groups(vis._data, (d) => d.title)
                .filter(([title, _]) => vis.filter.roles.includes(title));
            if (groups.length === 1) {
                vis.binnedData1 = bin(groups[0][1]);
                vis.binnedData2 = null;
            } else {
                vis.binnedData1 = bin(groups.find(g => g[0] === vis.filter.roles[0])[1]);
                vis.binnedData2 = bin(groups.find(g => g[0] === vis.filter.roles[1])[1]);
            }
        }
        vis.yValue = (d: d3.Bin<SalaryRecord, number>): number => d.length;
        let maxCount = d3.max(vis.binnedData1, vis.yValue);
        if (vis.binnedData2) {
            const count2 = d3.max(vis.binnedData2, vis.yValue);
            if (count2 > maxCount) {
                maxCount = count2;
            }
        }
        vis.yScale.domain([0, Math.max(maxCount, 1)]);
        vis.renderVis();
    }

    public renderVis() {
        let vis = this;
        const barWidth = vis.width / vis.binnedData1.length - 1;

        const fill1 = titleColourMap.get(vis.filter.roles[0]) ?? 'rgb(99, 187, 110)';
        vis.chart.selectAll('.bar')
            .data(vis.binnedData1)
            .join('rect')
            .attr('class', 'bar')
            .attr('width', barWidth)
            .attr('height', (d) => vis.height - vis.yScale(vis.yValue(d)))
            .attr('x', (d) => vis.xScale(d.x0))
            .attr('y', (d) => vis.yScale(vis.yValue(d)))
            .attr('fill', fill1)
            .attr('opacity', 0.6);

        if (vis.binnedData2) {
            const fill2 = titleColourMap.get(vis.filter.roles[1]);
            vis.bars2 = vis.chart.selectAll('.bar2')
                .data(vis.binnedData2)
                .join('rect')
                .attr('class', 'bar2')
                .attr('width', barWidth)
                .attr('height', (d) => vis.height - vis.yScale(vis.yValue(d)))
                .attr('x', (d) => vis.xScale(d.x0))
                .attr('y', (d) => vis.yScale(vis.yValue(d)))
                .attr('fill', fill2)
                .attr('opacity', 0.6)
                .attr('display', 'block');
        } else {
            vis.bars2?.attr('display', 'none');
        }

        vis.xAxisG
            .call(vis.xAxis)
            .call(g => g.select('.domain').remove());

        vis.yAxisG
            .call(vis.yAxis)
            .call(g => g.select('.domain').remove())
    }

    /**
     * Updates filterRange based off of brush selection
     * @param selection
     * @private
     */
    private brushed(selection) {
        let vis = this;

        // Check if the brush is still active or if it has been removed
        if (selection) {
          // Convert given pixel coordinates (range: [x0,x1]) into a time period (domain: [Date, Date])
          const lowerBound = vis.xScale.invert(selection[0]);
          const upperBound = vis.xScale.invert(selection[1]);
          vis.filterRange = [lowerBound, upperBound];
        } else {
          // Reset x-scale of the focus view (full time period)
          vis.filterRange = null;
        }
    }

    /**
     * Returns true if there is a record within the selected attribute value range; false otherwise
     * @param selection
     * @private
     */
    private isSelectionEmpty(selection) {
        let vis = this;
        const lowerBound = vis.xScale.invert(selection[0]);
        const upperBound = vis.xScale.invert(selection[1]);
        switch (this.config.parentElement) {
            case '#base-salary-histogram':
                return !vis._data.some(r => r.baseSalary >= lowerBound && r.baseSalary <= upperBound);
            case '#years-of-experience-histogram':
                return !vis._data.some(r => r.yearsOfExperience >= lowerBound && r.yearsOfExperience <= upperBound);
            case '#years-at-company-histogram':
                return !vis._data.some(r => r.yearsAtCompany >= lowerBound && r.yearsAtCompany <= upperBound);
            default:
                return false;
        }
    }
}
