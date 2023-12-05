import React from 'react';
import StreamGraph from './StreamGraph'

const Page3 = () => {
  return (
    <div>
        <div style={{ textAlign: 'center' }}>
            <h2>Terrorist Activity by World Region</h2>
            <h3>
                This plot shows the total casualties from terrorist attacks by region over time.<br/>
                You can add or remove regions to make comparisons by clicking on the region in the legend. You can also zoom in on the plot itself.
            </h3>
        </div>
        <StreamGraph />
    </div>);
};

export default Page3;
