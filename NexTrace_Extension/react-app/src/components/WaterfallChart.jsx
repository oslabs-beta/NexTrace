import React, { useEffect, useState } from 'react';
import * as d3 from 'd3'

export default function WaterfallChart(props) {

  const { data } = props;

  // tooltip
  // const tooltip = d3.select("#waterfall-chart")
  //   .append("div")
  //   .style("opacity", 0)
  //   .attr("class", "tooltip")
  //   .style("background-color", "white")
  //   .style("border", "solid")
  //   .style("border-width", "1px")
  //   .style("border-radius", "5px")
  //   .style("padding", "10px")
  
    // // Three function that change the tooltip when user hover / move / leave a cell
    // const mouseover = function(d) {
    //   tooltip
    //       .html('it\'s literally 1984')
    //       .style("opacity", 1)
    // }
    // const mousemove = function(d) {
    //   tooltip
    //     .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
    //     .style("top", (d3.mouse(this)[1]) + "px")
    // }
    // const mouseleave = function(d) {
    //   tooltip
    //     .style("opacity", 0)
    // }


  useEffect(() => {
    d3.select('svg').remove();

    // console.log('THE DATAAAAAAAAAAAAA: ', data);
  
    // created adjusted dataset for relative start times
    const minStart = Math.min(...data.map(el => el.start));
    const adjData = [];
    data.forEach(obj => {
      const newObj = Object.assign({}, obj);
      newObj.adjStart = obj.start - minStart;
      newObj.adjName = obj.name + ' ' + obj.method;
      adjData.push(newObj);
    })

    // sort adjusted dataset by adjusted start time
    adjData.sort((a, b) => {
      if (a.adjStart > b.adjStart) return 1;
      else return -1;
    })
    // console.log('Adjusted Data', adjData);

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
      .domain(adjData.map(function(d) { return d.adjName; }))
      .padding(.1);

    svg.append('g')
      .call(d3.axisLeft(y))

    // Bars
    svg.selectAll('myRect')
      .data(adjData)
      .enter()
      .append('rect')
      .attr('x', function(d) { return x(d.adjStart); })
      .attr('y', function(d) { return y(d.adjName); })
      .attr('width', function(d) { return x(d.duration); })
      .attr('height', y.bandwidth() )
      .attr('fill', function(d) {
        if (d.rendering === '') return '#69b3a2';
        if (d.rendering === 'client') return '#6972b3';
        if (d.rendering === 'server') return '#b36969';
        else return '#b3ad69';
      })
      .attr('rx', 5)
      // .on("mouseover", mouseover)
      // .on("mousemove", mousemove)
      // .on("mouseleave", mouseleave)

  }, [data]);

      
  return (
    <div id="waterfall-chart"></div>
  );
}