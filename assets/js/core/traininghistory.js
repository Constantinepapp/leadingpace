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
            for (var i in response.entries){
                var id=response.entries[i].id
                var date=response.entries[i].date
                var duration=response.entries[i].duration
                var distance=response.entries[i].distance
                var avgHr=response.entries[i].avgHr
                var runningIndex= response.entries[i].runningIndex
                var stressScore=response.entries[i].stressScore
                var counts = response.entries[i].counts
                var entry = {"id":id,"date": date,"duration":duration,"distance":distance,"avgHr":avgHr,"runningIndex":runningIndex,"stressScore":stressScore,"counts":counts}
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
        
        var table = document.querySelector("#traininghistory")
        var row = document.createElement("tr")
        row.setAttribute("class","text-white")
        var checked = "checked"
        var averageSpeed = calcAverageSpeed(entry).toFixed(1)
        if (entry.counts == false){
            checked = ""
        }
        
        row.innerHTML=`
        <td>
            ${entry.date}
        </td>
        <td>
        ${entry.distance} <span class="text-info">m</span>
        </td>
        <td>
        ${entry.duration} <span class="text-info">min</span>
        </td>
        <td>
        ${entry.avgHr} <span class="text-info">bpm</span>
        </td>
        <td>
        ${averageSpeed} <span class="text-info"> km/hr</span>
        </td>
        <td class="text-success">
        ${entry.runningIndex}
        </td>
        <td class="text-warning">
        ${entry.stressScore}
        </td>
        <td class="text-warning">
            <div class="custom-control  custom-checkbox">
                <input type="checkbox" 
                        class="custom-control-input countsForFitness" 
                        id=${entry.id} name=${entry.id} ${checked}>
                <label class="custom-control-label" 
                        for=${entry.id}>
                </label>
            </div>
        </td>
        <td>
          <div class="btn btn-danger deleteEntry" id=${entry.id}>
            DELETE
          </div>
        </td>`

        table.appendChild(row)
        

    }

    static deleteEntry(target){
        if (target.classList.contains('deleteEntry')){
            target.parentElement.parentElement.remove()
            var id_target=target.id
            UI.deleteDatabaseEntry(id_target)
        }
    }
    static countsFitness(target){
        if (target.classList.contains('countsForFitness')){
            var checkbox = document.querySelector('.countsForFitness')
            var isChecked = checkbox.checked
            var id_target=target.id
            console.log(id_target,isChecked)
            UI.countsForFitnessDatabase(id_target,isChecked)
        }
    }

    static countsForFitnessDatabase(id_target,isChecked){
        var token=window.localStorage.getItem('token')
        
        
        const myHeaders=new Headers()
        
        myHeaders.append("Content-Type","application/json");
        myHeaders.append("x-access-token",token);
        
        var formData={"id":id_target,"counts":isChecked}
        
        var link="https://leadingpace.pythonanywhere.com/countsforfitness"
        
        fetch(link,{
            method:'PUT',
            headers:myHeaders,
            body: JSON.stringify(formData)
        })
        .then(response =>{
            if (response.status === 200){
                console.log("success")
                return response.json();
            }else{
                console.log("error");
                console.log("Token expired log in again ")
                window.localStorage.clear();
                window.location.replace("login.html")
            }
        })
        .then(response =>{
            console.log(response);


            if (response.message){
                customAlert(response.message)
            }
        })
        
    }

    
    static deleteDatabaseEntry(id_target){
        var token=window.localStorage.getItem('token')
        
        
        const myHeaders=new Headers()
        
        myHeaders.append("Content-Type","application/json");
        myHeaders.append("x-access-token",token);
        
        var formData={"id":id_target}
        
        var link="https://leadingpace.pythonanywhere.com/deleteentry"
        
        fetch(link,{
            method:'DELETE',
            headers:myHeaders,
            body: JSON.stringify(formData)
        })
        .then(response =>{
            if (response.status === 200){
                console.log("success")
                return response.json();
            }else{
                console.log("error");
                console.log("Token expired log in again ")
                window.localStorage.clear();
                window.location.replace("login.html")
            }
        })
        .then(response =>{
            console.log(response);


            if (response.message){
                customAlert(response.message)
            }
        })
        
    }


}



function calcAverageSpeed(entry){
    averageSpeed = ((entry.distance)/(entry.duration * 60))*3.6
    return averageSpeed
}

document.querySelector("#traininghistory").addEventListener("click",(e)=>{
    UI.deleteEntry(e.target);
})

document.querySelector("#traininghistory").addEventListener("change",(e)=>{
    UI.countsFitness(e.target);
})

document.addEventListener("DOMContentLoaded",UI.callDatabase)


document.querySelector("#logout").addEventListener("click",logout)

function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}


function customAlert(message){
    document.querySelector(".alert").setAttribute("class",`alert alert-${message[0]}`)
    document.querySelector(".alertText").innerHTML = message[1]
    setTimeout(function(){ document.querySelector(".alert").setAttribute("class","alert alert-info collapse"); }, 3000);
}