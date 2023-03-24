import d3 from 'd3';
import { SalaryRecord, toSalaryRecord } from './view';
import { ScatterPlot } from './scatterPlot';
import { Histogram } from './histogram';
import { BarChart } from './barChart';

const dispatch = d3.dispatch('lmaoidk');

// TODO: load csv and map with `toSalaryRecord`
const data: SalaryRecord[] = [
    {
        company: 'Google',
        title: 'Software Engineer',
        baseSalary: 100000,
        yearsOfExperience: 5
    }
];
const scatterPlot = new ScatterPlot(data, {
    parentElement: '#scatter-plot',
    width: 500,
    height: 500,
    margin: { top: 10, right: 10, bottom: 50, left: 50 }
});
const histogram = new Histogram(data, {
    parentElement: '#histogram',
    width: 500,
    height: 500,
    margin: { top: 10, right: 10, bottom: 50, left: 50 }
});
const barChart = new BarChart(data, {
    parentElement: '#bar-chart',
    width: 500,
    height: 500,
    margin: { top: 10, right: 10, bottom: 50, left: 50 }
});
scatterPlot.updateVis();
histogram.updateVis();
barChart.updateVis();
