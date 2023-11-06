import * as d3 from 'd3';
import { DashboardManager } from './dashboardManager';
import { Histogram } from './histogram';
import { ChoroplethMap } from './choroplethMap';
import { BarChart } from './barChart';
import { toSalaryRecord } from './view';


/**
 * Load data and initialize views and interactions
 */
Promise.all([
    d3.csv('./data/salaries_data.csv'),
    d3.json('./data/states-albers-10m.json')
]).then(([data, geoData]) => {
    const records = data.map(toSalaryRecord);
    const filter = { companies: [], roles: [] };
    const dispatcher = d3.dispatch('filterCompanies', 'filterState', 'filterHistogram');
    const mapInfoType = d3.select('#map-info-selector').property('value');

    const choroplethMap = new ChoroplethMap(records, geoData, {
        parentElement: '#choropleth-map',
        containerWidth: 955,
        containerHeight: 640,
        margin: { top: 10, right: 25, bottom: 0, left: 40 },
        tooltipPadding: 15,
        scale: 0.9,
        legendWidth: 200,
        legendHeight: 20
    }, mapInfoType, filter, dispatcher);

    const barChart = new BarChart(records, {
        parentElement: '#bar-chart',
        containerWidth: 470,
        containerHeight: 640,
        margin: { top: 60, right: 40, bottom: 50, left: 70 },
        tooltipPadding: 15
    }, filter, dispatcher);

    const baseSalaryHistogram = new Histogram(records, {
        parentElement: '#base-salary-histogram',
    }, filter, dispatcher, (d): number => d.baseSalary, 'Base Salary (Thousand USD)', (val): string => String(val / 1000));

    const yearsOfExperienceHistogram = new Histogram(records, {
        parentElement: '#years-of-experience-histogram',
    }, filter, dispatcher, (d): number => d.yearsOfExperience, 'Years of Experience');

    const yearsAtCompanyHistogram = new Histogram(records, {
        parentElement: '#years-at-company-histogram',
    }, filter, dispatcher, (d): number => d.yearsAtCompany, 'Years of Tenure');

    const manager = new DashboardManager(
        records, filter, choroplethMap, barChart, baseSalaryHistogram, yearsOfExperienceHistogram, yearsAtCompanyHistogram);

    // Set event listeners
    d3.selectAll('#map-info-selector').on('change', manager.updateMapInfoType.bind(manager));
    d3.selectAll('.legend-btn').on('click', manager.filterByRoles.bind(manager));
    dispatcher.on('filterCompanies', manager.filterByCompanies.bind(manager));
    dispatcher.on('filterState', manager.filterByState.bind(manager))
    dispatcher.on('filterHistogram', manager.filterByRange.bind(manager))
}).catch(err => console.error(err));
