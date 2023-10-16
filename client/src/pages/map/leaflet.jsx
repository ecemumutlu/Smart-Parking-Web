
import { MapContainer,TileLayer, Marker, Popup } from 'react-leaflet';
import "leaflet/dist/leaflet.css"
import './leaflet.css'
import { Icon } from 'leaflet';


function LeafletPage() {

    const markers = [
        {
            geocode: [-37.840935,144.946457],
            popUp: 'Central of Melbourne'
        }
        ]

    const customIcon = new Icon({
        iconUrl: require("../../img/marker-icon.png"),
        iconSize: [38,38]
    })

   return (
    <MapContainer center={[-37.840935,144.946457]} zoom={13}>
      <TileLayer
        attribution='&copy;<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      />


        {markers.map(marker => (
          <Marker position={marker.geocode} icon={customIcon} >
              <Popup>{marker.popUp}</Popup>
          </Marker>
        ))
        }


    </MapContainer>
   )
    
}

export default LeafletPage