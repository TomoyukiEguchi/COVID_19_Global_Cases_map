$('body').append('<div style="" id="loadingDiv"><div class="loader">Loading...</div></div>');
$(window).on('load', function(){
    setTimeout(removeLoader, 2000);
});
function removeLoader(){
    $("#loadingDiv").fadeOut(500, function(){
        $("#loadingDiv").remove();
    });
}
import { sizeLegend } from './sizeLegend.js'
import { changeValue } from './changeValue.js'
const width = 960;
const height = 500;
const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom().on('zoom', function(){
        svg.attr('transform', d3.event.transform)
    }))
    .append('g');

const projection = d3.geoEquirectangular().scale(140).translate([width / 2, height / 1.78]);
const pathGenerator = d3.geoPath(projection);

/*
svg.append('path')
    .attr('class', 'sphere')
    .attr('d', path({type: 'Sphere'}));
*/

const radiusValue = d => +d['Cases - cumulative total'];
const C_N7Ds = d => +d['Cases - newly reported in last 7 days'];
const C_N24Hs = d => +d['Cases - newly reported in last 24 hours'];
const C_TPM = d => +d['Cases - cumulative total per 1 million population'];
const D_CT = d => +d['Deaths - cumulative total'];
const D_N7Ds = d => +d['Deaths - newly reported in last 7 days'];
const D_N24Hs = d => +d['Deaths - newly reported in last 24 hours'];
const D_TPM = d => +d['Deaths - cumulative total per 1 million population'];
const populationFormat = d3.format(',');

d3.csv('https://cors-anywhere.herokuapp.com/https://covid19.who.int/WHO-COVID-19-global-table-data.csv', function(error, csvData) {
//d3.csv('assets/WHO-COVID-19-global-table-data.csv', function(error, csvData) {
    if (error) throw error;
d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json', function(error, jsonData) {
    if (error) throw error;

    changeValue(csvData);

    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)

    const countries = topojson.feature(jsonData, jsonData.objects.countries);

        _(countries.features)
            .keyBy(d => d.properties.name)
            .merge(_.keyBy(csvData, 'Name'))
            .values()
            .value();
            //console.log(countries);
            //console.log(csvData);

        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(countries.features, radiusValue)])
            .range([0, 25]);
        
        svg.selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
            .attr('class', 'country')
            .attr('d', pathGenerator)
            .attr('fill', d => d.Name ? 'rgb(214, 214, 214)' : 'rgb(245, 254, 255)')
        
        .on('mousemove', function(d){
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);

            tooltip.style('left', (d3.event.pageX + 15) + 'px')
                .style('top', (d3.event.pageY) + 'px')
                .text(() => isNaN(radiusValue(d))
                    ? d.properties.name + '\nMissing data'
                    : [
                        d.properties.name + '\n'
                                    + 'Cases - cumulative total: ' + populationFormat(radiusValue(d)) + '\n'
                                    + 'Cases - newly reported in last 7 days: ' + populationFormat(C_N7Ds(d)) + '\n'
                                    + 'Cases - newly reported in last 24 hours: ' + populationFormat(C_N24Hs(d)) + '\n'
                                    + 'Cases - cumulative total per 1 million population: ' + populationFormat(C_TPM(d)) + '\n'
                                    + 'Deaths - cumulative total: ' + populationFormat(D_CT(d)) + '\n'
                                    + 'Deaths - newly reported in last 7 days: ' + populationFormat(D_N7Ds(d)) + '\n'
                                    + 'Deaths - newly reported in last 24 hours: ' + populationFormat(D_N24Hs(d)) + '\n'
                                    + 'Deaths - cumulative total per 1 million population: ' + populationFormat(D_TPM(d)) + '\n'
                    ]
                );
        })
        .on('mouseout', function(d, i){
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })

        //console.log(radiusValue(countries.features[0]));

        const featuresWithCase = countries.features
            .filter(d => d['Cases - cumulative total'])

        featuresWithCase.forEach(d =>{
            d.properties.projected = projection(d3.geoCentroid(d));
        });

        svg.selectAll('circle')
            .data(featuresWithCase)
            .enter()
            .append('circle')
                .attr('class', 'country-circle')
                .attr('cx', d => d.properties.projected[0])
                .attr('cy', d => d.properties.projected[1])
                .attr('r', d => radiusScale(radiusValue(d)));

        svg.append('g')
            .attr('transform', `translate(275, 40)`)
            .attr('class', 'data-title')
            .append('text')
                .text('Coronavirus COVID-19 Global Cases');

        svg.append('g')
            .attr('transform', `translate(23, 75)`)
            .attr('class', 'globalCase')
            .append('text')
                .text([
                    'Global Cases',
                    populationFormat(csvData[0]['Cases - cumulative total'])
                ].join(': '));

        svg.append('g')
            .attr('transform', `translate(23, 95)`)
            .attr('class', 'globalCase')
            .append('text')
                .text([
                    'Global Deaths',
                    populationFormat(csvData[0]['Deaths - cumulative total'])
                ].join(': '));

        svg.append('g')
            .attr('transform', `translate(50, 300)`)
            //.attr('transform', `translate(55, 215)`)
            .attr('class', 'sizeLegend')
            .call(sizeLegend, {
                radiusScale,
                spacing: 30,
                textOffset: 10,
                numTicks: 6,
                tickFormat: populationFormat
            })
            .append('text')
                .text('Cases by Region')
                .attr('class', 'legend-title')
                .attr('y', -40)
                .attr('x', -25);

        svg.append('g')
            .attr('transform', `translate(850, 75)`)
            .attr('class', 'dataTable')
            .append('text')
                .text('Bar Chart')
                .on('click', function(){
                    window.open('https://tomoyukieguchi.github.io/covid_barChart/');
                });

});
});
