const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const preview = document.getElementById("preview");

let mediaRecorder;
let recordedChunks = [];
let stream;

/* Старт записи */

async function startRecording() {

  try {

    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    preview.srcObject = stream;

    recordedChunks = [];

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {

      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = showPreview;

    mediaRecorder.start();

    // Чёрный экран
    document.body.classList.add("recording");

  } catch (err) {

    alert("Ошибка камеры: " + err);
  }
}

/* Стоп */

function stopRecording() {

  if (
    mediaRecorder &&
    mediaRecorder.state !== "inactive"
  ) {
    mediaRecorder.stop();
  }

  if (stream) {

    stream.getTracks().forEach(track => {
      track.stop();
    });
  }

  document.body.classList.remove("recording");

  stopBtn.classList.add("hidden");
  startBtn.classList.remove("hidden");
}

/* Просмотр после записи */

function showPreview() {

  const blob = new Blob(recordedChunks, {
    type: "video/mp4"
  });

  const videoURL = URL.createObjectURL(blob);

  // Главный контейнер
  const container = document.createElement("div");

  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.background = "black";
  container.style.zIndex = "99999";

  // Видео
  const video = document.createElement("video");

  video.src = videoURL;
  video.controls = true;
  video.autoplay = true;
  video.playsInline = true;

  video.style.width = "100%";
  video.style.height = "80%";
  video.style.objectFit = "contain";

  // Кнопка сохранить
  const saveBtn = document.createElement("button");

  saveBtn.innerText = "Сохранить";

  saveBtn.style.position = "absolute";
  saveBtn.style.bottom = "40px";
  saveBtn.style.left = "50%";
  saveBtn.style.transform = "translateX(-50%)";

  saveBtn.style.padding = "16px 28px";
  saveBtn.style.fontSize = "18px";

  saveBtn.style.border = "none";
  saveBtn.style.borderRadius = "14px";

  saveBtn.style.background = "white";
  saveBtn.style.color = "black";

  saveBtn.onclick = () => {

    const a = document.createElement("a");

    a.href = videoURL;
    a.download = `video-${Date.now()}.mp4`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
  };

  // Кнопка закрыть
  const closeBtn = document.createElement("button");

  closeBtn.innerText = "Закрыть";

  closeBtn.style.position = "absolute";
  closeBtn.style.top = "20px";
  closeBtn.style.right = "20px";

  closeBtn.style.padding = "10px 18px";
  closeBtn.style.fontSize = "16px";

  closeBtn.style.border = "none";
  closeBtn.style.borderRadius = "10px";

  closeBtn.onclick = () => {

    container.remove();

    URL.revokeObjectURL(videoURL);
  };

  // Добавление элементов
  container.appendChild(video);
  container.appendChild(saveBtn);
  container.appendChild(closeBtn);

  document.body.appendChild(container);
}

/* Кнопки */

startBtn.addEventListener("click", async () => {

  startBtn.classList.add("hidden");
  stopBtn.classList.remove("hidden");

  await startRecording();
});

stopBtn.addEventListener("click", stopRecording);

/* Service Worker */

if ("serviceWorker" in navigator") {

  navigator.serviceWorker.register("./sw.js");
}
