class UI {
    static callDatabase(){
        const api="http://127.0.0.1:5000/trainingzones"
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
        document.querySelector("#threSpeed").innerHTML = convertMetrics(response.threSpeed)
        document.querySelector("#aerSpeed").innerHTML = convertMetrics(response.aerobicSpeed)
        document.querySelector("#intervalSpeed").innerHTML = convertMetrics(response.intervalSpeed)
        document.querySelector("#aerobicOneSpeed").innerHTML = convertMetrics(response.aerobicOneSpeed)

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
    
    
    
document.addEventListener("DOMContentLoaded",UI.callDatabase)


document.querySelector("#logout").addEventListener("click",logout)

function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}