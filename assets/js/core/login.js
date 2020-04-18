document.querySelector("#buttonLogin").addEventListener("click",login)


function login(){
    username = document.querySelector("#usernameLogin").value
    password = document.querySelector("#passwordLogin").value
    var link="http://leadingpace.pythonanywhere.com/login"

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
        console.log(token)
        if (response!==""){
            window.localStorage.setItem("token",token)
            window.localStorage.setItem("max_hr",max_hr)
            window.localStorage.setItem("rest_hr",rest_hr)
            window.localStorage.setItem("lactate_th",lactate_th)
            window.localStorage.setItem("tss_target",tss_target)
            window.localStorage.setItem("age",age)
            window.localStorage.setItem("program_start",program_start)
            window.localStorage.setItem("male",male)
            window.location.replace("dashboard.html")
        }
    }).catch(error => {
        console.error(error);
    });
}