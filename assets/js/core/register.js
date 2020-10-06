function signUp(){
    const email=document.getElementById('emailRegister').value
    const username=document.getElementById('usernameRegister').value
    const password=document.getElementById('passwordRegister').value
    const confirmPass=document.getElementById('confirmPasswordRegister').value

    if (confirmPass !== password){
        alert("Passwords don't match")
    }

    const myHeaders= new Headers();
    myHeaders.append('Content-Type',"application/json")
    
    var link="http://127.0.0.1:5000/register"

    

    var formData={"email":email,"password":password,"username":username}

    fetch(link,{
        method:'POST',
        headers: myHeaders,
        body: JSON.stringify(formData),
    })

    .then(response =>{
        if (response.status === 200){
            window.location.replace("login.html")
            return response.json();
        } else {
            console.log("error");
        }
    })
    .then(response =>{
        console.debug(response);
        if (response.message){
            customAlert(response.message) 
        }
    })
    
}

document.getElementById('buttonSignUp').addEventListener('click',signUp)


function customAlert(message){
    document.querySelector(".alert").setAttribute("class",`alert alert-${message[0]}`)
    document.querySelector(".alertText").innerHTML = message[1]
    setTimeout(function(){ document.querySelector(".alert").setAttribute("class","alert alert-info collapse"); }, 3000);
}




    
  