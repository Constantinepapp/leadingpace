
function pageload(){
    document.querySelector("#rest_hr").value = localStorage.getItem("rest_hr")
    document.querySelector("#max_hr").value = localStorage.getItem("max_hr")
    document.querySelector("#username").value = localStorage.getItem("username")
    //document.querySelector("#password").placeholder = localStorage.getItem("password")
    document.querySelector("#lactate").value = localStorage.getItem("lactate_th")
    document.querySelector("#age").value = localStorage.getItem("age")
    document.querySelector("#measurementSystem").value = localStorage.getItem("measurementSystem")
    document.querySelector("#email").placeholder = localStorage.getItem("email")
    document.querySelector("#sex").value = localStorage.getItem("sex")

    if (localStorage.getItem("male")=='true'){
        document.querySelector("#sex").value = "Male"
    }
    else{
        document.querySelector("#sex").value = "Female"
    }
}



class Entry{
    constructor(){
        this.rest_hr = document.querySelector("#rest_hr").value
        this.max_hr = document.querySelector("#max_hr").value
        this.username = document.querySelector("#username").value
        this.password = document.querySelector("#password").value
        this.lactate = document.querySelector("#lactate").value
        this.age = document.querySelector("#age").value
        this.measurementSystem = document.getElementById("measurementSystem").value
        this.sex = document.getElementById("sex").value
    }
}

function saveEntryToDatabase(){
    
    var entryforUpdate = new Entry()
    
    
    

    console.log(entryforUpdate)

    var token=window.localStorage.getItem('token')
    const myHeaders={"x-access-token":token,"Content-Type": "application/json",'access-control-allow-origin':"*"}
    
    
    
    var link="https://leadingpace.pythonanywhere.com/account"
    

    fetch(link,{
        method:'PUT',
        headers:myHeaders,
        body: JSON.stringify(entryforUpdate)
    })

    .then(response =>{
        if (response.status === 200){
            alert("saved succesfully")
            localStorage.setItem("rest_hr",entryforUpdate.rest_hr )
            localStorage.setItem("max_hr",entryforUpdate.max_hr )
            localStorage.setItem("lactate_th",entryforUpdate.lactate)
            localStorage.setItem("username",entryforUpdate.username)
            localStorage.setItem("age",entryforUpdate.age)
            localStorage.setItem("measurementSystem",entryforUpdate.measurementSystem)
            logout()
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



document.addEventListener("DOMContentLoaded",pageload)
document.querySelector("#saveToDatabase").addEventListener("click",saveEntryToDatabase)

document.querySelector("#logout").addEventListener("click",logout)
function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}