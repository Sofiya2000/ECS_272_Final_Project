import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import ByYear from './byYear';
import './PageStyle.css';
const Page2 = () => {
  const [selectedYear, setSelectedYear] = useState(2000);

  useEffect(() => {
    const map = async () => {
      const width = 975;
      const height = 610;

      // Fetch the map data
      const res = await fetch(`https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json`);
      const mapJson = await res.json();

      // Filter your data for the United States
      const usData = require('./Data/data.json').filter(
        (item) => item.Country === 'United States'
      );

      const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(usData, (d) => d.Casualties)])
        .range([5, 50]); // Adjust the range as needed

      // Clear existing SVG content
      d3.select("#map").selectAll('*').remove();

      // Create an svg element to hold our map
      const svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, 975, 610])
        .attr("style", "width: 100%; height: auto; height: intrinsic;");

      // Define projection
      const projection = d3.geoAlbersUsa()
        .scale(1300)
        .translate([width / 2, height / 2]);

      // Create the US boundary
      svg.append('g')
        .append('path')
        .datum(topojson.feature(mapJson, mapJson.objects.nation))
        .attr('d', d3.geoPath());

      // Create the state boundaries. "stroke" and "fill" set the outline and fill
      // colors, respectively.
      svg.append('g')
        .attr('stroke', '#444')
        .attr('fill', '#eee')
        .selectAll('path')
        .data(topojson.feature(mapJson, mapJson.objects.states).features)
        .join('path')
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('d', d3.geoPath());

      const tooltip = d3.select("#map")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("box-shadow", "0 0 10px rgba(0, 0, 0, 0.1)");

      // Mark datapoints with latitude and longitude for the United States
      svg.selectAll('circle')
        .data(usData)
        .enter()
        .append('circle')
        .attr('cx', (d) => {
          const coordinates = projection([d.longitude, d.latitude]);
          return coordinates ? coordinates[0] : 0;
        })
        .attr('cy', (d) => {
          const coordinates = projection([d.longitude, d.latitude]);
          return coordinates ? coordinates[1] : 0;
        })
        .attr('r', (d) => radiusScale(d.Casualties)) // Set the radius based on casualties
        .style('fill', (d) => (d.Year === selectedYear ? 'red' : '#bbb')) // Change fill color dynamically
        .style('fill-opacity', 0.5)
        .on('mouseover', function (event, d) {
          // Highlight the circle when mouseover
          d3.select(this)
            .style('fill', 'darkred')
            .style('fill-opacity', 1.0);

          tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
          tooltip.html(`
            <strong>Year:</strong> ${d.Year}<br/>
            <strong>Casualties:</strong> ${d.Casualties}<br/>
            <strong>Country:</strong> ${d.Country}<br/>
            <strong>Region:</strong> ${d.Region}<br/>
            <strong>City:</strong> ${d.city}<br/>
            <strong>Attack Type:</strong> ${d.Attack_Type}<br/>
            <strong>Target:</strong> ${d.Target}<br/>
            <strong>Group:</strong> ${d.Group}<br/>
            <strong>Target Type:</strong> ${d.Target_Type}<br/>
            <strong>Weapon Type:</strong> ${d.Weapon_Type}
          `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 50) + "px");
        })
        .on('mouseout', function () {
          // Reset the fill color when mouseout
          d3.select(this)
            .style('fill', (d) => (d.Year === selectedYear ? 'red' : '#bbb'))
            .style('fill-opacity', 0.5);

          // Hide tooltip when moving away from the circle
          tooltip.transition()
            .duration(200)
            .style("opacity", 0);
        });
    };

    map();
  }, [selectedYear]); // Run the effect whenever selectedYear changes

  const handleYearChange = (event) => {
    setSelectedYear(+event.target.value);
  };

  return (
    <div>
        <div style={{ textAlign: 'center' }}>
            <h2>Terrorist Activity in the United States Over the Years</h2>
            <h3>
                The size of circles on the map represent the number of casualties of each incident.<br/>
                Hover over each circle to see more information. The year selected on the slider will highlight attacks for that year on the map.<br/>
                You can also click on points from the line plot to see a breakdown of what each attack was targeting.
            </h3>
        </div>
        <div className="container">
        <div className="left-side">
            <div id="map">
            {/* Your map content goes here */}
            </div>
            <div id="year-controls">
            <label htmlFor="yearRange">Select Year:</label>
            <input
                id="yearRange"
                type="range"
                min="1970"
                max="2017"
                step="1"
                value={selectedYear}
                onChange={handleYearChange}
            />
            <div>Selected Year: {selectedYear}</div>
            </div>
        </div>
        <div className="ByYear">
            <ByYear />
        </div>
        </div>
    </div>
  );
  
  
};

export default Page2;



