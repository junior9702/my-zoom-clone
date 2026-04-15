const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer()
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
let myStream

const myName = prompt("What is your name?") || "Guest"

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myStream = stream
    
    // START WITH MIC AND CAMERA OFF (Performance/Privacy)
    myStream.getAudioTracks()[0].enabled = false
    myStream.getVideoTracks()[0].enabled = false

    addVideoStream(myVideo, stream, myName)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream, "Participant Joined")
        })
    })

    socket.on('user-connected', (userId, userName) => {
        appendMessage(`${userName} joined the meeting`, "System")
        connectToNewUser(userId, stream, userName)
    })
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id, myName)
})

function connectToNewUser(userId, stream, userName) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream, userName)
    })
    call.on('close', () => { video.remove() })
    peers[userId] = call
}

function addVideoStream(video, stream, name) {
    const div = document.createElement('div')
    div.className = 'video-box'
    const tag = document.createElement('div')
    tag.className = 'name-tag'
    tag.innerText = name
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => video.play())
    div.append(video)
    div.append(tag)
    videoGrid.append(div)
}

// Features
const chatForm = document.getElementById('chat-form')
const chatInput = document.getElementById('chat-input')
const messages = document.getElementById('chat-messages')

chatForm.addEventListener('submit', e => {
    e.preventDefault()
    if (chatInput.value) {
        socket.emit('message', chatInput.value)
        appendMessage(chatInput.value, "Me")
        chatInput.value = ''
    }
})

socket.on('createMessage', (msg, userName) => {
    if (userName !== myName) appendMessage(msg, userName)
})

document.getElementById('hand-btn').addEventListener('click', () => {
    socket.emit('raise-hand')
})

socket.on('user-raised-hand', (userName) => {
    const li = document.createElement('li')
    li.style.color = "#f1c40f"
    li.innerHTML = `<b>✋ ${userName} raised hand!</b>`
    messages.append(li)
    messages.scrollTop = messages.scrollHeight
})

function appendMessage(msg, sender) {
    const li = document.createElement('li')
    li.innerHTML = `<b>${sender}:</b> ${msg}`
    messages.append(li)
    messages.scrollTop = messages.scrollHeight
}

// Control Buttons
document.getElementById('mute-btn').addEventListener('click', () => {
    const enabled = myStream.getAudioTracks()[0].enabled
    myStream.getAudioTracks()[0].enabled = !enabled
    document.getElementById('mute-btn').innerText = enabled ? "Mute" : "Unmute"
})

document.getElementById('video-btn').addEventListener('click', () => {
    const enabled = myStream.getVideoTracks()[0].enabled
    myStream.getVideoTracks()[0].enabled = !enabled
    document.getElementById('video-btn').innerText = enabled ? "Stop Video" : "Start Video"
    const copyBtn = document.getElementById('copy-link-btn');

// 1. First, finish the video button code
document.getElementById('video-btn').addEventListener('click', () => {
    // your video toggle logic here
}); // <--- Make sure this has its own closing bracket and semicolon

// 2. Then, start the copy button code separately
copyBtn.addEventListener('click', () => {
    const roomUrl = window.location.href;
    navigator.clipboard.writeText(roomUrl).then(() => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = "Link Copied! ✅";
        copyBtn.style.background = "#27ae60";

        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.style.background = "#3498db";
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}); // <--- This closes the copy button