
class Entry{
    constructor(email){
        this.subject = document.querySelector("#subjectPicker").value
        this.body = document.querySelector("#messageBody").value +"                 Send by       " +email
        
    }
}
class UI{

    static sendMessage(){
        const email = localStorage.getItem("email")
        var messageForSend = new Entry(email)
        

        
        console.log(messageForSend)

        var token=window.localStorage.getItem('token')
        const myHeaders={"x-access-token":token,"Content-Type": "application/json",'access-control-allow-origin':"*"}
        
        

        
        var link="https://leadingpace.pythonanywhere.com/contact"
        
        if (messageForSend.body.length>10){
            fetch(link,{
                method:'POST',
                headers:myHeaders,
                body: JSON.stringify(messageForSend)
            })
        
            .then(response =>{
                if (response.status === 200){
                    localStorage.setItem("retry",0)
                    return response.json();
                } else{
                    localStorage.setItem("retry",parseInt(localStorage.getItem("retry"))+1)
                    if (parseInt(localStorage.getItem("retry"))<3){
                      
                        setTimeout(function (){UI.callDatabase()}, 2000)  
                    }
                    else{
                      console.log("Token expired log in again ")
                      window.localStorage.clear();
                      window.location.replace("login.html")
                      throw new Error('Something went wrong on api server!');
                    }
                }
            })
            .then(response =>{
                console.log(response.message)
                console.debug(response);
                
            })
        }
        else{
            alert("message too short")
        }
        
    
    
    }
    
    
}

document.querySelector("#sendMessage").addEventListener("click",UI.sendMessage)





document.querySelector("#logout").addEventListener("click",logout)

function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}