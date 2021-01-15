import { useState } from "react";
import "./App.css";

function App() {
  const [svgFile, setSvgFile] = useState(null);
  const fileReader = new FileReader();
  const regexPolygonPoints = /(?<=<polygon.*points=)(['"])[\d. \n]+\1/gi;

  const getPointsList = (pointsString) => {
    let str = pointsString.replace(/[^\d. \n]/g, "");
    const listNumbers = str.split(/[, \n]/);
    const pointsList = [];
    for (let i = 0; i < listNumbers.length - 1; i++) {
      const point = {
        x: +listNumbers[i],
        y: +listNumbers[++i],
      };
      pointsList.push(point);
    }
    return pointsList;
  };

  const calculateCenter = (points) => {
    let firstPoint = points[0];
    let lastPoint = points[points.length - 1];
    if (firstPoint.x !== lastPoint.x || firstPoint.y !== lastPoint.y) {
      points.push(firstPoint);
    }
    let area = 0;
    let center = { x: 0, y: 0 };
    const numberPoints = points.length;
    for (let i = 0, j = numberPoints - 1; i < numberPoints; j = i++) {
      const point1 = points[i];
      const point2 = points[j];
      const c =
        (point1.y - firstPoint.y) * (point2.x - firstPoint.x) -
        (point2.y - firstPoint.y) * (point1.x - firstPoint.x);
      area += c;
      center.x += (point1.x + point2.x - 2 * firstPoint.x) * c;
      center.y += (point1.y + point2.y - 2 * firstPoint.y) * c;
    }
    area = area * 3;
    return {
      x: center.x / area + firstPoint.x,
      y: center.y / area + firstPoint.y,
    };
  };

  const insertCenter = (center, content) => {
    const [firstPart, ...rest] = content.split("</svg>");
    const result = `
      ${firstPart}
      <circle cx="${center.x}" cy="${center.y}" r="10" stroke="black" stroke-width="3" fill="red" />
      ${rest}
      </svg
    `;
    return result;
  };

  const readFile = () => {
    const content = fileReader.result;
    const [pointsString] = content.match(regexPolygonPoints);
    const pointsList = getPointsList(pointsString);
    const centerPoint = calculateCenter(pointsList);
    const svgResult = insertCenter(centerPoint, content);
    setSvgFile(svgResult);
  };

  fileReader.onloadend = readFile;

  const uploadFile = (event) => {
    fileReader.readAsText(event.target.files[0]);
  };

  return (
    <div className="App">
      <input type="file" accept=".svg" onChange={uploadFile} />
      {/* <img src={image} alt="polygon"/ */}
      {svgFile && <div dangerouslySetInnerHTML={{ __html: svgFile }} />}
    </div>
  );
}

export default App;
