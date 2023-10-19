import React, { useEffect } from 'react';
import * as d3 from 'd3';


export default function PieChartComponent() {

    useEffect(() => {
        d3.select('#pie-chart-container svg').remove();

        // Data
        const data = [
            { label: 'Red', value: 300 },
            { label: 'Blue', value: 50 },
            { label: 'Yellow', value: 100 }
        ];

        // Dimensions
        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2;

        // Create SVG container
        const svg = d3.select('#pie-chart-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        // Set up color scale
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.label))
            .range(['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)']);

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
            .enter().append('g')
            .attr('class', 'arc');

        g.append('path')
            .attr('d', arc)
            .style('fill', d => color(d.data.label));

        // Optional: Add labels
        g.append('text')
            .attr('transform', d => 'translate(' + arc.centroid(d) + ')')
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .text(d => d.data.label);
    }, []);

    return (
        <div id='pie-chart-container'></div>
    )
}

