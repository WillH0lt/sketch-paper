import * as PIXI from 'pixi.js';

import type PixiTile from '../../PixiTile.js';
import { BrushKindEnum } from '../../types.js';
import BaseBrush from '../BaseBrush.js';
import { MarkerShader } from './MarkerShader.js';

function catmullRom(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const v0 = (p2 - p0) * 0.5;
  const v1 = (p3 - p1) * 0.5;
  const t2 = t * t;
  const t3 = t * t2;
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}

class MarkerBrush extends BaseBrush {
  public readonly kind = BrushKindEnum.Marker;

  private readonly app: PIXI.Application;

  private readonly brush: PIXI.Mesh<PIXI.Geometry, MarkerShader>;

  // private lastPosition: [number, number] | null = null;

  private prevPoint: [number, number] | null = null;

  // private readonly points: [number, number][] = [];

  public constructor(
    app: PIXI.Application,
    shapeTexture: PIXI.Texture,
    grainTexture: PIXI.Texture,
  ) {
    super();
    this.app = app;

    const size = 500;
    const quadGeometry = new PIXI.Geometry({
      attributes: {
        aPosition: [0, 0, 1, 0, 1, 1, 0, 1],
        aUV: [0, 0, 1, 0, 1, 1, 0, 1],
      },
      indexBuffer: [0, 1, 2, 0, 2, 3],
    });

    const texture = PIXI.RenderTexture.create({
      width: size,
      height: size,
    });

    const shader = new MarkerShader({
      texture,
      shapeTexture,
      grainTexture,
    });

    this.brush = new PIXI.Mesh({
      geometry: quadGeometry,
      shader,
      blendMode: 'multiply',
    });
    this.brush.scale.set(size, size);
  }

  public get shapeTexture(): PIXI.TextureSource {
    return this.brush.shader.shapeTexture;
  }

