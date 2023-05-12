var svgLayer = document.getElementById("svg-layer");
var canvasLayer = document.getElementById("canvas-layer");
var clear = document.getElementById("clear");
var fillColor = false, color = "black", bordercolor = "black";
var checkbox = document.getElementById("fill-color");
var sizeSlider = document.getElementById("size-slider");
//для заливки
colorBtns = document.querySelectorAll(".colors .option");
colorPicker = document.getElementById("color-picker");
//для границ
bordercolorBtns = document.querySelectorAll(".border-colors .border-option ");
bordercolorPicker = document.getElementById("border-color-picker");
const toolBtns = document.querySelectorAll(".tool");
//canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
var prevMouseX, prevMouseY, snapshot;
//svg
var svg = document.getElementById("svg");
var svgns = "http://www.w3.org/2000/svg"; // XML namespace
var isDrawing = false;
//для удаления выделенных
var selectedElement;
var prevPositionX, prevPositionY;
var prevElement
//default 
var color = "#000";
var bordercolor = "#000";
var linewidth = 10;
var selectedTool = "rectangle";
var fillColor = false
var isMoving = false
var svgAndCanvas = false
window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
});
disableAll()
//очистка холста
clear.addEventListener("click", Clear)
//line width
function onChangeSlider() {
    linewidth = sizeSlider.value
}
sizeSlider.addEventListener("change", onChangeSlider);
toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});
//заполнение цветом
checkbox.onchange = function () {
    if (checkbox.checked == true) {
        fillColor = true;
    }
    else {
        fillColor = false
    }
}
svgLayer.onchange = function () {
    if (svgLayer.checked == true && canvasLayer.checked == false) {
        svgLayerActive()
    }
    else if (svgLayer.checked == false && canvasLayer.checked == false) {
        disableAll()
    }
    else if (svgLayer.checked == true && canvasLayer.checked == true) {
        svgAndCanvasActive()
    }
    else if (svgLayer.checked == false && canvasLayer.checked == true) {
        canvasLayerActive()
    }
}
canvasLayer.onchange = function () {
    if (svgLayer.checked == true && canvasLayer.checked == false) {
        svgLayerActive()
    }
    else if (svgLayer.checked == false && canvasLayer.checked == false) {
        disableAll()
    }
    else if (svgLayer.checked == true && canvasLayer.checked == true) {
        svgAndCanvasActive()
    }
    else if (svgLayer.checked == false && canvasLayer.checked == true) {
        canvasLayerActive()
    }
}
//bg and border colors 
colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        color = window.getComputedStyle(btn).getPropertyValue("background-color");
        if (svgLayer.checked == true && canvasLayer.checked == false) {
            if (selectedElement != null && fillColor == true) {
                selectedElement.setAttributeNS(null, 'fill', color);
            }
        }
    });
});
colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});
//выбор цвета границы
bordercolorBtns.forEach(element => {
    element.addEventListener("click", () => {
        document.querySelector(".border-options .selected").classList.remove("selected");
        element.classList.add("selected");
        bordercolor = window.getComputedStyle(element).getPropertyValue("background-color");
        if (svgLayer.checked == true && canvasLayer.checked == false) {
            if (selectedElement != null) {
                selectedElement.setAttributeNS(null, 'stroke', bordercolor);
            }
        }
    })
});
//color picker границы
bordercolorPicker.addEventListener("change", () => {
    bordercolorPicker.parentElement.style.background = bordercolorPicker.value;
    bordercolorPicker.parentElement.click();
})
//общие для всех фигур
const svgPoint = (elem, x, y) => {
    const p = svg.createSVGPoint();
    p.x = x;
    p.y = y;
    return p.matrixTransform(elem.getScreenCTM().inverse());
};
function onChangeSliderSVG() {
    if (selectedElement != null) {
        selectedElement.setAttributeNS(null, 'stroke-width', linewidth);
    }
}
//рисование
const startDraw = (e) => {
    if (isMoving == false) {
        isDrawing = true;
    }
    console.log(isMoving)
}
const drawing = (e) => {
    if (isDrawing == true) {
        svg.removeEventListener("mousemove", drawing);
        switch (selectedTool) {
            case "rectangle":
                console.log("ect")
                StartDrawRect(e)
                break;
            case "circle":
                StartDrawCircle(e);
                break;
        }
    }
}
//рисование прямоугольника
const StartDrawRect = (e) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const start = svgPoint(svg, event.clientX, event.clientY);
    const drawRect = (e) => {
        const p = svgPoint(svg, e.clientX, e.clientY);
        const w = Math.abs(p.x - start.x);
        const h = Math.abs(p.y - start.y);
        if (p.x > start.x) {
            p.x = start.x;
        }
        if (p.y > start.y) {
            p.y = start.y;
        }
        rect.setAttributeNS(null, 'x', p.x);
        rect.setAttributeNS(null, 'y', p.y);
        rect.setAttributeNS(null, 'width', w);
        rect.setAttributeNS(null, 'height', h);
        if (fillColor == false) {
            rect.setAttributeNS(null, 'fill', "transparent");
            rect.setAttributeNS(null, 'stroke', bordercolor);
            rect.setAttributeNS(null, 'stroke-width', linewidth);
        }
        else {
            rect.setAttributeNS(null, 'fill', color);
            rect.setAttributeNS(null, 'stroke', bordercolor);
            rect.setAttributeNS(null, 'stroke-width', linewidth);
        }
        rect.addEventListener('mousedown', stroke);
        rect.classList.add("rect")
        svg.appendChild(rect);
    };
    svg.addEventListener('mousemove', drawRect);
    const endDraw = (e) => {
        svg.removeEventListener('mousemove', drawRect);
        svg.removeEventListener('mouseup', endDraw);
        svg.addEventListener('mousemove', drawing);
    };
    svg.addEventListener('mouseup', endDraw);
}
//рисование круга
const StartDrawCircle = (e) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const circleStart = svgPoint(svg, event.clientX, event.clientY);
    const drawCircle = (e) => {
        const p = svgPoint(svg, e.clientX, e.clientY);
        const r = Math.abs(p.x - circleStart.x);
        if (p.x > circleStart.x) {
            p.x = circleStart.x;
        }
        if (p.y > circleStart.y) {
            p.y = circleStart.y;
        }
        circle.setAttributeNS(null, 'cx', p.x);
        circle.setAttributeNS(null, 'cy', p.y);
        circle.setAttributeNS(null, 'r', r);
        if (fillColor == false) {
            circle.setAttributeNS(null, 'fill', "transparent");
            circle.setAttributeNS(null, 'stroke', bordercolor);
            circle.setAttributeNS(null, 'stroke-width', linewidth);
        }
        else {
            circle.setAttributeNS(null, 'fill', color);
            circle.setAttributeNS(null, 'stroke', bordercolor);
            circle.setAttributeNS(null, 'stroke-width', linewidth);
        }
        circle.addEventListener('mousedown', stroke);
        circle.classList.add("circle");
        svg.appendChild(circle);
    };
    svg.addEventListener('mousemove', drawCircle);
    const endDrawCircle = (e) => {
        svg.removeEventListener('mousemove', drawCircle);
        svg.removeEventListener('mouseup', endDrawCircle);
        svg.addEventListener('mousemove', drawing);
    };
    svg.addEventListener('mouseup', endDrawCircle);
}
//выбор фигуры
function stroke(evt) {
    if (svgAndCanvas == false) {
        isMoving = true;
        selectedElement = evt.target;
        if (selectedElement.classList.contains("blink") == true) {
            if (selectedElement.classList.contains("rect") == true) {
                evt.preventDefault()
                selectedElementRect = selectedElement;
                offsetRect = getMousePosition(evt);
                prevPositionX = offsetRect.x;
                prevPositionY = offsetRect.y;
                offsetRect.x -= parseFloat(selectedElementRect.getAttributeNS(null, "x"));
                offsetRect.y -= parseFloat(selectedElementRect.getAttributeNS(null, "y"));
                svg.addEventListener('mousemove', drag);
                selectedElement.addEventListener('mouseup', endDrag);
            }
            else {
                evt.preventDefault()
                selectedElementCirc = selectedElement;
                offsetCirc = getMousePosition(evt);
                prevPositionX = offsetCirc.x;
                prevPositionY = offsetCirc.y;
                offsetCirc.x -= parseFloat(selectedElementCirc.getAttributeNS(null, "cx"));
                offsetCirc.y -= parseFloat(selectedElementCirc.getAttributeNS(null, "cy"));
                selectedElement.addEventListener('mousemove', dragCircle);
                selectedElement.addEventListener('mouseup', endDragCircle);
            }
            selectedElement.classList.remove("blink");
            selectedElement = null
        }
        else {
            if (prevElement == null) {
                prevElement = selectedElement
                selectedElement.classList.add("blink");
            }
            else {
                prevElement.classList.remove("blink")
                prevElement = selectedElement
                selectedElement.classList.add("blink");
            }
        }
    }
}
function drag(evt) {
    if (selectedElementRect) {
        evt.preventDefault();
        document.addEventListener('keydown', (event) => {
            if (event.keyCode === 27) {
                selectedElementRect.setAttributeNS(null, "x", prevPositionX);
                selectedElementRect.setAttributeNS(null, "y", prevPositionY);
                endDrag(evt)
            }
        }, false);
        var coordRect = getMousePosition(evt);
        selectedElementRect.setAttributeNS(null, "x", coordRect.x - offsetRect.x);
        selectedElementRect.setAttributeNS(null, "y", coordRect.y - offsetRect.y);
    }
}
function endDrag(evt) {
    document.removeEventListener('keydown', (event) => {
        if (event.keyCode === 27) {
            selectedElementRect.setAttributeNS(null, "x", prevPositionX);
            selectedElementRect.setAttributeNS(null, "y", prevPositionY);
        }
    }, false);
    selectedElementRect.removeEventListener('mousemove', drag);
    selectedElementRect.removeEventListener('mouseup', endDrag);
    isMoving = false;
    selectedElementRect = null;
}
function dragCircle(evt) {
    if (selectedElementCirc) {
        evt.preventDefault();
        document.addEventListener('keydown', (event) => {
            if (event.keyCode === 27) {
                selectedElementCirc.setAttributeNS(null, "cx", prevPositionX);
                selectedElementCirc.setAttributeNS(null, "cy", prevPositionY);
                endDragCircle(evt)
            }
        }, false);
        var coord = getMousePosition(evt);
        selectedElementCirc.setAttributeNS(null, "cx", coord.x - offsetCirc.x);
        selectedElementCirc.setAttributeNS(null, "cy", coord.y - offsetCirc.y);
    }
}
function endDragCircle(evt) {
    selectedElementCirc.removeEventListener('mousemove', dragCircle);
    selectedElementCirc.removeEventListener('mouseup', endDragCircle);
    isMoving = false;
    selectedElementCirc = null;
}
function getMousePosition(evt) {
    evt.preventDefault();
    var CTM = svg.getScreenCTM();
    return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
    };
}
function svgLayerActive() {
    svgAndCanvas = false
    sizeSlider.addEventListener("change", onChangeSliderSVG);
    clear.disabled = false;
    svg.style.visibility = 'visible';
    canvas.style.visibility = 'hidden';
    document.addEventListener('keydown', (event) => {
        if (event.keyCode === 46) {
            alert(`Удаление выделенного элемента?`);
            svg.removeChild(selectedElement)
        }
        isMoving = false
    }, false);
    svg.addEventListener("mousedown", startDraw);
    svg.addEventListener("mousemove", drawing);
    svg.addEventListener("mouseup", () => isDrawing = false);
}
function svgAndCanvasActive() {
    svgAndCanvas = true
    svg.removeEventListener("mousedown", startDraw);
    svg.removeEventListener("mousemove", drawing);
    svg.removeEventListener("mouseup", () => isDrawing = false);
    clear.disabled = true;
    canvas.style.visibility = 'visible';
    svg.style.visibility = 'visible';
}
function canvasLayerActive() {
    clear.disabled = false;
    canvas.style.visibility = 'visible';
    svg.style.visibility = 'hidden';
    const drawRect = (e) => {
        if (!fill) {
            return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
        }
        ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
        ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
    const drawCircle = (e) => {
        ctx.beginPath();
        var radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
        ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
        if (!fill) {
            return ctx.stroke();
        }
        else {
            ctx.stroke()
            ctx.fill();
        }
    }
    const startDraw = (e) => {
        isDrawing = true;
        prevMouseX = e.offsetX;
        prevMouseY = e.offsetY;
        ctx.beginPath();
        ctx.lineWidth = linewidth;
        ctx.strokeStyle = bordercolor;
        ctx.fillStyle = color;
        fill = checkbox.checked
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    const drawing = (e) => {
        if (!isDrawing) return;
        ctx.putImageData(snapshot, 0, 0);
        if (selectedTool === "rectangle") {
            drawRect(e);
        }
        else if (selectedTool === "circle") {
            drawCircle(e);
        }
    }
    function end() {
        isMoving == false
        isDrawing = false
    }
    canvas.addEventListener("mousemove", drawing);
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mouseup", end);
}
function Clear() {
    if (svgLayer.checked == true) {
        while (svg.lastChild) {
            svg.removeChild(svg.lastChild);
            console.log("svg cleared!")
        }
    }
    else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.log("canvas cleared!")
    }
}
function disableAll() {
    console.log("none")
    clear.disabled = true;
    svg.style.visibility = 'hidden';
    canvas.style.visibility = 'hidden';
}