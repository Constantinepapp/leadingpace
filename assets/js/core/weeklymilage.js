class UI {
    static callDatabase(){
        const api="https://leadingpace.pythonanywhere.com/weeklymileage"
        const token = window.localStorage.getItem("token")
        var timeFrame = localStorage.getItem("timeFrame")
        var timeScale = localStorage.getItem("timeScale")
        if (token == null){
            window.location.replace("login.html")
        }

        const myHeaders={"x-access-token":token,"timeFrame":timeFrame,"timeScale":timeScale}
        
        fetch(api,{
            method:"GET",
            headers: myHeaders
        })
        .then(response=>{
            if (response.status === 200) {
                localStorage.setItem("retry",0)
                return response.json();
              } else {
                localStorage.setItem("retry",parseInt(localStorage.getItem("retry"))+1)
                if (parseInt(localStorage.getItem("retry"))<3){
                    setTimeout(function (){UI.callDatabase()}, 2000)    
                }
                else{
                    console.log("Token expired log in again ")
                    window.localStorage.clear();
                    window.location.replace("login.html")
                    throw new Error('Something went wrong on api server!');
                }
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
        displayCards(weeklymilage)

        UI.screenWidth()

        UI.showChart(response)
        UI.raceReadiness(response)

    }
    static showChart(response){
        
        var weeklymilage = response.weeklymilage
        console.log(weeklymilage)
        weeklymilage = metricsValues(weeklymilage)
        var date = response.date
        
        console.log(date)
        console.log(weeklymilage)
        const timeScale = localStorage.getItem("timeScale")
        if (timeScale == "y"){
            var timeScaleString = "Yearly Mileage"
            var timeUnit ="year"
        }
        else if (timeScale == "m"){
            var timeScaleString = "Monthly Mileage"
            var timeUnit ="month"
        }
        else{
            var timeScaleString = "Weekly Mileage"
            var timeUnit ="week"
        }
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
                        label:timeScaleString+`(${metric()})`,
                        fill:true,
                        borderColor:"rgb(0, 0, 255,1)",
                        backgroundColor: "rgba(255, 255, 255,1)",
                        pointBackgroundColor: "rgb(0, 0, 255,1)",
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
                        fontColor:'rgb(255, 255, 255)'
                    }
                },
                elements: {
                    point:{
                        radius: 0
                    }
                },
                pan: {
                    enabled: false,
                    mode: "xy",
                    speed: 10,
                    threshold: 10
                },
                zoom: {
                    enabled: false,
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
                        gridLines: {
                            offsetGridLines: false
                          },
                        
                        type: 'category'
                        //time: 
                        //{
                        //unit: timeUnit,
                        //displayFormats: { 'day': 'MMM D','year':`YY`}
                        //}

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

document.querySelector("#timeFrame").addEventListener("click",reloadGraph)

function displayCards(weeklymilage){
    var timeScale = localStorage.getItem("timeScale")

    if (timeScale !="w"){
        document.querySelector("#distanceReadinessCard").style = "display:none;"
    }

    if (timeScale == "w"){
        var current = weeklymilage[weeklymilage.length - 1]
        var last = weeklymilage[weeklymilage.length - 1] + weeklymilage[weeklymilage.length - 2] + weeklymilage[weeklymilage.length - 3] + weeklymilage[weeklymilage.length - 4] 
        var average = (weeklymilage[weeklymilage.length - 1] + weeklymilage[weeklymilage.length - 2] + weeklymilage[weeklymilage.length - 3] + weeklymilage[weeklymilage.length - 4])/4 
    }
    else if (timeScale =="m"){
        var current = weeklymilage[weeklymilage.length - 1]
        var last = 0
        for (var i = 1;i<weeklymilage.length;i++){
            if (i<14){
                last = last + weeklymilage[weeklymilage.length - i]
            }
        }
        var average = last/12



        document.querySelector("#current").innerHTML = "This Month"
        document.querySelector("#last").innerHTML = "Last 12 Months"
        document.querySelector("#average").innerHTML = "Average per Month"
    }
    else{
        var current = weeklymilage[weeklymilage.length - 1]
        var last = weeklymilage.reduce(function(acc, val) { return acc + val; }, 0)
        var average = last/weeklymilage.length

        document.querySelector("#current").innerHTML = "This Year"
        document.querySelector("#last").innerHTML = "All time"
        document.querySelector("#average").innerHTML = "Average per year"
    }

    document.querySelector("#currentWeek").innerHTML = metricsSingleValue(current.toFixed(2))+`  ${metric()}`
    document.querySelector("#currentMonth").innerHTML = metricsSingleValue(last.toFixed(2))+`  ${metric()}`
    document.querySelector("#averageMonth").innerHTML = metricsSingleValue(average.toFixed(2))+`  ${metric()}`
}
function reloadGraph(){
    timeFrame = document.querySelector("#timeFrameSelection").value
    timeScale = document.querySelector("#timeScaleSelection").value
    localStorage.setItem("timeScale",timeScale)
    localStorage.setItem("timeFrame",timeFrame)
    window.location.replace("analysis.html")
}

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
        readiness = readiness*2.9
    }
    if (distance==10){
        readiness = readiness*3.7
    }
    if (distance==5){
        readiness = readiness*7
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

function metricsValues(weeklymilage){
    const measurementSystem = localStorage.getItem("measurementSystem")
    if (measurementSystem == "Imperial mile/hr"){
        weeklymilage = weeklymilage.map(distance =>(distance*0.62).toFixed(2))
        return (weeklymilage)
    }
    if (measurementSystem == "Imperial min/mile"){
        weeklymilage = weeklymilage.map(distance =>(distance*0.62).toFixed(2))
        return (weeklymilage.toFixed(2))
    }
    else{
        return (weeklymilage)
    }

}
function metricsSingleValue(distance){
    const measurementSystem = localStorage.getItem("measurementSystem")
    if (measurementSystem == "Imperial mile/hr"){
        distance = (distance*0.62).toFixed(2)
        return (distance)
    }
    if (measurementSystem == "Imperial min/mile"){
        distance = (distance*0.62).toFixed(2)
        return (distance)
    }
    else{
        return (distance)
    }

}
function metric(){
    const measurementSystem = localStorage.getItem("measurementSystem")
    if (measurementSystem == "Imperial mile/hr"){
        return ("miles")
    }
    if (measurementSystem == "Imperial min/mile"){
        return ("mins")
    }
    else{
        return("km")
    }
}
document.querySelector("#logout").addEventListener("click",logout)

function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}