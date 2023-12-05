
import React, { useEffect } from 'react';
import * as d3 from 'd3';  // Import D3 library

const data = require('./Data/data.json');
const colorValues = require('./Data/color.json')
const width = 1200;
const height = 700;
const margin = { top: 20, right: 30, bottom: 50, left: 70 };

const StreamGraph = () => {
    let currentRegions = [];
    useEffect(() => {
      d3.select('#stream-svg').selectAll('*').remove();
      initChart();
    }, []);  // Empty dependency array ensures that the effect runs only once when the component mounts
  
    function initChart() {
        const svg = d3.select("#stream-svg")
            .attr("width", width)
            .attr("height", height);
    
        const regions = [...new Set(data.map(d => d.Region))];
        currentRegions = [...regions];
        const color = {};
        regions.forEach((r, i) => {
            color[r] = colorValues['colors'][i];
        });
    
        var x = d3
            .scaleLinear()
            .domain(d3.extent(data, (d) => d.Year))
            .range([margin.left, width - margin.right]);
    
        var y = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d.Casualties) * 8])
            .range([height - margin.bottom, margin.top]);
    
        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .attr("class", "y-axis")
            .call(d3.axisLeft(y))
            .append('text')
            .attr('fill', '#000')
            .attr('transform', `translate(${-margin.left * 0.9}, ${(height - margin.top * 5) / 2}) rotate(-90)`)
            .attr('dy', '0.71em')
            .attr('text-anchor', 'end')
            .style("font-size", "15px")
            .text('Casualties');
    
        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .attr("class", "x-axis")
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
            .keys(regions)
            .value(([, group], key) => getCasualties(group, key))
            (d3.index(uniqueData, d => d.year, d => d.region));
    
        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom);
    
        const areas = svg.append("g")
            .attr("clip-path", "url(#clip)");
        
        areas.selectAll("mylayers")
            .data(stackedData)
            .enter()
            .append("path")
            .attr("class", "mylayers")
            .style("fill", (d) => color[d.key])
            .attr("d", d3.area()
                .x(function(d, i) { return x(d.data[0]); })
                .y0(function(d) { return y(d[0]); })
                .y1(function(d) { return y(d[1]); })
            )
    
        const legendPadding = 5;
        const legendWidth = 250;
    
        const legend = svg.append("g")
        .attr("transform", `translate(${margin.left * 2}, ${margin.top * 2})`);
    
        legend.append("rect")
            .attr("width", legendWidth + 2 * legendPadding)
            .attr("height", regions.length * 20 + 2 * legendPadding)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 1);
        
        legend.selectAll("rect.legend-item")
            .data(regions)
            .enter()
            .append("rect")
            .attr("class", "legend-item")
            .attr("x", legendPadding)
            .attr("y", (d, i) => (regions.length - i - 1) * 20 + legendPadding)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d => color[d])
            .style("cursor", "pointer")
            .on("click", toggleRegionVisibility);
        
        legend.selectAll("text.legend-item")
            .data(regions)
            .enter()
            .append("text")
            .attr("class", "legend-item")
            .attr("x", 25 + legendPadding)
            .attr("y", (d, i) => (regions.length - i - 1) * 20 + 9 + legendPadding)
            .attr("dy", "0.35em")
            .style("text-anchor", "start")
            .text(d => d)
            .style("cursor", "pointer")
            .on("click", toggleRegionVisibility);

        function toggleRegionVisibility(event, clickedRegion) {
            const regionIndex = regions.indexOf(clickedRegion);
        
            let relativePos = -1;
            for (let i = 0; i < currentRegions.length; i++) {
                const region = currentRegions[i];
                if (region === clickedRegion) {
                    currentRegions.splice(i, 1);
                    relativePos = -2;
                    break;
                }
                if (regions.indexOf(region) < regionIndex) {
                    relativePos = i;
                }
            }
            if (relativePos !== -2) {
                currentRegions.splice(relativePos + 1, 0, clickedRegion);
            }
        
            const updatedStackedData = d3.stack()
                .keys(currentRegions)
                .value(([, group], key) => getCasualties(group, key))
                (d3.index(uniqueData, d => d.year, d => d.region));
        
            const layers = areas.selectAll(".mylayers")
                .data(updatedStackedData, d => d.key);
        
            layers.exit()
                .transition()
                .duration(500)
                .style("opacity", 0)
                .remove();
        
            layers.transition()
                .duration(500)
                .style("fill", function (d) { return color[d.key]; })
                .attr("d", d3.area()
                    .x(function (d, i) { return x(d.data[0]); })
                    .y0(function (d) { return y(d[0]); })
                    .y1(function (d) { return y(d[1]); })
                );
        
            layers.enter()
                .append("path")
                .attr("class", d => "mylayers mylayers-" + d.key)
                .attr("d", d3.area()
                    .x(function (d, i) { return x(d.data[0]); })
                    .y0(function () { return y(0); })
                    .y1(function () { return y(0); })
                )
                .style("fill", function (d) { return color[d.key]; })
                .merge(layers) // Merge enter and update selections
                .transition()
                .duration(500)
                .attr("d", d3.area()
                    .x(function (d, i) { return x(d.data[0]); })
                    .y0(function (d) { return y(d[0]); })
                    .y1(function (d) { return y(d[1]); })
                );
            legend.selectAll("rect.legend-item")
                .style("fill", d => (currentRegions.includes(d) ? color[d] : "#ccc"));
        }
            

        const zoom = d3.zoom()
            .scaleExtent([1, 10])
            .translateExtent([[margin.left, 0], [width - margin.right, height]])
            .on("zoom", zoomed);
        
        svg.call(zoom);
        
        function zoomed(event) {
            const new_x = event.transform.rescaleX(x);
            const new_y = event.transform.rescaleY(y);
    
            svg.selectAll(".mylayers")
                .attr("d", d3.area()
                    .x(function (d, i) { return new_x(d.data[0]); })
                    .y0(function (d) { return new_y(d[0]); })
                    .y1(function (d) { return new_y(d[1]); })
                );
            svg.select("#clip rect")
                .attr("width", width - margin.left - margin.right);    
            svg.select(".x-axis").call(d3.axisBottom(new_x).tickFormat(d3.format('.0f')));
            svg.select(".y-axis").call(d3.axisLeft(new_y));
        }
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <svg id="stream-svg"></svg>
        </div>
    );
  };
  
  export default StreamGraph;