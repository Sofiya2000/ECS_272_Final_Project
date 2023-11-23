
import React, { useEffect } from 'react';
import * as d3 from 'd3';  // Import D3 library
import * as topojson from 'topojson';

const data = require('./Data/data.json');
const world = require('./Data/countries-50m.json')
const colorValues = require('./Data/color.json')
// const margin = { top: 30, right: 30, bottom: 30, left: 30 };
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

    const g = svg.append('g')
        .style("will-change", "transform");

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

    const borderLines = g.append("path")
        .attr("d", path(borders))
        .attr("fill", "none")
        .attr("stroke-width", 1)
        .attr("stroke", "#fff");

    g.append("path")
        .attr("d", path(outline))
        .attr("fill", "none")
        .attr("stroke", "#000");
    
    const tempData = data.filter(d => d.Year === 2001);
    console.log(tempData)

    const regions = [...new Set(tempData.map(d => d.Region))];
    const color = d3.scaleOrdinal(regions, colorValues['colors']);

    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(tempData, d => d.Casualties)])
        .range([10, 200]); // Adjust the range as needed

    const tooltip = d3.select('#tooltip');

    g.selectAll("points")
        .data(tempData)
        .enter()
        .append("circle")
        .attr("cx", (d) => { return projection([+d.longitude, +d.latitude])[0] })
        .attr("cy", (d) => { return projection([+d.longitude, +d.latitude])[1] })
        .attr("r", (d) => radiusScale(d.Casualties))
        .style("fill", (d) => color(d.Region))
        .attr("stroke-width", 1)
        .attr("fill-opacity", 0.6)
        .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
                .html(`${(d.Attack_Type) ? d.Attack_Type : ""}<br>City: ${d.city}<br>Casualties: ${d.Casualties}<br>${d.summary}`);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 10 + "px");
        })
        .on("mouseout", () => {
            tooltip.style("display", "none");
        });
    

    const zoom = d3.zoom()
        .scaleExtent([1, 100]) // Set the scale extent for zooming (min, max)
        .on('zoom', handleZoom); // Attach the zoom event handler
  
    svg.call(zoom);

    function handleZoom(event) {
        const { transform } = event;
        // Apply the zoom transform to the map features
        g.transition()
            .attr('transform', transform);
            const zoomLevel = transform.k;
            const adjustedRadius = (d) => radiusScale(d.Casualties) / zoomLevel;
    
            g.selectAll("circle")
                .attr("r", (d) => adjustedRadius(d));

            borderLines.attr("stroke-width", 1 / zoomLevel);
    }

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
            <div id="tooltip" style={{ position: 'absolute', padding: '10px', background: 'white', border: '1px solid #ccc', display: 'none' }}></div>
        </div>
    );
  };
  
  export default Map;