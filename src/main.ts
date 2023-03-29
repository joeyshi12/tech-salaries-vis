import * as d3 from 'd3';
import { SalaryRecord, toSalaryRecord } from './view';
import { ScatterPlot } from './scatterPlot';
import { Histogram } from './histogram';
import { BarChart } from './barChart';

const dispatch = d3.dispatch('lmaoidk');
// console.log("HELLO WORLD!");
// TODO: load csv and map with `toSalaryRecord`
let data: SalaryRecord[] = [];

d3.csv('data/salaries_data.csv').then(_data => {
    // console.log('hello');
    console.log(_data)
    _data.forEach(d => {
        // console.log(d)
        // console.log(toSalaryRecord(d))
        data.push(toSalaryRecord(d))
      });
    // console.log("NEW DATA");
    // console.log(data);
})

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
    margin: { top: 10, right: 10, bottom: 50, left: 50 },
}, "yearsOfExperience");
scatterPlot.updateVis();
histogram.updateVis();
barChart.updateVis();
