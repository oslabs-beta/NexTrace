import React, { useEffect, useState } from 'react';
import * as d3 from 'd3'

export default function WaterfallChart(props) {

    // onMount
  useEffect(() => {
    
    // set the dimensions and margins of the graph
    const margin = {top: 20, right: 30, bottom: 40, left: 90},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#my_dataviz")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data
    const data = [
      {Country: 'United States', Value: 12394},
      {Country: 'Russia', Value: 6148},
      {Country: 'Germany', Value: 1234}
    ]

    // Add X axis
    const x = d3.scaleLinear()
      .domain([0, 13000])
      .range([ 0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Y axis
    const y = d3.scaleBand()
      .range([ 0, height ])
      .domain(data.map(function(d) { return d.Country; }))
      .padding(.1);
    svg.append("g")
      .call(d3.axisLeft(y))

    //Bars
    svg.selectAll("myRect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", x(0) )
      .attr("y", function(d) { return y(d.Country); })
      .attr("width", function(d) { return x(d.Value); })
      .attr("height", y.bandwidth() )
      .attr("fill", "#69b3a2")


      // .attr("x", function(d) { return x(d.Country); })
      // .attr("y", function(d) { return y(d.Value); })
      // .attr("width", x.bandwidth())
      // .attr("height", function(d) { return height - y(d.Value); })
      // .attr("fill", "#69b3a2")

  }, []);



      
  return (
    <div id="my_dataviz"></div>
  );
}