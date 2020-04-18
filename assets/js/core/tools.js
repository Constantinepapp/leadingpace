var count = 0;
var button = document.getElementById("countButton");
var display = document.getElementById("displayCount");
var timer=document.getElementById("displayTime");
var beatsMinute=document.getElementById("heartRate");

var start=document.getElementById("startButton")

button.onclick = function(){
  count++;
  display.innerHTML = count;
}

var seconds = 0;
start.onclick=function (){
  setInterval(function () {
  seconds++;
  timer.innerHTML = seconds;
  beats=display.innerHTML;
  beats=parseInt(beats, 10);
  
  beatsMin=(beats/seconds)*60;
  beatsMin=parseInt(beatsMin,10);
  beatsMinute.innerHTML=beatsMin;

}, 1000);
}



document.querySelector("#logout").addEventListener("click",logout)

function logout(){
    window.localStorage.clear()
    window.location.replace("login.html")
}