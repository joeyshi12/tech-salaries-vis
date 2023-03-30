import * as d3 from 'd3';
    import { SalaryRecord, toSalaryRecord } from './view';
import { ChoroplethMap } from './choroplethMap';
import { Histogram } from './histogram';
import { BarChart } from './barChart';

let data: SalaryRecord[];

<<<<<<< HEAD
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
    width: 800,
    height: 500,
    margin: { top: 50, right: 10, bottom: 50, left: 50 },
}, "yearsOfExperience");
scatterPlot.updateVis();
histogram.updateVis();
barChart.updateVis();
=======
Promise.all([
    d3.csv('/data/salaries_data.csv'),
    d3.json('/data/states-albers-10m.json')
]).then(([_data, geoData]) => {
    data = _data.map(toSalaryRecord);
    const scatterPlot = new ChoroplethMap(data, geoData, {
        parentElement: '#choropleth-map',
        containerWidth: 1000,
        containerHeight: 600,
        margin: { top: 100, right: 100, bottom: 100, left: 100 }
    });
    const histogram = new Histogram(data, {
        parentElement: '#histogram',
        containerWidth: 700,
        containerHeight: 500,
        margin: { top: 60, right: 40, bottom: 50, left: 70 }
    });
    const barChart = new BarChart(data, {
        parentElement: '#bar-chart',
        containerWidth: 500,
        containerHeight: 500,
        margin: { top: 10, right: 10, bottom: 50, left: 50 }
    });
    scatterPlot.updateVis();
    histogram.updateVis();
    barChart.updateVis();
}).catch(err => console.error(err));
>>>>>>> b653a770f29717a017b9baf23b17cf9ebb87f902
