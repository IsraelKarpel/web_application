# Anomalies detector web application
## Discription
Creating a web app that allow the client to detect anoamalies between 2 files.
The client upload the files, choose an alogirithm that he went to use, and then the server will return where exactly there were anomalies.

## Folders and files
The app is implemented aacording to the mvc model. which mean we have: 
* View library, which contains index.html which us the form the client will see when he will enter the app, and the showAnswer.html which used to show the anomalies inside.
* Controller library, which conatins the server.js file that in chrage of handling the client requests
* Model library, which contains the calcAnomaly.js logic of the the anomalies detector and does all the necceseary caclulates.
* In addotion. I added to csv files with values, right.csv and check.csv, in order to make the check of the app easier

## How the app looks like:
![settin image](https://github.com/IsraelKarpel/web_application/blob/5f66a0c1365ae7367c9d98ff08ee632162282a80/appDemo.png)

## Prerequisites
In order to work on the app, some moudels need to be insalled:
* npm install simple-statistics, which let us caclulates linear regression and pearson colleration.
* npm install smallest-enclosing-circle, whih help us compute the smallest circle for our hybrid algorithm.

## basic UML
![uml](https://github.com/IsraelKarpel/web_application/blob/25ab4332b4d46096ff84424421c2ab84bc6698dc/UML.png)

## How to use
Run server.js inside the controller directory, then you open localhost:8080 in your browser.
you can watch [here](https://youtu.be/713nmPH1TAs) example of basic use of this app
