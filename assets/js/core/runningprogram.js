
class Activity{
    constructor(type,duration,distance,tss){
        this.type = type
        this.duration = duration
        this.distance = distance
        this.tss = tss
    }
}

function createTimeStamp(tss_target){
    

    var token=window.localStorage.getItem('token')
    const myHeaders={"x-access-token":token,"Content-Type": "application/json",'access-control-allow-origin':"*"}
    
    
    
    var link="https://leadingpace.pythonanywhere.com/generateprogram"
    

    fetch(link,{
        method:'PUT',
        headers:myHeaders,
        body: JSON.stringify({"tss_target":tss_target})
    })

    .then(response =>{
        if (response.status === 200){
            window.location.reload(true)
            return response.json();
        } else{
            console.log('error');
            console.log("Token expired log in again ")
            window.localStorage.clear();
            window.location.replace("login.html")
            
        }
    })
    .then(response =>{
        console.debug(response);
        
    })


}

function tss_target(){
    var currentFitness=localStorage.getItem("currentFitness")
    var currentFatigue=localStorage.getItem("currentFatigue")

    if (currentFitness==undefined){
        
        return alert("please visit training load page first")
    }
    var tss_target = (1.116*currentFitness-0.16*currentFatigue+11.9)*7 + 1.5/currentFitness

    createTimeStamp(tss_target)
}   


function getDatabaseData(){
    const api="https://leadingpace.pythonanywhere.com/showprogram"
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

        showRunningProgram(response)

        console.log(response)


        if (response.message){
            alert(response.message)
        }
        
        
      }).catch(error => {
        console.error(error);
      });
}


function showRunningProgram(response){

    var startdate = response.program_start
    var enddate = response.program_ends
    var tss_target = response.tss_target
    var tss_until_now = response.tss_until_now

    var percentageGoal = (tss_until_now/tss_target)*100
    document.querySelector("#percentageGoal").innerHTML = percentageGoal.toFixed(0) + " %"
    document.querySelector("#percentageBar").setAttribute("style",`width: ${percentageGoal.toFixed(0)}%`)
    document.querySelector("#summaryTss").innerHTML = tss_target.toFixed(0)
    document.querySelector("#startDate").innerHTML = startdate
    document.querySelector("#endDate").innerHTML = enddate
    document.querySelector("#currentTss").innerHTML = tss_until_now.toFixed(0)
    document.querySelector("#goalTss").innerHTML = tss_target.toFixed(0)

    createTargetActivity(tss_target)
    
}
function aerobicSpeedCalculate(){
    const runningIndex = localStorage.getItem("runningIndex")
    const aerSpeed=(runningIndex-5.668)/3.82
    return (aerSpeed.toFixed(2))
}
function createTargetActivity(tss_target){
    
    aerobicSpeed = aerobicSpeedCalculate()
    var tempoSpeed = localStorage.getItem("threSpeed")
    var plan = "basic_aerobic"
    if (plan=="basic_aerobic"){
        for(var i=1;i<=3;i++){
            duration = duration_aerobic_two(tss_target)
            est_distance = ((duration * aerobicSpeed*0.98)*1000/60).toFixed(0)
            
            activity = new Activity(type="basic aerobic",duration,est_distance,tss_target/3)
            console.log(activity)

            createTableRow(activity,aerobicSpeed,tempoSpeed)
        }
    }
    

    

}
document.addEventListener("DOMContentLoaded",getDatabaseData)
document.querySelector("#generateProgram").addEventListener("click",tss_target)



function duration_aerobic_two(tss){
    return ((tss/3 - 0.001141)/1.293).toFixed(0)
}

function duration_aerobic_one(){

}

function duration_tempo(){

}

function intervals(){

}



function createTableRow(activity,speed){
    var table = document.querySelector("#weekplan")
    var row = document.createElement("tr")
    row.innerHTML=`
    <td class="text-success">
        ${activity.type}
    </td>
    <td class="text-white">
        <span class="text-info">${activity.duration}</span> min at <span class="text-success">${speed}</span> km/hr speed
    </td>
    <td class="text-info">
        ${activity.distance} m
    </td>
    <td class="text-warning">
        ${activity.tss.toFixed(0)}
    </td>`

    table.insertBefore(row, table.firstChild);
}


function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}


