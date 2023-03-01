import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const D3Line = ({ data, color, width, height }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const xScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (series) => d3.min(series, (d) => d.x)),
        d3.max(data, (series) => d3.max(series, (d) => d.x)),
      ])
      .range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (series) => d3.min(series, (d) => d.y)),
        d3.max(data, (series) => d3.max(series, (d) => d.y)),
      ])
      .range([height, 0]);

    const lineGenerator = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveBasis);

    svg
      .selectAll('path')
      .data(data)
      .join('path')
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', (d, i) => color[i % color.length])
      .attr('stroke-width', 2);
  }, [data, color, width, height]);

  return (
    <svg ref={svgRef} width={width} height={height} />
  );
};

export default D3Line;
