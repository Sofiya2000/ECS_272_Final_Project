import React from 'react';
import GlobeDisplay from './GlobeDisplay';

const Page2 = () => {
  return (
    <div>
        <div style={{ textAlign: 'center' }}>
            <h2>Global View of all Terrorist Attacks</h2>
            <h3>
                This globe shows where every terrorist attack in the database happened, and how many casualties occurred (size of the circles).<br/>
                Tune the parameters on the left to filter the data shown. Hover over points to learn more about individual incidents.
            </h3>
        </div>
        <GlobeDisplay />
    </div>);
};

export default Page2;
