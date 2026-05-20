const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const preview = document.getElementById("preview");

let mediaRecorder;
let recordedChunks = [];
let stream;

async function startRecording() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    preview.srcObject = stream;

    mediaRecorder = new MediaRecorder(stream);

    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = saveVideo;

    mediaRecorder.start();

    document.body.classList.add("recording");

  } catch (err) {
    alert("Ошибка доступа к камере: " + err);
  }
}

function stopRecording() {
  mediaRecorder.stop();

  stream.getTracks().forEach(track => track.stop());

  document.body.classList.remove("recording");

  stopBtn.classList.add("hidden");
  startBtn.classList.remove("hidden");
}

function saveVideo() {
  const blob = new Blob(recordedChunks, {
    type: "video/webm"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = `video-${Date.now()}.webm`;

  a.click();

  URL.revokeObjectURL(url);
}

startBtn.addEventListener("click", async () => {
  startBtn.classList.add("hidden");
  stopBtn.classList.remove("hidden");

  await startRecording();
});

stopBtn.addEventListener("click", stopRecording);

// PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}