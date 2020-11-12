class UI {
    static callDatabase(){
        const api="https://leadingpace.pythonanywhere.com/trainingzones"
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

            UI.showEntries(response);
            
          }).catch(error => {
            console.error(error);
          });
    }
    
    static showEntries(response){
        document.querySelector("#max2").innerHTML = response.max2
        document.querySelector("#max1").innerHTML = response.max1
        document.querySelector("#thre2").innerHTML = response.thre2
        document.querySelector("#thre1").innerHTML = response.thre1
        document.querySelector("#aer4").innerHTML = response.aer4
        document.querySelector("#aer3").innerHTML = response.aer3
        document.querySelector("#aer2").innerHTML = response.aer2
        document.querySelector("#aer1").innerHTML = response.aer1
        //document.querySelector("#threSpeed").innerHTML = convertMetrics(response.threSpeed)
        //document.querySelector("#aerSpeed").innerHTML = convertMetrics(response.aerobicSpeed)
        //document.querySelector("#aerobicOneSpeed").innerHTML = convertMetrics(response.aerobicOneSpeed)

        var aerobicSpeed = AerobicSpeedCalculate(60)
        var threSpeed = TempoSpeedCalculate(60)
        var baseSpeed = BaseSpeedCalculate(60)
        var intervalSpeed = IntervalSpeedCalculate(60)

        document.querySelector("#aerSpeed").innerHTML = convertMetrics(aerobicSpeed)
        document.querySelector("#threSpeed").innerHTML = convertMetrics(threSpeed)
        document.querySelector("#aerobicOneSpeed").innerHTML = convertMetrics(baseSpeed)
        document.querySelector("#intervalSpeed").innerHTML = convertMetrics(intervalSpeed)
        
        localStorage.setItem("aerobicSpeed",response.aerobicSpeed)
        localStorage.setItem("tempoSpeed",response.threSpeed)        

    }
}

function convertMetrics(speed){
    const measurementSystem = localStorage.getItem("measurementSystem")
      
    if (measurementSystem == "Imperial mile/hr"){
        $("div.metric").html("miles/hr");
        speed = speed * 0.6213
        return (speed.toFixed(2))
    }
    if (measurementSystem == "Imperial min/mile"){
        $("div.metric").html("min/mile");
        speed = 96.56/speed
        speed = timeConvert(speed)
        return (speed)
    }
    if (measurementSystem == "Metric min/km"){
        $("div.metric").html("min/km");
        speed = 60/speed
        speed = timeConvert(speed)
        return (speed)
    }
    else{
        $("div.metric").html("km/hr");
        return(speed.toFixed(2))
    }
}

function timeConvert(time) {
    var min = Math.floor(time)
    var sec = time % 60-Math.floor(time)
    sec = sec*60
    sec = sec.toFixed(0)
    if (sec<10){
        sec = `0${sec}`
    }
    return (min+':'+sec);
}
    
function AerobicSpeedCalculate(duration){
    const runningIndex = localStorage.getItem("runningIndex")
    var factor = 0.857868    ///percent of max (hr/max)
    var x = (factor*1.45)-0.30
    var distanceKm = Math.pow(((x*runningIndex -3.5)/213.9)*duration,1/1.06)
    var speed = (60/duration)*distanceKm
    
    return (speed)
}
function BaseSpeedCalculate(duration){
    const runningIndex = localStorage.getItem("runningIndex")
    var factor = 0.76    ///percent of max (hr/max)
    var x = factor*1.45-0.30
    var distanceKm = Math.pow(((x*runningIndex -3.5)/213.9)*duration,1/1.06)
    var speed = (60/duration)*distanceKm
    return (speed)
}
function TempoSpeedCalculate(duration){
    const runningIndex = localStorage.getItem("runningIndex")
    var factor = 0.895   ///percent of max (hr/max)
    var x = factor*1.45-0.30
    var distanceKm = Math.pow(((x*runningIndex -3.5)/213.9)*duration,1/1.06)
    var speed = (60/duration)*distanceKm
    return (speed)
}
function IntervalSpeedCalculate(duration){
    const runningIndex = localStorage.getItem("runningIndex")
    var factor = 1    ///percent of max (hr/max)
    var x = factor*1.45-0.30
    var distanceKm = Math.pow(((x*runningIndex -3.5)/213.9)*duration,1/1.06)
    var speed = (60/duration)*distanceKm
    return (speed)
}
    
document.addEventListener("DOMContentLoaded",UI.callDatabase)


document.querySelector("#logout").addEventListener("click",logout)

function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}