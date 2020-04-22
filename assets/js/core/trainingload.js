class UI {
    static callDatabase(){
        const api="https://leadingpace.pythonanywhere.com/trainingload"
        const token = window.localStorage.getItem("token")
        if (token == null){
            window.location.replace("login.html")
        }
        var timeFrame = localStorage.getItem("timeFrame")
        const myHeaders={"x-access-token":token,"timeFrame":timeFrame}
        
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

        var fatigue = response.fatigue
        var currentFatigue = fatigue[Object.keys(fatigue)[Object.keys(fatigue).length-31]]
        var fitness = response.fitness
        var currentFitness = fitness[Object.keys(fitness)[Object.keys(fitness).length-31]]
        var form = response.form
        var currentForm = form[Object.keys(form)[Object.keys(form).length-31]]
        localStorage.setItem("currentFitness",currentFitness)
        localStorage.setItem("currentFatiygue",currentFatigue)
        //render chart bigDashboardChart
        document.querySelector("#currentFatigue").innerHTML = currentFatigue.toFixed(1)
        document.querySelector("#currentFitness").innerHTML = currentFitness.toFixed(1)
        document.querySelector("#currentForm").innerHTML = currentForm.toFixed(1)
        

        UI.showChart(response)

    }
    static showChart(response){
        
        var chartFatigue = response.fatigue
        var chartFitness = response.fitness
        var chartForm = response.form
        var chartDates = response.date

        chartFitness = roundNumber(chartFitness)
        chartFatigue = roundNumber(chartFatigue)
        chartForm = roundNumber(chartForm)

        //var dates = []

        //for (var i=0; i<Object.keys(chartFatigue).length;i++){
            //dates.push(new Date(Object.keys(chartFatigue)[i]))
       // }
       // console.log(dates)

        const ctx = document.querySelector("#trainingloadChart")
        var trainingloadChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels:chartDates,
                datasets:[
                    {
                        label:"Fatigue",
                        fill:true,
                        borderColor:"rgb(251, 187, 25,1)",
                        backgroundColor: "rgba(251, 187, 25,0.1)",
                        pointBackgroundColor: "rgb(251, 187, 25,1)",
                        borderWidth: 1,
                        pointHitRadius:4,
                        lineTension:0,
                        
                        data:Object.values(chartFatigue)
                    },
                    {
                        label:"Fitness",
                        fill:true,
                        borderColor:"rgba(100, 150, 255,1)",
                        backgroundColor: "rgba(100, 150, 255,0.1)",
                        pointBackgroundColor: "rgba(100, 150, 255,1)",
                        borderWidth: 1,
                        lineTension:0,
                        pointHitRadius:3,
                        data:Object.values(chartFitness)
                    },
                    {
                        label:"Form",
                        fill:true,
                        borderColor:"rgb(255, 64, 43)",
                        backgroundColor: "rgba(255, 64, 43,0.1)",
                        pointBackgroundColor: "rgb(185, 249, 159)",
                        lineTension:0,
                        borderWidth: 1,
                        pointHitRadius:3,
                        data:Object.values(chartForm)
                    },
                    {   
                        label:"Optimal lower",
                        data: new Array(chartFitness.length).fill(-5),
                        fill: false,
                        radius: 0,
                        pointBackgroundColor: "rgb(0, 249, 0)",
                        borderWidth: 1,
                        pointHitRadius:3,
                        borderColor: "rgba(250,250,250,0.5)"
                    },
                    {   
                        label:"Optimal upper level",
                        data: new Array(chartFitness.length).fill(-15),
                        fill: false,
                        radius: 0,
                        pointBackgroundColor: "rgb(185, 0, 0)",
                        borderWidth: 1,
                        pointHitRadius:4,
                        borderColor: "rgba(250,250,250,0.5)"
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
                            labelString: 'Month'
                        },
                        type: 'time',
                        time: 
                        {
                            unit: 'month',
                            displayFormats: { 'day': 'MMM DD' }//,
                            //min: new Date(dateMin),
                            //max: new Date(dateMax)
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

function roundNumber(list){
    listRound=[]
    for (var i=0; i<list.length; i++){
        list[i]=list[i].toFixed(1)
        listRound.push(list[i])

    }
    return listRound
}


document.addEventListener("DOMContentLoaded",UI.screenWidth)
document.addEventListener("DOMContentLoaded",UI.callDatabase)

document.querySelector("#timeFrame").addEventListener("click",reloadGraph)

function reloadGraph(){
    timeFrame = document.querySelector("#timeFrameSelection").value
    localStorage.setItem("timeFrame",timeFrame)
    window.location.replace("trainingload.html")
}

document.querySelector("#logout").addEventListener("click",logout)

function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}
