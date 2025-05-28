
import axios from 'axios';


const cookie = "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTU1OTc3LCJ1c2VybmFtZSI6ImhpYmVub3VrIiwic29mdF9pc19hZG1pbiI6ZmFsc2UsInNvZnRfaXNfYmFubmVkIjpmYWxzZSwiY2FtcHVzX25hbWUiOiJLaG91cmliZ2EiLCJpYXQiOjE3NDgzNDgxMTUsImV4cCI6MTc0ODM0ODQxNX0.bBfeeFrhSj15NCgZxvg7i5NeJDu78cYXGUL8MVSlFog; refresh=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTU1OTc3LCJ1c2VybmFtZSI6ImhpYmVub3VrIiwidG9rZW5fc2VxIjoxLCJpYXQiOjE3NDgzNDgxMTUsImV4cCI6MTc0ODM1NTMxNX0.0xX9FIRNY5FnVShQi7BzMj1ultMQo521sqHXqxf-tXo"

const body = {
    "color": 4,
    "x": 28,
    "y": 269
}
// 28:269

const url = "https://ftplace.42lausanne.ch/api/set"




const api = axios.create({
    headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie,
    },
})


for (let i = 0; i < 10; i++) {

    body.x += 1;

    api.post(url, body).then((response) => {

        console.log("Response:", response.data);
    }).catch((error) => {

        if (error.response) {
            // The request was made and the server responded with a status code
            console.error("Error response data:", error.response.data);
            console.error("Error response status:", error.response.status);
            console.error("Error response headers:", error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("Error request data:", error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error message:", error.message);
        }
    })

    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before the next request
}
