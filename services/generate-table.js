const axios = require("axios");
require("dotenv").config();
const generateTable = async (req, res) => {
    try {
        const { text : rawTableText } = req.body;

        if (!rawTableText) throw new Error("No Input found")
        const API_KEY = process.env.API_KEY;

        if (!API_KEY) throw new Error('No API Key found')
        const requestOptions = {
            headers : {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
            }
        }

        const API_URL = `https://api.openai.com/v1/engines/text-davinci-003/completions`

        const prompt = `
            Convert the below data into an HTML table with class=“flowdojo-custom-table”, show only table code and no text, no answer.

            ${rawTableText}
        `
        const payload = {
            prompt,
            temperature: 0.2,
            max_tokens: 3800,
            n: 1,
        }
        const body = JSON.stringify(payload);

        try {
            const { data } = await axios.post(API_URL, body, requestOptions);
            const responseText = data.choices[0].text.trim();
            res.status(200).json({
                success : true,
                responseText 
            });

        } catch (err) {
            console.log("error ", err.response.data.error);
            res.json({ 
                success : false,  
                error : err.response.data.error
            })
        }
    } catch (err) {
        res.json({ 
            success : false,  
            error : err.message
        })
        console.log("error ", err.message);

        
    }
 
}

module.exports = {
    generateTable
}