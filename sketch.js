let video;
let asciiPre;
let densityFull = "Ñ@#W$9876543210?!abc "; 
;
let density = densityFull;
let contrast = 0;

function setup() {
  noCanvas();

  asciiPre = select("#ascii");

  video = createCapture({
    video: { width: { ideal: 320 }, height: { ideal: 180 }, facingMode: "user" },
    audio: false
  });
  video.size(350, 100);
  video.hide();

  // Slider events
  document.getElementById("contrastSlider").addEventListener("input", e => {
    contrast = parseInt(e.target.value);
    document.getElementById("contrastVal").textContent = contrast;
  });

  document.getElementById("charsSlider").addEventListener("input", e => {
    let count = parseInt(e.target.value);
    document.getElementById("charsVal").textContent = count;
    density = densityFull.slice(0, count);
  });

  // Photo button
  document.getElementById("photoBtn").addEventListener("click", () => {
    const asciiText = asciiPre.elt.textContent;
    const isMobile = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

    if (isMobile) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const lines = asciiText.split("\n");
      const charWidth = 8;
      const charHeight = 8;
      canvas.width = lines[0].length * charWidth;
      canvas.height = lines.length * charHeight;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#fff";
      ctx.font = `${charHeight}px monospace`;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], 0, charHeight * (i + 1));
      }

      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ascii_art.png";
        a.click();
        URL.revokeObjectURL(url);
      });
    } else {
      const blob = new Blob([asciiText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ascii_art.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  });

  // Reset button
  document.getElementById("resetBtn").addEventListener("click", () => {
    contrast = 0;
    density = densityFull;
    document.getElementById("contrastSlider").value = contrast;
    document.getElementById("contrastVal").textContent = contrast;
    document.getElementById("charsSlider").value = densityFull.length;
    document.getElementById("charsVal").textContent = densityFull.length;
  });
}

function draw() {
  video.loadPixels();
  let asciiImage = "";
  const w = video.width;
  const h = video.height;

  for (let j = 0; j < h; j++) {
    let row = "";
    for (let i = 0; i < w; i++) {
      const idx = (i + j * w) * 4;
      const r = video.pixels[idx + 0];
      const g = video.pixels[idx + 1];
      const b = video.pixels[idx + 2];

      let avg = (r + g + b) / 3;

      let factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      avg = factor * (avg - 128) + 128;
      avg = constrain(avg, 0, 255);

      const len = density.length;
      const mapped = map(avg, 0, 255, 0, len - 1);
      const charIndex = constrain(Math.floor(mapped), 0, len - 1);
      const c = density.charAt(len - charIndex - 1);
      row += (c === " ") ? " " : c;
    }
    asciiImage += row + "\n";
  }

  asciiPre.elt.textContent = asciiImage;
}
