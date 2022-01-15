import * as React from 'react';
import { useState } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import { Room, Star } from '@material-ui/icons'
import './App.css';
import axios from "axios";
import { useEffect } from 'react';
import { format } from 'timeago.js'
function App() {
  const currentUsername = "john";
  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlaceId, setNewPlaceId] = useState(null);

  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [rating, setRating] = useState(0);

  const [viewport, setViewport] = useState({
    width: "100%",
    height: "100vh",
    latitude: 46,
    longitude: 17,
    zoom: 4
  });

  useEffect(() => {
    const getPins = async () => {
      try {
        const allPins = await axios.get("/pins");
        setPins(allPins.data);
        console.log(allPins.data);

      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);

  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewport({ ...viewport, latitude: lat, longitude: long });
  };

  const handleAddClick = (e) =>{
   const[long,lat] =  e.lngLat;
   setNewPlaceId({
     lat,
     long,
   });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUsername,
      title,
      desc,
      rating,
      lat: newPlaceId.lat,
      long: newPlaceId.long,
    };

    
    try {
      const res = await axios.post("/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlaceId(null);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="App">
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
        onViewportChange={nextViewport => setViewport(nextViewport)}
        mapStyle="mapbox://styles/safak/cknndpyfq268f17p53nmpwira"
        onClick={handleAddClick}
        transitionDuration="200"
      >
        {pins.map(p => (
          <>
            <Marker
              latitude={p.lat}
              longitude={p.long}
              offsetLeft={-viewport.zoom * 3.5}
              offsetTop={-viewport.zoom * 7}>
              <Room style={{
                fontSize: viewport.zoom * 7,
                color:
                  currentUsername === p.username ? "tomato" : "slateblue",
                cursor: "pointer"
              }}
                onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
              />
            </Marker>
            {p._id === currentPlaceId && (
              <Popup
                latitude={p.lat}
                longitude={p.long}
                closeButton={true}
                closeOnClick={false}
                anchor="left"
                onClose={() => setCurrentPlaceId(null)}
              >
                <div className='card'>
                  <label>Place</label>
                  <h4>{p.title}</h4>
                  <label>Review</label>
                  <p className='desc'>{p.desc}</p>
                  <label>Rating</label>
                  <div className='stars'>
                  {Array(p.rating).fill(<Star className='star'/>)}
                  </div>
                  <label>Information</label>
                  <span className='username'>Created By <b>{p.username}</b></span>
                  <span className='date'>{format(p.createdAt)}</span>
                </div>
              </Popup>
            )}
          </>
        ))}
      {newPlaceId && (
        <Popup
        latitude={newPlaceId.lat}
        longitude={newPlaceId.long}
        closeButton={true}
        closeOnClick={false}
        anchor="left"
        onClose={() => setNewPlaceId(null)}
      >
       <div>
         <form onSubmit={handleSubmit}>
           <label>Title</label>
          <input placeholder='Enter a Title'
           onChange={(e)=>setTitle(e.target.value)}
          />
           <label>Review</label>
           <textarea placeholder='Say something about this place'
            onChange={(e)=>setDesc(e.target.value)}
            />
           <label>Rating</label>
           <select  onChange={(e)=>setRating(e.target.value)}>
             <option value='1'>1</option>
             <option value='2'>2</option>
             <option value='3'>3</option>
             <option value='4'>4</option>
             <option value='5'>5</option>
           </select>
           <button className='submitButton' type='submit'>Add Pin</button>
         </form>
       </div>
      </Popup>

      )}

        {currentUsername ? 
        ( <button className="button logout">Log Out</button>)
        : 
        ( <div className="buttons">
        <button className='button login'>Login</button>
        <button className='button register'>Register</button>
        </div>
        )}
     
      </ReactMapGL>

    </div >
  );
}

export default App;
