import React from 'react';
import Svg, { Circle, Rect, Polygon, Path } from 'react-native-svg';

type ShapeIconProps = {
  shape: string;
  size: number;
  color: string;
};

export function ShapeIcon({ shape, size, color }: ShapeIconProps) {
  const halfSize = size / 2;

  switch (shape) {
    case 'circle':
      return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle cx={halfSize} cy={halfSize} r={halfSize - 2} fill={color} />
        </Svg>
      );

    case 'square':
      return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Rect x={2} y={2} width={size - 4} height={size - 4} fill={color} rx={4} />
        </Svg>
      );

    case 'triangle':
      return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Polygon
            points={`${halfSize},4 ${size - 4},${size - 4} 4,${size - 4}`}
            fill={color}
          />
        </Svg>
      );

    case 'star':
      const outerRadius = halfSize - 2;
      const innerRadius = outerRadius * 0.4;
      const points = [];
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        points.push(`${halfSize + radius * Math.cos(angle)},${halfSize + radius * Math.sin(angle)}`);
      }
      return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Polygon points={points.join(' ')} fill={color} />
        </Svg>
      );

    case 'heart':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={color}
            scale={size / 24}
          />
        </Svg>
      );

    case 'diamond':
      return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Polygon
            points={`${halfSize},4 ${size - 4},${halfSize} ${halfSize},${size - 4} 4,${halfSize}`}
            fill={color}
          />
        </Svg>
      );

    default:
      return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle cx={halfSize} cy={halfSize} r={halfSize - 2} fill={color} />
        </Svg>
      );
  }
}
