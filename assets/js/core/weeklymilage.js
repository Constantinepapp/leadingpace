class UI {
    static callDatabase(){
        const api="https://leadingpace.pythonanywhere.com/weeklymileage"
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



            if (response.message){
                alert(response.message)
            }
            UI.showEntries(response);
            
          }).catch(error => {
            console.error(error);
          });
    }
    
    static showEntries(response){

        var weeklymilage = response.weeklymilage
        var date = response.date
       
        //render chart bigDashboardChart
        


        UI.showChart(response)

    }
    static showChart(response){
        
        var weeklymilage = response.weeklymilage
        var date = response.date
       

        
        

        //var dates = []

        //for (var i=0; i<Object.keys(chartFatigue).length;i++){
            //dates.push(new Date(Object.keys(chartFatigue)[i]))
       // }
       // console.log(dates)

        const ctx = document.querySelector("#weeklymilageChart")
        var weeklymilageChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels:date,
                datasets:[
                    {
                        label:"Weekly mileage (km)",
                        fill:true,
                        borderColor:"rgb(0, 0, 255,1)",
                        backgroundColor: "rgba(100, 187, 255,1)",
                        pointBackgroundColor: "rgb(251, 187, 25,1)",
                        borderWidth: 1,
                        pointHitRadius:4,
                        lineTension:0,
                        
                        data:Object.values(weeklymilage)
                    }
    
                ]
            },
            options:{
                legend:{
                    display:false,
                    labels:{
                        fontColor:'rgb(255, 99, 132)'
                    }
                },
                elements: {
                    point:{
                        radius: 0
                    }
                },
                pan: {
                    enabled: true,
                    mode: "xy",
                    speed: 10,
                    threshold: 10
                  },
                zoom: {
                    enabled: true,
                    drag: false,
                    mode: "xy",
                    limits: {
                      max: 10,
                      min: 0.5
                    }
                },
                tooltips: {
                    mode: 'nearest'
                },
                scales:{
                    xAxes:[{
                        display:true,
                        gridLines:{
                            display:false
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Week'
                        },
                        type: 'time',
                        time: 
                        {
                        unit: 'month',
                        displayFormats: { 'day': 'MMM D' }
                        }

                    }],
                    yAxes: [{
                        display: true,
                        gridLines: {
                          display:true
                        },
                        scaleLabel: {
                          display: false,
                          labelString: 'Value'
                        },
                        ticks: {
                          suggestedMin: 20,   
                          suggestedMax:-20
                      }
                      }]
                }
            }
            
        })
    }

    static screenWidth(){
        if (screen.width<800){
            document.querySelector("#trainingloadChart").height = 250
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