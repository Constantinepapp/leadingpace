class UI {
    static callDatabase(){
        
        const api="https://leadingpace.pythonanywhere.com/traininghistory"
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
            for (var i in response.entries){
                var id=response.entries[i].id
                var date=response.entries[i].date
                var duration=response.entries[i].duration
                var distance=response.entries[i].distance
                var avgHr=response.entries[i].avgHr
                var runningIndex= response.entries[i].runningIndex
                var stressScore=response.entries[i].stressScore
                var up= response.entries[i].ascent
                var down=response.entries[i].descent
                var entry = {"id":id,"date": date,"duration":duration,"distance":distance,"avgHr":avgHr,"runningIndex":runningIndex,"stressScore":stressScore,"ascent":up,"descent":down}
                UI.showEntry(entry)
                

                if (response.message){
                    alert(response.message)
                }
            }
            
            
          }).catch(error => {
            console.error(error);
          });
    }
    
    static showEntry(entry){

        var row = document.querySelector("#exportText")
        row.setAttribute("class","text-white")
        row.innerHTML+=
        `
        <br>${formatDate(entry.date)},${entry.duration},${entry.distance},${entry.avgHr},${entry.ascent},${entry.descent},0
        `

    }

}
function readfile(){
    fileToRead = document.querySelector(".csvupload").files[0]
    getAsText(fileToRead)
}

function getAsText(fileToRead) {
    var reader = new FileReader();
    // Read file into memory as UTF-8      
    reader.readAsText(fileToRead);
    // Handle errors load
    reader.onload = loadHandler;
    reader.onerror = errorHandler;
  }

  function loadHandler(event) {
    var csv = event.target.result;
    csvJSON(csv);
  }


  function errorHandler(evt) {
    if(evt.target.error.name == "NotReadableError") {
        alert("Canno't read file !");
    }
  }


function csvJSON(csv){

    var lines=csv.split("\n");
  
    var result = [];
  
    var headers=lines[0].split(",");
  
    for(var i=1;i<lines.length;i++){
        
        var obj = {};
        var currentline=lines[i].split(",");
  
        for(var j=0;j<headers.length;j++){

            obj[headers[j]] = currentline[j];
        }
  
        result.push(obj);
  
    }
    
    
    for (var i=0;i<result.length; i++){
        result[i].runningIndex = calcRunningIndex(result[i])
        output = calcTrimpTss(result[i])
        result[i].trimp = output[0]
        result[i].tss = output[1]

        
    } ; 
    csvToDatabase(result)
}
function csvToDatabase(result){

    
    console.log(JSON.stringify(result))
    var token=window.localStorage.getItem('token')
    const myHeaders={"x-access-token":token,"Content-Type": "application/json",'access-control-allow-origin':"*"}
    
    
    
    var link="https://leadingpace.pythonanywhere.com/bulk_import"
    

    fetch(link,{
        method:'POST',
        headers:myHeaders,
        body: JSON.stringify(result)
    })

    .then(response =>{
        if (response.status === 200){
            alert("saved succesfully")
            return response.json();
        } else{
            console.log('error');
        }
    })
    .then(response =>{
        console.debug(response);
        
    })


}


function sendToDatabase(activitiesList){

    
    console.log(JSON.stringify(activitiesList))
    var token=window.localStorage.getItem('token')
    const myHeaders={"x-access-token":token,"Content-Type": "application/json",'access-control-allow-origin':"*"}
    
    
    
    var link="https://leadingpace.pythonanywhere.com/strava_import"
    
    
    fetch(link,{
        method:'POST',
        headers:myHeaders,
        body: JSON.stringify(activitiesList)
    })

    .then(response =>{
        if (response.status === 200){
            
            return response.json();
        } else{
            console.log('error');
        }
    })
    .then(response =>{
        console.debug(response);
        if (response.message){
            customAlert(response.message)
        }
        
    })


}



document.querySelector("#exportButton").addEventListener("click",UI.callDatabase)
document.querySelector("#csvSubmit").addEventListener("click",readfile)


function calcRunningIndex(entry){
    var max_hr = localStorage.getItem('max_hr')
    var x = entry.hr/max_hr*1.45-0.30
    var distance = Number(entry.distance)
    var up = Number(entry.up)
    var down = Number(entry.down)
    var d = distance + 3*up //d = distance + 6*up //- 4*down changed due to strava not provide down
    var RIO = (213.9/entry.duration) * Math.pow(d/1000,1.06) +3.5
    var runningIndex = RIO/x

    return runningIndex.toFixed(2)
}
       
function calcTrimpTss(entry){

       var rest_hr = localStorage.getItem("rest_hr")
       var max_hr = localStorage.getItem("max_hr")
       var lactate_th = localStorage.getItem("lactate_th")
       //calculate trimp and tss
       var hrr = (entry.hr-rest_hr)/(max_hr-rest_hr)
       trimp=0
       Math.round(entry.duration)
       for (var i=0;i<entry.duration;i++){
           trimp = trimp + 1 * hrr * 0.64 * Math.exp(1.92 * hrr)
       }
       
       var hr_lthr = (lactate_th - rest_hr)/(max_hr - rest_hr)
       var hour_lthr = 60 * hr_lthr * 0.64 * Math.exp(1.92 * hr_lthr)
       var tss =  (trimp/hour_lthr)*100

       return [trimp,tss.toFixed(2)]

}    

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [month, day, year].join('/');
}



document.querySelector("#logout").addEventListener("click",logout)
document.querySelector("#stravaAuth").addEventListener("click",stravaAuth)
document.addEventListener("DOMContentLoaded",checkUrl)

