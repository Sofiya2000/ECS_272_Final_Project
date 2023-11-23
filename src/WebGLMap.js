import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import Globe from 'react-globe.gl';
import countriesData from './Data/countries.geojson'; // Import your GeoJSON file with country borders
const data = require('./Data/data.json');
const colorValues = require('./Data/color.json')

const renamedData = data.map((d) => ({
    "lat": d.latitude,
    "lng": d.longitude,
    "Casualties": d.Casualties,
    "Year": d.Year,
    "Region": d.Region,
    "Attack_Type": d.Attack_Type,
    "city": d.city,
    "summary": d.summary
}));

const WebGLMap = () => {
    const globeRef = useRef();
    const [pointData, setPointData] = useState([]);

    useEffect(() => {
        // setPointData(data.filter(d => d.Year === 2001));
        setPointData(renamedData.filter(d => d.Year === 2001));
      }, []);

    const regions = [...new Set(renamedData.map(d => d.Region))];
    const color = d3.scaleOrdinal(regions, colorValues['colors']);
  
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Globe
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
          pointsData={pointData}
          pointLabel={({ Attack_Type, city, summary }) => `<div style="background-color: rgba(0, 0, 0, 0.3); color: whitesmoke; padding: 5px;">${Attack_Type} in ${city}<br>${summary}</div>`}
          pointColor={({ Region }) => color(Region)}
          pointAltitude={() => 0.01}
          pointRadius={({ Casualties }) => Math.sqrt(Casualties / 30 + 0.01)}
          ref={globeRef}
        />
      </div>
    );
  };

export default WebGLMap;
