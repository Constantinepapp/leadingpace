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
    //var link="http://leadingpace.pythonanywhere.com/user"
    var link="http://leadingpace.pythonanywhere.com/register"

    

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
        if (response.message=="new user is created"){
            alert('Account has been created, You are ready to log in ')
        }
        if (response.message=="user already exists"){
            alert('User already exists')
        }
    })
    
}

document.getElementById('buttonSignUp').addEventListener('click',signUp)