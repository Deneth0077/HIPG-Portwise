/**
 * Road / Corridor Definition Types for HIPG Terminal
 */

export interface RoadSegment {
  id: string;
  name: string;
  x: number; // Center X
  z: number; // Center Z
  width: number; // X span (or width if along Z)
  depth: number; // Z span (or length)
  rotation?: number; // degrees
  color?: string; // road asphalt color (default #232830)
  hasMarking?: boolean; // yellow / white median line
  markingColor?: string; // e.g. #E6C844 or #FFFFFF
  label?: string; // e.g. "MAIN ROAD"
  isCustom?: boolean; // whether created by user
}

export type CreateRoadInput = Omit<RoadSegment, "id"> & { id?: string };
