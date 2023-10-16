import DateObject from "react-date-object";
import {React,useState,useRef,useEffect} from "react";
import {useJsApiLoader,GoogleMap,Marker,InfoWindow,Autocomplete,DirectionsRenderer,} from '@react-google-maps/api'
import {Box,Button,ButtonGroup,Flex,HStack,IconButton,Input} from '@chakra-ui/react'
import Select from "react-select"
import { FaLocationArrow, FaTimes,FaWalking} from 'react-icons/fa'
import {BiTimer} from "react-icons/bi"
import '../search/searchpage.css'
import '../home/homepage.css'
import axios from 'axios'
import LoadingIcon from "../../components/loadingicon/loadingicon";
import DisplayBoxesComponent from "../../components/sortboxcomponent/displayboxes";

const GOOGLE_MAPS_LIBRARIES = ['places'];
function SearchPage() {
  const[closestTen,setClosestTen] = useState([])
  const[suggestions, setSuggestions] = useState([])
  const[finalBoxes,setFinalBoxes]=useState([])
  const [segmentmarkers,setSegmentMarkers]=useState([])
  var current_date = new DateObject();
  const[currentTime, setCurrentTime] = useState(new DateObject({
    year: 2019,
    month: 2,
    day: current_date.day,
    hour: current_date.hour,
    minute: current_date.minute,
    second: current_date.second,
    milisecond: current_date.milisecond,
    format: "YYYY/MM/DD HH:mm:ss",
  }))

  const parking_array=[
    (require("../search/parking_blue.png")),
    (require("../search/parking_yellow.png")),
    (require("../search/parking_red.png")),
    (require("../search/parking_purple.png"))
  ]
  const parking_colors=[
    '#B6D5FF',
    '#FFFEB6',
    '#FFB6B6',
    '#DAB6FF'
  ]

  async function getClosest10Segments() {
    setDirectionsResponse(null)
    setSegmentMarkers(null)
    setError('')
    setButtonLoading(true)
    setLoadingIcon(true)
    if(!isDestSelected || !isSelected) {
      setError('Please fill in Destination and Origin fields.')
      setButtonLoading(false) // calculate button free
      return
    }
    else if(!selectedOption)
    {
      setError('Please select preferences.')
      setButtonLoading(false)
      return
    } 
    else{
      setIsClicked(true)
      await axios.post(`${process.env.REACT_APP_URL}/api/closest_ten/`, { lat: destinationCord.lat, lng: destinationCord.lng}
      ).then(res => {
        setClosestTen(res.data)
        getPrediction(res.data)
      }).catch(err => console.log(err))
    }
  };

  async function getPrediction(dict_all) {
    await axios.post(`${process.env.REACT_APP_URL}/api/make_pred/`, 
    { places: dict_all['selected_seg_dict'], 
      seg_cap_dict: dict_all['seg_cap_dict'],
      error_dist_dict: dict_all['error_dist_dict'],
      matrix_index_dict: dict_all['matrix_index_dict'],
      time: currentTime.format("YYYY/MM/DD HH:mm:ss"),
      dest_lat: destinationCord.lat,
      dest_lng: destinationCord.lng,
      current_loc: [originCord.lat , originCord.lng],
      selected_option: selectedOption.value
    }).then(res => {
      setSuggestions(res.data);
      segmentsFiller(res.data)
    }).catch(err => console.log(err))
  };
  var initialDisplayBoxes=[]  

  function segmentsFiller(data) {
    var MarkersLoc=[]
    for (var i = 0; i < (data.length)-6; i++) {
      var segment_info = data[i];
      var lat=segment_info[1][0]
      var long=segment_info[1][1]
      var total_dist= (segment_info[5]['car_distance'] + segment_info[5]['walking_distance'])/1000
      var newDisplayBox= {
        location:{ lat: lat, lng: long },
        walkingTime:segment_info[5]['walking_duration'],
        walkingDistance:segment_info[5]['walking_distance'],
        totalDistance: total_dist.toFixed(2),
        totalTime:segment_info[5]['seg_total_dur'],
        segmentNum:segment_info[0],
        capacity:segment_info[3],
        predictedRatio:segment_info[4],
        color:parking_colors[i],
        destination:destinationCord,
        origin:originCord,
        street:segment_info[6],
        ratio:segment_info[4]
      }
      var segment_loc={
        id: segment_info[0],
        remain: Math.floor(segment_info[3]*segment_info[4]),
        position: {lat: segment_info[1][0], lng: segment_info[1][1]},
        color:parking_array[i]
      }
      MarkersLoc.push(segment_loc)
      initialDisplayBoxes.push(newDisplayBox)  
    }
    setFinalBoxes(initialDisplayBoxes)
    setSegmentMarkers(MarkersLoc)
    setHandler()
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      var current_date = new DateObject();
      var tmp_date = new DateObject({
        year: 2019,
        month: 2,
        day: current_date.day,
        hour: current_date.hour,
        minute: current_date.minute,
        second: current_date.second,
        milisecond: current_date.milisecond,
        format: "YYYY/MM/DD HH:mm:ss",
      });
      setCurrentTime(tmp_date)

    }, 60000); // Update every minute

    return () => {
      clearInterval(intervalId); // Clean up the interval when the component unmounts
    };
  }, []);
  const [activeMarker, setActiveMarker] = useState(null);
  const handleActiveMarker = (marker) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES,
      })
      const [map, setMap] = useState(/** @type google.maps.Map */ (null))
      const [directionsResponse, setDirectionsResponse] = useState(null)
      const [destVisible,setDestVisible]=useState(false)
      const center = { lat: -37.840935, lng: 144.946457 }
      const [currentPosition, setCurrentPosition] = useState(center);
      const[isClicked,setIsClicked]=useState(false);
      const [buttonLoading,setButtonLoading]=useState(false)
      const [loadingicon,setLoadingIcon]=useState(true)
      const [error, setError] = useState('');
      const [isDestSelected, setDestSelected] = useState(false);
      const [destinationCord,setDestinationCord]=useState(center)
      const [originCord,setOriginCord]=useState({lat: 200, lng: 200})
      const [isSelected,setIsSelected]=useState(false)

      const originRef = useRef()
      
      const destinationRef = useRef()
    

      function setHandler() {
        setLoadingIcon(false)
        setButtonLoading(false)
      }

      function clearRoute() {
        setDestVisible(false)
        setDirectionsResponse(null)
        setSegmentMarkers(null)
        destinationRef.current.value=''
        originRef.current.value = ''
        setOriginCord({lat: 200, lng: 200})
        setIsClicked(false)
        setDestSelected(false)
        setIsSelected(false)
        setLoadingIcon(true)
        setDestSelected(false)
    }

    const handleGetCoordinates = async () => {
      setButtonLoading(true)
      setDestSelected(true)
      setIsClicked(false)
        try {
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json`,
            {
              params: {
                address:destinationRef.current.value,
                key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
              },
            }
          );
  
          if (response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry.location;
            setDestinationCord({ lat: lat, lng: lng });
          } else {
            console.log("No results found");
          }
        } catch (error) {
          console.error(error);
        }
        setButtonLoading(false)
        setDestVisible(true)
        
    };
    const handleGetCoordinatesOrigin = async () => {
      setButtonLoading(true)
      setIsSelected(true)
      setIsClicked(false)

        try {
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json`,
            {
              params: {
                address:originRef.current.value,
                key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
              },
            }
          );
  
          if (response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry.location;
            setOriginCord({ lat: lat, lng: lng });
          } else {
            console.log("No results found");
          }
        } catch (error) {
          console.error(error);
        }

        setButtonLoading(false)
    };
      const [selectedOption, setSelectedOption] = useState(null);

      const options = [
        { value: 'Walking', label: (<Flex alignItems="center"> <FaWalking size={20} /> <span style={{ marginLeft: '0.3rem' }}>Less Walking</span> </Flex>) },
        { value: 'Travel', label: (<Flex alignItems="center" ><BiTimer size={20} /> <span style={{ marginLeft: '0.3rem' }}>Less Travel Time </span> </Flex>) },
      ];
    return(
      !isLoaded ? 
          (<LoadingIcon/>)
          : 
          (
          <><Flex 
        flexDirection='column'
        alignItems='center'
        h='85vh'
        w='100vw'>

            <Box
            p={4}
            borderRadius='lg'
            m={4}
            bgColor='white'
            shadow='base'
            minW='container.md'
             zIndex='1'> 
            <HStack spacing={4} mb={4} justifyContent='flex-start' alignItems='center'>
              <Box flexGrow={1}>
                {/* <p>Selected Date: {currentTime.format("YYYY/MM/DD HH:mm:ss")}</p> */}
                <Autocomplete
                  onPlaceChanged={handleGetCoordinatesOrigin}
                >
                  <Input
                    type='text'
                    placeholder='Origin'
                    ref={originRef}
                  />
                </Autocomplete>
              </Box>
              <Box flexGrow={1}>
                <Autocomplete
                  onPlaceChanged={handleGetCoordinates}
                >
                  <Input
                    type='text'
                    placeholder='Destination'
                    ref={destinationRef}
                  />
                </Autocomplete>
              </Box>
                <HStack  margin='0.5rem' spacing={1} justifyContent='space-evenly'>
                  <ButtonGroup>
                    <IconButton
                    aria-label='center back'
                    icon={<FaLocationArrow />}
                    isRound     
                    onClick={async () => {
                    if(isDestSelected){
                      map.setCenter(destinationCord)
                      setError("")
                    }
                    else{
                      setError('Please fill in Destination field.')
                    }
                    }}
                    />
                    <IconButton
                    aria-label='center back'
                    icon={<FaTimes />}
                    onClick={clearRoute}/>
                  </ButtonGroup>
              </HStack>
            </HStack>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <HStack className="hstack-walking" spacing={20} justifyContent='flex-start'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Select
                placeholder="Preferences"
                className="select-preferences"
                value={selectedOption}
                onChange={setSelectedOption}
                options={options}/>
            </div>
              <Button isLoading={buttonLoading} loadingText='Calculating' colorScheme='whatsapp' type='submit' onClick={getClosest10Segments}>
                 Show Suggestions
              </Button>
            </HStack>
        </Box>
      <div className="maps-style">
        {/* Google Map Box */}
        <GoogleMap
          center={currentPosition}
          zoom={15}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          mapContainerClassName="map-container"
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={map => setMap(map)}
        >
          <Marker
           position={destinationCord} 
           visible={destVisible} 
           icon={
            {url:(require("../search/destination.png")),
            // eslint-disable-next-line no-undef
            scaledSize: new google.maps.Size(40, 40),
          }}
           >
          
           </Marker>
              {segmentmarkers ? segmentmarkers.map(({ id, remain, position,color },index) => (
            <Marker
              key={id}
              position={position}
              onClick={() => handleActiveMarker(id)}
              icon={
                {url:color,
                // eslint-disable-next-line no-undef
                scaledSize: new google.maps.Size(30, 30),
            }}
            >
              {activeMarker === id ? (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div>
                    There Are <b>{remain} Free Parking </b> Spaces
                    <div>{id}</div>
                  </div>
                  
                </InfoWindow>
              ) : null}
            </Marker>
          ))
        :
        <></>
        }
          {directionsResponse
           ?
           <>
           <DirectionsRenderer
            directions={directionsResponse.driving}
            options={{
              suppressMarkers:true,
              polylineOptions: {
                strokeColor: '#0021FF', 
                strokeWeight: 5,    
              }
            }}
          />
          <DirectionsRenderer 
          directions={directionsResponse.walking}
          options={{
            suppressMarkers:true,
            polylineOptions: {
              strokeColor: '#05B3E2', 
              strokeWeight: 5,
              strokeOpacity:0.5
            }
          }}
          />
          </>    
          : <div></div>}
        </GoogleMap>
      </div>
    </Flex>
      {isClicked ? 
        (loadingicon && finalBoxes ?
        <LoadingIcon></LoadingIcon>
        :   
        <DisplayBoxesComponent initialDisplayBoxes={finalBoxes} setDirectionResponse={setDirectionsResponse}/> 
        )
        :
        <div className="before-calc-container">
          <div className="before-calc-centered-text">
            <h1>Please click calculate route button when you enter the destination address</h1>
            <h1>After that you can see the suggestions here</h1>
          </div>
        </div>        
          }
       </>)
    )
    
}

export default SearchPage