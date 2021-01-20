export const sizeLegend = (selection, props) => {
    const { radiusScale, spacing, textOffset, numTicks, tickFormat } = props;
  
      const ticks = radiusScale.ticks(numTicks)
        .filter(d => d !== 0)
        .reverse();
    
    const groups = selection.selectAll('g').data(ticks);
    const groupsEnter = groups
        .enter().append('g')
            .attr('class', 'tick');
    groupsEnter
      .merge(groups)
        .attr('transform', (d, i) =>
          `translate(0, ${i * spacing})`
        );
    groups.exit().remove();
    
    //console.log(sizeScale);
    
    groupsEnter.append('circle')
      .merge(groups.select('circle'))
        .attr('r', radiusScale)
    
    groupsEnter.append('text')
      .merge(groups.select('text'))
        .text(tickFormat)
            .attr('dy', '0.32em')
        .attr('x', d => radiusScale(d) + textOffset);
  
};