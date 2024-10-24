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

const undoButton = document.createElement("button");
undoButton.innerText = "Undo";
app.append(undoButton);

const redoButton = document.createElement("button");
redoButton.innerText = "Redo";
app.append(redoButton);

let lines: { x: number; y: number }[][] = [];
let currentLine: { x: number; y: number }[] = [];
let redoStack: { x: number; y: number}[][] = [];
let isDrawing = false;

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  currentLine = [];
  currentLine.push({ x: e.offsetX, y: e.offsetY });
  redoStack = [];
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    currentLine.push({ x: e.offsetX, y: e.offsetY });
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

canvas.addEventListener("mouseup", () => {
  if (isDrawing) {
    isDrawing = false;
    lines.push(currentLine);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

canvas.addEventListener("mouseout", () => {
  if (isDrawing) {
    isDrawing = false;
    lines.push(currentLine);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

clearButton.addEventListener("click", () => {
  lines = [];
  currentLine = [];
  redoStack = [];
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

undoButton.addEventListener("click", () => {
  if (lines.length > 0) {
    const lastLine = lines.pop();
    redoStack.push(lastLine!);
    currentLine = [];
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    const redoLine = redoStack.pop();
    lines.push(redoLine!);
    currentLine = [];
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

canvas.addEventListener("drawing-changed", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw all lines from the lines array
  lines.forEach((line) => {
    context.beginPath();
    for (let i = 0; i < line.length; i++) {
      const point = line[i];
      if (i === 0) {
        context.moveTo(point.x, point.y); // the first point
      } else {
        context.lineTo(point.x, point.y);
      }
    }
    context.stroke();
  });

  if (currentLine.length > 0) {
    context.beginPath();
    for (let i = 0; i < currentLine.length; i++) {
      const point = currentLine[i];
      if (i === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    }
    context.stroke();
  }
});