function checkUrl(){
    const currentUrl = window.location.href 
    const stravaStatus = localStorage.getItem("stravaConnected")
    if (stravaStatus == "true"){
        syncActivitiesAppear()
    }
    if (currentUrl.includes("code")){
        if (document.querySelector("#conectivityStatus").innerHTML == "Not connected"){
            linkToStrava()
        }

    }
}
function syncActivitiesAppear(){
    document.querySelector("#conectivityStatus").innerHTML = "Connected"
    document.querySelector("#conectivityStatus").style = "color:green"
    document.querySelector("#syncActivities").style ="border-radius: 30px; background-color:green"
    document.querySelector("#syncActivities").innerHTML ="Sync Activities"
}

function stravaAuth(){
    url = "http://www.strava.com/oauth/authorize?client_id=54636&response_type=code&redirect_uri=https://leadingpace.net/webapp/bulk.html&exchange_token&approval_prompt=force&scope=activity:read_all"
    window.open(url)
    
}

function linkToStrava(){
    const currentUrl = window.location.href 
    authCode = splitUrl(currentUrl)
    console.log(authCode)
    const token = window.localStorage.getItem("token")
    authLink = `https://leadingpace.pythonanywhere.com/strava_auth`
    const myBody = {
        authCode:authCode
    }

    const myHeaders = {
        "x-access-token":token,
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json' 
    }
    fetch(authLink,{
        method:'POST',
        headers:myHeaders,
        body: JSON.stringify(myBody)
    })

    .then(response =>{
        if (response.status === 200){
            
            return response.json();
        } else{
            console.log('error');
            
            
        }
    })
    .then(response => {
        console.debug(response);
        if (response.data){
            console.log(response)
            console.log(response.data.access_token)
            localStorage.setItem("stravaConnected",response.strava_connected)
            localStorage.setItem("stravaRefreshToken",response.data)
            syncActivitiesAppear()
            
        }
        if (response.message){
            customAlert(response.message)
        }
        
      }).catch(error => {
        console.error(error);
      });
}

 

class Activity{
    constructor(activity){
        this.id = activity.id
        this.distance = activity.distance
        const duration = activity.elapsed_time/60
        this.duration = duration.toFixed(2)
        this.date = activity.start_date_local
        this.hr = activity.average_heartrate
        if (activity.total_elevation_gain){
            this.up = activity.total_elevation_gain
        }
        else{
            this.up = 0
        }
        this.down = 0
        
    }
}
class StravaUI {
    static refreshToken(){
        const token = localStorage.getItem("token")
        const refreshTokenLink="https://leadingpace.pythonanywhere.com/strava_refresh_token"
        const refreshToken = window.localStorage.getItem("stravaRefreshToken")
        if (refreshToken=="null"){
            alert("Link strava first")
        }
        else{
            const myHeaders = {"x-access-token":token,
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json' }
            const myBody = {refreshToken:refreshToken}
    
    
            fetch(refreshTokenLink,{
                method: 'POST',
                headers: myHeaders,
                body:JSON.stringify(myBody)
            })
            .then(response =>{
                if (response.status === 200){
                    
                    return response.json();
                } else{
                    console.log('error');
                    console.log("Something Went Wrong ")
                   
                    
                    
                }
            })
            .then(response => {
                
                if (response.access_token){
                    console.log(response.access_token)
                    const accessToken = response.access_token
                    StravaUI.getActivities(accessToken)
            
                }
                if (response.message){
                    customAlert(response.message)
                }
                
              }).catch(error => {
                console.error(error);
              });
        }
        

    }
    
    static getActivities(accessToken){
        const activitiesLink = "https://www.strava.com/api/v3/athlete/activities?per_page=200"
        const myHeaders = {Authorization:`Bearer ${accessToken}`}
        document.querySelector("#syncMessage").innerHTML = "Waiting"
        fetch(activitiesLink,{
            method: 'GET',
            headers: myHeaders
        })
        .then(response =>{
            if (response.status === 200){
                
                return response.json();
            } else{
                console.log('error');
                console.log("Something Went Wrong ")
            }
        })
        .then(response =>{
            console.log(response)
            
            StravaUI.saveActivities(response)
        })
        .then(response =>{
            document.querySelector("#syncMessage").innerHTML = "Done!!!!"
        })
        
    }
    static saveActivities(activities){
        const activitiesList = []
        for (var i=0;i<activities.length-1;i++){
            if (activities[i].type == "Run"){
                if (activities[i].average_heartrate){
                    var entryForSave = new Activity(activities[i])
                    entryForSave.runningIndex = calcRunningIndex(entryForSave)
                    var output = calcTrimpTss(entryForSave)
                    entryForSave.tss = output[1]
                    entryForSave.trimp = output[0]
                    activitiesList.push(entryForSave)
                }
                
            }
        }
        if (activitiesList.length>1){
            sendToDatabase(activitiesList)
        }
        else{
            alert('Heart rate data missing')
        }
        
    }
    

}
document.querySelector("#syncActivities").addEventListener("click",StravaUI.refreshToken)

//https://leadingpace.pythonanywhere.com/

function splitUrl(url){
    str1 = url.split("=")
    str2 = str1[2]
    str3 = str2.split("&")
    str4 = str3[0]
    return (str4)
}

function customAlert(message){
    document.querySelector(".alert").setAttribute("class",`alert alert-${message[0]}`)
    document.querySelector(".alertText").innerHTML = message[1]
    setTimeout(function(){ document.querySelector(".alert").setAttribute("class","alert alert-info collapse"); }, 10000);
}
  

function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}
