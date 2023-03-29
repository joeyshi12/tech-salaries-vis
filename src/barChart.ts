import d3 from 'd3';
import { View, ViewConfig, SalaryRecord } from './view';

export class BarChart implements View {
    private records: SalaryRecord[];
    private config: ViewConfig;
    width: number;
    height: number;
    svg: any;
    chartArea: any;
    yScale: d3.ScaleLinear<number, number, never>;
    xScale: d3.ScaleBand<string>;
    xAxis: d3.Axis<string>;
    yAxis: d3.Axis<d3.NumberValue>;
    xAxisG: any;
    yAxisG: any;
    xValue: (d: any) => any;
    yValue: (d: any) => any;

    public constructor(records: SalaryRecord[], config: ViewConfig, xValue: string) {
        this.config = {
            parentElement: config.parentElement,
            width: 279,
            height: 300,
            margin: {top: 40, right: 10, bottom: 30, left: 35}
          };
        this.records = records;
        this.config = config;
        this.xValue = d => d[xValue];
        this.initVis;
    }

    public initVis() {
        let vis = this;

        // Create SVG area, initialize scales and axes
        vis.width = vis.config.width - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.height - vis.config.margin.top - vis.config.margin.bottom;

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement).append('svg')
            .attr('id', 'bar-chart')
            .attr('width', vis.config.width)
            .attr('height', vis.config.height);

        // Append group element that will contain our actual chart 
        // and position it according to the given margin config
        vis.chartArea = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]) 

        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.2)
            .paddingOuter(0.2);

        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(10)
            .tickPadding(10)
            .tickSize(0);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            .tickPadding(5)
            .tickSize(-vis.width);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chartArea.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);

        // Append y-axis group 
        vis.yAxisG = vis.chartArea.append('g')
            .attr('class', 'axis y-axis');

        // Append axis title
        vis.chartArea.append('text')
        .attr('class', 'chart-title')
        .attr('y', -20)
        .attr('x', 10 - vis.config.margin.left)
        .attr('text-anchor', 'start')
        .text('Gender');

        vis.updateVis();
    }

    public updateVis() {
        let vis = this

        vis.yValue = d => d.baseSalary;

        // Set the scale input domains
        vis.xScale.domain(vis.records.map(vis.xValue));
        vis.yScale.domain([0, d3.max(vis.records, vis.yValue)]);

        vis.renderVis();
    }

    public renderVis() {
        let vis = this

    // Bind data to visual elements, update axes
    const bars = vis.chartArea.selectAll('.bar')
        .data(vis.records, vis.xValue)
      .join('rect')
        .attr('class', 'bar')
        .attr('x', (d: any) => vis.xScale(vis.xValue(d)))
        .attr('width', vis.xScale.bandwidth())
        .attr('height', (d: any) => vis.height - vis.yScale(vis.yValue(d)))
        .attr('y', (d: any) => vis.yScale(vis.yValue(d)))
        .attr('fill', '#a0a0a0');

    
    // Update the axes/gridlines
    vis.xAxisG
      .call(vis.xAxis)

    vis.yAxisG
      .call(vis.yAxis)
    }
}
