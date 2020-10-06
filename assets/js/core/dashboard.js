class UI {
    static callDatabase(){
        const api="http://127.0.0.1:5000/dashboard"
        const token = window.localStorage.getItem("token")
        if (token == null){
            window.location.replace("login.html")
        }

        const myHeaders={"x-access-token":token}
        
        fetch(api,{
            method:"GET",
            headers: myHeaders
        })
        .then(response=>{
            if (response.status === 200) {
              

                return response.json();
              } else {
                console.log("Token expired log in again ")
                window.localStorage.clear();
                window.location.replace("login.html")
                throw new Error('Something went wrong on api server!');
                
              }
        })
        .then(response => {
            if (response.message){
              customAlert(response.message)
            }
            
            UI.showEntries(response);
            
            
          }).catch(error => {
            console.error(error);
          });
    }
    
    static showEntries(response){

        //show running index
        var median = response.median
        median = median[median.length-1]
        document.querySelector("#median").innerHTML = median
        localStorage.setItem("runningIndex",median)
        // show Vo2max
        var VO2max=response.VO2max
        document.querySelector("#VO2max").innerHTML = VO2max
        // show trend
        var median_two = response.median[response.median.length-2]
        var median_three = response.median[response.median.length-3]
        var y =  [median_three,median_two,median]
        var x = [1,2,3]
        var slope = linearRegression(y,x).toFixed(2)
        document.querySelector("#trend").innerHTML = slope
        //render chart

        


        UI.showChart(response)

    }

    static showChart(response){
        var chartMedian = response.median
        var chartRawValues = response.running_index

        var dates=response.date;
        //create date objects from strings
        
        
    
        const ctx = document.querySelector("#runningIndexChart")
        var runningIndexChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels:dates,
                datasets: [
                    {
                        label: "Running Index",
                        fill:true,
                        borderColor:"rgba(255, 255, 255,1)",
                        backgroundColor: "rgba(255, 255, 255,0.1)",
                        pointBackgroundColor: "rgba(255, 255, 255,0.1)",
                        
                        data: Object.values(chartMedian)
                    },
                    {
                        label:"Raw values",
                        borderColor:"#7ED8F6",
                        backgroundColor: "#7ED8F6",
                        pointBackgroundColor: "#7ED8F6",
                        
                        showLine: false,
                        data:Object.values(chartRawValues)
                    }  
                ]
            },
            options: {
                
                legend: {
                    display: false,
                    labels: {
                        fontColor: 'rgb(255, 99, 132)'
                    }
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                  },
                  scales: {
                    xAxes: [{
                      display: true,
                      gridLines: {
                        display: false
                      },
                      scaleLabel: {
                        display: true,
                        labelString: 'Month'
                      },
                      type:'time',
                      distribution: 'series',
                      time: {
                        displayFormats: {
                            parser: 'YYYY/MM/DD',
                            unit: 'day',
                            unitStepSize: 1,
                            
                            quarter: 'MMM YYYY'
                        }
                      }
                    }],
                    yAxes: [{
                        display: true,
                        gridLines: {
                          display: false
                        },
                        scaleLabel: {
                          display: true,
                          labelString: 'Value'
                        },
                        ticks: {
                          suggestedMin: 35,   
                          suggestedMax: 45
                        },
                      }]
                    }
            }
        });
    }
    static screenWidth(){
      if (screen.width<800){
          document.querySelector("#runningIndexChart").height = 250
      }
  }
}

document.addEventListener("DOMContentLoaded",UI.screenWidth)
document.addEventListener("DOMContentLoaded",UI.callDatabase)
document.addEventListener("DOMContentLoaded",UI.raceReadiness)



document.querySelector("#logout").addEventListener("click",logout)

function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}

function customAlert(message){
  document.querySelector(".alert").setAttribute("class",`alert alert-${message[0]}`)
  document.querySelector(".alertText").innerHTML = message[1]
  setTimeout(function(){ document.querySelector(".alert").setAttribute("class","alert alert-info collapse"); }, 3000);
}




function linearRegression(y,x){
  var slope = 0;
  var n = y.length;
  var sum_x = 0;
  var sum_y = 0;
  var sum_xy = 0;
  var sum_xx = 0;
  var sum_yy = 0;

  for (var i = 0; i < y.length; i++) {

      sum_x += x[i];
      sum_y += y[i];
      sum_xy += (x[i]*y[i]);
      sum_xx += (x[i]*x[i]);
      sum_yy += (y[i]*y[i]);
  } 

  slope = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
  

  return slope;
}