
class Activity{
    constructor(type,duration,distance,tss){
        this.type = type
        this.duration = duration
        this.distance = distance
        this.tss = tss
    }
}

function createTimeStamp(tss_target,runningProgram,planType,targetForm,program_runs_per_week){
    

    var token=window.localStorage.getItem('token')
    const myHeaders={"x-access-token":token,"Content-Type": "application/json",'access-control-allow-origin':"*"}
    
    
    
    var link="https://leadingpace.pythonanywhere.com/generateprogram"
    
    fetch(link,{
        method:'PUT',
        headers:myHeaders,
        body: JSON.stringify({"tss_target":tss_target,"runningProgram":runningProgram,"planType":planType,"targetForm":targetForm,"program_runs_per_week":program_runs_per_week})
    })

    .then(response =>{
        if (response.status === 200){
            localStorage.setItem("retry",0)
            window.location.reload(true)
            return response.json();
        } else{
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
    const program_runs_per_week = document.querySelector("#daysPerWeekChooser").value
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
    var form = currentFatigue-currentFitness
    alert(form)
    var tss_target = (1.116*currentFitness-0.16*currentFatigue+factor)*(7.7-form*0.03)
    //alert(tss_target)
    createTimeStamp(tss_target,runningProgram,planType,targetForm,program_runs_per_week)
}   




//Show running program


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

////////////////////// CORE UI FUNCTIONS /////////////////////////////////////////////////////
function showRunningProgram(response){

    var startdate = response.program_start
    var enddate = response.program_ends
    var tss_target = response.tss_target
    var tss_until_now = response.tss_until_now
    var program_duration = 4
    var program_runs_per_week = response.program_runs_per_week
    var runningProgram = response.runningProgram
    var planType = response.planType
    var programType = runningProgram
    var targetForm = response.targetForm
    var weeksDurations = response.weekDates
    

    //This section creates the running program
    var TotalStressScore = 0
    for (var week=1;week<=program_duration;week++){
        var stressScoreTarget = calculateStressScoreTarget(week,tss_target,targetForm)
        TotalStressScore =TotalStressScore+stressScoreTarget
        var weekType = programType[week-1]
        createTargetProgram(weekType,stressScoreTarget,week,program_runs_per_week,weeksDurations)
    }
    //This section creates the running program


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

//this function creates every week
function createTargetProgram(weekType,tss_target,week,program_runs_per_week,weeksDurations){
    
    const [runType,tss_activity] = runTypePick(weekType,program_runs_per_week)

    console.log(runType,tss_activity)
    createWeekRow(week,weekType,weeksDurations,runType)
    for(var i=1;i<=program_runs_per_week;i++){
        var duration = durationCalculate(tss_activity[i-1]*tss_target,runType[i-1])

        var {speedOriginal,speed} = calculateActivitySpeed(duration,runType[i-1])
 
        var est_distance = distanceEstimation (duration,speedOriginal)
        
        activity = new Activity(type=runType[i-1],duration,est_distance,tss=tss_activity[i-1]*tss_target)
        console.log(activity)

        createTableRow(activity,speed,speedOriginal)

        }

    
    
}

function createTableRow(activity,speed,speedOriginal){
    var table = document.querySelector("#weekplan")
    var row = document.createElement("tr")
    var color = "success"
    const measurementSystem = localStorage.getItem("measurementSystem")
    if (activity.type == "Interval"){
        color = "danger"
        var intervalTime = (activity.duration/3).toFixed(0)
        var intervalLowTime = (activity.duration*2/3).toFixed(0)
        
        var estDistance = intervalTime * speedOriginal*1000/60 + intervalLowTime *0.8* speedOriginal*1000/60
        if (measurementSystem == "Imperial min/mile"){
            estDistance = estDistance/1000 *0.60
        }
        if (measurementSystem == "Imperial mile/hr"){
            estDistance = estDistance/1000 *0.60
        }
        row.innerHTML=`
        <td class="text-${color}">
            ${activity.type} 1-2 ratio
        </td>
        <td class="text-white">
            <span class="text-info">${intervalTime}</span> min at <span class="text-${color}">${speed}</span> ${metric()} speed
            and
            <span class="text-info">${intervalLowTime}</span> min at <span class="text-success">${convertMetrics(speedOriginal*0.8)}</span> ${metric()} speed
        </td>
        <td class="text-info distanceForSum">
            ${estDistance.toFixed(2)} m
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
        <td style="background-color:#444444;">
            <h5 class="text-warning">Week   - <span class="text-info"> ${week}</span></h5>
        
        </td>
        <td class="text-white" style="background-color:#444444;">
        <p class="text-info" style="font-size:15px;">Starts at <span class="text-warning">${weeksDurations[week-1]}</span>  (${runType})</p> 
        </td>
        <td class="text-info" style="background-color:#444444;">
           
        </td>
        <td class="text-warning" style="background-color:#444444;">
            
        </td>`
    
    table.appendChild(row);
    
    
    
}

////////////////////// CORE UI FUNCTIONS /////////////////////////////////////////////////////




////////////////////// SECONDARY FUNCTIONS //////////////////////////////////////////////////

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
        runType = ["Long run","Aerobic","Aerobic","Easy","Easy"]
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





function durationCalculate(tss,runType){

    
    var rest = localStorage.getItem("rest_hr")
    var maxh = localStorage.getItem("max_hr")
    var lactate = localStorage.getItem("lactate_th")
    var male = localStorage.getItem("male")
    var k = 1.92
    if (male=="false"){
        k = 1.67
    }
    
    var hthr = (lactate-rest)/(maxh-rest)
    var hour_lthr = 60 * hthr *0.64* Math.exp(k*hthr)
    var reserve = maxh - rest

    console.log(hthr,hour_lthr,k)


    
    if (runType == "Aerobic"){
        var hr = 0.857868*maxh///parseInt(rest) + reserve * 0.80
    
        var hrr = (hr-rest)/(maxh-rest)
        var trimp = hour_lthr * tss/100
        var duration = trimp/(hrr*0.64*Math.exp(k*hrr))    
    }
    if (runType == "Tempo"){
        var hr = 0.8934*maxh////parseInt(rest) + reserve * 0.85
        
        var hrr = (hr-rest)/(maxh-rest)
        var trimp = hour_lthr * tss/100
        var duration = trimp/(hrr*0.64*Math.exp(k*hrr))  
    }
    if (runType == "Long run"){
        var hr = 0.8071*maxh

        var hrr = (hr-rest)/(maxh-rest)
        var trimp = hour_lthr * tss/100
        var duration = trimp/(hrr*0.64*Math.exp(k*hrr))     
    }
    if (runType == "Base"){
        var hr = 0.7614*maxh//parseInt(rest) + reserve * 0.70
       
        var hrr = (hr-rest)/(maxh-rest)
        var trimp = hour_lthr * tss/100
        var duration = trimp/(hrr*0.64*Math.exp(k*hrr))     
    } 
    if (runType == "Interval"){
        var hr = maxh
      
        var hrr = (hr-rest)/(maxh-rest)
        var trimp = hour_lthr * tss/100
        var duration = trimp/(hrr*0.64*Math.exp(k*hrr))    
    } 
    if (runType == "Easy"){
        var hr = maxh*0.83
        var hrr = (hr-rest)/(maxh-rest)
        var trimp = hour_lthr * tss/100
        var duration = trimp/(hrr*0.64*Math.exp(k*hrr))    
    } 
    return (duration.toFixed(2))
    
}


function calculateActivitySpeed(duration,runType){
    var speed = AerobicSpeedCalculate(duration)
    if (runType == "Tempo"){
        var speed = TempoSpeedCalculate(duration)
        
    }
    if (runType == "Long run"){
        var aerobicSpeed = AerobicSpeedCalculate(duration)
        var baseSpeed = BaseSpeedCalculate(duration)
        var speed = (parseFloat(aerobicSpeed)+parseFloat(baseSpeed))/2
        
    }
    if (runType == "Base"){
        var speed = BaseSpeedCalculate(duration)
        
    }
    if (runType == "Easy"){
        var speed = AerobicSpeedCalculate(duration)*0.95
        
    }
    if (runType == "Interval"){
        var speed = IntervalSpeedCalculate(duration)
        
    }
    speedConvert = convertMetrics(speed)
    return ({"speedOriginal":speed.toFixed(2),"speed":speedConvert})
}


function distanceEstimation (duration,speed){
    const measurementSystem = localStorage.getItem("measurementSystem")
    var est_distance = ((duration * speed)*1000/60).toFixed(0) 
    if (measurementSystem == "Imperial mile/hr"){
        est_distance = (est_distance/1000)*0.621371192
        return(est_distance.toFixed(2))
    }
    if (measurementSystem == "Imperial min/mile"){
        est_distance = (est_distance/1000)*0.621371192
        return(est_distance.toFixed(2))
    }
    else{
        return(est_distance)
    }
}

function totalMonthDistance(){
    distanceList = document.querySelectorAll(".distanceForSum")
    const measurementSystem = localStorage.getItem("measurementSystem")

    if (measurementSystem == "Imperial mile/hr"){
        var totalMonthDist = 0
        for (i=0;i<distanceList.length;i++){
            distance = distanceList[i].innerHTML
            distance = distance.replace("m", '')
            totalMonthDist = totalMonthDist + parseFloat(distance)
        }
        return(totalMonthDist.toFixed(2)+" Miles")
    }
    if (measurementSystem == "Imperial min/mile"){
        var totalMonthDist = 0
        for (i=0;i<distanceList.length;i++){
            distance = distanceList[i].innerHTML
            distance = distance.replace("m", '')
            totalMonthDist = totalMonthDist + parseFloat(distance)
        }
        return(totalMonthDist.toFixed(2)+" Miles")
    }
    else{
        var totalMonthDist = 0
        for (i=0;i<distanceList.length;i++){
            distance = distanceList[i].innerHTML
            distance = distance.replace("m", '')
            totalMonthDist = totalMonthDist + parseInt(distance)

        }
        return((totalMonthDist/1000).toFixed(2)+" Km")
    }
    
}

function calculateStressScoreTarget(week,tss_target,targetForm){
    stressScoreTarget = targetForm*0.96*week+tss_target
    stressScoreTarget = stressScoreTarget
    return(stressScoreTarget)
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

////////////////////// SECONDARY FUNCTIONS //////////////////////////////////////////////////




////////////////////// HELPER FUNCTIONS //////////////////////////////////////////////////


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
    if (measurementSystem == "Imperial mile/hr"){
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


    
document.addEventListener("DOMContentLoaded",getDatabaseData)
document.querySelector("#generateProgram").addEventListener("click",tss_target)




function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}


