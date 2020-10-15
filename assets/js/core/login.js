document.querySelector("#buttonLogin").addEventListener("click",login)
//http://127.0.0.1:5000/

function login(){
    username = document.querySelector("#usernameLogin").value
    password = document.querySelector("#passwordLogin").value
    var link="http://127.0.0.1:5000/login"

    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Basic ' + btoa(username + ":" + password));

    return fetch(link,{
        method: "GET",
        headers: myHeaders,
    })

    .then(response =>{
        if (response.status === 200) {
            return response.json();
          } else {
            if (response.message){
                customAlert(response.message) 
            }
            throw new Error('Something went wrong on api server!');
          }
    })
    .then(response=>{
        console.debug(response);

        token = response.token
        max_hr = response.max_hr
        rest_hr = response.rest_hr
        lactate_th = response.lactate_th
        public_id=response.public_id
        tss_target=response.tss_target
        age=response.age
        program_start=response.program_start
        male=response.male
        stravaConnected = response.strava_connected
        stravaRefreshToken = response.strava_refresh_token
        measurementSystem = response.measurementSystem
        console.log(token)
        if (response.message){
            customAlert(response.message) 
        }
        if (response!==""){
            window.localStorage.setItem("token",token)
            window.localStorage.setItem("max_hr",max_hr)
            window.localStorage.setItem("rest_hr",rest_hr)
            window.localStorage.setItem("lactate_th",lactate_th)
            window.localStorage.setItem("tss_target",tss_target)
            window.localStorage.setItem("age",age)
            window.localStorage.setItem("program_start",program_start)
            window.localStorage.setItem("male",male)
            window.localStorage.setItem("username",username)
            window.localStorage.setItem("stravaConnected",stravaConnected)
            window.localStorage.setItem("stravaRefreshToken",stravaRefreshToken)
            window.localStorage.setItem("measurementSystem",measurementSystem)
            window.location.replace("dashboard.html")
        }
    }).catch(error => {
        if (response.message){
            customAlert(response.message) 
        }
        console.error(error);
    });
}


function customAlert(message){
    document.querySelector(".alert").setAttribute("class",`alert alert-${message[0]}`)
    document.querySelector(".alertText").innerHTML = message[1]
    setTimeout(function(){ document.querySelector(".alert").setAttribute("class","alert alert-info collapse"); }, 3000);
}

