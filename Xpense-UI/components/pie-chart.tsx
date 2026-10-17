import { Text, View } from 'react-native';
import Svg, { G, Line, Path, Text as SvgText } from 'react-native-svg';

import { money, typeColor } from '@/lib/format';
import { colors, space } from '@/lib/theme';
import type { TransactionType } from '@/lib/types';

type Slice = {
  label: string;
  amount: number;
  color: string;
};

type Point = { x: number; y: number };

type SegmentCallout = {
  d: string;
  color: string;
  slice: Slice;
  pct: number;
  onRing: Point;
  elbow: Point;
  label: Point;
  goRight: boolean;
};

function polar(cx: number, cy: number, r: number, angleDeg: number): Point {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSlice(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  start: number,
  end: number
) {
  if (end - start >= 359.99) {
    end = start + 359.99;
  }
  const oStart = polar(cx, cy, outer, end);
  const oEnd = polar(cx, cy, outer, start);
  const iStart = polar(cx, cy, inner, start);
  const iEnd = polar(cx, cy, inner, end);
  const large = end - start > 180 ? 1 : 0;
  return [
    `M ${oStart.x} ${oStart.y}`,
    `A ${outer} ${outer} 0 ${large} 0 ${oEnd.x} ${oEnd.y}`,
    `L ${iStart.x} ${iStart.y}`,
    `A ${inner} ${inner} 0 ${large} 1 ${iEnd.x} ${iEnd.y}`,
    'Z',
  ].join(' ');
}

function arrowHeadAtTip(tip: Point, toward: Point, head = 6) {
  const angle = Math.atan2(tip.y - toward.y, tip.x - toward.x);
  const left = {
    x: tip.x - head * Math.cos(angle - Math.PI / 7),
    y: tip.y - head * Math.sin(angle - Math.PI / 7),
  };
  const right = {
    x: tip.x - head * Math.cos(angle + Math.PI / 7),
    y: tip.y - head * Math.sin(angle + Math.PI / 7),
  };
  return `M ${tip.x} ${tip.y} L ${left.x} ${left.y} L ${right.x} ${right.y} Z`;
}

function assignCalloutDirections(
  items: { onRing: Point; index: number }[],
  cx: number,
  cy: number
) {
  const goRight = new Map<number, boolean>();
  const nearAxis = items.filter((item) => Math.abs(item.onRing.x - cx) < 16);

  const top = nearAxis.filter((item) => item.onRing.y <= cy + 2).sort((a, b) => a.onRing.x - b.onRing.x);
  const bottom = nearAxis.filter((item) => item.onRing.y > cy + 2).sort((a, b) => a.onRing.x - b.onRing.x);

  const spread = (list: typeof top, defaultRight: boolean) => {
    if (list.length === 0) {
      return;
    }
    if (list.length === 1) {
      goRight.set(list[0].index, defaultRight);
      return;
    }
    list.forEach((item, idx) => {
      goRight.set(item.index, idx % 2 === 0 ? false : true);
    });
  };

  spread(top, false);
  spread(bottom, false);

  items.forEach((item) => {
    if (goRight.has(item.index)) {
      return;
    }
    const dx = item.onRing.x - cx;
    goRight.set(item.index, dx > 4 ? true : dx < -4 ? false : item.onRing.y > cy);
  });

  return goRight;
}

function buildCallout(
  onRing: Point,
  elbow: Point,
  goRight: boolean,
  arm: number,
  yOffset: number
): Point {
  return {
    x: elbow.x + (goRight ? arm : -arm),
    y: elbow.y + yOffset,
  };
}

export function PieChart({
  slices,
  size = 168,
  stacked,
}: {
  slices: Slice[];
  size?: number;
  /** Legend below chart (better on narrow phones). */
  stacked?: boolean;
}) {
  const pad = 48;
  const chartSize = size + pad * 2;
  const total = slices.reduce((sum, s) => sum + s.amount, 0);
  const cx = chartSize / 2;
  const cy = chartSize / 2;
  const outer = size / 2 - 8;
  const inner = outer * 0.52;
  let cursor = 0;

  const raw =
    total <= 0
      ? []
      : slices
          .filter((s) => s.amount > 0)
          .map((slice, index) => {
            const sweep = (slice.amount / total) * 360;
            const start = cursor;
            const end = cursor + sweep;
            cursor = end;
            const mid = start + sweep / 2;
            const pct = Math.round((slice.amount / total) * 100);
            const onRing = polar(cx, cy, outer, mid);
            const elbow = polar(cx, cy, outer + 16, mid);
            return {
              d: donutSlice(cx, cy, outer, inner, start, end),
              color: slice.color,
              slice,
              pct,
              onRing,
              elbow,
              index,
            };
          });

  const direction = assignCalloutDirections(
    raw.map((item) => ({ onRing: item.onRing, index: item.index })),
    cx,
    cy
  );

  const topIndices = raw
    .filter((item) => item.onRing.y <= cy + 2 && Math.abs(item.onRing.x - cx) < 16)
    .sort((a, b) => a.onRing.x - b.onRing.x)
    .map((item) => item.index);

  const segments: SegmentCallout[] = raw.map((item) => {
    const goRight = direction.get(item.index) ?? item.onRing.x >= cx;
    const topSlot = topIndices.indexOf(item.index);
    const yOffset = topSlot >= 0 ? (topSlot - (topIndices.length - 1) / 2) * 14 : 0;
    const arm = 30 + (item.pct < 5 ? 6 : 0);
    const label = buildCallout(item.onRing, item.elbow, goRight, arm, yOffset);

    return {
      d: item.d,
      color: item.color,
      slice: item.slice,
      pct: item.pct,
      onRing: item.onRing,
      elbow: { x: item.elbow.x, y: item.elbow.y + yOffset * 0.35 },
      label,
      goRight,
    };
  });

  return (
    <View
      style={{
        flexDirection: stacked ? 'column' : 'row',
        alignItems: stacked ? 'stretch' : 'center',
        gap: space.md,
      }}
    >
      <View style={{ width: chartSize, height: chartSize, alignSelf: stacked ? 'center' : undefined }}>
        <Svg width={chartSize} height={chartSize}>
          <G>
            {segments.length === 0 ? (
              <Path d={donutSlice(cx, cy, outer, inner, 0, 359.99)} fill={colors.line} />
            ) : (
              segments.map((item) => <Path key={item.slice.label} d={item.d} fill={item.color} />)
            )}
            <SvgText
              x={cx}
              y={cy - 8}
              fill={colors.muted}
              fontSize={10}
              fontWeight="700"
              textAnchor="middle"
              letterSpacing={1.2}
            >
              TOTAL
            </SvgText>
            <SvgText
              x={cx}
              y={cy + 10}
              fill={colors.ink}
              fontSize={11}
              fontWeight="800"
              textAnchor="middle"
            >
              {money(total)}
            </SvgText>
            {segments.map((item) => (
              <G key={`${item.slice.label}-callout`}>
                <Line
                  x1={item.onRing.x}
                  y1={item.onRing.y}
                  x2={item.elbow.x}
                  y2={item.elbow.y}
                  stroke={item.color}
                  strokeWidth={1.5}
                />
                <Line
                  x1={item.elbow.x}
                  y1={item.elbow.y}
                  x2={item.label.x}
                  y2={item.label.y}
                  stroke={item.color}
                  strokeWidth={1.5}
                />
                <Path d={arrowHeadAtTip(item.onRing, item.elbow)} fill={item.color} />
                <SvgText
                  x={item.label.x + (item.goRight ? 8 : -8)}
                  y={item.label.y + 4}
                  fill={colors.ink}
                  fontSize={12}
                  fontWeight="700"
                  textAnchor={item.goRight ? 'start' : 'end'}
                >
                  {`${item.pct}%`}
                </SvgText>
              </G>
            ))}
          </G>
        </Svg>
      </View>
      <View style={{ flex: 1, gap: 10 }}>
        {slices.map((slice) => (
          <View key={slice.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: slice.color }} />
            <Text style={{ flex: 1, color: colors.ink, fontWeight: '600', fontSize: 13 }} numberOfLines={1}>
              {slice.label}
            </Text>
            <Text style={{ color: colors.ink, fontWeight: '800', fontSize: 12 }}>{money(slice.amount)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function buildTypePieSlices(
  items: { label: string; value: string; amount: number }[]
): Slice[] {
  return items.map((item) => ({
    label: item.label,
    amount: item.amount,
    color: typeColor(item.value as TransactionType),
  }));
}
