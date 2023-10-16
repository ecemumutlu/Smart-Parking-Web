import React, { useState } from 'react';
import "../sortboxcomponent/displayboxes.css"
import DisplayBox from "../../components/display/displaybox";

function DisplayBoxesComponent({ initialDisplayBoxes,setDirectionResponse}) {
  // console.log("fonksiyona gelen",initialDisplayBoxes);
  const [displayBoxes, setDisplayBoxes] = useState(initialDisplayBoxes);
  const [sortingCriteria, setSortingCriteria] = useState("walkingDistance");
  const [loading,setloading]=useState(false)

  const sortDisplayBoxes = (criteria) => {
    setloading(true)
    const sortedBoxes = [...displayBoxes].sort((a, b) => {
      if (a[criteria] < b[criteria]) return -1;
      if (a[criteria] > b[criteria]) return 1;
      return 0;
    });
    setDisplayBoxes(sortedBoxes);
    setloading(false)
  };

  const handleSorting = (criteria) => {
    setSortingCriteria(criteria);
    sortDisplayBoxes(criteria);

  };

  return (
    <div className="display-container">
      <h1>4 suggested segments based on destination</h1>
      <div className="sort-buttons">
        <button
          className={sortingCriteria === "walkingTime" ? "active" : ""}
          onClick={() => handleSorting("walkingTime")}
        >
          Sort by Walking Time
        </button>
        <button
          className={sortingCriteria === "totalDistance" ? "active" : ""}
          onClick={() => handleSorting("totalDistance")}
        >
          Sort by Total Distance
        </button>
        <button
          className={sortingCriteria === "totalTime" ? "active" : ""}
          onClick={() => handleSorting("totalTime")}
        >
          Sort by Total Time
        </button>
      </div>
      <div className="display-boxes">
        {!loading ?
        displayBoxes.map((box, index) => (
          <div className="display-boxes-row" key={index}>
            <DisplayBox
              key={index}
              location={box.location}
              walkingTime={box.walkingTime}
              walkingDistance={box.walkingDistance}
              totalDistance={box.totalDistance}
              totalTime={box.totalTime}
              segmentNum={index + 1}
              capacity={box.capacity}
              color={box.color}
              origin={box.origin}
              destination={box.destination}
              setDirectionResponse={setDirectionResponse}
              street={box.street}
              ratio={box.ratio}
            />
          </div>
        )): <></>}
      </div>
    </div>
  );
}

export default DisplayBoxesComponent;
