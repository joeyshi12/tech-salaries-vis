import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { FeatureCollection } from 'geojson';
import {SalaryRecord, ViewConfig} from './view';

type ChoroplethMapConfig = ViewConfig & {
    scale: number;
}

export class ChoroplethMap {
    private width: number;
    private height: number;
    private geoPath: d3.GeoPath<any, d3.GeoPermissibleObjects>;
    private stateRecordCountMap: Map<string, number>;
    private svg: d3.Selection<any, any, any, any>;
    private chart: d3.Selection<any, any, any, any>
    private colorScale: d3.ScaleSequential<string>;

    constructor(private data: SalaryRecord[],
                private geoData: any,
                private config: ChoroplethMapConfig) {
        this.initVis();
    }

    public initVis() {
        let vis = this;

        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select('#choropleth-map')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top}) scale(${vis.config.scale})`)

        // Initialize path generator
        vis.geoPath = d3.geoPath();

        vis.colorScale = d3.scaleSequential(d3.interpolateBlues);
        vis.updateVis();
    }

    public updateVis() {
        let vis = this;
        const stateRecordCounts = d3.rollups<SalaryRecord, number, string>(vis.data,
            (records: SalaryRecord[]) => records.length,
            (record: SalaryRecord) => record.state);
        vis.stateRecordCountMap = new Map(stateRecordCounts);
        vis.colorScale.domain(d3.extent<[string, number], number>(stateRecordCounts, (rollup: [string, number]) => rollup[1]));
        this.renderVis();
    }

    public renderVis() {
        let vis = this;
        const states = <FeatureCollection><unknown>topojson.feature(vis.geoData, vis.geoData.objects.states);

        vis.chart.selectAll('state')
            .data(states.features)
            .join('path')
            .attr('class', 'state')
            .attr('d', vis.geoPath)
            .style('fill', (feature) => vis.colorScale(vis.stateRecordCountMap.get(feature.properties.name) ?? 0))
    }
}
