import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { FeatureCollection } from 'geojson';
import {SalaryRecord, ViewConfig} from './view';

export class ChoroplethMap {
    private states: FeatureCollection;
    private width: number;
    private height: number;
    private svg: d3.Selection<any, any, any, any>;
    private colorScale: d3.ScaleSequential<string, never>;
    private geoPath: d3.GeoPath<any, d3.GeoPermissibleObjects>;

    constructor(private data: SalaryRecord[],
                private geoData: any,
                private config: ViewConfig) {
        this.initVis();
    }

    public initVis() {
        let vis = this;

        vis.states = <FeatureCollection><unknown>topojson.feature(
            vis.geoData, vis.geoData.objects.states);

        vis.svg = d3.select('#choropleth-map')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.colorScale = d3.scaleSequential(d3.interpolateGreens)
            .domain([0, 1000]);

        vis.geoPath = d3.geoPath();
    }

    public updateVis() {
        this.renderVis();
    }

    public renderVis() {
        let vis = this;

        vis.svg.selectAll('path')
          .data(vis.states.features)
          .join('path')
          .attr('d', vis.geoPath)
          .style('fill', "#ccc")
          .style('stroke', 'white')
          .style('stroke-width', 1);
    }
}

