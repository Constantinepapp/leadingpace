$(window).on("load",function(){
    $(".loader-wrapper").fadeOut(2000);
  })


$("#syncActivities").on("click",function(){
  $(".loader-wrapper").fadeIn(1000);
  $(".loader-wrapper").fadeOut(5000);
})
