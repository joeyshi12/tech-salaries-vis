import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { FeatureCollection } from 'geojson';
import { RecordFilter, SalaryRecord, View, ViewConfig } from './view';

type ChoroplethMapConfig = ViewConfig & {
    scale: number;
    legendWidth: number;
    legendHeight: number;
}

type MapInfoType = 'record' | 'salary';

interface StateInfo {
    recordCount: number;
    averageSalary: number;
}

interface LegendStop {
    color: string;
    value: number;
    offset: number;
}

export class ChoroplethMap implements View {
    private width: number;
    private height: number;
    private geoPath: d3.GeoPath<any, d3.GeoPermissibleObjects>;
    private stateInfoMap: Map<string, StateInfo>;
    private colorScale: d3.ScaleSequential<string>;
    private infoGetter: (d: StateInfo) => number;
    private legendStops: LegendStop[];
    private states: FeatureCollection;

    private svg: d3.Selection<any, any, any, any>;
    private chart: d3.Selection<any, any, any, any>;
    private linearGradient: d3.Selection<any, any, any, any>;
    private legend: d3.Selection<any, any, any, any>;
    private legendRect: d3.Selection<any, any, any, any>;

    constructor(private _data: SalaryRecord[],
                geoData: any,
                private config: ChoroplethMapConfig,
                private infoType: MapInfoType,
                private filter: RecordFilter,
                private dispatcher: d3.Dispatch<string[]>) {
        this.states = <FeatureCollection><unknown>topojson.feature(geoData, geoData.objects.states);
        this.initVis();
    }

    public set data(val: SalaryRecord[]) {
        this._data = val;
    }

    public set mapInfoType(val: MapInfoType) {
        this.infoType = val;
    }

    public initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select('#choropleth-map')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.chart = vis.svg.append('g').attr('transform',
            `translate(${vis.config.margin.left},${vis.config.margin.top}) scale(${vis.config.scale})`)

        // Initialize path generator
        vis.geoPath = d3.geoPath();

        // Initialize gradient that we will later use for the legend
        vis.linearGradient = vis.svg.append('defs').append('linearGradient')
            .attr("id", "legend-gradient");

        // Append legend
        vis.legend = vis.chart.append('g')
            .attr('class', 'legend')
            .attr('transform',`translate(${vis.config.margin.left},${vis.config.containerHeight})`);

        vis.legendRect = vis.legend.append('rect')
            .attr('width', vis.config.legendWidth)
            .attr('height', vis.config.legendHeight);

        vis.legend.append('text')
            .attr('class', 'legend-title')
            .attr('dy', '.35em')
            .attr('y', -10)
            .text('Record count');

        vis.colorScale = d3.scaleSequential(d3.interpolateBlues);
        vis.updateVis();
    }

    public updateVis() {
        let vis = this;
        switch (vis.infoType) {
            case 'salary':
                vis.infoGetter = (info: StateInfo) => info?.averageSalary ?? 0;
                vis.colorScale = d3.scaleSequential(d3.interpolateGreens);
                break;
            default:
                vis.infoGetter = (info: StateInfo) => info?.recordCount ?? 0;
                vis.colorScale = d3.scaleSequential(d3.interpolateBlues);
        }
        const stateInfoPairs = d3.rollups<SalaryRecord, StateInfo, string>(vis._data,
            (records: SalaryRecord[]) => ({
                recordCount: records.length,
                averageSalary: Math.round(d3.mean(records, (record: SalaryRecord) => record.baseSalary))
            }),
            (record: SalaryRecord) => record.state);
        vis.stateInfoMap = new Map(stateInfoPairs);
        for (const state of vis.states.features) {
            if (!vis.stateInfoMap.has(state.properties.name)) {
                vis.stateInfoMap.set(state.properties.name, {recordCount: 0, averageSalary: 0});
            }
        }

        vis.colorScale.domain(d3.extent<[string, StateInfo], number>(Array.from(vis.stateInfoMap),
            (pair) => vis.infoGetter(pair[1])));

        // Define begin and end of the color gradient (legend)
        const [min, max] = vis.colorScale.domain();
        vis.legendStops = [
            { color: vis.colorScale(min), value: min, offset: 0},
            { color: vis.colorScale(max), value: max, offset: 100},
        ];

        this.renderVis();
    }

    public renderVis() {
        let vis = this;

        vis.chart.selectAll('.state')
            .data(vis.states.features)
            .join('path')
            .attr('class', (d) =>
                d.properties.name === vis.filter.state ? 'state active' : 'state')
            .attr('d', vis.geoPath)
            .style('fill', (d) => vis.colorScale(
                vis.infoGetter(vis.stateInfoMap.get(d.properties.name)))
            )
            .attr('active', (d) => d.properties.name === vis.filter.state)
            .on('mousemove', (event, d) => {
                d3.select('#tooltip')
                    .style('display', 'block')
                    .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
                    .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                    .html(`<div class="tooltip-title">${d.properties.name}</div>
                          <ul>
                            <li>Average salary: ${vis.stateInfoMap.get(d.properties.name)?.averageSalary ?? 0}</li>
                            <li>Record count: ${vis.stateInfoMap.get(d.properties.name)?.recordCount ?? 0}</li>
                          </ul>`);
            })
            .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
            })
            .on('click', function(event, d) {
                const isActive = d3.select(this).classed('active');
                const activeState = isActive ? null : d.properties.name;
                if (activeState && !vis.stateInfoMap.get(activeState)?.recordCount) {
                    return;
                }
                vis.dispatcher.call('filterState', event, activeState);
            });

        vis.chart.selectAll(".state.active").raise();

        // Add legend labels
        vis.legend.selectAll('.legend-label')
            .data(vis.legendStops)
            .join('text')
            .attr('class', 'legend-label')
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .attr('y', 30)
            .attr('x', (d,index) => {
                return index == 0 ? 0 : vis.config.legendWidth;
            })
            .text(d => Math.round(d.value * 10 ) / 10);

        // Update gradient for legend
        vis.linearGradient.selectAll('stop')
            .data(vis.legendStops)
            .join('stop')
            .attr('offset', d => d.offset)
            .attr('stop-color', d => d.color);

        vis.legend.select('text')
            .text(vis.infoType === 'record' ? 'Record count' : 'Average salary')

        vis.legendRect.attr('fill', 'url(#legend-gradient)');
    }
}
