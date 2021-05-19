# Documentation

## Table of content

* **Functionality**
    1. [Disclaimer](#Disclaimer)
    1. [The app](#The-app)
    1. [Running Index-VO2max](#Running-Index-VO2max)
    1. [Fitness-Fatigue](#Fitness-Fatigue)
    1. [Running Program](#Running-Program)
    1. [Training Zones](#Training-Zones)



     
* **Code documentation**
    1. [Stack](Stack)
        1. Front end
        1. Back end
        1. Database
        1. Strava external API
    1. Function
    1. New App (React)

## Disclaimer

Leading pace is created,owned and maintained by Konstantinos Pappas. 

## The app 

This is the version 2.4.2 of the Leading Pace Running analytics app. The app is currently at the version 3 with a new repository and a completely new react front end.

Leading pace is a running metrics and analytics app. The app collects your training data, calculates your VO2max running performance and generates a personalized running program depending on your fitness, fatigue levels and current training.

The app currently supports imports using the strava api.

## Running Index-VO2max

VO2 max (also maximal oxygen consumption, maximal oxygen uptake, peak oxygen uptake or maximal aerobic capacity) is the maximum rate of oxygen consumption measured during incremental exercise. VO2max is only measured in labs using using special equipment. However there are various ways to get a rough estimation of Vo2max with maximum or submaxial tests. In this app VO2max is estimated using submaxial methods using your past activities data (speed,heart rate) and elevation changes in order to predict your performance in maximal tests or workouts.

Both VO2max and Performance idex are calculated using your speed,elevation and heart rate data.Higher Performance index means that you are running faster in the same heart rate zone or that you have a lower heart rate in the same speed.

Heart rate deviations may appear due to other reasons as rest and nutrition changes, stress or even temperature changes so the app uses a weighted average of your last 10 activities to meassure your index

## Fitness-Fatigue

Raw stress (fatigue) is the raw stress accumulation from your past activities not taking into account your fitness levels. it is the linked with the activities stress. It represents your activity stress levels from the past 10-15 days
Fitness is an indication of the cumulative effects that training has had over time. It represents the activity stress levels from the past 2 months.Both fitness and raw stress are weighted average values of your past activities stress scores
Perceived stress (form) is the difference between raw stress and fitness. It represents your actual fatigue levels taking into account not only the raw strees but also your fitness. As your fitness rises you have to train harder to keep perceived stress in the same negative value

## Running Program

Leading pace takes into account your VO2max estimation heart rate zones,running paces and current fatigue-fitness from the training load page.Using this data it calculates the target stress score you need to achieve in the next month in order your form to be consistent to form target value ( -10 by default ). The accuracy is higher for the first and second week and drops a little for the last two weeks. 

The estimation of the second,third and forth week will only be accurate if you achive your goal in the last week. However small deviations (<10%) in your last weeks goal won't be a problem.

As your VO2max and your running paces change the estimated paces and distances for future workouts will also be recalculated to your current aerobic fitness so it is normal your workout's pace and distance to change. Tss will stay the same

This formula is based on fitness-fatigue curve which is based on scientific stats but it has it's flaws. So follow the program but listen to your body needs. It is adviced after every monthly program to have a "lighter" week to avoid injury before you start a new months program

If you are a begiener in running and you are not used to run for 10 or more minutes straight it is adviced to run-walk on your first weeks. In order to stay in the correct zones run at a little higher speed than your goal to counterbalance your walking paces.


## Training Zones

Training zones in this app are calculated using the karvonen formula.The Karvonen Formula is a mathematical formula that helps you determine your target heart rate (HR) training zone. The formula uses maximum and resting heart rate with the desired training intensity to get a target heart rate.Target Heart Rate = [(max HR − resting HR) × %Intensity] + resting HR example

Training speeds in each zone are calculated using your weighted average VO2max from your last 10 activities


