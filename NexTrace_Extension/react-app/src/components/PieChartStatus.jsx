import React, { useEffect } from 'react';
import * as d3 from 'd3';

export default function PieChartStatus(props) {
  const { reqData } = props;
  
  const newObj = {};
  reqData.forEach(obj => {
    if(!newObj[obj.status]){
        newObj[obj.status] = {value: 100}
    } else {
      newObj[obj.status].value += 100;
    }
  })
  
  const data = Object.entries(newObj).map(([name, group]) => {
      const statusSum = group.value;
      return { label: name, value: statusSum };
  });

  // created adjusted dataset for relative start times
  useEffect(() => {
    const container = document.getElementById('pie-status');
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    // Dimensions
    let width, height;
    data.length > 0 ? [width, height] = [300, 300] : [width, height] = [0, 0];
    const radius = Math.min(width, height) / 2;

      // Create SVG container
    const svg = d3.select('#pie-status')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    // Generate an array of random colors
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Pie layout
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    // Arc generator
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    // Create arcs
    const g = svg.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    g.append('path')
      .attr('d', arc)
      .style('fill', (d, i) => colorScale(i));

    // Optional: Add labels
    g.append('text')
      .attr('transform', d => 'translate(' + arc.centroid(d) + ')')
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .text(d => d.data.label);

  }, [data]);

    return (
            <span className='pieChart' id='pie-status'></span>
    );
}
