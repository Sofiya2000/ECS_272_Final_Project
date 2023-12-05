import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';  // Import D3 library
import './Page1.css';
const data = require('./Data/data.json');
const totalHeight = 1000;

// Paraphrased from Wikipedia
const groupToDefinition = {
    "Taliban": "Islamic fundamentalist organization with the aim of governing Afghanistan and Pakistan.",
    "Islamic State of Iraq and the Levant (ISIL)": "Also known as the Islamic State of Iraq and Syria (ISIS). " +
        "It is a jihadist group centered in Iraq whose stated goal is to create a worldwide Islamic state.",
    "Shining Path (SL)": "Also known as the Communist Party of Peru. Its seeks to overthrow the government of Peru and instill a communist regime.",
    "Al-Shabaab": "Islamic militant group centered in Somalia. It has strong ties with al-Qaeda.",
    "Farabundo Marti National Liberation Front (FMLN)": "Far-Left political party in El Salvador that was formerly a guerilla militant group.",
    "Irish Republican Army (IRA)": "A number of Irish paramilitary organizations share this name, with the common goal of liberating Ireland from British Imperialism.",
    "New People's Army (NPA)": "Armed wing of the Communist Party of the Philippines, who aim to over throw the sitting government.",
    "Boko Haram": "Sunni Islamist militant organization based in Nigeria. One of its main goals is to destroy Shia Islam from the region.",
    "Revolutionary Armed Forces of Colombia (FARC)": "Far-Left guerilla group that is just one of many groups involved in an ongoing conflict in Colombia.",
    "Kurdistan Workers' Party (PKK)": "Guerilla militant group whose stated goal is the autonomy of Kurds in Kurdistan and Turkey.",
    "Basque Fatherland and Freedom (ETA)": "Key player in the Basque liberation movement centered in Spain.",
    "Communist Party of India - Maoist (CPI-Maoist)": "Indian militant group who aim to over throw the 'semi-colonial and semi-feudal Indian state'.",
    "Maoists": "Umbrella name for those who follow the ideology of Mao Zedong. Comprises of many Far-Left political and militant groups around China.",
    "Liberation Tigers of Tamil Eelam (LTTE)": "Militant group based in Norther Sri Lanka. Countermovement to Sri Lankan persecution of the Tamil people."
};

function groupBy(objectArray, property) {
  return objectArray.reduce(function (acc, obj) {
    let key = obj[property];
    if (key !== undefined && key !== '') {
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
    }
    return acc;
  }, {});
}

const groupedData = groupBy(data, "Group");
// Convert the object into an array of key-value pairs
const groupedArray = Object.entries(groupedData);

// Sort the array based on the length of the arrays (number of elements in each group)
groupedArray.sort((a, b) => b[1].length - a[1].length);

const groupCount = groupedArray.slice(1, 15);


const processedData = {};

// Process data for each group
groupCount.forEach(([group, groupData]) => {
  // Initialize an object to store country-wise casualties
  const countryCasualties = {};

  // Process each entry in the group data
  groupData.forEach(entry => {
    const country = entry.Country;
    const casualties = entry.Casualties; // Make sure the property name matches your data

    // Update or initialize the country's casualties
    countryCasualties[country] = (countryCasualties[country] || 0) + casualties;
  });

  // Store the results for the group
  processedData[group] = countryCasualties;
});

console.log(processedData);

const counts_all = Object.keys(groupedData).map(key => {
  return {
    group: key,
    count: groupedData[key].length
  };
});

// Sort the counts array
counts_all.sort((a, b) => b.count - a.count);

// Keep only the first 20 values
const counts = counts_all.slice(1, 15);

// Move these outside the initChart function
const handleMouseOver = function (event, d, setHoveredGroup) {
  d3.select(this)
    .transition()
    .duration(100)
    .style('fill', 'black'); // Change color on mouseover

  setHoveredGroup(d.group); // Update the state with the hovered group
};

const handleMouseOut = function (event, d, color, setHoveredGroup) {
  d3.select(this)
    .transition()
    .duration(100)
    .style('fill', d => color(d.group)); // Restore original color on mouseout

  setHoveredGroup(null); // Reset the state when the mouse is not over any bar
};

