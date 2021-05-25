const express = require("express")
const fileUpload = require("express-fileupload")
const fs = require("fs")
const moudle = require("../model/calcAnomaly")
const readline = require('readline');
const { json } = require("express");

const app = express()
app.use(express.urlencoded({
    extended: false
}))

app.use(fileUpload())
app.use(express.static("../view"))

app.get("/",(req, res)=> {
    res.sendFile("./index.html")
})

app.post("/detect",async (req,res)=>{
    if (req.files){
        //reading the right csv
        var right_file = req.files.right_file
        //reading the check csv
        var check_file = req.files.check_file
        //reads the algo choice of the user
        var anomaly_chose = req.body.pick_algorithms
        anomalies = moudle.calculateAnomaly(right_file.data.toString(), check_file.data.toString(), anomaly_chose)
        colunm_names = moudle.getColumnName(right_file.data.toString())
        answer_string = await (async function() {    
            answerString = ""
            const fileStream = fs.createReadStream('../view/showAnswer.html');    
            const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
            });
            var count = 1
            for await (const line of rl) {
            if (count != 19) {
                answerString = answerString.concat(" ", `${line}`)        
                count++
            } else {
                anomalies_as_strings = JSON.parse(anomalies)
                answerString = answerString.concat(" ", "<table style='width:100%'>\n<tr>\n<th>Columns Names")
                answerString = answerString.concat(" ", "</th>\n<th>Index where there is an anomally</th>\n</tr>\n")
                for (let i = 0; i < colunm_names.length; i++) {
                    answerString = answerString.concat(" ", "<tr>" + "\n" + "<th>" +  colunm_names[i] + "</th>")
                    answerString = answerString.concat(" ","<th>" + anomalies_as_strings[colunm_names[i]])
                    answerString = answerString.concat(" ", "</th>\n </tr>\n")
                }
                count++
                answerString = answerString.concat(" ", "</table>\n")
            }
        }
        return answerString
        })();
      
        res.write(answer_string.toString())
        res.end()
    } else {
        res.write("Missing File/s")
        res.end()
    }})

app.listen(8080)
