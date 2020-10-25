
class Activity{
    constructor(type,duration,distance,tss){
        this.type = type
        this.duration = duration
        this.distance = distance
        this.tss = tss
    }
}

function createTimeStamp(tss_target,runningProgram,planType,targetForm){
    

    var token=window.localStorage.getItem('token')
    const myHeaders={"x-access-token":token,"Content-Type": "application/json",'access-control-allow-origin':"*"}
    
    
    
    var link="https://leadingpace.pythonanywhere.com/generateprogram"
    
    fetch(link,{
        method:'PUT',
        headers:myHeaders,
        body: JSON.stringify({"tss_target":tss_target,"runningProgram":runningProgram,"planType":planType,"targetForm":targetForm})
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
    const planType = document.querySelector("#planChooser").value
    const monthRuns = $("#planChooser").find('option:selected').data('weeklist')
    let runningProgram = monthRuns.split(",")
    const targetForm = parseInt(document.querySelector("#targetForm").innerHTML)
    if (planType == "Custom"){
        const weekOne = document.querySelector("#week1Chooser").value
        const weekTwo = document.querySelector("#week2Chooser").value
        const weekThree = document.querySelector("#week3Chooser").value
        const weekFour = document.querySelector("#week4Chooser").value

        runningProgram = [weekOne,weekTwo,weekThree,weekFour]
        
    }
    

    if (currentFitness==undefined){
        
        return alert("please visit training load page first")
    }
    const factor = targetForm+targetForm*0.19
    var tss_target = (1.116*currentFitness-0.16*currentFatigue+factor)*7.7
    alert(tss_target)
    createTimeStamp(tss_target,runningProgram,planType,targetForm)
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
    var program_duration = 4
    var program_runs_per_week = 3
    var runningProgram = response.runningProgram
    var planType = response.planType
    var programType = runningProgram
    var targetForm = response.targetForm

    var weeksDurations = response.weekDates
    
    
    var TotalStressScore = 0
    for (var week=1;week<=program_duration;week++){
        var stressScoreTarget = calculateStressScoreTarget(week,tss_target,targetForm)
        TotalStressScore =TotalStressScore+stressScoreTarget
        var weekType = programType[week-1]
        createTargetProgram(weekType,stressScoreTarget,week,program_runs_per_week,weeksDurations)
    }
    document.querySelector("#monthProgramType").innerHTML = planType
    document.querySelector("#summaryTss").innerHTML = TotalStressScore.toFixed(0)
    document.querySelector("#goalTss").innerHTML = TotalStressScore.toFixed(0)
    var percentageGoal = (tss_until_now/TotalStressScore.toFixed(0))*100
    document.querySelector("#percentageGoal").innerHTML = percentageGoal.toFixed(0) + " %"
    document.querySelector("#percentageBar").setAttribute("style",`width: ${percentageGoal.toFixed(0)}%`)
    document.querySelector("#startDate").innerHTML = startdate
    document.querySelector("#endDate").innerHTML = enddate
    document.querySelector("#currentTss").innerHTML = tss_until_now.toFixed(0)
    document.querySelector("#totalMonthDistance").innerHTML = totalMonthDistance()
    document.querySelector("#targetFormTable").innerHTML = "Target Form : "+targetForm

    
    
   
    
}

function createTargetProgram(weekType,tss_target,week,program_runs_per_week,weeksDurations){
    
    const [runType,tss_activity] = runTypePick(weekType,program_runs_per_week)

    console.log(runType,tss_activity)
    createWeekRow(week,weekType,weeksDurations,runType)
    for(var i=1;i<=program_runs_per_week;i++){
        var duration = durationCalculate(tss_activity[i-1]*tss_target,runType[i-1])

        var speed = calculateActivitySpeed(runType[i-1])
 

        var est_distance = ((duration * speed*0.98)*1000/60).toFixed(0) 
        activity = new Activity(type=runType[i-1],duration,est_distance,tss=tss_activity[i-1]*tss_target)
        console.log(activity)

        createTableRow(activity,speed)
        }

    
    
}

function runTypePick(weekType,program_runs_per_week){
    //"Aerobic","Base","Aerobic-Tempo","Easy-longRun-Tempo"
    var runType = ["Aerobic","Aerobic","Aerobic","Aerobic","Aerobic"]
    var ratioFactor = 1/program_runs_per_week
    var ratio = [ratioFactor,ratioFactor,ratioFactor,ratioFactor,ratioFactor]

    if (weekType=="Base"){
        runType = ["Base","Base","Base","Base","Base"]
        ratio = [ratioFactor,ratioFactor,ratioFactor,ratioFactor,ratioFactor]
    }
    if (weekType=="Aerobic-Tempo"){
        runType = ["Aerobic","Aerobic","Tempo","Easy","Easy"]
        ratio = [ratioFactor,ratioFactor,ratioFactor,ratioFactor,ratioFactor]
    }
    if (weekType=="Easy-LongRun-Tempo"){
        runType = ["Long run","Easy","Tempo","Easy","Easy"]
        ratio = [ratioFactor*1.20,ratioFactor*0.85,ratioFactor*0.95,ratioFactor,ratioFactor]
    }
    if (weekType=="LongRun-Aerobic"){
        runType = ["Long run","Aerobic","Aerobic","Easy","Base"]
        ratio = [ratioFactor*1.10,ratioFactor*0.95,ratioFactor*0.95,ratioFactor,ratioFactor]
    }
    if (weekType=="LongRun-Tempo-Easy"){
        runType = ["Long run","Easy","Tempo","Easy","Easy"]
        ratio = [ratioFactor*1.20,ratioFactor*0.85,ratioFactor*0.95,ratioFactor,ratioFactor]
    }
    if (weekType=="LongRun-Interval-Easy"){
        runType = ["Long run","Easy","Interval","Easy","Easy"]
        ratio = [ratioFactor*1.20,ratioFactor*0.85,ratioFactor*0.95,ratioFactor,ratioFactor]
    }
    
    return [runType,ratio]
}


function createTableRow(activity,speed){
    var table = document.querySelector("#weekplan")
    var row = document.createElement("tr")
    var color = "success"
    if (activity.type == "Interval"){
        color = "danger"
        var intervalTime = (activity.duration/3).toFixed(0)
        var intervalLowTime = (activity.duration*2/3).toFixed(0)
        var estDistance = intervalTime * speed*1000/60 + intervalLowTime *0.8* speed*1000/60
        row.innerHTML=`
        <td class="text-${color}">
            ${activity.type} 1-2 ratio
        </td>
        <td class="text-white">
            <span class="text-info">${intervalTime}</span> min at <span class="text-${color}">${speed}</span> ${metric()} speed
            and
            <span class="text-info">${intervalLowTime}</span> min at <span class="text-success">${(speed*0.8).toFixed(2)}</span> ${metric()} speed
        </td>
        <td class="text-info distanceForSum">
            ${estDistance.toFixed(0)} m
        </td>
        <td class="text-warning">
            ${activity.tss.toFixed(1)}
        </td>`
    }
    else{
        if (activity.type == "Tempo"){
            color = "warning"
        }
        if (activity.type == "Base"){
            color = "info"
        }
        if (activity.type == "Long run"){
            color = "success"
        }
        
        row.innerHTML=`
        <td class="text-${color}">
            ${activity.type}
        </td>
        <td class="text-white">
            <span class="text-info">${activity.duration}</span> min at <span class="text-${color}">${speed}</span> ${metric()} speed
        </td>
        <td class="text-info distanceForSum">
            ${activity.distance} m
        </td>
        <td class="text-warning">
            ${activity.tss.toFixed(1)}
        </td>`
    }
    

    table.appendChild(row);
}

function createWeekRow(week,runType,weeksDurations){
    var table = document.querySelector("#weekplan")
    var row = document.createElement("tr")
    row.id = `${week}`

    row.innerHTML=`
        <td>
            <h5 class="text-warning">Week   - <span class="text-info"> ${week}</span></h5>
            <p class="text-info" style="font-size:15px;">Starts at <span class="text-warning">${weeksDurations[week-1]}</span>  (${runType})</p> 
        </td>
        <td class="text-white">
        </td>
        <td class="text-info">
           
        </td>
        <td class="text-warning">
            
        </td>`
    
    table.appendChild(row);
    
    
    
}

function durationCalculate(tss,runType){

    var hour_lthr = 165
    var rest = localStorage.getItem("rest_hr")
    var maxh = localStorage.getItem("max_hr")



    if (runType == "Tempo"){
        var hr = 176
        var hrr = (hr-rest)/(maxh-rest)
        var trimp = hour_lthr * tss/100
        var duration = trimp/(hrr*0.64*Math.exp(1.92*hrr))  
    }
    if (runType == "Aerobic"){
        var hr = 169
    
        var hrr = (hr-rest)/(maxh-rest)
        var trimp = hour_lthr * tss/100
        var duration = trimp/(hrr*0.64*Math.exp(1.92*hrr))    
    }
    if (runType == "Long run"){
        var hr = 164

        var hrr = (hr-rest)/(maxh-rest)
        var trimp = hour_lthr * tss/100
        var duration = trimp/(hrr*0.64*Math.exp(1.92*hrr))     
    }
    if (runType == "Base"){
        var hr = 157
       
        var hrr = (hr-rest)/(maxh-rest)
        var trimp = hour_lthr * tss/100
        var duration = trimp/(hrr*0.64*Math.exp(1.92*hrr))     
    } 
    if (runType == "Interval"){
        var hr = 197
      
        var hrr = (hr-rest)/(maxh-rest)
        var trimp = hour_lthr * tss/100
        var duration = trimp/(hrr*0.64*Math.exp(1.92*hrr))    
    } 
    if (runType == "Easy"){
        var hr = 164
        var hrr = (hr-rest)/(maxh-rest)
        var trimp = hour_lthr * tss/100
        var duration = trimp/(hrr*0.64*Math.exp(1.92*hrr))    
    } 
    return (duration.toFixed(0))
    
}


function calculateActivitySpeed(runType){
    var speed = AerobicSpeedCalculate()
    if (runType == "Tempo"){
        var speed = TempoSpeedCalculate()
        
    }
    if (runType == "Long run"){
        var aerobicSpeed = AerobicSpeedCalculate()
        var baseSpeed = BaseSpeedCalculate()
        var speed = (parseFloat(aerobicSpeed)+parseFloat(baseSpeed))/2
        
    }
    if (runType == "Base"){
        var speed = BaseSpeedCalculate()
        
    }
    if (runType == "Easy"){
        var speed = AerobicSpeedCalculate()*0.95
        
    }
    if (runType == "Interval"){
        var speed = IntervalSpeedCalculate()
        
    }
    speed = convertMetrics(speed)
    return (speed)
}

function totalMonthDistance(){
    distanceList = document.querySelectorAll(".distanceForSum")
    var totalMonthDist = 0
    for (i=0;i<distanceList.length;i++){
        distance = distanceList[i].innerHTML
        distance = distance.replace("m", '')
        totalMonthDist = totalMonthDist + parseInt(distance)

    }
    return((totalMonthDist/1000).toFixed(2)+"Km")
}






function calculateStressScoreTarget(week,tss_target,targetForm){
    stressScoreTarget = targetForm*0.96*week+tss_target
    stressScoreTarget = stressScoreTarget
    return(stressScoreTarget)
}
function AerobicSpeedCalculate(){
    const runningIndex = localStorage.getItem("runningIndex")
    var speed=(runningIndex-5.668)/3.82
    return (speed)
}
function BaseSpeedCalculate(){
    const runningIndex = localStorage.getItem("runningIndex")
    var speed=(0.21*runningIndex) - 0.68
    return (speed)
}
function TempoSpeedCalculate(){
    const runningIndex = localStorage.getItem("runningIndex")
    var speed=(runningIndex-2.84)/3.75
    return (speed)
}
function IntervalSpeedCalculate(){
    const runningIndex = localStorage.getItem("runningIndex")
    var speed=(runningIndex * 0.2979) - 0.8774
    return (speed)
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
function metric(){
    const measurementSystem = localStorage.getItem("measurementSystem")
    if (measurementSystem == "Imperial miles/hr"){
        return ("mile/hr")
    }
    if (measurementSystem == "Imperial min/mile"){
        return ("min/mile")
    }
    if (measurementSystem == "Metric min/km"){
        return ("min/km")
    }
    else{
        return("km/hr")
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
function planChooser(){
    var planType = document.querySelector("#planChooser").value
    document.querySelector("#customCard").style = "display:none;"
    if (planType == "Custom"){
        document.querySelector("#customCard").style = ""
        document.querySelector("#week1Chooser").disabled = false
        document.querySelector("#week2Chooser").disabled = false
        document.querySelector("#week3Chooser").disabled = false
        document.querySelector("#week4Chooser").disabled = false
    }
} 

    
document.addEventListener("DOMContentLoaded",getDatabaseData)
document.querySelector("#generateProgram").addEventListener("click",tss_target)
document.querySelector("#planChooseButton").addEventListener("click",planChooser)




function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}


