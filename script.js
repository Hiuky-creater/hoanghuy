// --- PHẦN 1: XỬ LÝ ÂM THANH & CLICK START ---
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("start-overlay");
  const audio = document.getElementById("myAudio");

  // Khi click vào màn hình chờ
  overlay.addEventListener("click", () => {
    // 1. Phát nhạc
    audio.volume = 0.8;
    audio
      .play()
      .then(() => {
        console.log("Nhạc đang phát!");
      })
      .catch((e) => {
        console.error("Lỗi phát nhạc:", e);
        alert("Không thể phát nhạc. Vui lòng kiểm tra file audio-1.mp3");
      });

    // 2. Ẩn màn hình chờ với hiệu ứng mờ dần
    gsap.to(overlay, {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        overlay.style.display = "none";
        // Bắt đầu animation chính sau khi click
        startMainAnimation();
      },
    });
  });
});

// --- PHẦN 2: HIỆU ỨNG CÂY THÔNG ---
function startMainAnimation() {
  MorphSVGPlugin.convertToPath("polygon");
  var xmlns = "http://www.w3.org/2000/svg",
    xlinkns = "http://www.w3.org/1999/xlink",
    select = function (s) {
      return document.querySelector(s);
    },
    selectAll = function (s) {
      return document.querySelectorAll(s);
    },
    pContainer = select(".pContainer"),
    mainSVG = select(".mainSVG"),
    star = select("#star"),
    sparkle = select(".sparkle"),
    tree = select("#tree"),
    showParticle = true,
    particleColorArray = [
      "#E8F6F8",
      "#ACE8F8",
      "#F6FBFE",
      "#A2CBDC",
      "#B74551",
      "#5DBA72",
      "#910B28",
      "#910B28",
      "#446D39",
    ],
    particleTypeArray = ["#star", "#circ", "#cross", "#heart"],
    particlePool = [],
    particleCount = 0,
    numParticles = 201;

  gsap.set("svg", {
    visibility: "visible",
  });

  gsap.set(sparkle, {
    transformOrigin: "50% 50%",
    y: -100,
  });

  let getSVGPoints = (path) => {
    let arr = [];
    var rawPath = MotionPathPlugin.getRawPath(path)[0];
    rawPath.forEach((el, value) => {
      let obj = {};
      obj.x = rawPath[value * 2];
      obj.y = rawPath[value * 2 + 1];
      if (value % 2) {
        arr.push(obj);
      }
    });
    return arr;
  };

  let treePath = getSVGPoints(".treePath");
  var treeBottomPath = getSVGPoints(".treeBottomPath");
  var mainTl = gsap.timeline({ delay: 0, repeat: 0 }),
    starTl;

  function flicker(p) {
    gsap.killTweensOf(p, { opacity: true });
    gsap.fromTo(
      p,
      { opacity: 1 },
      { duration: 0.07, opacity: Math.random(), repeat: -1 }
    );
  }

  function createParticles() {
    var i = numParticles,
      p;
    while (--i > -1) {
      p = select(particleTypeArray[i % particleTypeArray.length]).cloneNode(
        true
      );
      mainSVG.appendChild(p);
      p.setAttribute("fill", particleColorArray[i % particleColorArray.length]);
      p.setAttribute("class", "particle");
      particlePool.push(p);
      gsap.set(p, { x: -100, y: -100, transformOrigin: "50% 50%" });
    }
  }

  var getScale = gsap.utils.random(0.5, 3, 0.001, true);

  function playParticle(p) {
    if (!showParticle) {
      return;
    }
    var p = particlePool[particleCount];
    gsap.set(p, {
      x: gsap.getProperty(".pContainer", "x"),
      y: gsap.getProperty(".pContainer", "y"),
      scale: getScale(),
    });
    var tl = gsap.timeline();
    tl.to(p, {
      duration: gsap.utils.random(0.61, 6),
      physics2D: {
        velocity: gsap.utils.random(-23, 23),
        angle: gsap.utils.random(-180, 180),
        gravity: gsap.utils.random(-6, 50),
      },
      scale: 0,
      rotation: gsap.utils.random(-123, 360),
      ease: "power1",
      onStart: flicker,
      onStartParams: [p],
      onRepeat: (p) => {
        gsap.set(p, { scale: getScale() });
      },
      onRepeatParams: [p],
    });
    particleCount++;
    particleCount = particleCount >= numParticles ? 0 : particleCount;
  }

  function drawStar() {
    starTl = gsap.timeline({ onUpdate: playParticle });
    starTl
      .to(".pContainer, .sparkle", {
        duration: 6,
        motionPath: { path: ".treePath", autoRotate: false },
        ease: "linear",
      })
      .to(".pContainer, .sparkle", {
        duration: 1,
        onStart: function () {
          showParticle = false;
        },
        x: treeBottomPath[0].x,
        y: treeBottomPath[0].y,
      })
      .to(
        ".pContainer, .sparkle",
        {
          duration: 2,
          onStart: function () {
            showParticle = true;
          },
          motionPath: { path: ".treeBottomPath", autoRotate: false },
          ease: "linear",
        },
        "-=0"
      )
      .from(
        ".treeBottomMask",
        {
          duration: 2,
          drawSVG: "0% 0%",
          stroke: "#FFF",
          ease: "linear",
        },
        "-=2"
      );
  }

  createParticles();
  drawStar();

  mainTl
    .from([".treePathMask", ".treePotMask"], {
      duration: 6,
      drawSVG: "0% 0%",
      stroke: "#FFF",
      stagger: { each: 6 },
      duration: gsap.utils.wrap([6, 1, 2]),
      ease: "linear",
    })
    .from(
      ".treeStar",
      {
        duration: 3,
        scaleY: 0,
        scaleX: 0.15,
        transformOrigin: "50% 50%",
        ease: "elastic(1,0.5)",
      },
      "-=4"
    )
    .to(
      ".sparkle",
      {
        duration: 3,
        opacity: 0,
        ease: "rough({strength: 2, points: 100, template: linear, taper: both, randomize: true, clamp: false})",
      },
      "-=0"
    )
    .to(
      ".treeStarOutline",
      {
        duration: 1,
        opacity: 1,
        ease: "rough({strength: 2, points: 16, template: linear, taper: none, randomize: true, clamp: false})",
      },
      "+=1"
    );

  mainTl.add(starTl, 0);
  gsap.globalTimeline.timeScale(1.5);

  // Kích hoạt các hiệu ứng phụ
  startSnow();
  startTextAnimation();

  // QUAN TRỌNG: Gọi hàm animateSanta ở đây thì nó mới bay
  animateSanta();
}

