


var json;
var gaugechart;
var pot;
var curr;
var time;
var state = "on";
var tension = 215; //La tensión puede variar
var consumo = [];

//Web Socket comunication
//Connect to server
var ws = new WebSocket("ws://localhost:8888/websocket");
console.log(ws);

//Open the socket and say hi
ws.onopen = function() {
  ws.send("Hello, world");
};

//Receive message form server
ws.onmessage = function (evt) {
  console.log("puto")
  json = JSON.parse(evt.data);
  console.log(json);

  //set the variables of the object to global variables
  pot = json.potencia;
  curr = json.corriente;
  timestamp = json.timestamp;
  state = json.estado;

  var date = new Date(timestamp*1000);
  // Hours part from the timestamp
  var hours = date.getHours();
  // Minutes part from the timestamp
  var minutes = date.getMinutes();
  // Seconds part from the timestamp
  var seconds = date.getSeconds();
  // Format Time
  time=hours + ":" + minutes + ":" + seconds;

};


$(function () {
    $(document).ready(function () {
        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });


        $('#onbtn').click(function () {
           ws.send(JSON.stringify({"relay1":1}));
        });

        $('#offbtn').click(function () {
           ws.send(JSON.stringify({"relay1":0}));
        });

        $('#acceptbtn').click(function () {
           var max = $("#maximo").val();
           ws.send(JSON.stringify({"max1":parseInt(max)}));
        });

        $('#potencia_chart').highcharts({
            chart: {
                type: 'spline',
                animation: Highcharts.svg, // don't animate in old IE
                marginRight: 10,
                events: {
                    load: function () {

                        // set up the updating of the chart each second
                        var series = this.series[0];
                        setInterval(function () {
                            var x = (new Date()).getTime(), // current time
                                y = pot;
                            series.addPoint([x, y], true, true);
                        }, 1000);
                    }
                }
            },
            title: {
                text: 'Potencia sensada por segundo'
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150
            },
            yAxis: {
                title: {
                    text: 'Watt'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                        Highcharts.numberFormat(this.y, 2);
                }
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            series: [{
                name: 'Potencia Medida por Segundo',
                data: (function () {
                    // generate an array of random data
                    var data = [],
                        time = (new Date()).getTime(),
                        i;

                    for (i = -19; i <= 0; i += 1) {
                        data.push({
                            x: time + i * 1000,
                            y: pot
                        });
                    }
                    return data;
                }())
            }],
            credits: {
              enabled: false
            },
        });

        $('#corriente_chart').highcharts({
            chart: {
                type: 'spline',
                animation: Highcharts.svg, // don't animate in old IE
                marginRight: 10,
                events: {
                    load: function () {

                        // set up the updating of the chart each second
                        var series = this.series[0];
                        setInterval(function () {
                            var x = (new Date()).getTime(), // current time
                                y = curr;
                            series.addPoint([x, y], true, true);
                        }, 1000);
                    }
                }
            },
            title: {
                text: 'Corriente sensada por segundo'
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150
            },
            yAxis: {
                title: {
                    text: 'Ampére'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                        Highcharts.numberFormat(this.y, 2);
                }
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            series: [{
                name: 'Potencia Medida por Segundo',
                data: (function () {
                    // generate an array of random data
                    var data = [],
                        time = (new Date()).getTime(),
                        i;

                    for (i = -19; i <= 0; i += 1) {
                        data.push({
                            x: time + i * 1000,
                            y: pot
                        });
                    }
                    return data;
                }())
            }],
            credits: {
              enabled: false
           },
        });
    });
});


//Last Data Gauge Chart
$(function () {

  $('#gauge').highcharts({

      chart: {
          type: 'gauge',
          plotBackgroundColor: null,
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false
      },

      title: {
          text: 'Corriente'
      },

      pane: {
          startAngle: -150,
          endAngle: 150,
          background: [{
              backgroundColor: {
                  linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                  stops: [
                      [0, '#FFF'],
                      [1, '#333']
                  ]
              },
              borderWidth: 0,
              outerRadius: '109%'
          }, {
              backgroundColor: {
                  linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                  stops: [
                      [0, '#333'],
                      [1, '#FFF']
                  ]
              },
              borderWidth: 1,
              outerRadius: '107%'
          }, {
              // default background
          }, {
              backgroundColor: '#DDD',
              borderWidth: 0,
              outerRadius: '105%',
              innerRadius: '103%'
          }]
      },

      // the value axis
      yAxis: {
          min: 0,
          max: 30,

          minorTickInterval: 'auto',
          minorTickWidth: 1,
          minorTickLength: 10,
          minorTickPosition: 'inside',
          minorTickColor: '#666',

          tickPixelInterval: 30,
          tickWidth: 2,
          tickPosition: 'inside',
          tickLength: 10,
          tickColor: '#666',
          labels: {
              step: 1,
              rotation: 'auto'
          },
          title: {
              text: 'Watt/h'
          },
          plotBands: [{
              from: 0,
              to: 10,
              color: '#55BF3B' // green
          }, {
              from: 10,
              to: 20,
              color: '#DDDF0D' // yellow
          }, {
              from: 20,
              to: 30,
              color: '#DF5353' // red
          }]
      },

      series: [{
          name: 'Corriente',
          data: [0],
          tooltip: {
              valueSuffix: ' Ampére/h'
          }
        }],
        credits: {
          enabled: false
       },
  },
  // Add some life
  function (chart) {
      if (!chart.renderer.forExport) {
          setInterval(function () {
              var point = chart.series[0].points[0];

              point.update(curr);

          }, 3000);
      }
  });
});
//End of Last Data Gauge Chart
