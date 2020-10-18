

function calcRunningIndex(entry){
    var max_hr = localStorage.getItem('max_hr')
    var x = entry.hr/max_hr*1.45-0.30
    var d = Number(entry.distance) + Number(6*entry.up - 4*entry.down)
    var RIO = (213.9/entry.time) * Math.pow(d/1000,1.06) +3.5
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
       Math.round(entry.time)
       for (var i=0;i<entry.time;i++){
           trimp = trimp + 1 * hrr * 0.64 * Math.exp(1.92 * hrr)
       }
       
       var hr_lthr = (lactate_th - rest_hr)/(max_hr - rest_hr)
       var hour_lthr = 60 * hr_lthr * 0.64 * Math.exp(1.92 * hr_lthr)
       var tss =  (trimp/hour_lthr)*100
       
       return [trimp,tss.toFixed(2)]

}    


class Entry{
    constructor(){
        this.subject = document.querySelector("#subjectPicker").value
        this.body = document.querySelector("#messageBody").value
    }
}
class UI{

    static sendMessage(){
        var messageForSend = new Entry()
        

   
        console.log(messageForSend)

        var token=window.localStorage.getItem('token')
        const myHeaders={"x-access-token":token,"Content-Type": "application/json",'access-control-allow-origin':"*"}
        
        
        
        var link="https://leadingpace.pythonanywhere.com/contact"
        
    
        fetch(link,{
            method:'POST',
            headers:myHeaders,
            body: JSON.stringify(messageForSend)
        })
    
        .then(response =>{
            if (response.status === 200){
                return response.json();
            } else{
                console.log('error');
                console.log("Token expired log in again ")
                window.localStorage.clear();
                window.location.replace("login.html")
                
            }
        })
        .then(response =>{
            console.log(response.message)
            console.debug(response);
            
        })
    
    
    }
    
    
}

document.querySelector("#sendMessage").addEventListener("click",UI.sendMessage)





document.querySelector("#logout").addEventListener("click",logout)

function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}