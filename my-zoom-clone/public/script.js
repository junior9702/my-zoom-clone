const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(); // Auto-connects to PeerJS cloud for Render
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
let myVideoStream;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream, "Me", 'my-id');

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream, "User", call.peer);
        });
    });

    socket.on('user-connected', (userId, userName) => {
        connectToNewUser(userId, stream, userName);
    });
});

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id, user);
});

function connectToNewUser(userId, stream, userName) {
    if (peers[userId]) return;
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream, userName, userId);
    });
    call.on('close', () => { video.remove(); });
    peers[userId] = call;
}

function addVideoStream(video, stream, name, userId) {
    if (document.getElementById(userId)) return; // Prevents double boxes
    const div = document.createElement('div');
    div.className = 'video-box';
    div.id = userId;
    const tag = document.createElement('div');
    tag.className = 'name-tag';
    tag.innerText = name;
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => { video.play(); });
    div.append(video);
    div.append(tag);
    videoGrid.append(div);
}

// --- CONTROLS ---

// Video Toggle
const videoBtn = document.getElementById('video-btn');
videoBtn.addEventListener('click', () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        videoBtn.innerText = "Start Video";
        videoBtn.style.backgroundColor = "rgb(255, 82, 82)";
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        videoBtn.innerText = "Stop Video";
        videoBtn.style.backgroundColor = "rgb(68, 68, 68)";
    }
});

// Copy Link Button (Fixed Brackets)
const copyBtn = document.getElementById('copy-link-btn');
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = "Link Copied! ✅";
        copyBtn.style.background = "#27ae60";
        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.style.background = "#3498db";
        }, 2000);
    });
});