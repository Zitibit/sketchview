import React from "react"; 
import {
    MousePointer2,
    RectangleHorizontal,
    Diamond,
    ArrowRight,
    Circle,
    Pencil,
    Type,
    Minus,
    Share as Share2Off,
    Move,
    Circle as CircleIcon,
    ArrowRight as ArrowRightIcon,
    Type as TypeIcon,
    Minus as MinusIcon,
    Pencil as PencilIcon,
    Move as MoveIcon,
    Eraser,
  } from "lucide-react";
import { Tool } from "../interface";

const TOOLS: { icon:  React.JSX.Element; tool: Tool; title: string }[] = [
    { icon: <Pencil size={20} strokeWidth={1}/>, tool: "freedraw", title: "Freehand" },
    { icon: <MousePointer2 size={20} strokeWidth={1}/>, tool: "select", title: "Select" },
    {
      icon: <RectangleHorizontal size={20} strokeWidth={1}/>,
      tool: "rectangle",
      title: "Rectangle",
    },
    { icon: <Diamond size={20} strokeWidth={1}/>, tool: "diamond", title: "Diamond" },
    { icon: <Circle size={20} strokeWidth={1}/>, tool: "ellipse", title: "Ellipse" },
    { icon: <ArrowRight size={20} strokeWidth={1}/>, tool: "arrow", title: "Arrow" },
    { icon: <Minus size={20} strokeWidth={1}/>, tool: "line", title: "Line" },
    { icon: <Eraser size={20} strokeWidth={1}/>, tool: "eraser", title: "Eraser" },
    { icon: <Type size={20} strokeWidth={1}/>, tool: "text", title: "Text" },
    { icon: <Move size={20} strokeWidth={1}/>, tool: "pan", title: "Move" },
  ];

export default TOOLS;