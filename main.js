var data = {
  forecast: [
    {
      high: 51,
      low: 32,
      precip: 0
    },
    {
      high: 44,
      low: 29,
      precip: 23
    },
    {
      high: 39,
      low: 24,
      precip: 65
    }
  ]
}
var sortedHighs = data.forecast.sort((a, b) => b.high - a.high);
var maxTemp = sortedHighs[0].high;
var sortedLows = data.forecast.sort((a, b) => a.lows - b.lows);
var minTemp = sortedLows[0].low;
var sortedPrecips = data.forecast.sort((a, b) => b.precip - a.precip);

var svg = d3.select("#chart")

const XOFFSET = 25;
const BWIDTH = 12;
const YOFFSET = 50;
const MAXTHEIGHT = YOFFSET - 3;
const MINTHEIGHT = 15;
const MAXPHEIGHT = 90 - YOFFSET;
const TTHRESHOLD = 15;
const PTHRESHOLD = 7;

var tempToHeight = temp => MINTHEIGHT + (temp - minTemp) / (maxTemp - minTemp) * (MAXTHEIGHT - MINTHEIGHT);
var precipToHeight = precip => precip / 100 * MAXPHEIGHT;


svg.selectAll("rect.high")
  .data(data.forecast)
  .enter()
  .append("rect")
  .attr({
    class: "temp",
    width: BWIDTH + "%",
    x: (d, i) => ((50 - (i-1) * XOFFSET - BWIDTH / 2) + "%"),
    height: d => (tempToHeight(d.high) + "%"),
    y: d => ((YOFFSET - tempToHeight(d.high)) + "%"),
  })

svg.selectAll("text.high")
  .data(data.forecast)
  .enter()
  .append("text")
  .attr({
    class: "high",
    x: (d, i) => ((50 - (i-1) * XOFFSET) + "%"),
    y: d => {
      var barHeight = tempToHeight(d.high);
      if(barHeight < TTHRESHOLD)
        return (YOFFSET - barHeight - 8) + "%";
      else
        return (YOFFSET - barHeight + 6) + "%";
        return (YOFFSET - barHeight + 6) + "%";
    },
  })
  .text(d => d.high)

svg.selectAll("text.low")
  .data(data.forecast)
  .enter()
  .append("text")
  .attr({
    class: "low",
    x: (d, i) => ((50 - (i-1) * XOFFSET) + "%"),
    y: d => {
      var barHeight = tempToHeight(d.high);
      if(barHeight < TTHRESHOLD)
        return (YOFFSET - barHeight - 2) + "%";
      else
        return (YOFFSET - barHeight + 12) + "%";
    },
  })
  .text(d => d.low)

svg.selectAll("rect.precip")
  .data(data.forecast)
  .enter()
  .append("rect")
  .attr({
    class: "precip",
    width: BWIDTH + "%",
    x: (d, i) => ((50 - (i-1) * XOFFSET - BWIDTH / 2) + "%"),
    height: d => {
      var barHeight = precipToHeight(d.precip);
      if(barHeight < PTHRESHOLD)
        return 0;
      else
        return barHeight + "%"
    },
    y: d => (YOFFSET + 2) + "%",
  })

svg.selectAll("text.precip")
  .data(data.forecast)
  .enter()
  .append("text")
  .attr({
    class: "precip",
    x: (d, i) => ((50 - (i-1) * XOFFSET) + "%"),
    y: d => {
      var barHeight = precipToHeight(d.precip);
      if(barHeight < PTHRESHOLD)
        return (YOFFSET + 1) + "%";
      else
        return (YOFFSET + barHeight - 5) + "%";
    },
  })
  .text(d => d.precip)
