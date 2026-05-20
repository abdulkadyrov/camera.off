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

    // Чёрный экран
    document.body.classList.add("recording");

  } catch (err) {

    alert("Ошибка доступа к камере: " + err);
  }
}

function stopRecording() {

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  document.body.classList.remove("recording");

  stopBtn.classList.add("hidden");
  startBtn.classList.remove("hidden");
}

function saveVideo() {

  const blob = new Blob(recordedChunks, {
    type: "video/mp4"
  });

  const url = URL.createObjectURL(blob);

  // Контейнер просмотра
  const container = document.createElement("div");

  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.background = "black";
  container.style.zIndex = "9999";

  // Видео
  const video = document.createElement("video");

  video.src = url;
  video.controls = true;
  video.autoplay = true;

  video.style.width = "100%";
  video.style.height = "80%";
  video.style.objectFit = "contain";

  // Кнопка сохранения
  const saveBtn = document.createElement("button");

  saveBtn.innerText = "Сохранить видео";

  saveBtn.style.position = "absolute";
  saveBtn.style.bottom = "40px";
  saveBtn.style.left = "50%";
  saveBtn.style.transform = "translateX(-50%)";

  saveBtn.style.padding = "15px 25px";
  saveBtn.style.fontSize = "18px";
  saveBtn.style.border = "none";
  saveBtn.style.borderRadius = "12px";

  saveBtn.onclick = () => {

    const a = document.createElement("a");

    a.href = url;
    a.download = `video-${Date.now()}.mp4`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
  };

  // Кнопка закрытия
  const closeBtn = document.createElement("button");

  closeBtn.innerText = "Закрыть";

  closeBtn.style.position = "absolute";
  closeBtn.style.top = "20px";
  closeBtn.style.right = "20px";

  closeBtn.style.padding = "10px 20px";
  closeBtn.style.fontSize = "16px";

  closeBtn.onclick = () => {

    container.remove();

    URL.revokeObjectURL(url);
  };

  container.appendChild(video);
  container.appendChild(saveBtn);
  container.appendChild(closeBtn);

  document.body.appendChild(container);
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
