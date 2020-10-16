function sendMail(){
    const email=document.getElementById('emailReset').value
    const myHeaders= new Headers();
    myHeaders.append('Content-Type',"application/json")
        
    var link="https://leadingpace.pythonanywhere.com/password_reset"
    
        
    
    var formData={"email":email}
        
    fetch(link,{
        method:'POST',
        headers: myHeaders,
        body: JSON.stringify(formData),
    })
    
    .then(response =>{
        if (response.status === 200){
            window.location.replace("passwordreset.html")
            return response.json();
        } else {
            console.log("error");
        }
    })
    .then(response =>{
        console.debug(response);
        if (response.message){
            window.location.replace("passwordreset.html")
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