  public set shapeTexture(value: PIXI.TextureSource) {
    this.brush.shader.shapeTexture = value;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public get size(): number {
    return this.brush.shader.brushSize;
  }

  public set size(value: number) {
    this.brush.shader.brushSize = value;
  }

  public set color(value: [number, number, number, number]) {
    this.brush.shader.brushColor = value;
  }

  public reset(): void {
    // this.lastPosition = null;
    this.prevPoint = null;
  }

  public draw(pointA: [number, number], pointB: [number, number], tile: PixiTile): void {
    if (this.prevPoint === null) {
      this.prevPoint = pointA;
    }

    const curvePoints = [] as [number, number][];
    for (let t = 0; t <= 1; t += 0.05) {
      const x = catmullRom(t, this.prevPoint[0], pointA[0], pointB[0], pointB[0]);
      const y = catmullRom(t, this.prevPoint[1], pointA[1], pointB[1], pointB[1]);
      curvePoints.push([x, y]);
    }

    for (let i = 0; i < curvePoints.length - 1; i++) {
      // const A = curvePoints[i];
      // const B = curvePoints[i + 1];

      const distance = Math.sqrt((pointB[0] - pointA[0]) ** 2 + (pointB[1] - pointA[1]) ** 2);

      const nPoints = Math.floor(distance / (0.05 * this.size));
      if (nPoints <= 0) continue;

      console.log(tile);

      // const points = [];
      // for (let i = 0; i < nPoints; i++) {
      //   const x = pointA[0] + (pointB[0] - pointA[0]) * (i / nPoints);
      //   const y = pointA[1] + (pointB[1] - pointA[1]) * (i / nPoints);
      //   points.push([x, y]);
      // }

      // console.log(points);
      // for (let i = 0; i < points.length; i++) {
      //   const renderTexture = this.brush.shader.texture;
      //   const point = points[i];
      //   const x = point[0] - tile.position.x - renderTexture.width / 2;
      //   const y = point[1] - tile.position.y - renderTexture.width / 2;

      //   if (!this.lastPosition) {
      //     this.lastPosition = [x, y];
      //     continue;
      //   }
      //   this.brush.shader.lastPosition = this.lastPosition;
      //   this.brush.shader.position = [x, y];
      //   this.brush.position.x = x;
      //   this.brush.position.y = y;
      //   this.lastPosition = [x, y];

      //   this.app.renderer.render({
      //     container: this.brush,
      //     target: tile.texture,
      //     clear: false,
      //   });
      // }
    }

    // const distance = Math.sqrt(
    //   Math.pow(pointB[0] - pointA[0], 2) + Math.pow(pointB[1] - pointA[1], 2)
    // );

    // const nPoints = Math.floor(distance / (0.05 * this.size));
    // if (nPoints <= 0) return null;

    // const points = [];
    // for (let i = 0; i < nPoints; i++) {
    //   const x = pointA[0] + (pointB[0] - pointA[0]) * (i / nPoints);
    //   const y = pointA[1] + (pointB[1] - pointA[1]) * (i / nPoints);
    //   points.push([x, y]);
    // }

    // for (let i = 0; i < points.length; i++) {
    //   const renderTexture = this.brush.shader.texture;
    //   const point = points[i];
    //   const x = point[0] - tile.position.x - renderTexture.width / 2;
    //   const y = point[1] - tile.position.y - renderTexture.width / 2;

    //   if (!this.lastPosition) {
    //     this.lastPosition = [x, y];
    //     continue;
    //   }
    //   this.brush.shader.lastPosition = this.lastPosition;
    //   this.brush.shader.position = [x, y];
    //   this.brush.position.x = x;
    //   this.brush.position.y = y;
    //   this.lastPosition = [x, y];

    this.app.renderer.render({
      container: this.brush,
      target: tile.texture,
      clear: false,
    });
    // }
  }

  // draw(pointA: [number, number], pointB: [number, number], tile: PixiTile) {
  //   if (this.points.length === 0) this.points.push([pointA[0], pointA[1]]);
  //   this.points.push([pointB[0], pointB[1]]);

  //   const stampPoints = this._getStampPoints();
  //   console.log(stampPoints);

  //   // if (this.points.length < 4) return;

  //   // const samplePoints = this.points.slice(-4);

  //   // const points = getPoints(
  //   //   samplePoints[0],
  //   //   samplePoints[1],
  //   //   samplePoints[2],
  //   //   samplePoints[3],
  //   //   0.05 * this.size
  //   // );

  //   // console.log(points);

  //   // for (let i = 0; i < points.length; i++) {
  //   //   const renderTexture = this.brush.shader.texture;
  //   //   const point = points[i];
  //   //   const x = point[0] - tile.position.x - renderTexture.width / 2;
  //   //   const y = point[1] - tile.position.y - renderTexture.width / 2;

  //   //   if (!this.lastPosition) {
  //   //     this.lastPosition = [x, y];
  //   //     continue;
  //   //   }
  //   //   this.brush.shader.lastPosition = this.lastPosition;
  //   //   this.brush.shader.position = [x, y];
  //   //   this.brush.position.x = x;
  //   //   this.brush.position.y = y;
  //   //   this.lastPosition = [x, y];

  //   //   this.app.renderer.render({
  //   //     container: this.brush,
  //   //     target: tile.texture,
  //   //     clear: false,
  //   //   });
  //   // }

  //   // const distance = Math.sqrt(
  //   //   Math.pow(pointB[0] - pointA[0], 2) + Math.pow(pointB[1] - pointA[1], 2)
  //   // );

  //   // const nPoints = Math.floor(distance / (0.05 * this.size));
  //   // if (nPoints <= 0) return null;

  //   // const points = [];
  //   // for (let i = 0; i < nPoints; i++) {
  //   //   const x = pointA[0] + (pointB[0] - pointA[0]) * (i / nPoints);
  //   //   const y = pointA[1] + (pointB[1] - pointA[1]) * (i / nPoints);
  //   //   points.push([x, y]);
  //   // }

  //   for (let i = 0; i < stampPoints.length; i++) {
  //     const renderTexture = this.brush.shader.texture;
  //     const stampPoint = stampPoints[i];
  //     const x = stampPoint[0] - tile.position.x - renderTexture.width / 2;
  //     const y = stampPoint[1] - tile.position.y - renderTexture.width / 2;

  //     if (!this.lastPosition) {
  //       this.lastPosition = [x, y];
  //       continue;
  //     }
  //     this.brush.shader.lastPosition = this.lastPosition;
  //     this.brush.shader.position = [x, y];
  //     this.brush.position.x = x;
  //     this.brush.position.y = y;
  //     this.lastPosition = [x, y];

  //     this.app.renderer.render({
  //       container: this.brush,
  //       target: tile.texture,
  //       clear: false,
  //     });
  //   }
  // }

  // _getStampPoints(): Array<[number, number]> {
  //   if (this.points.length < 2) return [];

  //   const a = this.points[this.points.length - 2];
  //   const b = this.points[this.points.length - 1];

  //   const distance = Math.sqrt(
  //     Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2)
  //   );

  //   console.log(distance);

  //   const nPoints = Math.floor(distance / (0.05 * this.size));
  //   if (nPoints <= 0) return [];

  //   const points = [] as Array<[number, number]>;
  //   for (let i = 0; i < nPoints; i++) {
  //     const x = a[0] + (b[0] - a[0]) * (i / nPoints);
  //     const y = a[1] + (b[1] - a[1]) * (i / nPoints);
  //     points.push([x, y]);
  //   }

  //   return points;
  // }

  // getPoints(): Array<[number, number]> {
  //   // const splinePoints = catmullRom([pointA, pointB, pointC, pointD], 10);

  //   const splinePoints = [pointC, pointD];
  //   const points: Array<[number, number]> = [];
  //   for (let i = 0; i < splinePoints.length - 1; i++) {
  //     const a = splinePoints[i];
  //     const b = splinePoints[i + 1];

  //     points.push(a);

  //     const distance = Math.sqrt(
  //       Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2)
  //     );

  //     const nPoints = Math.floor(distance / maxDistance);
  //     for (let j = 1; j < nPoints; j++) {
  //       const x = a[0] + (b[0] - a[0]) * (j / nPoints);
  //       const y = a[1] + (b[1] - a[1]) * (j / nPoints);
  //       points.push([x, y]);
  //     }
  //   }

  //   return points;
  // }
}

// function catmullRom(
//   pointA: [number, number],
//   pointB: [number, number],
//   pointC: [number, number],
//   numIntermediatePoints: number
// ): Array<[number, number]> {
//   const curvePoints: Array<[number, number]> = [];
//   for (let i = 0; i < points.length - 1; i++) {
//     const p0 = i > 0 ? points[i - 1] : points[i];
//     const p1 = points[i];
//     const p2 = points[i + 1];
//     const p3 = i < points.length - 2 ? points[i + 2] : p2;

//     for (let t = 0; t <= numIntermediatePoints; t++) {
//       const t1 = t / numIntermediatePoints;
//       const tt = t1 * t1;
//       const ttt = tt * t1;

//       const q1 = -ttt + 2 * tt - t1;
//       const q2 = 3 * ttt - 5 * tt + 2;
//       const q3 = -3 * ttt + 4 * tt + t1;
//       const q4 = ttt - tt;

//       const tx = 0.5 * (p0[0] * q1 + p1[0] * q2 + p2[0] * q3 + p3[0] * q4);
//       const ty = 0.5 * (p0[1] * q1 + p1[1] * q2 + p2[1] * q3 + p3[1] * q4);

//       curvePoints.push([tx, ty]);
//     }
//   }

//   return curvePoints;
// }

export default MarkerBrush;
