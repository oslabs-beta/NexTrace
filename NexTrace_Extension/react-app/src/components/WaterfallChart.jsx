import React, { useEffect, useState } from 'react';
import * as d3 from 'd3'

export default function WaterfallChart(props) {

    // onMount
  useEffect(() => {
    
    // set the dimensions and margins of the graph
    const margin = {top: 20, right: 30, bottom: 40, left: 90},
    height = 200 - margin.top - margin.bottom;

    const width = document.getElementById('waterfall-chart').offsetWidth;

    // append the svg object to the body of the page
    const svg = d3.select("#waterfall-chart")
      .append("svg")
        .attr("width", '90%')
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")")

    // Parse the Data
    const data = [
      {name: 'Request 1', Value: 12394, start: 2300},
      {name: 'Request 2', Value: 6148, start: 4000},
      {name: 'Request 3', Value: 1234, start: 5500},
      {name: 'Request 4', Value: 124, start: 6600},
    ]

    // Add X axis
    const x = d3.scaleLinear()
      .domain([0, Math.max(...data.map(el => el.Value)) + 1000])
      .range([0, Math.round(width * 0.7)]);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Y axis
    const y = d3.scaleBand()
      .range([ 0, height ])
      .domain(data.map(function(d) { return d.name; }))
      .padding(.1);
    svg.append("g")
      .call(d3.axisLeft(y))

    //Bars
    svg.selectAll("myRect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", function(d) { return x(d.start); })
      .attr("y", function(d) { return y(d.name); })
      .attr("width", function(d) { return x(d.Value); })
      .attr("height", y.bandwidth() )
      .attr("fill", "#69b3a2")

  }, []);



      
  return (
    <div id="waterfall-chart"></div>
  );
}