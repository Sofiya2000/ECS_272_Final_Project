
import React, { useEffect } from 'react';
import * as d3 from 'd3';  // Import D3 library

const data = require('./Data/data.json');
const colorValues = require('./Data/color.json')
const width = 1200;
const height = 700;
const margin = { top: 20, right: 30, bottom: 50, left: 50 };

function initChart() {
    const svg = d3.select("#stream-svg")
        .attr("width", width)
        .attr("height", height);

    const regions = [...new Set(data.map(d => d.Region))];
    const color = d3.scaleOrdinal(regions, colorValues['colors']);

    var x = d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => d.Year))
        .range([margin.left, width - margin.right]);

    var y = d3
        .scaleLinear()
        .domain([-d3.max(data, (d) => d.Casualties) * 4, d3.max(data, (d) => d.Casualties) * 4])
        .range([height - margin.bottom, margin.top]);

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat((value) => (value < 0 ? -value : value)))
        .append('text')
        .attr('fill', '#000')
        .attr('transform', `translate(${-margin.left}, ${(height - margin.top * 5) / 2}) rotate(-90)`)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .style("font-size", "15px")
        .text('Casualties');

    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('.0f')))
        .append('text')
        .attr('fill', '#000')
        .attr('x', (width + margin.left) / 2)
        .attr('y', margin.bottom / 2)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .style("font-size", "15px")
        .text('Year');

    const uniqueData = [];
    data.forEach((item) => {
        const casualties = item.Casualties;
        const year = item.Year;
        const region = item.Region;

        const existingItem = uniqueData.find((obj) => obj.year === year && obj.region === region);

        if (existingItem) {
            existingItem.casualties += casualties;
        } else {
            const newItem = { region: region, year: year, casualties: casualties };
            uniqueData.push(newItem);
        }
    });
    uniqueData.sort((a, b) => a.year - b.year);

    function getCasualties(group, key) {
        const entry = group.get(key);
        return (entry && entry.casualties) ? entry.casualties : 0;
    };

    const stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(regions)
        .value(([, group], key) => getCasualties(group, key))
        (d3.index(uniqueData, d => d.year, d => d.region));

    // console.log(stackedData);
    
    svg.selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
          .style("fill", function(d) { return color(d.key); })
          .attr("d", d3.area()
            .x(function(d, i) { return x(d.data[0]); })
            .y0(function(d) { 
                return y(d[0]); 
            })
            .y1(function(d) { return y(d[1]); })
        )

    const legend = svg.append("g")
        .attr("transform", `translate(${margin.left * 2}, ${margin.top * 2})`);

    legend.selectAll("rect")
        .data(regions.reverse())
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => color(d));

    legend.selectAll("text")
        .data(regions)
        .enter()
        .append("text")
        .attr("x", 25)
        .attr("y", (d, i) => i * 20 + 9)
        .attr("dy", "0.35em")
        .style("text-anchor", "start")
        .text(d => d);
}

const StreamGraph = () => {
    useEffect(() => {
    //   d3.select('#stream-svg').selectAll('*').remove();
      initChart();
    }, []);  // Empty dependency array ensures that the effect runs only once when the component mounts
  
    return (
        <div style={{ textAlign: 'center' }}>
            <svg id="stream-svg"></svg>
        </div>
    );
  };
  
  export default StreamGraph;