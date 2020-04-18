class UI {
    static callDatabase(){
        const api="http://leadingpace.pythonanywhere.com/dashboard"
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
            console.debug(response);
            console.log(response)

            if (response.message){
              alert(response.message)
            }
            
            UI.showEntries(response);
            
            
          }).catch(error => {
            console.error(error);
          });
    }
    
    static showEntries(response){

        //show running index
        var median = response.median
        median = median[Object.keys(median)[Object.keys(median).length-1]]
        document.querySelector("#median").innerHTML = median
        var VO2max=response.VO2max
        document.querySelector("#VO2max").innerHTML = VO2max


        //render chart

        


        UI.showChart(response)

    }

    static showChart(response){
        var chartMedian = response.median
        var chartRawValues = response.running_index

        var dates=response.date;
        //create date objects from strings
        
        console.log(dates)
        
    
        const ctx = document.querySelector("#runningIndexChart")
        var runningIndexChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels:dates,
                datasets: [
                    {
                        label: "Running Index",
                        fill:true,
                        borderColor:"rgba(255, 160, 0,1)",
                        backgroundColor: "rgba(255, 255, 0,0)",
                        pointBackgroundColor: "#7efcf8",
                        
                        data: Object.values(chartMedian)
                    },
                    {
                        label:"Raw values",
                        borderColor:"#e8e237",
                        backgroundColor: "#e8e237",
                        pointBackgroundColor: "#e8e237",
                        
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
                          suggestedMin: 30,   
                          suggestedMax: 50
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


document.querySelector("#logout").addEventListener("click",logout)

function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}