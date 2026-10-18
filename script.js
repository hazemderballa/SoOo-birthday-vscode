/* =========================================================
   ESRAA BIRTHDAY — INTERACTIONS FILE
   هنا بنكتب اللي يحصل لما إسراء تضغط على الأزرار.
   ========================================================= */
(() => {
  "use strict";

  // 1) ربط عناصر الصفحة بأسمائها في HTML.
  const $ = (id) => document.getElementById(id);
  const introOverlay = $("introOverlay");
  const startButton = $("startButton");
  const wishButton = $("wishButton");
  const relightButton = $("relightButton");
  const birthdayTitle = $("birthdayTitle");
  const candle = $("candle");
  const flame = $("flame");
  const plate = $("plate");
  const letterBackdrop = $("letterBackdrop");
  const closeLetterButton = $("closeLetterButton");
  const layers = [$("tierBottom"), $("tierMiddle"), $("tierTop")];
  const sparkles = document.querySelectorAll(".twinkle");

  let surpriseStarted = false;
  let candleIsOut = false;
  let audioContext = null;

  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  // مؤثرات صوتية قصيرة بتتولد داخل المتصفح. مفيش أغاني أو ملفات صوت خارجية.
  function getAudioContext() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioContext = new AudioContextClass();
    }
    if (audioContext && audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function playSound(kind = "sparkle") {
    const context = getAudioContext();
    if (!context) return; // لو المتصفح مش بيدعم الصوت، الأنيميشن هيكمل عادي.

    const now = context.currentTime;
    const sounds = {
      drop: [
        { start: 220, end: 145, duration: 0.16, wave: "triangle", volume: 0.065 }
      ],
      sparkle: [
        { start: 660, end: 990, duration: 0.22, wave: "sine", volume: 0.045 },
        { start: 990, end: 1320, duration: 0.27, wave: "sine", volume: 0.028, delay: 0.07 }
      ],
      blow: [
        { start: 290, end: 110, duration: 0.25, wave: "sine", volume: 0.045 }
      ],
      relight: [
        { start: 420, end: 820, duration: 0.2, wave: "sine", volume: 0.04 },
        { start: 820, end: 1120, duration: 0.22, wave: "sine", volume: 0.025, delay: 0.08 }
      ]
    };

    (sounds[kind] || sounds.sparkle).forEach((tone) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startAt = now + (tone.delay || 0);
      oscillator.type = tone.wave;
      oscillator.frequency.setValueAtTime(tone.start, startAt);
      oscillator.frequency.exponentialRampToValueAtTime(tone.end, startAt + tone.duration);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(tone.volume, startAt + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + tone.duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + tone.duration + 0.02);
    });
  }

  // قلوب ونجوم صغيرة تطلع من أسفل الشاشة.
  function floatHearts(amount = 16) {
    const shapes = ["♥", "♡", "✦", "✧", "✿"];
    for (let index = 0; index < amount; index += 1) {
      const item = document.createElement("span");
      item.className = "floaty";
      item.textContent = shapes[Math.floor(Math.random() * shapes.length)];
      item.style.left = `${3 + Math.random() * 94}vw`;
      item.style.fontSize = `${12 + Math.random() * 22}px`;
      item.style.setProperty("--drift", `${-55 + Math.random() * 110}px`);
      item.style.setProperty("--spin", `${-100 + Math.random() * 200}deg`);
      item.style.animationDuration = `${4.2 + Math.random() * 3.5}s`;
      item.style.animationDelay = `${Math.random() * 0.35}s`;
      document.body.appendChild(item);
      window.setTimeout(() => item.remove(), 8500);
    }
  }

  // ترتيب المشهد: الطبق، ثم طبقات التورتة، ثم الشمعة والنار، وأخيرًا العنوان.
  async function startSurprise() {
    if (surpriseStarted) return;
    surpriseStarted = true;
    getAudioContext(); // الصوت يبدأ بعد ضغطة المستخدم احترامًا لقواعد المتصفح.
    introOverlay.classList.add("dismissed");
    plate.classList.add("visible");
    await wait(250);

    for (let index = 0; index < layers.length; index += 1) {
      layers[index].classList.add("land");
      playSound("drop");
      await wait(index === 0 ? 760 : 650);
    }

    await wait(180);
    candle.classList.add("show", "glow");
    await wait(500);
    flame.classList.add("lit");
    playSound("sparkle");
    floatHearts(12);
    await wait(350);
    birthdayTitle.classList.add("reveal");
    sparkles.forEach((item, index) => {
      item.classList.add("active");
      item.style.animationDelay = `${index * 0.25}s`;
    });
    await wait(750);
    wishButton.hidden = false;
    wishButton.focus({ preventScroll: true });
  }

  function openLetter() {
    letterBackdrop.hidden = false;
    floatHearts(20);
    playSound("sparkle");
    closeLetterButton.focus({ preventScroll: true });
  }

  function closeLetter() {
    letterBackdrop.hidden = true;
    wishButton.focus({ preventScroll: true });
  }

  function blowOutCandle() {
    if (!surpriseStarted) return;
    if (!candleIsOut) {
      flame.classList.remove("lit");
      candle.classList.remove("glow");
      candleIsOut = true;
      playSound("blow");
      floatHearts(22);
      wishButton.textContent = "افتحي رسالتك تاني 💌";
      relightButton.hidden = false;
      openLetter();
      return;
    }
    openLetter();
  }

  function relightCandle() {
    if (!surpriseStarted) return;
    flame.classList.add("lit");
    candle.classList.add("glow");
    candleIsOut = false;
    wishButton.textContent = "اطفي الشمعة وافتحي رسالتك 💌";
    relightButton.hidden = true;
    playSound("relight");
    floatHearts(10);
  }

  startButton.addEventListener("click", startSurprise);
  wishButton.addEventListener("click", blowOutCandle);
  relightButton.addEventListener("click", relightCandle);
  closeLetterButton.addEventListener("click", closeLetter);
  letterBackdrop.addEventListener("click", (event) => {
    if (event.target === letterBackdrop) closeLetter();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !letterBackdrop.hidden) closeLetter();
  });
})();
