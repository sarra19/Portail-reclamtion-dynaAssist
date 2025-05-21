import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { RiBrushFill, RiCircleLine, RiDeleteBinLine, RiEraserFill, RiPaintFill, RiPaletteFill, RiRectangleLine, RiShapesFill, RiStickyNoteFill, RiTriangleFill, RiTriangleLine } from "react-icons/ri";
import { TbOvalVertical } from 'react-icons/tb';
import { BiPolygon, BiStar } from 'react-icons/bi';
import { FaArrowsAltH, FaFilePowerpoint, FaGripLines, FaMicrophone, FaMicrophoneSlash, FaPalette } from "react-icons/fa";
import { useHistory } from 'react-router-dom';
import StickyNote from './StickyNote';

const Canvas = ({ roomId, quiz }) => {
  const socketRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("brush");
  const [startPoint, setStartPoint] = useState(null);
  const [color, setColor] = useState("#000000");
  const [brushWidth, setBrushWidth] = useState(5);
  const [sides, setSides] = useState(5);
  const colorInputRef = useRef(null);
  const [stickyNotes, setStickyNotes] = useState([]);
  const history = useHistory();

  useEffect(() => {

    socketRef.current = io.connect('http://localhost:8800');
    if (roomId) {
      socketRef.current.emit("joinRoom", roomId);

      socketRef.current.on("loadDrawing", (drawings) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        drawings.forEach((drawing) => renderDrawing(ctx, drawing));
      });

      socketRef.current.on("drawing", (data) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        renderDrawing(ctx, data);
      });

      socketRef.current.on("clearBoard", () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });

      socketRef.current.on("syncStickyNotes", (notes) => {
        setStickyNotes(notes);
      });

      socketRef.current.on("syncDeleteStickyNote", (noteId) => {
        // Remove the note with the specified ID
        setStickyNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      });

      socketRef.current.on("createStickyNote", (note) => {
        setStickyNotes((prevNotes) => [...prevNotes, note]);
      });
    }

    return () => {
      socketRef.current.off("loadDrawing");
      socketRef.current.off("drawing");
      socketRef.current.off("clearBoard");
      socketRef.current.off("syncStickyNotes");
      socketRef.current.off("createStickyNote");
    };
  }, [roomId]);

  const renderDrawing = (ctx, drawing) => {
    ctx.strokeStyle = drawing.color || "#000";
    ctx.lineWidth = drawing.brushWidth || 1;

    switch (drawing.tool) {
      case "brush":
        ctx.beginPath();
        ctx.moveTo(drawing.prevX, drawing.prevY);
        ctx.lineTo(drawing.offsetX, drawing.offsetY);
        ctx.stroke();
        break;

      case "circle":
        ctx.beginPath();
        ctx.arc(drawing.startPoint.x, drawing.startPoint.y, drawing.radius, 0, 2 * Math.PI);
        ctx.lineWidth = drawing.brushWidth || 1;
        ctx.stroke();
        break;

      case "eraser":
        ctx.strokeStyle = "#FFFFFF"; // Assuming the background is white
        ctx.lineWidth = drawing.brushWidth || 10; // Larger width for erasing
        ctx.beginPath();
        ctx.moveTo(drawing.prevX, drawing.prevY);
        ctx.lineTo(drawing.offsetX, drawing.offsetY);
        ctx.stroke();
        break;


      case "rectangle":
        ctx.lineWidth = drawing.brushWidth || 1;
        ctx.strokeRect(
          drawing.startPoint.x,
          drawing.startPoint.y,
          drawing.endPoint.x - drawing.startPoint.x,
          drawing.endPoint.y - drawing.startPoint.y
        );
        break;

      case "line":
        ctx.beginPath();
        ctx.moveTo(drawing.startPoint.x, drawing.startPoint.y);
        ctx.lineTo(drawing.endPoint.x, drawing.endPoint.y);
        ctx.lineWidth = drawing.brushWidth || 1;
        ctx.stroke();
        break;

      case "ellipse":
        ctx.beginPath();
        ctx.ellipse(
          (drawing.startPoint.x + drawing.endPoint.x) / 2,
          (drawing.startPoint.y + drawing.endPoint.y) / 2,
          drawing.radiusX,
          drawing.radiusY,
          0,
          0,
          2 * Math.PI
        );
        ctx.lineWidth = drawing.brushWidth || 1;
        ctx.stroke();
        break;

      case "polygon":
        ctx.lineWidth = drawing.brushWidth || 1;
        drawPolygon(ctx, drawing.startPoint.x, drawing.startPoint.y, drawing.radius, drawing.sides);
        ctx.stroke();
        break;

      case "star":
        ctx.lineWidth = drawing.brushWidth || 1;
        drawStar(ctx, drawing.startPoint.x, drawing.startPoint.y, drawing.radius, drawing.points);
        ctx.stroke();
        break;

      case "triangle":
        drawTriangle(ctx, drawing.startPoint, drawing.endPoint, drawing.fill);
        break;

      case "arrow":
        drawArrow(ctx, drawing.startPoint, drawing.endPoint, drawing.fill);
        break;

      case "fill":
        const targetColor = ctx.getImageData(drawing.x, drawing.y, 1, 1).data;
        const fillColor = hexToRGBA(drawing.color);
        floodFill(ctx, drawing.x, drawing.y, Array.from(targetColor), fillColor);
        break;


      default:
        console.error("Unknown tool:", drawing.tool);
    }
  };

  const handleColorClick = () => {
    colorInputRef.current.click();
  };

  const drawPolygon = (ctx, x, y, radius, sides) => {
    const angleStep = (2 * Math.PI) / sides;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const px = x + radius * Math.cos(i * angleStep);
      const py = y + radius * Math.sin(i * angleStep);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  };


  const drawStar = (ctx, x, y, radius, points) => {
    const angleStep = (2 * Math.PI) / points;
    const innerRadius = radius / 2;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : innerRadius;
      const px = x + r * Math.cos(i * angleStep);
      const py = y + r * Math.sin(i * angleStep);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  };

  const drawTriangle = (ctx, start, end, fillShape) => {
    ctx.beginPath();
    ctx.moveTo(start.x, end.y); // Bottom-left
    ctx.lineTo(end.x, end.y); // Bottom-right
    ctx.lineTo((start.x + end.x) / 2, start.y); // Top-center
    ctx.closePath();
    if (fillShape) ctx.fill();
    else ctx.stroke();
  };

  const drawArrow = (ctx, start, end, fillShape) => {
    const arrowWidth = 10;
    const arrowHeight = 20;

    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowPoint = { x: end.x, y: end.y };
    const arrowBase1 = {
      x: end.x - arrowHeight * Math.cos(angle) + arrowWidth * Math.sin(angle),
      y: end.y - arrowHeight * Math.sin(angle) - arrowWidth * Math.cos(angle),
    };
    const arrowBase2 = {
      x: end.x - arrowHeight * Math.cos(angle) - arrowWidth * Math.sin(angle),
      y: end.y - arrowHeight * Math.sin(angle) + arrowWidth * Math.cos(angle),
    };

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(arrowPoint.x, arrowPoint.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(arrowBase1.x, arrowBase1.y);
    ctx.lineTo(arrowPoint.x, arrowPoint.y);
    ctx.lineTo(arrowBase2.x, arrowBase2.y);
    ctx.closePath();

    if (fillShape) ctx.fill();
    else ctx.stroke();
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    if (tool === "fill") {
      const ctx = canvas.getContext("2d");
      const targetColor = ctx.getImageData(x, y, 1, 1).data;
      const fillColor = hexToRGBA(color);

      floodFill(ctx, x, y, Array.from(targetColor), fillColor);

      if (roomId) {
        socketRef.current.emit("drawing", { roomId, tool: "fill", x, y, color });
      }
    }
    else if (tool === "stickyNote") {
      createStickyNote(x, y); // Create sticky note at clicked position
    }
    else {
      setIsDrawing(true);
      setStartPoint({ x, y });
      if (tool === "brush") {
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = brushWidth;
      }
    }
  };


  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext("2d");

    // Set brush properties
    ctx.strokeStyle = color;
    ctx.lineWidth = brushWidth;
    ctx.lineCap = "round"; // Ensures the ends of lines are rounded
    ctx.lineJoin = "round"; // Smoothens the joins between segments

    if (tool === "brush") {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y); // Start from the last point
      ctx.lineTo(x, y); // Draw to the current point
      ctx.stroke();

      // Emit the drawing event for real-time synchronization
      if (roomId) {
        socketRef.current.emit("drawing", {
          roomId,
          tool: "brush",
          offsetX: x,
          offsetY: y,
          prevX: startPoint.x,
          prevY: startPoint.y,
          color,
          brushWidth,
        });
      }

      // Update the start point for the next segment
      setStartPoint({ x, y });
    }
    else if (tool === "eraser") {
      ctx.strokeStyle = "#FFFFFF"; // Erase with the background color
      ctx.lineWidth = brushWidth;
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();

      if (roomId) {
        socketRef.current.emit("drawing", {
          roomId,
          tool: "eraser",
          offsetX: x,
          offsetY: y,
          prevX: startPoint.x,
          prevY: startPoint.y,
          brushWidth,
        });
      }

      setStartPoint({ x, y });
    }

  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    let drawingData = { roomId, tool, color, brushWidth };

    switch (tool) {
      case "circle":
        const radius = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2));
        ctx.beginPath();
        ctx.lineWidth = brushWidth;
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        drawingData = { ...drawingData, startPoint, radius };
        break;

      case "rectangle":
        ctx.lineWidth = brushWidth;
        ctx.strokeRect(startPoint.x, startPoint.y, x - startPoint.x, y - startPoint.y);
        drawingData = { ...drawingData, startPoint, endPoint: { x, y } };
        break;

      case "line":
        ctx.lineWidth = brushWidth;
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        drawingData = { ...drawingData, startPoint, endPoint: { x, y } };
        break;

      case "ellipse":
        const radiusX = Math.abs(x - startPoint.x) / 2;
        const radiusY = Math.abs(y - startPoint.y) / 2;
        ctx.lineWidth = brushWidth;
        ctx.beginPath();
        ctx.ellipse((startPoint.x + x) / 2, (startPoint.y + y) / 2, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
        drawingData = { ...drawingData, startPoint, endPoint: { x, y }, radiusX, radiusY };
        break;

      case "polygon":
        const radiusPoly = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2));
        ctx.lineWidth = brushWidth;
        drawPolygon(ctx, startPoint.x, startPoint.y, radiusPoly, sides);
        ctx.stroke();
        drawingData = { ...drawingData, startPoint, radius: radiusPoly, sides };
        break;

      case "star":
        const radiusStar = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2));
        ctx.lineWidth = brushWidth;
        drawStar(ctx, startPoint.x, startPoint.y, radiusStar, sides);
        ctx.stroke();

        drawingData = { ...drawingData, startPoint, radius: radiusStar, points: sides };
        break;

      case "triangle":
        drawTriangle(ctx, startPoint, { x, y });
        drawingData = { ...drawingData, startPoint, endPoint: { x, y } };
        break;

      case "arrow":
        drawArrow(ctx, startPoint, { x, y });
        drawingData = { ...drawingData, startPoint, endPoint: { x, y } };
        break;

      case "fill":
        const targetColor = ctx.getImageData(x, y, 1, 1).data; // Use x and y from mouse event
        const fillColor = hexToRGBA(drawingData.color); // Use color from drawingData
        floodFill(ctx, x, y, Array.from(targetColor), fillColor); // Perform fill operation
        drawingData = { ...drawingData, type: "fill", targetColor: Array.from(targetColor), fillColor, x, y };
        break;

      default:
        break;
    }

    socketRef.current.emit("drawing", drawingData);

    setIsDrawing(false);
    setStartPoint(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socketRef.current.emit("clearBoard", roomId);
  };

  const createStickyNote = (x, y) => {
    const note = {
      id: Date.now(), // You can use a better unique ID generation strategy
      x,
      y,
      text: "New sticky note",
      color: "#FFF9C4", // You can customize the color
    };

    // Emit the sticky note creation to the backend
    socketRef.current.emit("createStickyNote", {
      roomId,
      note,
    });

    // Temporarily add the sticky note locally (this will be synced later)
    setStickyNotes((prevNotes) => [...prevNotes, note]);
  };

  const updateStickyNote = (updatedNote) => {
    // Emit the updated sticky note to the backend
    socketRef.current.emit("updateStickyNote", {
      roomId,
      note: updatedNote,
    });

    // Update the sticky notes locally
    setStickyNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === updatedNote.id ? updatedNote : note
      )
    );
  };

  const deleteStickyNote = (noteId) => {
    // Emit the deletion event to the backend
    socketRef.current.emit("deleteStickyNote", {
      roomId,
      noteId,
    });

    // Remove the note locally (optimistic update)
    setStickyNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
  };

  const handleCreateNewNote = (x, y) => {
    createStickyNote(x, y); // Create a new note with an offset from the clicked note
  };

  const floodFill = (ctx, startX, startY, targetColor, fillColor) => {
    const canvas = canvasRef.current;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;

    const getColorAt = (x, y) => {
      const index = (y * width + x) * 4;
      return data.slice(index, index + 4); // RGBA array
    };

    const setColorAt = (x, y, color) => {
      const index = (y * width + x) * 4;
      data[index] = color[0]; // R
      data[index + 1] = color[1]; // G
      data[index + 2] = color[2]; // B
      data[index + 3] = color[3]; // A
    };

    const colorMatch = (c1, c2) => c1.every((v, i) => v === c2[i]);

    const fillStack = [[startX, startY]];
    while (fillStack.length) {
      const [x, y] = fillStack.pop();
      const currentColor = getColorAt(x, y);

      if (!colorMatch(currentColor, targetColor) || colorMatch(currentColor, fillColor)) continue;

      setColorAt(x, y, fillColor);

      if (x > 0) fillStack.push([x - 1, y]);
      if (x < width - 1) fillStack.push([x + 1, y]);
      if (y > 0) fillStack.push([x, y - 1]);
      if (y < height - 1) fillStack.push([x, y + 1]);
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const hexToRGBA = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255, 255];
  };

  const navigateToQuiz = () => {
    history.push('/quiz', { state: { quizData: quiz } });
  }

  return (
    <div className="min-h-screen bg-blueGray-100 flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar */}
      <div className="bg-white shadow-lg rounded-r-xl p-4 flex flex-col gap-6 w-full lg:w-48">
        <div className="mt-20 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-blueGray-800 mb-4">Drawing Tools</h3>
          
          {/* Tools Grid */}
          <div className="flex flex-row grid grid-cols-3 gap-3 ">
            {[
              { tool: "brush", icon: <RiBrushFill className="text-xl" />, label: "Pinceau" },
              { tool: "eraser", icon: <RiEraserFill className="text-xl" />, label: "Gomme" },
              { tool: "circle", icon: <RiCircleLine className="text-xl" />, label: "Cercle" },
              { tool: "rectangle", icon: <RiRectangleLine className="text-xl" />, label: "Rectangle" },
              { tool: "triangle", icon: <RiTriangleLine className="text-xl" />, label: "Triangle" },
              { tool: "line", icon: <FaGripLines className="text-xl" />, label: "Ligne" },
              { tool: "ellipse", icon: <TbOvalVertical className="text-xl" />, label: "Ellipse" },
              { tool: "polygon", icon: <BiPolygon className="text-xl" />, label: "Polygon" },
              { tool: "star", icon: <BiStar className="text-xl" />, label: "Étoile" },
              { tool: "arrow", icon: <FaArrowsAltH className="text-xl" />, label: "Flèche" },
              { tool: "fill", icon: <RiPaintFill className="text-xl" />, label: "Remplissage" },
              { tool: "stickyNote", icon: <RiStickyNoteFill className="text-xl" />, label: "Note" },
            ].map(({ tool, icon, label }) => (
              <div key={tool} className="flex flex-col mr-2 items-center">
                <button
                  onClick={() => setTool(tool)}
                  className={`p-2 rounded-lg flex flex-col items-center w-full transition-all ${
                    tool === tool
                      ? "bg-orange-dys text-white shadow-md"
                      : "bg-white text-blueGray-700 hover:bg-blueGray-50"
                  }`}
                  title={label}
                >
                  {icon}
                  <span className="text-xs mt-1">{label}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

{/* Color Picker */}
<div className="flex flex-col mt-12 gap-2">
  <label className="text-sm font-medium text-gray-600">Sélectionner une couleur</label>
  <div className="flex items-center gap-3">
    <button
      onClick={handleColorClick}
      className="mt-2 px-4 py-2 rounded-lg border border-gray-300 flex items-center justify-between w-full bg-gray-100 shadow-sm transition hover:bg-gray-200"
    >
      <div 
        className="w-8 h-8 rounded-full border border-gray-400 shadow-md" 
        style={{ backgroundColor: color }}
      />
      <span className="text-sm font-semibold text-gray-700">Changer</span>
    </button>
    <input
      type="color"
      ref={colorInputRef}
      value={color}
      onChange={(e) => setColor(e.target.value)}
      className="hidden"
    />
  </div>
</div>



        {/* Brush Size */}
        <div className="mt-12 flex flex-col gap-2">
          <label className="text-sm font-medium text-blueGray-700">
            Taille de Pinceau: {brushWidth}px
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={brushWidth}
            onChange={(e) => setBrushWidth(Number(e.target.value))}
            className="w-full accent-orange-dys"
          />
        </div>

        {/* Actions */}
        <div className="mt-12 flex flex-col gap-3 mt-2">
          <button
            onClick={clearCanvas}
            className="flex items-center justify-center px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300  bg-red-500 text-white"
          >
            <RiDeleteBinLine />
            <span className="ml-2 ">Effacer Canvas</span>
          </button>

          {/* {quiz && (
            <button
              onClick={navigateToQuiz}
              className="flex items-center justify-center gap-2 p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <FaFilePowerpoint />
              <span>Take Quiz</span>
            </button>
          )} */}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-grow p-4">
        <div className="bg-white rounded-xl shadow-lg h-full flex items-center justify-center relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={900}
            height={662}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="border border-blueGray-200 rounded-lg"
          />

          {/* Sticky Notes */}
          {stickyNotes.map((note) => (
            <StickyNote
              key={note.id}
              noteData={note}
              onUpdateNote={updateStickyNote}
              onDeleteNote={deleteStickyNote}
              onCreateNewNote={handleCreateNewNote}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Canvas;