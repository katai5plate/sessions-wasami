const D = document;
const S = speechSynthesis;

const make = (def, fn) => fn(def);
const addElement = (tag, fn, parent) =>
  make(
    D.createElement(tag),
    (t, v = fn(t)) => (v, (parent || D.body).appendChild(t), [t, v])
  );

const speak = (mes, rate = 0.8, timeout = mes.length * (150 / rate)) =>
  new Promise((resolve) => {
    const ssu = new SpeechSynthesisUtterance(mes);
    // console.log(mes, rate, timeout);
    ssu.lang = "en-US";
    ssu.rate = rate;
    if (S.speaking) S.cancel();
    S.speak(ssu);
    const t = setTimeout(() => {
      if (S.speaking) resolve(console.warn(S.cancel()));
    }, timeout);
    ssu.addEventListener("end", () => resolve(console.log(clearTimeout(t))));
    ssu.addEventListener("error", () =>
      resolve(console.error(clearTimeout(t)))
    );
  });

const wait = (w) => new Promise((r) => setTimeout(r, w * 1e3));
const repeat = async (c, w, fn) => {
  for (let i in new Array(c).fill()) {
    fn(+i, c);
    await wait(w);
  }
};

const audio = new AudioContext();

const playSynth = (time, freq) => {
  if (!freq) return;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  const now = audio.currentTime;
  osc.connect(amp);
  amp.connect(audio.destination);
  osc.frequency.value = freq;
  osc.type = "sawtooth";
  amp.gain.value = 0;
  amp.gain.setValueAtTime(0, now);
  amp.gain.linearRampToValueAtTime(0.1, now + 0);
  amp.gain.exponentialRampToValueAtTime(0.1 * 0.8, now + 0 + 0.1);
  amp.gain.setTargetAtTime(0, now + 0 + 0.1, 0.1);
  osc.start(time);
  osc.stop(time + 0.2);
};

