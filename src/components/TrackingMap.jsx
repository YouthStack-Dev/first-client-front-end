import { APIProvider } from "@vis.gl/react-google-maps"
import FlexibleMap from "./FlexibleMap";

const TrackingMap= ()=>{
    const API_KEY = import.meta.env.VITE_GOOGLE_API || '';
    return<APIProvider apiKey={API_KEY} >

        <FlexibleMap
         
         // enablePanToCompany
         companyInfo={{
           label: 'Company HQ',
           location: { lat: 12.9716, lng: 77.5946 },
         }}
         onAddressSelect={(pos, addr) => console.log('Address Selected:', pos, addr)}
         onLandmarkSelect={(name) => console.log('Landmark Selected:', name)}
         markers={[
           {
             position: { lat: 12.9716, lng: 77.5946 },
             title: 'Initial Marker',
             draggable: true,
             onDragEnd: (pos) => console.log('Marker dragged to:', pos),
           },
         ]}
       />

    </APIProvider>
}

export default TrackingMap