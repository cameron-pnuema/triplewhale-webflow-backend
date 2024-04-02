var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
const cors = require("cors");

var app = express();
const PORT = process.env.PORT || 8080;
const axios = require("axios");
const {generateTable} = require('./services/generate-table');


// Allow requests from all origins (for testing purposes)

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.triplewhale.com');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});



app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const API_KEY = process.env.API_KEY;

app.post("/generate-response", async (req, res) => {
  const { prompt: promptText } = req.body;
  const API_URL =
    "https://api.openai.com/v1/engines/text-davinci-003/completions";

  const payload = {
    prompt: promptText,
    temperature: 0.2,
    max_tokens: 3800,
    n: 1,
  };

  const requestOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  const body = JSON.stringify(payload);

  try {
    const { data } = await axios.post(API_URL, body, requestOptions);
    const responseText = data.choices[0].text.trim();

    res.status(200).json({ responseText });
  } catch (err) {
    console.log("error ", err.response.data.error);
  }

});


// send notification on slack that the above API failed for some reason
app.post("/notify-slack", async function (req, res, next) {
  const WEBHOOK_URL = process.env.WEBHOOK_URL
  try {
    const response = await axios.post(WEBHOOK_URL, {
      text: "Ecom API Failed",
    });

    if (response.status === 200) {
      res.status(200).json({
        message: "Slack Notification Sent",
      });
    } else {
      res.status(400).json({
        error: "Slack Notification Sent",
      });
    }
  } catch (error) {
    res.status(400).json({
      error: "Slack Notification Sent " + error.message,
    });
  }
});


/**
 *  Custom Table Generator 
*/

app.post("/create-table", generateTable)

app.get("/", (req, res) => {
  res.status(200).json({ message: "Triple Whale ChatGPT Project Running" });
});

var listener = app.listen(PORT, function () {
  console.log("Listening on port " + listener.address().port);
});

// var express = require("express");
// var cookieParser = require("cookie-parser");
// var logger = require("morgan");
// require("dotenv").config();
// const cors = require("cors");

// var app = express();
// const PORT = process.env.PORT || 8080;
// const axios = require("axios");
// const { generateTable } = require('./services/generate-table');

// app.use(cors());
// app.use(logger("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());

// const API_KEY = process.env.API_KEY;

// app.post("/generate-response", async (req, res) => {
//   const { prompt: promptText } = req.body;
//   const API_URL = "https://api.openai.com/v1/engines/text-davinci-003/completions";

//   const payload = {
//     prompt: promptText,
//     temperature: 0.2,
//     max_tokens: 3800,
//     n: 1,
//   };

//   const requestOptions = {
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${API_KEY}`,
//     },
//   };

//   try {
//     const { data } = await axios.post(API_URL, payload, requestOptions); // You can directly pass payload without stringify when using axios
//     const responseText = data.choices[0].text.trim();
//     res.status(200).json({ responseText });
//   } catch (err) {
//     console.error("Error: ", err.response ? err.response.data.error : err.message);
//     res.status(500).json({ error: "Internal Server Error" }); // Send back an appropriate error message
//   }
// });

// app.post("/notify-slack", async function (req, res) {
//   const WEBHOOK_URL = process.env.WEBHOOK_URL;
//   try {
//     const response = await axios.post(WEBHOOK_URL, {
//       text: "Ecom API Failed",
//     });

//     if (response.status === 200) {
//       res.status(200).json({
//         message: "Slack Notification Sent",
//       });
//     } else {
//       // This block might be unnecessary because axios throws an error for non-2xx responses
//       res.status(400).json({
//         error: "Failed to send Slack Notification",
//       });
//     }
//   } catch (error) {
//     console.error("Slack Notification Error: ", error.message);
//     res.status(400).json({
//       error: "Failed to send Slack Notification: " + error.message,
//     });
//   }
// });

// app.post("/create-table", generateTable);

// app.get("/", (req, res) => {
//   res.status(200).json({ message: "Triple Whale ChatGPT Project Running" });
// });

// var listener = app.listen(PORT, function () {
//   console.log("Listening on port " + listener.address().port);
// });

