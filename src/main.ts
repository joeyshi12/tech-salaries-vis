import * as d3 from 'd3';
    import { SalaryRecord, toSalaryRecord } from './view';
import { ChoroplethMap } from './choroplethMap';
import { Histogram } from './histogram';
import { BarChart } from './barChart';

let data: SalaryRecord[];

Promise.all([
    d3.csv('/data/salaries_data.csv'),
    d3.json('/data/states-albers-10m.json')
]).then(([_data, geoData]) => {
    data = _data.map(toSalaryRecord);
    const scatterPlot = new ChoroplethMap(data, geoData, {
        parentElement: '#choropleth-map',
        containerWidth: 1030,
        containerHeight: 600,
        margin: { top: 100, right: 100, bottom: 100, left: 100 }
    });
    const baseSalaryHistogram = new Histogram(data, {
        parentElement: '#histogram',
        containerWidth: 500,
        containerHeight: 400,
        margin: { top: 60, right: 40, bottom: 50, left: 70 }
    }, (d): number => d.baseSalary, "Salary (Thousand USD)", (val): string => String(val/1000));
    const yearsOfExperienceHistogram = new Histogram(data, {
        parentElement: '#years-of-experience-chart',
        containerWidth: 500,
        containerHeight: 400,
        margin: { top: 60, right: 40, bottom: 50, left: 70 }
    }, (d): number => d.yearsOfExperience, "Years of Experience");
    const yearsAtCompanyHistogram = new Histogram(data, {
        parentElement: '#years-at-company-chart',
        containerWidth: 700,
        containerHeight: 500,
        margin: { top: 60, right: 40, bottom: 50, left: 70 }
    }, (d): number => d.yearsAtCompany, "Years at Company");
    // const barChart = new BarChart(data, {
    //     parentElement: '#bar-chart',
    //     containerWidth: 500,
    //     containerHeight: 500,
    //     margin: { top: 10, right: 10, bottom: 50, left: 50 }
    // }, "yearsOfExperience");
    scatterPlot.updateVis();
    baseSalaryHistogram.updateVis();
    yearsOfExperienceHistogram.updateVis();
    yearsAtCompanyHistogram.updateVis();

    //barChart.updateVis();
}).catch(err => console.error(err));
