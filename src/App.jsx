import { useState, useEffect } from 'react'
import * as d3 from "d3"

function App() {

  const [data, setData] = useState([])
  const [style, setStyle] = useState({
    'visibility': "hidden",
    'position': 'absolute',
    'left': '',
    'top': '',
  })
  const [dataYear, setDataYear] = useState('')
  const [details, setDetails] = useState({
    time: '',
    place: '',
    name: '',
    year: '',
    doping: ''
  })
  const dataUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

  useEffect(() => {

    fetch(dataUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error("Network response was not ok")
            }
            return response.json()
          })
          .then(fetchData => {
            setData(fetchData)
          })
          .catch(error => {
            console.error("Error: ", error)
          });
  }, []
);


  useEffect(() => {
    if (data.length === 0) return;

    const h = 600;
    const w = 1000;
    const padding = 50
    const formatTime = d3.timeFormat("%M:%S")
    const formatYear = d3.timeFormat("%Y")


    const y = d3.scaleTime()
                .domain([d3.max(data, d => new Date(d.Seconds * 1000)), d3.min(data, d => new Date(d.Seconds * 1000))])
                .range([h - padding, padding])
    
    const x = d3.scaleTime()
                .domain([d3.min(data, d => new Date().setFullYear(d.Year - 1)), d3.max(data, d => new Date().setFullYear(d.Year + 1))])
                .range([padding, w - padding])
    
    const svg = d3.select('main')
                  .append('svg')
                  .attr('width', w)
                  .attr('height', h)

    const legend = svg.append('g')
                      .attr('id', 'legend')

    const legendItem = legend.append('g')
                              .attr('class', 'legend-element')
                              .attr('transform', `translate(${w - padding}, ${h / 2})`)

    legendItem.append('rect')
              .attr('width', 18)
              .attr('height', 18)
              .attr('x', 0)
              .attr('y', 0)
              .attr('fill', 'blue')

    legendItem.append('text')
              .text("No allegations")
              .attr('x', -75)
              .attr('y', 13)
              .attr('font-size', 12)

    legendItem.append('rect')
              .attr('width', 18)
              .attr('height', 18)
              .attr('x', 0)
              .attr('y', 20)
              .attr('fill', 'red')

    legendItem.append('text')
              .text("Allegations")
              .attr('x', -60)
              .attr('y', 33)
              .attr('font-size', 12)
 

    svg.append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${h - padding})`)
        .call(d3.axisBottom(x).tickFormat(formatYear));

    svg.append('g')
        .attr('id', 'y-axis')
        .attr('transform', `translate(${padding}, 0)`)
        .call(d3.axisLeft(y).tickFormat(formatTime))

    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => x(new Date().setFullYear(d.Year)))
        .attr('cy', (d) => y(d.Seconds * 1000))
        .attr('data-xvalue', (d) => formatYear(new Date().setFullYear(d.Year)))
        .attr('data-yvalue', (d) => new Date(d.Seconds * 1000).toISOString())
        .attr('r', 6)
        .attr('fill', (d) => d.Doping ? 'red' : 'blue')
        .on('mouseover', (event, d) => {
          setStyle(s => ({
            ...s,
            'visibility': 'visible',
            'left': `${event.pageX}px`,
            'top': `${event.pageY}px`
          }))
          setDataYear(d.Year)
          setDetails(details => ({
            ...details,
            time: d.Time,
            place: d.Place,
            name: d.Name,
            year: d.Year,
            doping: d.Doping,
          }))
        })
        .on('mouseout', () => {
          setStyle(s => ({
            ...s,
            'visibility': 'hidden'
          })) 
        })
      
      return () => {
        d3.selectAll('circle').on("mouseover", null).on('mouseout', null)
      }
      
  }, [data])


  return (
    <main>
      <h1 id='title'>Doping Allegations in Professional Bicycle Racing</h1>
      <div id='tooltip' data-year={dataYear} style={style}>
      Name: {details.name},<br />
      Place: {details.place},<br />
      Time: {details.time},<br />
      Year: {details.year},<br />
      Doping: {details.doping},
      </div>
    </main>
  )
}

export default App