import { SalaryRecord, View, ViewConfig } from './view';
import * as d3 from 'd3';

export class Histogram implements View {
    private records: SalaryRecord[];
    private config: ViewConfig;
    private width: number = 0;
    private height: number = 0;
    private xScale: d3.ScaleLinear<number, number, never>;
    private yScale: d3.ScaleLinear<number, number, never>;
    private xAxis: d3.Axis<d3.NumberValue>;
    private yAxis: d3.Axis<d3.NumberValue>;
    private svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
    private xGetter: (sr: SalaryRecord) => number = (d): number => d.baseSalary;
    private chart: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private xAxisG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private yAxisG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private binnedData: d3.Bin<SalaryRecord, number>[];

    public constructor(private data: SalaryRecord[], config: ViewConfig) {
        this.config = config;
        this.initVis();
    }

    public initVis() {
        let vis = this;
        vis.width = vis.config.width - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.height - vis.config.margin.top - vis.config.margin.bottom;
        
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);
        
        vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(12)
        .tickSizeOuter(0);

        vis.yAxis = d3.axisLeft(vis.yScale)
        .tickSize(-vis.height - 10)
        .tickSizeOuter(0);
        // .tickSize(-vis.height - 10)

        vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.width)
        .attr('height', vis.config.height);

        vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left + 10},${vis.config.margin.top + 10})`);

        vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
    
        vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

        vis.chart.append('text')
        .attr('class', 'axis-title')
        .attr('y', vis.height + 25)
        .attr('font-weight', 'bold')
        .attr('x', vis.width/2)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Salary');

        vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('font-weight', 'bold')
        .attr('font-size', '20')
        .attr('x', vis.width/3)
        .attr('y', 0)
        .attr('dy', '.71em')
        .text('Distribution of Tech Salaries');

        vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('font-weight', 'bold')
        .attr('x', - vis.height/1.5)
        .attr('y', 0)
        .attr('transform', 'rotate(-90)')
        .attr('dy', '.71em')
        .text('Counts');

        vis.updateVis();
    }

    public updateVis() {
        let vis = this;
        vis.xScale.domain(d3.extent(vis.data, vis.xGetter));
        
        const bin = d3.bin<SalaryRecord, number>()
        .domain(vis.xScale.domain() as [number, number])
        .value(vis.xGetter)
        .thresholds(40);

        vis.binnedData = bin(vis.data);

        const yAccessor = (d) => d.length;
        
        vis.yScale.domain([0, d3.max(vis.binnedData, yAccessor)]);

        vis.renderVis();
    }

    public renderVis() {
        let vis = this;
        const yAccessor = (d) => d.length;

        vis.chart
        .append('g')
        .classed("bars", true)
        .selectAll("rect")
        .data(vis.binnedData)
        .join("rect")
        .attr("width", (d) => d3.max([0, vis.xScale(d.x1) - vis.xScale(d.x0)]) - 2)
        .attr("height", (d) => vis.height - vis.yScale(yAccessor(d)))
        .attr("x", (d) => vis.xScale(d.x0))
        .attr("y", (d) => vis.yScale(yAccessor(d)))
        .attr('fill', "rgb(165, 140, 95)")

        vis.xAxisG
        .call(vis.xAxis)
        .call(g => g.select('.domain').remove());

        vis.yAxisG
        .call(vis.yAxis)
        .call(g => g.select('.domain').remove())
    }
}
