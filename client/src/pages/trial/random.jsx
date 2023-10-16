// async function calcCarTravel() {

//         if(originRef.current.value === '') return
        
//         const directionsService = new window.google.maps.DirectionsService();
        
//         const promises = myseg.map(async (seg) => {
//           const destination = { lat: seg.lat, lng: seg.long }
//           const response = await directionsService.route({
//             origin: originRef.current.value,
//             destination: destination,
//             travelMode: window.google.maps.TravelMode.DRIVING,
//             durationInTraffic: true
//           });
//           return ({"dist": response.routes[0].legs[0].distance.text, "dur": response.routes[0].legs[0].duration_in_traffic.text})
//           //return response;
//         });
      
//         const results = await Promise.all(promises);
        
//         // Now you can use the results array as needed
//         console.log("Return results",results);
//       };
//     const handlePlaceChanged = () => { 
  //       setIsSelected(true)
  //       Geocoder.init(process.env.REACT_APP_GOOGLE_MAPS_API_KEY, {libraries: GOOGLE_MAPS_LIBRARIES}); // use a valid API key
  //   // Search by address
  //   Geocoder.from(destinationRef.current.value)
  //       .then(json => {
  //         setDestLoc(json.results[0].geometry.location);
  //         console.log(destLoc);
  //       })
  //       .catch(error => console.warn(error));  

  //     return destLoc;
  // }