import * as d3 from 'd3';
import { SalaryRecord, toSalaryRecord } from './view';
import { ChoroplethMap } from './choroplethMap';
import { Histogram } from './histogram';
import { BarChart } from './barChart';

Promise.all([
    d3.csv('data/salaries_data.csv'),
    d3.json('data/states-albers-10m.json')
]).then(([data, geoData]) => {
    const mapInfoType = d3.select('#map-info-selector').property('value');
    const records = data.map(toSalaryRecord);
    const choroplethMap = new ChoroplethMap(records, geoData, {
        parentElement: '#choropleth-map',
        containerWidth: 955,
        containerHeight: 600,
        margin: { top: 20, right: 10, bottom: 10, left: 60 },
        tooltipPadding: 15,
        scale: 0.9
    }, mapInfoType);
    const barChart = new BarChart(records, {
        parentElement: '#bar-chart',
        containerWidth: 470,
        containerHeight: 600,
        margin: { top: 60, right: 40, bottom: 50, left: 70 },
        tooltipPadding: 15
    });
    const baseSalaryHistogram = new Histogram(records, {
        parentElement: '#base-salary-histogram',
    }, (d): number => d.baseSalary,
     'Base Salary (Thousand USD)',
     (val): string => String(val/1000));
    const yearsOfExperienceHistogram = new Histogram(records, {
        parentElement: '#years-of-experience-histogram',
    }, (d): number => d.yearsOfExperience,
    'Years of Experience');
    const yearsAtCompanyHistogram = new Histogram(records, {
        parentElement: '#years-at-company-histogram',
    }, (d): number => d.yearsAtCompany,
    'Years of Tenure');

    d3.selectAll('#map-info-selector').on('change', function() {
        choroplethMap.mapInfoType = d3.select(this).property('value');
        choroplethMap.updateVis();
    });

    d3.selectAll('.legend-btn').on('click', function() {
        // Check which categories are active
        let selectedCategories = [];
        d3.selectAll('.legend-btn:is(.active)').each(function() {
            selectedCategories.push(d3.select(<Window>this).attr('data-category'));
        });

        // Toggle categories while making sure only at most 2 is active
        const selectedRole = d3.select(this).attr('data-category');
        if (selectedCategories.includes(selectedRole)) {
            d3.select(this).classed('active', false);
            selectedCategories = selectedCategories.filter((category) => category !== selectedRole);
        } else if (selectedCategories.length >= 2) {
            return;
        } else {
            d3.select(this).classed('active', true);
            selectedCategories.push(selectedRole);
        }

        let newData: SalaryRecord[];
        if (selectedCategories.length === 0) {
            newData = records;
        } else {
            newData = records.filter((d) => selectedCategories.includes(d.title));
        }

        choroplethMap.data = newData;
        barChart.data = newData;
        baseSalaryHistogram.data = newData;
        yearsOfExperienceHistogram.data = newData;
        yearsAtCompanyHistogram.data = newData;

        baseSalaryHistogram.selectedTitles = selectedCategories;
        yearsOfExperienceHistogram.selectedTitles = selectedCategories;
        yearsAtCompanyHistogram.selectedTitles = selectedCategories;

        choroplethMap.updateVis();
        barChart.updateVis();
        baseSalaryHistogram.updateVis();
        yearsOfExperienceHistogram.updateVis();
        yearsAtCompanyHistogram.updateVis();
    });
}).catch(err => console.error(err));
