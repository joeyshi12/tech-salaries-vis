import * as d3 from 'd3';
import { SalaryRecord, toSalaryRecord } from './view';
import { ScatterPlot } from './scatterPlot';
import { Histogram } from './histogram';
import { BarChart } from './barChart';

const dispatch = d3.dispatch('lmaoidk');
let data: SalaryRecord[] = [];

d3.csv('data/salaries_data.csv').then(_data => {
    // console.log(_data)
    _data.forEach(d => {
        data.push(toSalaryRecord(d))
        // console.log(data)
      });

      const histogram = new Histogram(data, {
        parentElement: '#histogram',
        width: 500,
        height: 500,
        margin: { top: 10, right: 10, bottom: 50, left: 50 }
    });
    histogram.updateVis();
})


const scatterPlot = new ScatterPlot(data, {
    parentElement: '#scatter-plot',
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
barChart.updateVis();
