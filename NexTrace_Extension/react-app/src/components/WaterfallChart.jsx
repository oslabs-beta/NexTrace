import React, { useEffect, useState } from 'react';
import * as d3 from 'd3'

export default function WaterfallChart(props) {

  const { data } = props;

  useEffect(() => {
    d3.select('svg').remove();

    console.log('THE DATAAAAAAAAAAAAA: ', data);
  
    const minStart = Math.min(...data.map(el => el.start));
    const adjData = [];
    data.forEach(obj => {
      const newObj = Object.assign({}, obj);
      newObj.adjStart = obj.start - minStart;
      adjData.push(newObj);
    })
  
    adjData.sort((a, b) => {
      if (a.adjStart > b.adjStart) return 1;
      else return -1;
    })
  
    console.log('Adjusted Data', adjData);

    // set the dimensions and margins of the graph
    const margin = {top: 20, right: 30, bottom: 40, left: 90},
    height = 200 - margin.top - margin.bottom;

    const width = document.getElementById('waterfall-chart').offsetWidth;

    // append the svg object to the body of the page
    const svg = d3.select('#waterfall-chart')
      .append('svg')
        .attr('width', '90%')
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform',
              'translate(' + margin.left + ',' + margin.top + ')')

    // Parse the test data
    // const testData = [
    //   {name: 'Request 1', type: 'client', method: '', duration: 3162, status: '', rendering: '', start: 0},
    //   {name: 'Request 2', type: 'server', method: '', duration: 6148, status: '', rendering: '', start: 2000},
    //   {name: 'Request 3', type: '', method: '', duration: 1234, status: '', rendering: '', start: 3000},
    //   {name: 'Request 4', type: 'server', method: '', duration: 2154, status: '', rendering: '', start: 5000},
    //   {name: 'Request 5', type: 'client', method: '', duration: 854, status: '', rendering: '', start: 6000},
    // ]

    

    // X axis
    const x = d3.scaleLinear()
      .domain([0, Math.max(...adjData.map(el => el.duration + el.adjStart)) + 1000])
      .range([0, Math.round(width * 0.7)]);

    svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))
      .selectAll('text')
        .attr('transform', 'translate(-10,0)rotate(-45)')
        .style('text-anchor', 'end');

    // Y axis
    const y = d3.scaleBand()
      .range([ 0, height ])
      .domain(adjData.map(function(d) { return d.name; }))
      .padding(.1);

    svg.append('g')
      .call(d3.axisLeft(y))

    // // Tooltip
    // const tooltip = d3.select('body')
    //   .append('div')
    //   .style('position', 'absolute')
    //   .style('z-index', '10')
    //   .style('visibility', 'hidden')
    //   .style('background', '#000')
    //   .text("a simple tooltip");

    // Bars
    svg.selectAll('myRect')
      .data(adjData)
      .enter()
      .append('rect')
      .attr('x', function(d) { return x(d.adjStart); })
      .attr('y', function(d) { return y(d.name); })
      .attr('width', function(d) { return x(d.duration); })
      .attr('height', y.bandwidth() )
      .attr('fill', function(d) {
        if (d.rendering === '') return '#69b3a2';
        if (d.rendering === 'client') return '#6972b3';
        if (d.rendering === 'server') return '#b36969';
        else return '#b3ad69';
      })
      .attr('rx', 5)
      // .on("mouseover", function(){return tooltip.style("visibility", "visible");})
      // .on("mousemove", function(){return tooltip.style("top", (event.pageY-800)+"px").style("left",(event.pageX-800)+"px");})
      // .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

  }, [data]);

      
  return (
    <div id="waterfall-chart"></div>
  );
}