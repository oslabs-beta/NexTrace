import React, { useEffect } from 'react';
import * as d3 from 'd3';

export default function PieChartDuration(props) {
  const { reqData } = props;
  const newObj = {};

  //Adds duration and length to calculate average duration of each request
  reqData.forEach(obj => {
    if (!newObj[obj.name]) {
      newObj[obj.name] = { duration: obj.duration, length: 1 }
    } else {
      newObj[obj.name].duration += obj.duration;
      newObj[obj.name].length += 1;
    }
  })
//Declares array of objects with label and value property
  const data = Object.entries(newObj).map(([name, group]) => {
    const averageDuration = Math.floor(group.duration / group.length);
    return { label: name, value: averageDuration };
  });

  // Dimensions
  let [width, height] = [window.innerWidth * 0.3, window.innerWidth * 0.3];
  const radius = Math.min(width, height) / 2;

  //Created adjusted dataset for relative start times
  useEffect(() => {
    d3.select('#the-only-tooltip-pie-avg').remove();
    const container = document.getElementById('pie-avg-duration');
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    // Create SVG container
    const svg = d3.select('#pie-avg-duration')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
    
    //Checks if Data is present, if not display listening animation
    if (data.length === 0) {
      let counter = 0;
      const placeholderData = [1];
      const placeholderColor = '#e0e0e0';
      const listenStrings = ['Listening.    ', 'Listening. .  ', 'Listening. . .'];
      const placeholderPie = d3.pie().value(d => d);

      const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

      svg.selectAll('.placeholderArc')
        .data(placeholderPie(placeholderData))
        .enter()
        .append('path')
        .attr('d', arc)
        .style('fill', placeholderColor)

      const listeningText = svg.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', '.35em')
        .style('text-anchor', 'middle');

      const intervalId = setInterval(() => {
        counter++;
        if (counter > 2) counter = 0;

        listeningText.text(listenStrings[counter]);
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }

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
    
    // tooltip
    const tooltip = d3.select("#pie-avg-duration-div")
    .append("div")
    .style("opacity", 0)
    .style('display', 'none')
    .attr("class", "tooltip")
    .attr('id', 'the-only-tooltip-pie-avg')
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style('color', 'black')
    .style("top", "-300px")
    .style("padding", "10px");

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function (event, d) {
      const barData = d3.select(this)._groups[0][0].__data__.data;
      let tooltipString = '';
      for (const key in barData) {
        if (key === 'value') tooltipString += `avg duration: ${barData[key]} ms <br>`;
        else tooltipString += `${key}: ${barData[key]} <br>`;
      }

      const verticalScrollPos = window.scrollY;
      tooltip
          .html(tooltipString)
          .style("left",(event.x)+10+"px")
          .style('position', 'absolute')
          .style("top",(event.y)+verticalScrollPos+"px")
          .style("opacity", 1)
          .style('display', 'inline-block')
    }

    const mousemove = function (event, d) {
      const verticalScrollPos = window.scrollY;
      tooltip.style("transform", "translateY(-100%)")
        .style("left",(event.x)+10+"px")
        .style("top",(event.y)+verticalScrollPos+"px")

    }
    const mouseleave = function (event, d) {
      tooltip
        .style("opacity", 0)
        .style("top", "-300px")
        .style('display', 'none')
        .html('')
    }

    // Create arcs
    const g = svg.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

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
    <div id='pie-avg-duration-div'>
      <span className='pieChart' id='pie-avg-duration'></span>
      <h2 className='pieChartTitle'>Average Duration</h2>
    </div>
  );
}
