import * as d3 from 'd3';
import { SalaryRecord, toSalaryRecord } from './view';
import { ChoroplethMap } from './choroplethMap';
import { Histogram } from './histogram';
import { BarChart } from './barChart';

let data: SalaryRecord[];
let choroplethMap: ChoroplethMap;
let barChart: BarChart;
let baseSalaryHistogram: Histogram;
let yearsOfExperienceHistogram: Histogram;
let yearsAtCompanyHistogram: Histogram;

Promise.all([
    d3.csv('/data/salaries_data.csv'),
    d3.json('/data/states-albers-10m.json')
]).then(([_data, geoData]) => {
    data = _data.map(toSalaryRecord);
    const mapInfoType = d3.select('#map-info-selector').property('value');

    choroplethMap = new ChoroplethMap(data, geoData, {
        parentElement: '#choropleth-map',
        containerWidth: 955,
        containerHeight: 600,
        margin: { top: 20, right: 10, bottom: 10, left: 60 },
        tooltipPadding: 15,
        scale: 0.9
    }, mapInfoType);
    barChart = new BarChart(data, {
        parentElement: '#bar-chart',
        containerWidth: 470,
        containerHeight: 600,
        margin: { top: 60, right: 40, bottom: 50, left: 60 },
        tooltipPadding: 15
    });
    baseSalaryHistogram = new Histogram(data, {
        parentElement: '#base-salary-histogram',
    }, (d): number => d.baseSalary,
     'Base Salary (Thousand USD)',
     (val): string => String(val/1000));
    yearsOfExperienceHistogram = new Histogram(data, {
        parentElement: '#years-of-experience-histogram',
    }, (d): number => d.yearsOfExperience,
    'Years of Experience');
    yearsAtCompanyHistogram = new Histogram(data, {
        parentElement: '#years-at-company-histogram',
    }, (d): number => d.yearsAtCompany,
    'Years of Tenure');
}).catch(err => console.error(err));

d3.selectAll('#map-info-selector').on('change', function() {
    choroplethMap.mapInfoType = d3.select(this).property('value');
    choroplethMap.updateVis();
});
