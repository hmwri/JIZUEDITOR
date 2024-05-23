import {OpenAI} from "openai"
import {OPENAI_API_KEY} from "./ignore/apikey";


const openai = new OpenAI({
    dangerouslyAllowBrowser: true,
    apiKey: OPENAI_API_KEY // 先程取得したAPI KEY
})
const message = "GPTに聞きたいメッセージ"


let context :  OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []

async function ask(prompt: string) {
        context.push(
            {
                "role" : "user",
                "content" : prompt
            }
        )




    const completion = await openai.chat.completions.create({
        model: "gpt-4o", // 使いたいGPTのModel
        messages: [
            {
                "role" : "system",
                "content" : "You are a helpful assistant.　あなたはユーザーとチャットをしています。なお、ユーザーが考え中のときは、<<USER THINKING>>と入力されます。その際は、ユーザーの思考を広げるような返答をしてください。返答はできるだけ短くしてね ",
            },
            ...context,
        ],
    });


    let res = completion.choices[0].message.content

    context.push(
        {
            "role" : "assistant",
            "content" : res
        }
    )

    return res


}

let userStopTime = 0
let lastResponseLength = 30
let isLast = false

function update() {
    console.log(userStopTime)
    userStopTime += 1
    if(userStopTime > lastResponseLength / 6) {
        onUserStop();
        userStopTime = 0
    }
}

async function main() {
    setInterval(
        update,
        1000
    )
}


window.addEventListener("load", main)
document.getElementById('sendButton').addEventListener('click', function() {
    sendMessage();
});

document.getElementById('chatInput').addEventListener('keypress', function(event) {

    if (event.key === 'Enter') {
        isLast = false
        sendMessage();
    }
});

document.getElementById('chatInput').addEventListener('compositionstart', function(event) {
    userStopTime = 0
    console.log("here")
});

async function sendMessage() {
    const input = document.getElementById('chatInput') as HTMLInputElement;
    const message = input.value.trim();
    userStopTime = 0

    if (message !== '') {
        displayMessage(message, 'sent');
        input.value = '';
        // Simulate a response from the chat bot
        setGPTAnswer(message)
    }
}

async function setGPTAnswer(message : string) {
    let box = displayThinking()
    let res = await ask(message)
    lastResponseLength = res.length
    box.remove()
    displayMessage(res, 'received');
}


function onUserStop() {
    if(!isLast) {
        isLast = true
        setGPTAnswer("<<USER THINKING>>")
    }

}

function displayMessage(message :string, type : string) {
    const messageContainer = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function displayThinking() {
    const messageContainer = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `message received`;
    messageElement.textContent = "・・・";
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
    return messageElement
}



function HideThinking() {

}

