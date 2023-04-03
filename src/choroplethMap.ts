import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { FeatureCollection } from 'geojson';
import {SalaryRecord, View, ViewConfig} from './view';

type ChoroplethMapConfig = ViewConfig & {
    scale: number;
}

type MapInfoType = 'record' | 'salary';

interface StateInfo {
    recordCount: number;
    averageSalary: number;
}

export class ChoroplethMap implements View {
    private geoPath: d3.GeoPath<any, d3.GeoPermissibleObjects>;
    private stateInfoMap: Map<string, StateInfo>;
    private colorScale: d3.ScaleSequential<string>;
    private infoGetter: (d: StateInfo) => number;

    private svg: d3.Selection<any, any, any, any>;
    private chart: d3.Selection<any, any, any, any>

    constructor(private _data: SalaryRecord[],
                private geoData: any,
                private config: ChoroplethMapConfig,
                private infoType: MapInfoType) {
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

        vis.svg = d3.select('#choropleth-map')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.chart = vis.svg.append('g').attr('transform',
            `translate(${vis.config.margin.left},${vis.config.margin.top}) scale(${vis.config.scale})`)

        // Initialize path generator
        vis.geoPath = d3.geoPath();

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
        vis.colorScale.domain(d3.extent<[string, StateInfo], number>(stateInfoPairs,
            (pair) => vis.infoGetter(pair[1])));
        this.renderVis();
    }

    public renderVis() {
        let vis = this;
        const states = <FeatureCollection><unknown>topojson.feature(vis.geoData, vis.geoData.objects.states);

        vis.chart.selectAll('.state')
            .data(states.features)
            .join('path')
            .attr('class', 'state')
            .attr('d', vis.geoPath)
            .style('fill', (d) => vis.colorScale(
                vis.infoGetter(vis.stateInfoMap.get(d.properties.name)))
            )
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
            });
    }
}
