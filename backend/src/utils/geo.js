/**
 * ZONE-01 helpers — polygon validity, overlap detection, point-in-polygon.
 */

function ringArea(points) {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].lng * points[j].lat;
    area -= points[j].lng * points[i].lat;
  }
  return Math.abs(area / 2);
}

function hasSelfIntersection(points) {
  if (!points || points.length < 4) return false;
  const segs = [];
  for (let i = 0; i < points.length - 1; i++) {
    segs.push([points[i], points[i + 1]]);
  }
  // close ring
  segs.push([points[points.length - 1], points[0]]);

  function orient(a, b, c) {
    return (b.lng - a.lng) * (c.lat - a.lat) - (b.lat - a.lat) * (c.lng - a.lng);
  }
  function onSeg(a, b, c) {
    return (
      Math.min(a.lng, b.lng) <= c.lng &&
      c.lng <= Math.max(a.lng, b.lng) &&
      Math.min(a.lat, b.lat) <= c.lat &&
      c.lat <= Math.max(a.lat, b.lat)
    );
  }
  function intersects(p1, q1, p2, q2) {
    const o1 = orient(p1, q1, p2);
    const o2 = orient(p1, q1, q2);
    const o3 = orient(p2, q2, p1);
    const o4 = orient(p2, q2, q1);
    if (o1 === 0 && onSeg(p1, q1, p2)) return true;
    if (o2 === 0 && onSeg(p1, q1, q2)) return true;
    if (o3 === 0 && onSeg(p2, q2, p1)) return true;
    if (o4 === 0 && onSeg(p2, q2, q1)) return true;
    return o1 * o2 < 0 && o3 * o4 < 0;
  }

  for (let i = 0; i < segs.length; i++) {
    for (let j = i + 1; j < segs.length; j++) {
      if (Math.abs(i - j) <= 1 || (i === 0 && j === segs.length - 1)) continue;
      if (intersects(segs[i][0], segs[i][1], segs[j][0], segs[j][1])) return true;
    }
  }
  return false;
}

function validatePolygon(points, { kind = 'boundary' } = {}) {
  const issues = [];
  if (!Array.isArray(points) || points.length < 3) {
    issues.push({
      code: 'TOO_FEW_POINTS',
      message: `${kind} polygon needs at least 3 points`,
    });
    return { valid: false, issues };
  }
  for (const [idx, p] of points.entries()) {
    if (typeof p?.lat !== 'number' || typeof p?.lng !== 'number' || Number.isNaN(p.lat) || Number.isNaN(p.lng)) {
      issues.push({ code: 'INVALID_COORD', message: `Point ${idx + 1} has invalid lat/lng` });
    } else if (p.lat < -90 || p.lat > 90 || p.lng < -180 || p.lng > 180) {
      issues.push({ code: 'OUT_OF_RANGE', message: `Point ${idx + 1} is outside valid lat/lng range` });
    }
  }
  if (ringArea(points) < 1e-12) {
    issues.push({ code: 'ZERO_AREA', message: `${kind} polygon has zero area` });
  }
  if (hasSelfIntersection(points)) {
    issues.push({
      code: 'SELF_INTERSECTION',
      message: `${kind} polygon edges intersect — geometry is invalid`,
    });
  }
  return { valid: issues.length === 0, issues };
}

function bbox(points) {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
}

function bboxesOverlap(a, b) {
  return !(a.maxLat < b.minLat || a.minLat > b.maxLat || a.maxLng < b.minLng || a.minLng > b.maxLng);
}

function polygonsLikelyOverlap(a, b) {
  if (!a?.length || !b?.length) return false;
  return bboxesOverlap(bbox(a), bbox(b));
}

function pointInPolygon(point, polygon) {
  if (!point || !polygon?.length) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi + 0.0) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

module.exports = {
  validatePolygon,
  polygonsLikelyOverlap,
  pointInPolygon,
  ringArea,
};
