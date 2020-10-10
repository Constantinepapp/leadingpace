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

        var currentWeek = weeklymilage[weeklymilage.length - 1]
        var currentMonth = weeklymilage[weeklymilage.length - 1] + weeklymilage[weeklymilage.length - 2] + weeklymilage[weeklymilage.length - 3] + weeklymilage[weeklymilage.length - 4] 
        var averageMonth = (weeklymilage[weeklymilage.length - 1] + weeklymilage[weeklymilage.length - 2] + weeklymilage[weeklymilage.length - 3] + weeklymilage[weeklymilage.length - 4])/4 
        document.querySelector("#currentWeek").innerHTML = currentWeek.toFixed(2)
        document.querySelector("#currentMonth").innerHTML = currentMonth.toFixed(2)
        document.querySelector("#averageMonth").innerHTML = averageMonth.toFixed(2)
        UI.screenWidth()

        UI.showChart(response)
        UI.raceReadiness(response)

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
    static raceReadiness(response){
        const marathonPercent = marathonReadiness(response.weeklymilage,42)
        const marathonBarColor = barColor(marathonPercent)

        const halfMarathonPercent = marathonReadiness(response.weeklymilage,21)
        const halfMarathonBarColor = barColor(halfMarathonPercent)

        const tenKPercent = marathonReadiness(response.weeklymilage,10)
        const tenKBarColor = barColor(tenKPercent)

        const fiveKPercent = marathonReadiness(response.weeklymilage,5)
        const fiveKBarColor = barColor(fiveKPercent)


        document.querySelector("#marathonReadiness").innerHTML = marathonPercent.toFixed(2)+" %"
        document.querySelector("#marathonBar").style = `width:${marathonPercent}%`
        document.querySelector("#marathonBar").className = `progress-bar bg-c-${marathonBarColor}`

        document.querySelector("#halfMarathonReadiness").innerHTML = halfMarathonPercent.toFixed(2)+" %"
        document.querySelector("#halfMarathonBar").style = `width:${halfMarathonPercent}%`
        document.querySelector("#halfMarathonBar").className = `progress-bar bg-c-${halfMarathonBarColor}`

        document.querySelector("#tenkReadiness").innerHTML = tenKPercent.toFixed(2)+" %"
        document.querySelector("#tenkBar").style = `width:${tenKPercent}%`
        document.querySelector("#tenkBar").className = `progress-bar bg-c-${tenKBarColor}`

        document.querySelector("#fivekReadiness").innerHTML = fiveKPercent.toFixed(2)+" %"
        document.querySelector("#fivekBar").style = `width:${fiveKPercent}%`
        document.querySelector("#fivekBar").className = `progress-bar bg-c-${fiveKBarColor}`
    }

    static screenWidth(){
        if (screen.width<800){
            document.querySelector("#weeklymilageChart").height = 250
        }
    }

}

//64 + 57 *0.6 + 47*0.5 + 45*0.4
document.addEventListener("DOMContentLoaded",UI.screenWidth)
document.addEventListener("DOMContentLoaded",UI.callDatabase)

function marathonReadiness(weeklymilage,distance){
    var readiness = weeklymilage[weeklymilage.length-1] + weeklymilage[weeklymilage.length-2] *0.6 + weeklymilage[weeklymilage.length-3]*0.5 + weeklymilage[weeklymilage.length-4]*0.4
    
    readiness = readiness/2.5
    console.log(readiness)
    
    if (distance==42){
        readiness = readiness*1.7
    }
    if (distance==21){
        readiness = readiness*3
    }
    if (distance==10){
        readiness = readiness*4.2
    }
    if (distance==5){
        readiness = readiness*10
    }
    
    if (readiness>100){
        readiness = 100
    }
    return (readiness)
}

function barColor(value){
    var barColor = "yellow"
    if (value>=90){
        barColor = "green"
    }
    else if(value>75){
        barColor = "blue"
    }
    else if(value>50){
        barColor = "yellow"
    }
    else{
        barColor = "red"
    }
    return(barColor)
}
document.querySelector("#logout").addEventListener("click",logout)

function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}