function initChart(setHoveredGroup) {
  const totalWidth = 1000; // Total width of the SVG container
  const margin = { top: 30, right: 30, bottom: 50, left: 230 }; // Increased bottom margin for x-axis label
  const width = totalWidth - margin.left - margin.right;
  const height = totalHeight - margin.top - margin.bottom-200;

  const svg = d3.select('#bar-svg')
    .attr('width', totalWidth)
    .attr('height', totalHeight);

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(counts, d => d.count)])
    .range([margin.left, width]);

  const yScale = d3.scaleBand()
    .domain(counts.map(d => d.group))
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

  const color = d3.scaleOrdinal()
    .domain(counts.map(d => d.group))
    .range(d3.quantize(t => d3.interpolatePlasma(t * 0.8 + 0.1), counts.length));

  svg.selectAll('rect')
    .data(counts)
    .enter().append('rect')
    .attr('x', margin.left)
    .attr('y', d => yScale(d.group))
    .attr('width', d => xScale(d.count) - margin.left)
    .attr('height', yScale.bandwidth())
    .style('fill', d => color(d.group))
    .on('mouseover', function (event, d) {
      handleMouseOver.call(this, event, d, setHoveredGroup);
    })
    .on('mouseout', function (event, d) {
      handleMouseOut.call(this, event, d, color, setHoveredGroup);
    });

  // X-Axis
  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))
    .append('text')
    .attr('x', width / 2)
    .attr('y', margin.bottom - 10) // Adjusted y-coordinate for x-axis label
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .text('Count');

  // Y-Axis
  const yAxis = svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -margin.left + 10) // Adjusted y-coordinate for y-axis label
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .text('Group');


  // Legend
//   const legend = svg.append('g')
//   .attr('transform', `translate(${width + margin.right - 210},${margin.top+ 300})`);

// legend.selectAll('rect')
//   .data(counts)
//   .enter().append('rect')
//   .attr('x', 0)
//   .attr('y', (d, i) => i * 30)
//   .attr('width', 20)
//   .attr('height', 20)
//   .style('fill', d => color(d.group));

// legend.selectAll('text')
//   .data(counts)
//   .enter().append('text')
//   .attr('x', 15)
//   .attr('y', (d, i) => i * 15 + 9)
//   .style('font-size', '8px')
//   .text(d => d.group);


  // Title
  svg.append('text')
    .attr('x', totalWidth / 2)
    .attr('y', margin.top)
    .attr('text-anchor', 'middle')
    .style('font-size', '1em')
    .text('Terrorist Groups with Highest Terror Attacks');

  return svg.node();
}


const displayGroupData = (hoveredGroup) => {
  if (hoveredGroup && processedData[hoveredGroup]) {
    const groupData = processedData[hoveredGroup];

    // Display group data in the console (you can customize this part)
    // console.log(`Data for ${hoveredGroup}:`, groupData);

    // Render the group data in a new div (you can customize this part)
    return (
      <div>
        <h2>{hoveredGroup}</h2>
        <h3>{groupToDefinition[hoveredGroup]}</h3>
        <h3>Casualties by Country:</h3>
        <ul>
          {Object.entries(groupData).map(([country, casualties]) => (
            <li key={country}>{`${country}: ${casualties} casualties`}</li>
          ))}
        </ul>
      </div>
    );
  } else {
    return null; // If hoveredGroup is falsy or no data found, render nothing
  }
};

const Page1 = () => {
  const [hoveredGroup, setHoveredGroup] = useState(null);

  useEffect(() => {
    // Call the chart initialization function
    initChart(setHoveredGroup);
  }, []);

  return (
    <div>      
        <div style={{ textAlign: 'center' }}>
            <h2>Organized Terrorist Groups</h2>
            <h3>
                This is a visualization of the most notorious (in terms of number of incidents) terrorist groups worldwide through history.<br/>
                Hover over a group to see more information.
            </h3>
        </div>
        <div className="page-container" style={{ minWidth: 1400 }}>
            <svg id="bar-svg"></svg>
            <div className="group-data-container" height={totalHeight}>
                {displayGroupData(hoveredGroup)}
            </div>
        </div>
    </div>
  );
};

export default Page1;