// --- PHẦN 3: HIỆU ỨNG TUYẾT RƠI ---
function startSnow() {
  function createSnowflake() {
    const snow = document.createElement("div");
    snow.classList.add("snowflake");
    snow.textContent = "❄";
    snow.style.left = Math.random() * window.innerWidth + "px";
    snow.style.fontSize = Math.random() * 15 + 10 + "px";
    snow.style.opacity = Math.random() * 0.7 + 0.3;
    document.body.appendChild(snow);

    gsap.to(snow, {
      y: window.innerHeight + 100,
      x: (Math.random() - 0.5) * 50,
      rotation: Math.random() * 360,
      duration: Math.random() * 3 + 2,
      ease: "linear",
      onComplete: () => {
        if (snow.parentNode) {
          snow.parentNode.removeChild(snow);
        }
      },
    });
  }
  setInterval(createSnowflake, 100);
}

function startTextAnimation() {
  const messages = [
    "Merry Christmas!",
    "Chúc mọi người Giáng Sinh an lành",
    "niềm vui ngập tràn",
    "ấm áp bên gia đình",
    "Happy Holidays",
    "From HoangHuy - Jimmy to you ❤️",
  ];

  const msgEl = document.getElementById("message");
  let index = 0;

  const interval = setInterval(() => {
    msgEl.style.opacity = 0;

    setTimeout(() => {
      msgEl.innerText = messages[index];
      msgEl.style.opacity = 1;

      if (index === messages.length - 1) {
        clearInterval(interval);
        setTimeout(showChristmasCard, 2000);
        return;
      }
      index++;
    }, 1000);
  }, 3000);
}

// 🎁 THIỆP + GÕ CHỮ
function showChristmasCard() {
  const card = document.getElementById("card-container");
  const textEl = document.getElementById("typing-text");

  const text = `Giáng sinh đến rồi, mình muốn gửi đến những người mình yêu quý những lời chúc ấm áp nhất. Mong rằng mùa Noel này sẽ mang theo thật nhiều niềm vui, sức khỏe và bình an đến với mọi người. Dù chúng ta có ở gần hay xa nhau, tình cảm chân thành vẫn luôn ở trong tim. Chúc mọi người một Giáng sinh an lành, hạnh phúc và tràn ngập yêu thương. 🎄✨
Hoang Huy - Jimmy Nguen  `;

  card.style.pointerEvents = "auto";

  gsap.to(card, {
    opacity: 1,
    duration: 1.2,
    ease: "power2.out",
  });

  let i = 0;
  const typing = setInterval(() => {
    textEl.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(typing);
  }, 60);
}

// --- PHẦN JS: ÔNG GIÀ NOEL ĐỨNG YÊN & NHẤP NHÔ ---
function animateSanta() {
  const santa = document.querySelector(".santa-container");
  if (!santa) return;

  // Đảm bảo ông già Noel hiện rõ
  gsap.set(santa, { opacity: 1 });

  // 1. Hiệu ứng nhấp nhô lên xuống (Floating effect)
  gsap.to(santa, {
    y: -30, // Bay lên 30px
    duration: 2, // Trong vòng 2 giây
    yoyo: true, // Đi xong quay về vị trí cũ
    repeat: -1, // Lặp lại mãi mãi
    ease: "sine.inOut", // Chuyển động mượt mà hình sin
  });

  // 2. Hiệu ứng nghiêng nhẹ qua lại (cho sinh động)
  gsap.fromTo(
    santa,
    { rotation: -5 }, // Nghiêng trái 5 độ
    {
      rotation: 5, // Nghiêng phải 5 độ
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    }
  );
}
