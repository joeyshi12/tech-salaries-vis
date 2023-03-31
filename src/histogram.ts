import { SalaryRecord, View, ViewConfig } from './view';
import * as d3 from 'd3';

export class Histogram implements View {
    private config;
    private width: number = 0;
    private height: number = 0;
    private xScale: d3.ScaleLinear<number, number>;
    private yScale: d3.ScaleLinear<number, number>;
    private xAxis: d3.Axis<d3.NumberValue>;
    private yAxis: d3.Axis<d3.NumberValue>;
    private yValue: (d: d3.Bin<SalaryRecord, number>) => number;
    private svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
    private chart: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private xAxisG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private yAxisG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private binnedData: d3.Bin<SalaryRecord, number>[];

    public constructor(private data: SalaryRecord[],
                       config: ViewConfig,
                       private xValue: (SalaryRecord) => number,
                       private chartTitle: string,
                       private tickFormat?: (number) => string) {
        this.config = {
            parentElement: config.parentElement,
            containerWidth: config.containerWidth ?? 470,
            containerHeight: config.containerHeight ?? 400,
            margin: config.margin ?? { top: 60, right: 40, bottom: 50, left: 80 }
        }
        this.initVis();
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
        vis.xScale.domain(d3.extent(vis.data, vis.xValue));

        const bin = d3.bin<SalaryRecord, number>()
            .domain(vis.xScale.domain() as [number, number])
            .value(vis.xValue)
            .thresholds(20);

        vis.binnedData = bin(vis.data);
        vis.yValue = (d: d3.Bin<SalaryRecord, number>): number => d.length;
        vis.yScale.domain([0, d3.max(vis.binnedData, (d): number => d.length)]);
        vis.renderVis();
    }

    public renderVis() {
        let vis = this;

        vis.chart.selectAll('.bar')
            .data(vis.binnedData)
            .join('rect')
            .attr('class', 'bar')
            .attr('width', (d) => d3.max([0, vis.xScale(d.x1) - vis.xScale(d.x0)]) - 2)
            .attr('height', (d) => vis.height - vis.yScale(vis.yValue(d)))
            .attr('x', (d) => vis.xScale(d.x0))
            .attr('y', (d) => vis.yScale(vis.yValue(d)))
            .attr('fill', 'rgb(99, 187, 110)')

        vis.xAxisG
            .call(vis.xAxis)
            .call(g => g.select('.domain').remove());

        vis.yAxisG
            .call(vis.yAxis)
            .call(g => g.select('.domain').remove())
    }
}
