"use client";
import React from "react";
import './loader.css';

function Loading() {
    return (
        <div className="flex justify-center items-center h-screen fixed inset-0">
            <div className="loader"></div>
        </div>
    )
}

export default Loading;