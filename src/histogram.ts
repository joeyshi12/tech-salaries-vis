import { SalaryRecord, View, ViewConfig, titleColourMap } from './view';
import * as d3 from 'd3';

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
    private _selectedTitles: string[];

    private svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
    private chart: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private xAxisG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private yAxisG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private bars2: d3.Selection<d3.BaseType, d3.Bin<SalaryRecord, number>, SVGGElement, unknown>;

    public constructor(private _data: SalaryRecord[],
                       config: ViewConfig,
                       private xValue: (d: SalaryRecord) => number,
                       private chartTitle: string,
                       private tickFormat?: (d: number) => string) {
        this.config = {
            parentElement: config.parentElement,
            containerWidth: config.containerWidth ?? 470,
            containerHeight: config.containerHeight ?? 400,
            margin: config.margin ?? { top: 60, right: 40, bottom: 50, left: 80 }
        }
        this._selectedTitles = [];
        this.initVis();
    }

    public set data(val: SalaryRecord[]) {
        this._data = val;
    }

    public set selectedTitles(val: string[]) {
        this._selectedTitles = val;
    }

    public initVis() {
        let vis = this;
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);
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

        vis.updateVis();
    }

    public updateVis() {
        let vis = this;
        vis.xScale.domain(d3.extent(vis._data, vis.xValue));

        const bin = d3.bin<SalaryRecord, number>()
            .domain(vis.xScale.domain() as [number, number])
            .value(vis.xValue)
            .thresholds(20);

        // Set binned data
        if (vis._selectedTitles.length === 0) {
            vis.binnedData1 = bin(vis._data);
        } else {
            const groups = d3.groups(vis._data, (d) => d.title)
                .filter(([title, _]) => vis._selectedTitles.includes(title));
            vis.binnedData1 = bin(groups.find(g => g[0] === vis._selectedTitles[0])[1]);
            if (groups.length === 2) {
                vis.binnedData2 = bin(groups.find(g => g[0] === vis._selectedTitles[1])[1]);
            } else {
                vis.binnedData2 = null;
            }
        }
        vis.yValue = (d: d3.Bin<SalaryRecord, number>): number => d.length;
        let maxCount = d3.max(vis.binnedData1, vis.yValue);
        if (vis.binnedData2) {
            const count2 = d3.max(vis.binnedData2, vis.yValue);
            console.log(maxCount, count2)
            if (count2 > maxCount) {
                maxCount = count2;
            }
        }
        vis.yScale.domain([0, maxCount]);
        vis.renderVis();
    }

    public renderVis() {
        let vis = this;
        const barWidth = vis.width / vis.binnedData1.length - 1;

        const fill1 = titleColourMap.get(vis._selectedTitles[0]) ?? 'rgb(99, 187, 110)';
        vis.chart.selectAll('.bar')
            .data(vis.binnedData1)
            .join('rect')
            .attr('class', 'bar')
            .attr('width', barWidth)
            .attr('height', (d) => vis.height - vis.yScale(vis.yValue(d)))
            .attr('x', (d) => vis.xScale(d.x0))
            .attr('y', (d) => vis.yScale(vis.yValue(d)))
            .attr('fill', fill1)
            .attr('opacity', 0.8);

        if (vis.binnedData2) {
            const fill2 = titleColourMap.get(vis._selectedTitles[1]);
            vis.bars2 = vis.chart.selectAll('.bar2')
                .data(vis.binnedData2)
                .join('rect')
                .attr('class', 'bar2')
                .attr('width', barWidth)
                .attr('height', (d) => vis.height - vis.yScale(vis.yValue(d)))
                .attr('x', (d) => vis.xScale(d.x0))
                .attr('y', (d) => vis.yScale(vis.yValue(d)))
                .attr('fill', fill2)
                .attr('opacity', 0.8)
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
}
