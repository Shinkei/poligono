import { useState } from "react";
import "./App.css";

function App() {
  const [svgFile, setSvgFile] = useState(null);
  const [showError, setShowError] = useState(false);
  const fileReader = new FileReader();
  // const regexPolygonPoints = /(?<=<polygon.*points=)(['"])[\d. \n]+\1/gi;
  const regexPolygonPoints = /(?<=<polygon.*points=)(['"])[\d., \n-]+\1/gi;

  /**
   * Clean the list of points from strange characters and start building a list that contains object {x,y}
   * referencing the points of the polygon
   * @param {String} pointsString - list of values separated by comma and/or space
   */
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

  /**
   * Using the formula for calculate the center of a non-self-intersecting closed polygon,
   * https://en.wikipedia.org/wiki/Centroid#Of_a_polygon
   * go trough all the points of the poligon and apply the formula creating triagles between
   * the current point and the first point of the polygon
   * @param {Array[{x:number,y:number}]} points - list of points
   */
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

  /**
   * Renders the svg file but put a circle that is rendered in the center of the polygon
   * @param {Object{x:number, y:number}} center - points x and y
   * @param {String} content - the content og the svg file to be rendered
   */
  const insertCenter = (center, content) => {
    const [firstPart, ...rest] = content.split("</svg>");
    const result = `
      ${firstPart}
      <circle cx="${center.x}" cy="${center.y}" r="10" stroke="black" stroke-width="3" fill="#fd5a3c" />
      ${rest}
      </svg
    `;
    return result;
  };

  /**
   * Get the file from the input reader and take the points property using regex,
   * convert the list of values and convert it into a list of point ojects to calculate the
   * center of the svg
   */
  const readFile = () => {
    const content = fileReader.result;
    const pointsString = content.match(regexPolygonPoints);
    console.log(content);
    if (!pointsString) {
      setShowError(true);
      return;
    }
    const pointsList = getPointsList(pointsString[0]);
    const centerPoint = calculateCenter(pointsList);
    const svgResult = insertCenter(centerPoint, content);
    setSvgFile(svgResult);
  };

  /**
   * Get the file that is uploaded for the file input and sent to the FileReader
   * @param {Event} event - click event for the file input
   */
  const uploadFile = (event) => {
    setShowError(false);
    setSvgFile(null);
    fileReader.readAsText(event.target.files[0]);
  };

  // When the file is loaded by the fileReader, then the readFile function is called
  fileReader.onloadend = readFile;

  return (
    <div className="App">
      <label className="uploadButton">
        Upload Polygon
        <input type="file" accept=".svg" onChange={uploadFile} />
      </label>
      {showError && <p className="errorText">Error uploading file</p>}
      {svgFile && <div dangerouslySetInnerHTML={{ __html: svgFile }} />}
    </div>
  );
}

export default App;
