
import React, { useEffect } from 'react';
import * as d3 from 'd3';  // Import D3 library
import * as topojson from 'topojson';

const data = require('./Data/data.json');
const world = require('./Data/countries-50m.json')
const colorValues = require('./Data/color.json')
const margin = { top: 30, right: 30, bottom: 30, left: 30 };
const width = 1500;
const height = 800;

function initChart() {
    const projection = d3.geoEquirectangular();
    const path = d3.geoPath(projection);
    const outline = { type: "Sphere" };
    const graticule = d3.geoGraticule10();
    const land = topojson.feature(world, world.objects.land);
    const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);

    const svg = d3.select('#map-svg')
        .attr("width", width)
        .attr("height", height);

    projection.fitSize([width, height], land)
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append('g');

    g.append("path")
        .attr("d", path(outline))
        .attr("fill", "#fff");

    g.append("path")
        .attr("d", path(graticule))
        .attr("stroke", "#cccc")
        .attr("fill", "none");

    g.append("path")
        .attr("d", path(land))
        .attr("fill", "#999c");

    g.append("path")
        .attr("d", path(borders))
        .attr("fill", "none")
        .attr("stroke", "#fff");

    g.append("path")
        .attr("d", path(outline))
        .attr("fill", "none")
        .attr("stroke", "#000");
    
    const tempData = data.filter(d => d.Year === 2001);

    const regions = [... new Set(tempData.map(d => d.Region))];
    const color = d3.scaleOrdinal(regions, colorValues['colors']);

    g.selectAll("points")
        .data(tempData)
        .enter()
        .append("circle")
        .attr("cx", (d) => { return projection([+d.longitude, +d.latitude])[0] })
        .attr("cy", (d) => { return projection([+d.longitude, +d.latitude])[1] })
        .attr("r", (d) => Math.sqrt(d.Casualties))
        .style("fill", (d) => color(d.Region))
        .attr("stroke-width", 1)
        .attr("fill-opacity", 0.6);

    return svg.node();
}

const Map = () => {
    useEffect(() => {
      d3.select('#map-svg').selectAll('*').remove();
      initChart();
    }, []);  // Empty dependency array ensures that the effect runs only once when the component mounts
  
    return (
        <div style={{ textAlign: 'center' }}>
            <svg id="map-svg"></svg>
        </div>
    );
  };
  
  export default Map;