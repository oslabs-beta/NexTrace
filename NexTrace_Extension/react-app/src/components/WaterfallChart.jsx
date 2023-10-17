import React, { useEffect, useState } from 'react';
import * as d3 from 'd3'

export default function WaterfallChart(props) {
  const { data } = props;

  useEffect(() => {
    d3.select('svg').remove();
    d3.select('#the-only-tooltip').remove();
  
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
    
    const tooltip = d3.select("#waterfall-chart")
      .append("div")
      .style("opacity", 0)
      .style('display', 'none')
      .attr("class", "tooltip")
      .attr('id', 'the-only-tooltip')
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style('color', 'black')
      .style("top","-300px")
      .style("padding", "10px");

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function(event, d) {
      const barData = d3.select(this)._groups[0][0].__data__;
      let tooltipString = '';
      for (const key in barData) {
        if (key === 'start' || key === 'adjName') continue;
        tooltipString += `${key}: ${barData[key]} <br>`;
      }

      tooltip
          .html(tooltipString)
          .style("left",(event.x)-450+"px")
          .style('position', 'absolute')
          // .style("top",(event.y)-170+"px")
          .style("top",(event.y)+400+"px")
          .style("opacity", 1)
          .style('display', 'inline-block')
    }
    const mousemove = function(event, d) {
      tooltip.style("transform", "translateY(-100%)")
        .style("left",(event.x)+10+"px")
        .style("top",(event.y)+55+"px")
    }
    const mouseleave = function(event, d) {
      tooltip
        .style("opacity", 0)
        .style("top","-300px")
        .style('display', 'none')
        .html('')
    }

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
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
  }, [data]);

      
  return (
    <div id="waterfall-chart"></div>
  );
}