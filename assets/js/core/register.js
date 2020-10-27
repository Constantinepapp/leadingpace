function signUp(){
    const email=document.getElementById('emailRegister').value
    const username=document.getElementById('usernameRegister').value
    const password=document.getElementById('passwordRegister').value
    const confirmPass=document.getElementById('confirmPasswordRegister').value
    const male=document.getElementById('sexRegister').value
    const age=document.getElementById('ageRegister').value
    

    passwordChecked = passwordCheck(password,confirmPass)

    if (passwordChecked==true){
        const myHeaders= new Headers();
        myHeaders.append('Content-Type',"application/json")
        
        var link="https://leadingpace.pythonanywhere.com/register"
    
        
    
        var formData={"email":email,"password":password,"username":username,"age":age,"male":male}
    
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


}

document.getElementById('buttonSignUp').addEventListener('click',signUp)
function passwordCheck(password,confirmPass){
    if (password.length<8){
        customAlert(["danger","Password too short"])
        return(false)
    }
    if (password != confirmPass){
        customAlert(["danger","Passwords don't match"])
        return(false)
    }
    return(true)

}

function customAlert(message){
    document.querySelector(".alert").setAttribute("class",`alert alert-${message[0]}`)
    document.querySelector(".alertText").innerHTML = message[1]
    setTimeout(function(){ document.querySelector(".alert").setAttribute("class","alert alert-info collapse"); }, 3000);
}




    
  