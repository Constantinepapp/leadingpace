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
        document.querySelector("#threSpeed").innerHTML = response.threSpeed
        document.querySelector("#aerSpeed").innerHTML = response.aerobicSpeed
        document.querySelector("#intervalSpeed").innerHTML = response.intervalSpeed.toFixed(2)
        document.querySelector("#aerobicOneSpeed").innerHTML = response.aerobicOneSpeed.toFixed(2)

        localStorage.setItem("aerobicSpeed",response.aerobicSpeed)
        localStorage.setItem("tempoSpeed",response.threSpeed)        

    }
}


document.addEventListener("DOMContentLoaded",UI.callDatabase)


document.querySelector("#logout").addEventListener("click",logout)

function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}