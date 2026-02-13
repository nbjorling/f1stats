'use client';

import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import mqtt from 'mqtt';
import { fetchMqttToken } from '@/app/actions';
import { LiveDriverData } from '@/hooks/use-live-telemetry';

type LocationMsg = {
  driver_number: number;
  x: number;
  y: number;
  date: string;
};

type Point = { x: number; y: number; t: number };

type DriverState = {
  history: Point[];
  visualX: number;
  visualY: number;
  trail: Point[];
  color?: string;
  name?: string;
};

type Props = {
  driversInfo?: LiveDriverData[];
  width?: number;
  height?: number;
  padding?: number; // pixels
  trailLength?: number; // max trail points per driver
  playbackDelay?: number; // ms to stay behind "real-time" for smooth interpolation
  showLabels?: boolean;
  flipY?: boolean;
  rotationRad?: number;
};

function parseOpenF1Date(dateStr: string) {
  return new Date(dateStr).getTime();
}

const TrackMapCanvas = memo(function TrackMapCanvas({
  driversInfo = [],
  width = 900,
  height = 600,
  padding = 30,
  trailLength = 150,
  playbackDelay = 3000, // Slightly longer delay for safer buffering
  showLabels = true,
  flipY = true,
  rotationRad = 0,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const backCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const driversRef = useRef<Map<number, DriverState>>(new Map());
  const driversMapInfoRef = useRef<Map<number, LiveDriverData>>(new Map());
  const trackLayersRef = useRef<Map<number, { x: number; y: number }[]>>(
    new Map(),
  );

  const cumulativeBoundsRef = useRef({
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
    version: 0,
  });

  // synchronization: [Local timestamp] - [Server timestamp]
  const clockSkewRef = useRef<number | null>(null);
  // High-water mark of server time seen
  const latestServerTRef = useRef<number>(0);

  const staticLayerVersionRef = useRef(0);

  // Sync driversInfo to ref (stable between renders)
  useEffect(() => {
    const m = new Map<number, LiveDriverData>();
    driversInfo.forEach((d) => m.set(d.driver, d));
    driversMapInfoRef.current = m;
  }, [driversInfo]);

  // MQTT: receive live updates
  useEffect(() => {
    let client: mqtt.MqttClient | null = null;
    let isMounted = true;

    async function setupMqtt() {
      await new Promise((r) => setTimeout(r, 100));
      if (!isMounted) return;

      const token = await fetchMqttToken();
      if (!token || !isMounted) return;

      const mqttUrl = 'wss://mqtt.openf1.org:8084/mqtt';
      const options = {
        username: 'f1statsnext',
        password: token,
        reconnectPeriod: 5000,
        clientId: `f1stats_${Math.random().toString(16).slice(2, 10)}`,
        clean: true,
      };

      client = mqtt.connect(mqttUrl, options);

      client.on('connect', () => {
        if (!isMounted || !client || client.disconnecting) return;
        client.subscribe(['v1/location']);
      });

      client.on('message', (topic, message) => {
        if (topic !== 'v1/location') return;
        try {
          const msg = JSON.parse(message.toString()) as LocationMsg;
          const t = parseOpenF1Date(msg.date);

          if (t > latestServerTRef.current) {
            latestServerTRef.current = t;
            // Update clock skew estimate
            const skew = Date.now() - t;
            if (clockSkewRef.current === null) {
              clockSkewRef.current = skew;
            } else {
              // Smooth skew adjustment (moving average)
              clockSkewRef.current = clockSkewRef.current * 0.99 + skew * 0.01;
            }
          }

          let d = driversRef.current.get(msg.driver_number);
          if (!d) {
            const info = driversMapInfoRef.current.get(msg.driver_number);
            d = {
              history: [],
              visualX: msg.x,
              visualY: msg.y,
              trail: [],
              color: info?.color || '#FFFFFF',
              name: info?.name || String(msg.driver_number),
            };
            driversRef.current.set(msg.driver_number, d);
          }

          d.history.push({ x: msg.x, y: msg.y, t });
          if (d.history.length > 500) d.history.shift(); // Limit history

          // Update static track layer
          let layer = trackLayersRef.current.get(msg.driver_number);
          if (!layer) {
            layer = [];
            trackLayersRef.current.set(msg.driver_number, layer);
          }
          const last = layer[layer.length - 1];
          if (
            !last ||
            Math.pow(msg.x - last.x, 2) + Math.pow(msg.y - last.y, 2) > 400
          ) {
            layer.push({ x: msg.x, y: msg.y });
            if (layer.length > 8000) layer.shift();
          }

          // Update bounds
          const b = cumulativeBoundsRef.current;
          const cos = Math.cos(rotationRad);
          const sin = Math.sin(rotationRad);
          const rx = msg.x * cos - msg.y * sin;
          const ry = msg.x * sin + msg.y * cos;
          let changed = false;
          if (rx < b.minX) {
            b.minX = rx;
            changed = true;
          }
          if (ry < b.minY) {
            b.minY = ry;
            changed = true;
          }
          if (rx > b.maxX) {
            b.maxX = rx;
            changed = true;
          }
          if (ry > b.maxY) {
            b.maxY = ry;
            changed = true;
          }
          if (changed) b.version++;
        } catch (e) {}
      });
    }

    setupMqtt();
    return () => {
      isMounted = false;
      if (client) client.end();
    };
  }, [rotationRad]);

  useEffect(() => {
    let raf = 0;
    if (!backCanvasRef.current)
      backCanvasRef.current = document.createElement('canvas');
    const backCanvas = backCanvasRef.current;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const b = cumulativeBoundsRef.current;

      // Calculate transform
      let transform = { scale: 1, tx: width / 2, ty: height / 2 };
      if (b.minX !== Infinity) {
        const spanX = Math.max(1e-9, b.maxX - b.minX);
        const spanY = Math.max(1e-9, b.maxY - b.minY);
        const usableW = Math.max(1, width - padding * 2);
        const usableH = Math.max(1, height - padding * 2);
        const scale = Math.min(usableW / spanX, usableH / spanY);
        const cx = (b.minX + b.maxX) / 2;
        const cy = (b.minY + b.maxY) / 2;
        transform = {
          scale,
          tx: width / 2 - cx * scale,
          ty: height / 2 - cy * scale,
        };
      }

      const worldToScreen = (x: number, y: number) => {
        const cos = Math.cos(rotationRad);
        const sin = Math.sin(rotationRad);
        const rx = x * cos - y * sin;
        const ry = x * sin + y * cos;
        const sx = rx * transform.scale + transform.tx;
        const syRaw = ry * transform.scale + transform.ty;
        const sy = flipY ? height - syRaw : syRaw;
        return { x: sx, y: sy };
      };

      // == RENDER STATIC LAYER ==
      const staticVersion = b.version + trackLayersRef.current.size;
      if (
        staticLayerVersionRef.current !== staticVersion &&
        (raf % 60 === 0 || staticLayerVersionRef.current === 0)
      ) {
        backCanvas.width = width;
        backCanvas.height = height;
        const bCtx = backCanvas.getContext('2d');
        if (bCtx) {
          bCtx.clearRect(0, 0, width, height);
          bCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          bCtx.lineWidth = 3;
          bCtx.lineCap = 'round';
          bCtx.lineJoin = 'round';

          for (const [, points] of trackLayersRef.current) {
            if (points.length < 2) continue;
            bCtx.beginPath();
            const p0 = worldToScreen(points[0].x, points[0].y);
            bCtx.moveTo(p0.x, p0.y);
            for (let i = 1; i < points.length; i++) {
              const p = worldToScreen(points[i].x, points[i].y);
              bCtx.lineTo(p.x, p.y);
            }
            bCtx.stroke();
          }
          staticLayerVersionRef.current = staticVersion;
        }
      }

      // == CONTINUOUS PLAYBACK CLOCK ==
      // Estimate current server time: [Local Time] - [Skew]
      const currentServerTime =
        clockSkewRef.current !== null ?
          Date.now() - clockSkewRef.current
        : latestServerTRef.current;
      const playbackT = currentServerTime - playbackDelay;

      for (const d of driversRef.current.values()) {
        const h = d.history;
        if (h.length < 2) continue;

        // Find interpolation window
        let p1: Point | null = null;
        let p2: Point | null = null;

        // History is sorted by t
        for (let i = 0; i < h.length - 1; i++) {
          if (h[i].t <= playbackT && h[i + 1].t > playbackT) {
            p1 = h[i];
            p2 = h[i + 1];
            break;
          }
        }

        if (p1 && p2) {
          const ratio = (playbackT - p1.t) / (p2.t - p1.t);
          d.visualX = p1.x + (p2.x - p1.x) * ratio;
          d.visualY = p1.y + (p2.y - p1.y) * ratio;
        } else {
          // If we're out of buffer range, use the last/first known point
          const last = h[h.length - 1];
          const first = h[0];
          if (playbackT >= last.t) {
            d.visualX = last.x;
            d.visualY = last.y;
          } else if (playbackT <= first.t) {
            d.visualX = first.x;
            d.visualY = first.y;
          }
        }

        // Trail updates
        const lastTrail = d.trail[d.trail.length - 1];
        if (
          !lastTrail ||
          Math.pow(d.visualX - lastTrail.x, 2) +
            Math.pow(d.visualY - lastTrail.y, 2) >
            100
        ) {
          d.trail.push({ x: d.visualX, y: d.visualY, t: playbackT });
          if (d.trail.length > trailLength) d.trail.shift();
        }
      }

      // == RENDER MAIN CANVAS ==
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(backCanvas, 0, 0);

      const driversData = Array.from(driversRef.current.values());

      // Trails
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const d of driversData) {
        if (d.trail.length < 2) continue;
        ctx.beginPath();
        ctx.strokeStyle = d.color || '#FFFFFF';
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 2.5;
        const p0 = worldToScreen(d.trail[0].x, d.trail[0].y);
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < d.trail.length; i++) {
          const p = worldToScreen(d.trail[i].x, d.trail[i].y);
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Dots + Labels
      ctx.globalAlpha = 1;
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      for (const d of driversData) {
        const p = worldToScreen(d.visualX, d.visualY);

        ctx.beginPath();
        ctx.fillStyle = d.color || '#FFFFFF';
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (showLabels) {
          ctx.fillStyle = '#FFF';
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(0,0,0,1)';
          ctx.fillText(d.name || '', p.x + 10, p.y);
          ctx.shadowBlur = 0;
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [
    width,
    height,
    padding,
    rotationRad,
    flipY,
    showLabels,
    playbackDelay,
    trailLength,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-auto max-h-[75vh] bg-zinc-950/60 rounded-2xl border border-white/10 shadow-2xl"
    />
  );
});

export default TrackMapCanvas;