const drawText = ({ ctx, W, H }, text) => {
  const FONT_SIZE = 30;
  ctx.font = `${FONT_SIZE}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const highlightColor = "#fff";
  ctx.fillStyle = highlightColor;
  ctx.fillRect(0, (H / 4) * 3 - FONT_SIZE / 2, W, FONT_SIZE);
  const textColor = "red";
  ctx.fillStyle = textColor;
  ctx.fillText(text, W / 2, (H / 4) * 3);
};

addElement("button", (el) => {
  el.innerText = "START";
  el.onclick = async () => {
    el.remove();
    /** @type {CanvasRenderingContext2D} */
    const [canvas, ctx] = addElement("canvas", (el) => {
      el.width = 480;
      el.height = 270;
      el.style.imageRendering = "pixelated";
      // el.style.width = "100%"; // TODO: フルスクリーン処理に差し替える
      return el.getContext("2d");
    });
    canvas.requestFullscreen();

    const { width: W, height: H } = canvas;

    // Scene 01 ------------------------------------------------------------------------
    ctx.fillStyle = "#5ef";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#58e";
    ctx.fillRect(0, H / 2, W, H / 2);

    const notes = [, -2, 0, 2, 3, 5, 7, 8].map((n) => 440 * 2 ** (n / 12));
    const pattern = [..."2224e3e11e2233554456e2e2211e6556772211e"];

    await repeat(pattern.length * 4, 0.2, (i) => {
      const size = (i * 2) / 2 + 10;
      ctx.font = size + "px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("🚢", W / 2, H / 2);
      playSynth(audio.currentTime, notes[+pattern[i % pattern.length]]);
    });

    for (let [s, e] of [
      ["kow ray wah fu nay death", "This is a färjan."],
      [
        "fu nay gah? woo me ohh? whatt at tey, ki math",
        "The färjan is crossing the sea.",
      ],
      ["finland, dewa, ah lim ma sen", "It's not going to Finland."],
      ["cock oh wow? nip pong day, array math", "It's headed to Japan."],
      [
        "so she tey, kock oh wow? shi zoo oh kah toy you, bash oh death",
        "& This venue you are at is Shizuoka.",
      ],
      ["YEAH!"],
    ]) {
      drawText({ ctx, W, H }, e || s);
      await speak(s);
    }

    // Scene 02 ------------------------------------------------------------------------
    ctx.fillStyle = "#de9";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#7aa";
    ctx.fillRect(0, H / 2, W, H / 2);

    ctx.fillStyle = "#cba";
    ctx.strokeStyle = "#000";
    await repeat(6, 0.01, (i, m) => {
      ctx.beginPath();
      const numSides = (5 + Math.random() * 2) | 0;
      for (let n = 0; n < numSides; n++) {
        const angle = (n / numSides) * Math.PI * 2;
        const px = Math.cos(angle) * 50 + (W / m) * (i + 0.5);
        const py = Math.sin(angle) * 50 + H / 2;
        if (n === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    ctx.fillStyle = "#7aaa";
    ctx.fillRect(0, H / 2, W, H / 2);

    ctx.fillStyle = "#fff5";
    await repeat(100, 0.01, (i, m) => {
      [0, 1, 2].forEach((x) => {
        ctx.fillRect(
          (W / 4) * (x + 1) +
            Math.sin((i * Math.PI) / ((x + 3) * 10)) * ((5 - x) * 10),
          (H / 3) * (2 * (1 - i / m)),
          10,
          10
        );
      });
    });

    for (let [s, e] of [
      ["tock oh roday?", "By the way..."],
      ["min a sam a wah?", "Everyone,"],
      ["on sen nee, hi li mathy tack ah?", "Have you tried a hot spring yet?"],
      ["hi T e-nigh!", "I don't think so...!"],
      ["sonna kotto nigh death yo ney", "No way, really?"],
      ["shiz oh ka tow yeva", "Shizuoka is famous for:"],
    ]) {
      drawText({ ctx, W, H }, e || s);
      await speak(s);
    }

    // Scene 03 ------------------------------------------------------------------------
    const wasabi = async (nbg) => {
      if (!nbg) {
        ctx.fillStyle = "#544";
        ctx.fillRect(0, 0, W, H);
      }
      const a = [(0 * Math.PI) / 180, 360 * Math.PI];
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const x = 280 - 24 - i * 24;
        const y = 56 - 24 + i * 24;
        ctx.fillStyle = `#${["ba6", "cc8", "bc7", "dea", "df9"][i]}`;
        ctx.beginPath();
        ctx.arc(x, y, 24, ...a);
        ctx.arc(x, y + 24, 24, ...a);
        ctx.fill();
      }
      ctx.fillStyle = "#aaa";
      ctx.beginPath();
      ctx.ellipse(288 + 24, 144, 48, 24, 0, ...a);
      ctx.fill();
      ctx.fillStyle = "#400";
      ctx.beginPath();
      ctx.ellipse(288 + 24, 144, 48 - 8, 24 - 8, 0, ...a);
      ctx.fill();
      ctx.fillStyle = "#df9";
      ctx.beginPath();
      ctx.arc(252 + 24, 132, 8, ...a);
      ctx.fill();
    };
    const atami = async () => {
      ctx.fillStyle = "#ffe";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#0002";
      ctx.beginPath();
      for (let x = 0; x < W; x += 5) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      for (let y = 0; y < H; y += 5) {
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.stroke();
      ctx.fillStyle = "#aee";
      ctx.fillRect(0, 0, W, H / 6);
      ctx.fillStyle = "#09e";
      ctx.beginPath();
      ctx.moveTo(W, H / 6);
      ctx.lineTo(288, 79);
      ctx.lineTo(192, 100);
      ctx.lineTo(0, 163);
      ctx.lineTo(0, H);
      ctx.lineTo(280, 205);
      ctx.lineTo(232, 163);
      ctx.lineTo(378, 131);
      ctx.lineTo(W, H);
      ctx.fill();
      ctx.fillStyle = "#396";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(W, H / 6);
      ctx.lineTo(0, (H / 6) * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 163);
      ctx.lineTo(163, 240);
      ctx.lineTo(335, 210);
      ctx.lineTo(W, 233);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.fill();
      ctx.fillStyle = "#9c5";
      ctx.beginPath();
      ctx.moveTo(0, (H / 6) * 2);
      ctx.lineTo(W, H / 6);
      ctx.lineTo(187, 41);
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.fillStyle = "#dde";
      ctx.strokeRect(342, 148, 56, 60);
      ctx.fillRect(342, 148, 56, 60);
    };
    for (let i = 0; i < 3; i++) {
      wasabi();
      drawText({ ctx, W, H }, "Wasabi");
      await speak("whassabi, and?");
      atami();
      drawText({ ctx, W, H }, "Atami");
      await speak("ah tah me. yeah!");
    }
    atami();
    wasabi(1);
    drawText({ ctx, W, H }, "Wasabi? Atami? Wasami?");
    await speak("whassabi? ah tah me? whassa me?");

    const spd = 1;
    drawText({ ctx, W, H }, "...Repeat after me.");
    await speak("repeat after me?", spd);

    for (let i = 0; i < 2; i++) {
      wasabi();
      drawText({ ctx, W, H }, "Wasabi & Atami");
      await speak("whassabi, and? ah tah me. yeah!", spd);
      atami();
      drawText({ ctx, W, H }, "Wasabi & Atami");
      await speak("whassabi, and? ah tah me. yeah!", spd);
      wasabi();
      wait(0.75)
        .then(() => (atami(), wait(0.75)))
        .then(() => (wasabi(), wait(0.75)))
        .then(() => (atami(), wait(0.75)));
      await speak("whassabi, and? ah tah me. yeah!", spd);
      atami();
      wasabi(1);
      drawText({ ctx, W, H }, "Wasabi? Atami? Wasami? Come on!");
      await speak("whassabi? ah tah me? whassa me? come on", spd);
    }
    drawText({ ctx, W, H }, "HAHA! Nice");
    await speak("haha, nice", spd);

    await wait(1);

    const p = [
      [
        "Well, after all that praise about Shizuoka and Atami",
        "さぁて、みなさん",
      ],
      [
        "you must be really excited to go there.",
        "熱海、行きたくなったのでは？",
      ],
      [
        "Too bad you need to take the bullet train to get there from here!",
        "ここから熱海めちゃ遠いけどな！",
      ],
    ];
    for (let i in p) {
      if (+i === 2) {
        ctx.fillStyle = "#000a";
        ctx.fillRect(0, 0, W, H);
      }
      const [s, t] = p[i];
      drawText({ ctx, W, H }, t);
      await speak(s, 1);
    }

    await wait(1);

    atami();
    wasabi(1);
    drawText({ ctx, W, H }, "おあとが　よろしい　ようで");
    await speak("oh ah toh gaw, yo row sea,");
    const d = "YOU ARE DEAD";
    drawText({ ctx, W, H }, d);
    await speak(d);

    // Scene 04 ------------------------------------------------------------------------
    ctx.fillStyle = "#5ef";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#58e";
    ctx.fillRect(0, H / 2, W, H / 2);

    await repeat(pattern.length * 4, 0.2, (x, m) => {
      const i = m - x;
      const size = (i * 2) / 2 + 10;
      ctx.font = size + "px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("🚢", W / 2, H / 2);
      playSynth(audio.currentTime, notes[+pattern[x % pattern.length]]);
      drawText(
        { ctx, W, H },
        [
          "-- Greetings --",
          "gam0022 kuzpulse nav GAI",
          "FL1NE Jugem-T Hatsuka 0b5vr",
          "Jumalauta Quebarium Subzey p01",
        ][(x / pattern.length) | 0]
      );
    });

    await wait(1);

    drawText({ ctx, W, H }, "Bye🍵");
    speak("Bye. sem met tey o-cha gray non day kah elly nass eye");
    await wait(4.3);
    S.cancel();
    canvas.remove();
  };
});
