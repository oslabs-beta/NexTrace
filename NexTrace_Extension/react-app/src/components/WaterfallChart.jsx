import React, { useEffect, useState } from 'react';
import * as d3 from 'd3'

export default function WaterfallChart(props) {
  const { data } = props;

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

  // show "Listening . . ." when no data exists to display
  const [listeningDots, setListeningDots] = useState(' . . .');
  const updateListeningDots = () => {
    const states = { '': ' .', ' .': ' . .', ' . .': ' . . .', ' . . .': '' };
    setListeningDots(states[listeningDots]);
  }
  if (!data.length) {
    setTimeout(() => {
      updateListeningDots()
    }, 150)
  }
  const listeningString = 'Listening' + listeningDots;


  // render waterfall chart from data
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
    const maxTime = Math.max(...adjData.map(el => el.duration + el.adjStart))

    // set the dimensions and margins of the graph
    const margin = {top: 20, right: 30, bottom: 40, left: 20},
    height = 200 - margin.top - margin.bottom;
    const width = document.getElementById('waterfall-chart').offsetWidth;
    const widthFactor = maxTime / 10000;

    // append the svg object to the body of the page
    const svg = d3.select('#waterfall-chart')
      .style('overflow-x', 'scroll')
      .append('svg')
        .attr('width', (Math.max(1, widthFactor) * 100) + '%')
        .attr('height', height + margin.top + margin.bottom)
        .style('overflow-x', 'scroll')
        .style('margin-right', '80px')
      .append('g')
        .attr('transform',
              'translate(' + margin.left + ',' + margin.top + ')')
        .style('overflow-x', 'scroll')

    // X axis
    const x = d3.scaleLinear()
      .domain([0, maxTime])
      .range([0, Math.max(width * 0.9 * widthFactor, width * 0.9)])

    if (data.length) {
      svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x)
        .ticks(Math.ceil(maxTime / 500))
      )
      .selectAll('text')
        .attr('transform', 'translate(-10,0)')
        .style('text-anchor', 'start')
    }

    // Y axis
    const y = d3.scaleBand()
      .range([0, height])
      .domain(adjData.map(function (d) { return d.adjName; }))
      .padding(.1);
      
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
        .style('display', 'none');

    // vertical gridlines
    function make_x_gridlines() {		
      return d3.axisBottom(x)
        .ticks(Math.ceil(maxTime / 500))
    };
    svg.append('g')			
      .attr('class', 'grid')
      .attr('transform', 'translate(0,' + height + ')')
      .attr('stroke-opacity', 0.2)
      .call(make_x_gridlines()
        .tickSize(-height)
        .tickFormat('')
      );
    
    // tooltip
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

      const scrollPos = document.getElementById('waterfall-chart').scrollLeft;
      tooltip
          .html(tooltipString)
          .style("left",(event.x)+10+scrollPos+"px")
          .style('position', 'absolute')
          .style("top",(event.y)+53+"px")
          .style("opacity", 1)
          .style('display', 'inline-block')
    }
    const mousemove = function(event, d) {
      const scrollPos = document.getElementById('waterfall-chart').scrollLeft;
      tooltip.style("transform", "translateY(-100%)")
        .style("left",(event.x)+10+scrollPos+"px")
        .style("top",(event.y)+53+"px")

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
    
    // x axis title
    svg.append('text')
        .attr('x', (width / 2) - 16)
        .attr('y', height + 34)
        .attr('text-anchor', 'end')
        .attr('class', 'x-axis-title')
        .style('fill', 'lightgrey')
        .style('font-size', '80%')
        .text('Duration (ms)')
    
    // legend (bottom left corner colors for server/client)
    svg.append('text')
        .attr('x', 30)
        .attr('y', height + 34)
        .attr('text-anchor', 'end')
        .style('font-size', '80%')
        .style('fill', '#b36969')
        .text('server')
    svg.append('text')
        .attr('x', 70)
        .attr('y', height + 34)
        .attr('text-anchor', 'end')
        .style('font-size', '80%')
        .style('fill', '#6972b3')
        .text('client')

    // show "Listening . . ." when no data exists to display
    if (!data.length) {
      svg.append('text')
        .attr('x', (width / 2.5))
        .attr('y', height / 2)
        .attr('text-anchor', 'start')
        .style('fill', 'lightgrey')
        .style('font-size', '200%')
        .text(listeningString)
    }
  }, [data, listeningDots]);
      
  return (
    <div id="waterfall-chart"></div>
  );
}