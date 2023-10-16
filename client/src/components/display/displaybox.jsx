// DisplayBox.js

import React from 'react';
import { FaWalking} from 'react-icons/fa';
import {GiPathDistance} from 'react-icons/gi';
import {FaMapLocationDot} from 'react-icons/fa6'
import './displaybox.css';

const DisplayBox = ({ ratio,location, street,capacity, walkingTime,walkingDistance, totalDistance, totalTime, origin,destination,segmentNum,color,setDirectionResponse }) => {

  async function calculateRoute() {
    setDirectionResponse(null)
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
    // eslint-disable-next-line no-undef
    const drivingResults = await directionsService.route({
      origin: origin,
      destination: location,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING
    })
    const walkingResults = await directionsService.route({
      origin: location,
      destination: destination,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.WALKING
    });
    setDirectionResponse({
      driving: drivingResults,
      walking: walkingResults
    })
    // To wait google maps results    
  }
  
  
  var street_arr=street.split(',')
  var free_park=Math.floor(capacity*ratio)
  return (
    <div className="display-box">
      <div style={{backgroundColor:color}} className='parking-key-box'>
        Parking Segment #{segmentNum}
      </div>
      <div className="location-info">
        <div className="location-name">
          <FaMapLocationDot color='grey' size={30}/>
          <div className='location-text'>
            {street_arr[0]}
          </div> 
        </div>
        <div className='location-street-box'>
           Free: {free_park}
        </div>
      </div>
      <div className="walking-info">
        <div className='walking-details'>
          <FaWalking color='grey' size={30} />
          <div className="walking-details-right">
            <div> <span style={{ fontWeight: 'bold' }}>Walking Time: </span>{walkingTime} min</div>
            <div> <span style={{ fontWeight: 'bold' }}>Walking Distance: </span> {walkingDistance} meters</div>
          </div>
        </div>
        <hr className="divider" />
        <div className="route-details">
          <GiPathDistance  color='grey' size={30}/>
          <div className='route-details-right'>
            <div><span style={{ fontWeight: 'bold' }}>Total Time: </span>{totalTime} min</div>
            <div> <span style={{ fontWeight: 'bold' }}>Total Distance: </span>{totalDistance} km</div>
          </div>
        </div>
        <hr className="divider" />
      </div>
      <div className="map-link">
        <a href="#" onClick={calculateRoute}>
          Get Directions
        </a>
      </div>
    </div>
  );
};

export default DisplayBox;
