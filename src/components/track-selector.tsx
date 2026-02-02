"use client";

import React from "react";
import { allTracks, TrackData } from "@/components/f1-tracks";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TrackSelectorProps {
  selectedTrackId: string;
  onTrackChange: (trackId: string) => void;
}

// Group tracks by region for better UX
const tracksByRegion = {
  "Asia & Middle East": ["bahrain", "jeddah", "shanghai", "suzuka", "baku", "marina-bay", "lusail", "yas-marina"],
  "Europe": ["monaco", "barcelona", "imola", "red-bull-ring", "silverstone", "hungaroring", "spa", "zandvoort", "monza"],
  "Americas": ["miami", "montreal", "cota", "mexico", "interlagos", "las-vegas"],
  "Oceania": ["albert-park"],
};

export default function TrackSelector({
  selectedTrackId,
  onTrackChange,
}: TrackSelectorProps) {
  const selectedTrack = allTracks.find((t) => t.id === selectedTrackId);

  return (
    <Select value={selectedTrackId} onValueChange={onTrackChange}>
      <SelectTrigger className="w-full bg-black/40 border-white/10 text-white">
        <SelectValue>
          {selectedTrack ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{selectedTrack.country}</span>
              <span className="font-medium">{selectedTrack.name}</span>
            </div>
          ) : (
            "Select a track"
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-neutral-900 border-white/10 text-white">
        {Object.entries(tracksByRegion).map(([region, trackIds]) => (
          <SelectGroup key={region}>
            <SelectLabel className="text-xs uppercase text-gray-500 font-bold px-2 py-1.5">
              {region}
            </SelectLabel>
            {trackIds.map((trackId) => {
              const track = allTracks.find((t) => t.id === trackId);
              if (!track) return null;
              return (
                <SelectItem
                  key={track.id}
                  value={track.id}
                  className="hover:bg-white/10 focus:bg-white/10"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{track.name}</span>
                    <span className="text-xs text-gray-400">{track.country}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
