import "./style.css";

const APP_NAME = "Draw with Me";
const app = document.querySelector<HTMLDivElement>("#app")!;

const title = document.createElement("h1");
title.innerHTML = APP_NAME;
app.append(title);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.append(canvas);

const context = canvas.getContext("2d")!;
context.strokeStyle = "white";
context.lineWidth = 2;

const clearButton = document.createElement("button");
clearButton.innerText = "Clear";
app.append(clearButton);

let isDrawing = false;

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  context.beginPath();
  context.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

canvas.addEventListener("mouseout", () => {
  isDrawing = false;
});

clearButton.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
});
