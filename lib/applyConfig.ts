import express from "express";
import { io } from "./httpServerExporter";

const applyConfig = (config: Record<string, any>, app: express.Express) => {
    app.set('io', io);
};

export default applyConfig;
