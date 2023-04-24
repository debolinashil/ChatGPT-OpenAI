const express = require("express");
const bodyparser = require("body-parser");
const https = require("https");
const openai = require('openai');
const dotenv = require("dotenv");

dotenv.config();
openai.apikey = process.env.OPENAI_API_KEY;

const app = express();
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended: true}));

const url = "https://api.openai.com/v1/chat/completions";

const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openai.apiKey}`
    }
  };


const PORT = process.env.PORT || 3000;

app.get("/", (req,res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/", (req, res) => {
    var chatGPT;
    const userText = req.body.chatText;
    const openaiData = {
        model: "gpt-3.5-turbo",
        messages: [
            {role: "user", content: userText}
        ]
    };
    const jsonOpenaiData = JSON.stringify(openaiData);

    const request = https.request(url, options, (response)=>{
        let data="";
        response.on("data", (chunk)=>{
            data+=chunk;
            // console.log(data);
        })
        response.on("end", ()=>{
            const resData = JSON.parse(data);
            // console.log(resData);
            const openaiResponse = resData.choices[0].message.content;
            chatGPT = generateHtml(userText, openaiResponse);
            // console.log(chatGPT);
            // res.send("<p>" + chatGPT + "</p>");
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(chatGPT);
        });
    });
    request.on('error', (error) => {
        console.error(error);
    });
    request.write(jsonOpenaiData);
    request.end();
      
});

app.listen(PORT, ()=>{
    console.log("Server is running on " + PORT);
});


function generateHtml(userQuery, message) {
    return `
      <html>
        <head>
          <title>OpenAI Chat Response</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #ffe600;
            }
            .container1 {
              color: #fff;
              max-width: 800px;
              margin: 0 auto;
              margin-bottom: 20px;
              padding: 20px;
              background-color: #202020;
              box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
            }
            .container2 {
                max-width: 800px;
                margin: 0 auto;
                margin-bottom: 20px;
                padding: 20px;
                background-color: #202020;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
            }
            h3 {
              color: #a3a0a0;
              font-size: 15px;
              margin-top: 0;
            }
            p {
              color: #fff;
              font-size: 16px;
              line-height: 1.5;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container1">
            <h3>Your query</h3>
            <p>${userQuery}</p>
          </div>
          <div class="container2">
            <h3>OpenAI Chat Response</h3>
            <p>${message}</p>
          </div>
        </body>
      </html>
    `;
}