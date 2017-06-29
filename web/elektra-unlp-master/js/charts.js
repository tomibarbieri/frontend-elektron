var curr;

    function get_ajax() {

      $.ajax({
         type: 'POST',
         url: 'ajax_data',
         dataType: 'json',
         contentType: 'application/json; charset=utf-8',
         data: JSON.stringify(data),
         success: function(callback) {
             console.log(callback);
             // Watch out for Cross Site Scripting security issues when setting dynamic content!
             $(this).text('Hello ' + callback.first_name + ' ' + callback.last_name  + '!');
             curr = callback["measure"];
         },
         error: function() {
             $(this).html("error!");
         }
     });
     return parseFloat(curr);
    }


      $(document).ready(function () {
          Highcharts.setOptions({
              global: {
                  useUTC: false
              }
          });

          Highcharts.chart('container', {
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
                                  y = get_ajax();
                              series.addPoint([x, y], true, true);
                          }, 1000);
                      }
                  }
              },
              title: {
                  text: 'Live random data'
              },
              xAxis: {
                  type: 'datetime',
                  tickPixelInterval: 150
              },
              yAxis: {
                  title: {
                      text: 'Value'
                  },
                   min: 0,
                   max: 100,
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
                  name: 'Random data',
                  data: (function () {
                      // generate an array of random data for the begining
                      var data = [],
                          time = (new Date()).getTime(),
                          i;

                      for (i = -19; i <= 0; i += 1) {
                          data.push({
                              x: time + i * 1000,
                              y: get_ajax()
                          });
                      }
                      return data;
                  }())
              }]
          });


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
