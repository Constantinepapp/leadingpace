function sendMail(){
    const password=document.getElementById('newPassword').value
    const token = document.getElementById('token').value
    
    const myHeaders={"x-access-token":token,"Content-Type": "application/json",'access-control-allow-origin':"*"}
        
    var link="http://127.0.0.1:5000/new_password"
    
        
    
    var formData={"password":password}
        
    fetch(link,{
        method:'PUT',
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

document.getElementById('passwordReset').addEventListener('click',sendMail)


function customAlert(message){
    document.querySelector(".alert").setAttribute("class",`alert alert-${message[0]}`)
    document.querySelector(".alertText").innerHTML = message[1]
    setTimeout(function(){ document.querySelector(".alert").setAttribute("class","alert alert-info collapse"); }, 3000);
}



