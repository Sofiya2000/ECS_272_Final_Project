import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import Globe from 'react-globe.gl';
const data = require('./Data/data.json');
const colorValues = require('./Data/color.json');
const leftColumnWidth = '250px';

const labelStyle = { display: 'inline-block', color: 'black', width: leftColumnWidth, textAlign: 'center', marginTop: '10px' };

// Globe object expects latitude and longitude attributes to be named 'lat' and 'lng' for some weird reason
const renamedData = data.map((d) => ({
    "lat": d.latitude,
    "lng": d.longitude,
    "Casualties": d.Casualties,
    "Year": d.Year,
    "Region": d.Region,
    "Attack_Type": d.Attack_Type,
    "Group": d.Group,
    "city": d.city,
    "summary": d.summary
}));
const [minYear, maxYear] = d3.extent(renamedData, (d) => d.Year);
const absMaxCasualties = d3.max(renamedData, (d) => d.Casualties);
const allAttackTypes = [...new Set(renamedData.map((d) => d.Attack_Type))];

const GlobeDisplay = () => {
    const globeRef = useRef();
    const [pointData, setPointData] = useState([]);
    const [currentYear, setCurrentYear] = useState(2001);
    const [minCasualties, setMinCasualties] = useState(0);
    const [maxCasualties, setMaxCasualties] = useState(absMaxCasualties);
    const [attackTypes, setAttackTypes] = useState(new Map(allAttackTypes.map((type) => [type, true])));
    const [selectAll, setSelectAll] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState("");

    const handleAttackTypeChange = (type) => {
        setAttackTypes((prevAttackTypes) => {
            const newAttackTypes = new Map(prevAttackTypes);
            newAttackTypes.set(type, !prevAttackTypes.get(type));
            if (selectAll && !newAttackTypes.get(type)) {
                setSelectAll(false);
            }
            return newAttackTypes;
        });
    };

    const handleToggleAllAttackTypes = () => {
        setAttackTypes((prevAttackTypes) => {
            const newAttackTypes = new Map(prevAttackTypes);
            const newSelectAll = !selectAll;
    
            // Set all attack types to the value of newSelectAll
            for (const [type, _] of newAttackTypes) {
                newAttackTypes.set(type, newSelectAll);
            }
    
            setSelectAll(newSelectAll);
            return newAttackTypes;
        });
    };

    useEffect(() => {
        setPointData(renamedData.filter(d => (d.Year === currentYear) && (d.Casualties >= minCasualties) && (d.Casualties <= maxCasualties) && (attackTypes.get(d.Attack_Type)) && ((selectedGroup === "") || d.Group.toLowerCase().includes(selectedGroup.toLowerCase()))));
      }, [currentYear, minCasualties, maxCasualties, attackTypes, selectedGroup]);

    const regions = [...new Set(renamedData.map(d => d.Region))];
    const color = d3.scaleOrdinal(regions, colorValues['colors']);
  
    return (
      <div style={{ display: 'flex', flexDirection: 'row', backgroundColor: '#ecf0f1' }}>
        <div style={{ flex: '0 0 ' + leftColumnWidth, marginLeft: '20px', marginRight: '20px' }}>
            <div>
                <label style={labelStyle}>
                    <h3>Year</h3>
                </label>
                <input
                    style={{ width: leftColumnWidth }}
                    type="range"
                    min={minYear}
                    max={maxYear}
                    step={1}
                    value={currentYear}
                    onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                />
                <span style={labelStyle}>
                    {currentYear}
                </span>
            </div>
            <div style={{ flex: '0 0 ' + leftColumnWidth }}>
                <label style={labelStyle}>
                    <h3>Casualties</h3>
                </label>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', width: leftColumnWidth }}>
                    <label style={{ color: 'black', textAlign: 'center', marginTop: '10px', marginRight: '20px' }}>
                        Min
                    </label>
                    <input type="number" value={minCasualties} onChange={(e) => setMinCasualties(parseInt(e.target.value, 10))} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', width: leftColumnWidth, marginTop: '10px' }}>
                    <label style={{ color: 'black', textAlign: 'center', marginTop: '10px', marginRight: '20px' }}>
                        Max
                    </label>
                    <input type="number" value={maxCasualties} onChange={(e) => setMaxCasualties(parseInt(e.target.value, 10))} />
                </div>
            </div>
            <div style={{ flex: '0 0 ' + leftColumnWidth, display: 'flex', flexDirection: 'column' }}>
                <label style={labelStyle}><h3>Group</h3></label>
                <input
                    type="text"
                    style={{ flex: 1 }}
                    onChange={(g) => setSelectedGroup(g.target.value)}
                />
            </div>
            <div>
                <label style={labelStyle}><h3>Attack Types</h3></label>
                <div style={{ marginTop: '10px' }}>
                    <input
                        type="checkbox"
                        id="selectAll"
                        checked={selectAll}
                        onChange={handleToggleAllAttackTypes}
                    />
                    <label style={{ color: 'black', marginLeft: '10px' }}>Select All</label>
                </div>
                {allAttackTypes.map((type) => (
                    <div key={type} style={{ marginTop: '10px' }}>
                        <input
                            type="checkbox"
                            id={type}
                            checked={attackTypes.get(type)}
                            onChange={() => handleAttackTypeChange(type)}
                        />
                        <label style={{ color: 'black', marginLeft: '10px' }}>{type}</label>
                    </div>
                ))}
            </div>
        </div>
        <div style={{ flex: '1', paddingRight: '20px' }} >
            <Globe
            width={1300}
            height={900}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
            pointsData={pointData}
            pointLabel={({ Attack_Type, Casualties, city, Group, summary }) => 
                `<div style="background-color: rgba(0, 0, 0, 0.3); color: whitesmoke; padding: 5px;">
                    ${Attack_Type} in ${city} by ${Group}<br>Casualties: ${Casualties}<br>${summary}</div>`}
            pointColor={({ Region }) => color(Region)}
            pointAltitude={() => 0.01}
            pointRadius={({ Casualties }) => Math.sqrt(Casualties / 30 + 0.01)}
            ref={globeRef}
            backgroundColor='#ecf0f1'
            />
        </div>
      </div>
    );
  };

export default GlobeDisplay;
