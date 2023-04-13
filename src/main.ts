import * as d3 from 'd3';
import { VisService } from "./visService";

/**
 * Load data and initialize views and interactions
 */
Promise.all([
    d3.csv('./data/salaries_data.csv'),
    d3.json('./data/states-albers-10m.json')
]).then(([data, geoData]) => {
    const service = new VisService(data, geoData);
    service.start();
}).catch(err => console.error(err));
