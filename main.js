var tryNumber = (x) => {
  var num = Number(x);
  return isNaN(num) ? x : num;
}

var objToNumbers = (obj, i) => {
  var newObj = {};
  Object.keys(obj).forEach(key => newObj[key] = tryNumber(obj[key]));
  return newObj;
}

var state = window.location.search.match(/state=([^&]+)/);
const STATE = state ? state[1] : "ma";
var city = window.location.search.match(/city=([^&]+)/);
const CITY = city ? city[1] : "cambridge";

const replaces = [
  [/^snow$/ig, "it's snowy"],
  [/^rain$/ig, "it's rainy"],
  [/^clear$/ig, "clear skies"],
  [/^light drizzle$/ig, "lightly drizzling"],
  [/^light snow$/ig, "lightly snowing"]
]

var processCondition = weather => {
  replaces.forEach(r => weather = weather.replace(r[0], r[1]))
  return weather;
}

var cardColor = resp => {
  if(resp.current_observation.icon_url.match(/nt_.+gif/ig)) $("#card").addClass("night");
  else {
    var weather = resp.current_observation.weather;
    if (weather.match(/snow/ig)) $("#card").addClass("snowy")
    if (weather.match(/cloud/ig) || weather.match(/overcast/ig)) $("#card").addClass("cloudy")
    if (weather.match(/rainy/ig)) $("#card").addClass("rainy")
    if (weather.match(/sunny/ig) || weather.match(/clear/ig)) $("#card").addClass("sunny")
  }
}

$.get("http://api.wunderground.com/api/009488d0b563f9e5/conditions/q/" + STATE + "/" + CITY + ".json", (resp) => {
  console.log(resp);
  cardColor(resp)
  var city = resp.current_observation.display_location.city;
  var weather = processCondition(resp.current_observation.weather);
  var temperature = Number(resp.current_observation.temp_f).toFixed(0);
  var windSpd = Number(resp.current_observation.wind_mph).toFixed(0);
  var windDir = resp.current_observation.wind_dir.charAt(0);
  var feelslike = Number(resp.current_observation.feelslike_f).toFixed(0);
  var humidity = resp.current_observation.relative_humidity
  $("#condition").html(`${weather}<br>in ${city}`);
  $("#temperature").html(`${temperature}°`);
  $("#windval").html(`${windSpd} mph`)
  $("#feelslikeval").html(`${feelslike}°`)
  $("#humidityval").html(`${humidity}`)

  $.get("http://api.wunderground.com/api/009488d0b563f9e5/forecast/q/" + STATE + "/" + CITY + ".json", (resp) => {
    console.log(resp);
    var data = resp.forecast.simpleforecast.forecastday.slice(0, 3).map(x => {
      return {
        high: x.high.fahrenheit,
        low: x.low.fahrenheit,
        precip: x.pop,
        precipamt: x.qpf_allday.in + x.snow_allday.in
      }
    })
    data = data.map(objToNumbers)


    var sortedHighs = Array.from(data);
    sortedHighs.sort((a, b) => b.high - a.high);
    var maxTemp = sortedHighs[0].high;

    var sortedLows = Array.from(data);
    sortedLows = sortedLows.sort((a, b) => a.low - b.low);
    var minTemp = Math.min(sortedLows[0].low, maxTemp - 30);


    var svg = d3.select("#chart")

    const XOFFSET = 25;
    const BWIDTH = 12;
    const YOFFSET = 50;
    const MAXTHEIGHT = YOFFSET - 3;
    const MINTHEIGHT = 5;
    const TEXTPOS = 90;
    const MAXPHEIGHT = TEXTPOS - YOFFSET;
    const GAP = 2;

    var tempToHeight = temp => MINTHEIGHT + (temp - minTemp) / (maxTemp - minTemp) * (MAXTHEIGHT - MINTHEIGHT);
    var precipToHeight = precip => precip / 100 * MAXPHEIGHT;


    svg.selectAll("rect.high")
      .data(data)
      .enter()
      .append("rect")
      .attr({
        class: "high",
        width: BWIDTH + "%",
        x: (d, i) => ((50 - (1 - i) * XOFFSET - BWIDTH / 2) + "%"),
        height: d => (tempToHeight(d.high) + "%"),
        y: d => ((YOFFSET - tempToHeight(d.high)) + "%"),
      })

    svg.selectAll("rect.low")
      .data(data)
      .enter()
      .append("rect")
      .attr({
        class: "low",
        width: BWIDTH + "%",
        x: (d, i) => ((50 - (1 - i) * XOFFSET - BWIDTH / 2) + "%"),
        height: d => (Math.min(tempToHeight(d.low), tempToHeight(d.high) - 5) + "%"),
        y: d => (YOFFSET - Math.min(tempToHeight(d.low), tempToHeight(d.high) - 5) + "%"),
      })

    svg.selectAll("text.temp")
      .data(data)
      .enter()
      .append("text")
      .attr({
        class: "temp",
        x: (d, i) => ((50 - (1 - i) * XOFFSET) + "%"),
        y: (d) => {
          var highHeight = tempToHeight(d.high);
          var lowHeight = Math.min(tempToHeight(d.low), tempToHeight(d.high) - 5);
          var avgHeight = (highHeight + lowHeight) / 2;
          return (YOFFSET - avgHeight) + "%";
        }
      })
      .text(d => ((d.high + d.low) / 2).toFixed(0) + "°")

    svg.selectAll("text.highlow")
      .data(data)
      .enter()
      .append("text")
      .attr({
        class: "highlow",
        x: (d, i) => ((50 - (1 - i) * XOFFSET) + "%"),
        y: (d) => {
          var highHeight = tempToHeight(d.high);
          var lowHeight = Math.min(tempToHeight(d.low), tempToHeight(d.high) - 5);
          var avgHeight = (highHeight + lowHeight) / 2;
          return (YOFFSET - avgHeight) + "%";
        }
      })
      .text(d => `${d.high} / ${d.low}`)

    svg.selectAll("rect.precip")
      .data(data)
      .enter()
      .append("rect")
      .attr({
        class: "precip",
        width: BWIDTH + "%",
        x: (d, i) => ((50 - (1 - i) * XOFFSET - BWIDTH / 2) + "%"),
        height: d => {
          var barHeight = precipToHeight(d.precip);
          return barHeight + "%"
        },
        y: d => (YOFFSET + GAP) + "%",
      })

    svg.selectAll("text.precip")
      .data(data)
      .enter()
      .append("text")
      .attr({
        class: "precip",
        x: (d, i) => ((50 - (1 - i) * XOFFSET) + "%"),
        y: (d, i) => {
          var barHeight = precipToHeight(d.precip);
          return Math.max(YOFFSET + GAP + 3, (YOFFSET + GAP + barHeight / 2)) + "%";
        },
      })
      .text(d => d.precip + "%")

    for (let i = 0; i < 3; i++) {
      if (i == 0) var day = "today";
      else if (i == 1) var day = "tomorrow";
      else {
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        var day = days[new Date(+new Date() + 2 * 24 * 60 * 60 * 1000).getDay()];
      }
      svg.append("text")
        .attr({
          class: "date",
          x: (50 - (1 - i) * XOFFSET) + "%",
          y: "95%"
        })
        .text(day)
    }

    $("body").removeClass("notready")
  })
});

$("#more").click(function() {
  $(this).toggleClass("collapsed");
  console.log(this);
})
