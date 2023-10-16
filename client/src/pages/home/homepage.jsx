import React from "react";
import DisplayBox from "../../components/display/displaybox";
import './homepage.css'
function Home() {
    
    const street = 'Broadway';
    const walkingDistance = '2 km';
    const totalDistance = '10 km';
    const totalTime = '1 hour';
    var latitude = 52.514388;
    var longitude =13.349616;
    const location = `${latitude},${longitude}`;
    const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`
    return(
        <div className="display-container">
            <h1> Welcome to BeIntelli Smart Parking Web</h1>
            <DisplayBox
                location={location}
                street={street}
                walkingDistance={walkingDistance}
                totalDistance={totalDistance}
                totalTime={totalTime}
                mapLink={mapLink}
                segmentNum={1}
            />
            <DisplayBox
                location={location}
                street={street}
                walkingDistance={walkingDistance}
                totalDistance={totalDistance}
                totalTime={totalTime}
                mapLink={mapLink}
                segmentNum={2}
            />
        </div>
    )
}
export default Home