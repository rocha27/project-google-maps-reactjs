import React, {useState, useCallback} from "react";
import {
    GoogleMap,
    useLoadScript,
    Marker,
    InfoWindow,
} from "@react-google-maps/api";
import {formatRelative} from "date-fns";

const libraries = ["places"];
const mapContainerStyle = {
    height: "83vh",
    width: "100vw",
};
const options = {
    disableDefaultUI: true,
    zoomControl: true,
};

const center = {
    lat: -14.235004,
    lng: -51.925282,
};


/**
 * @return {string}
 */
export default function App() {
    const [latInput, setLatInput] = useState('');
    const [lngInput, setLngInput] = useState('');
    const {isLoaded, loadError} = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    async function handleLatInput(e) {
        setLatInput(Number(e.target.value));
    }

    async function handleLngInput(e) {
        setLngInput(Number(e.target.value));
    }

    const [marcador, setMarcador] = useState([]);
    const [selecionado, setSelecionado] = useState(null);

    const cliqueNoMapa = useCallback((e) => {

        setMarcador((current) => [
            ...current,
            {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
                time: new Date(),
            },
        ]);
    }, []);

    async function searchLocation() {
        setMarcador((current) => [
            ...current,
            {
                lat: latInput,
                lng: lngInput,
                time: new Date(),
            },
        ]);
    }

    const mapRef = React.useRef();
    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const panTo = useCallback(({lat, lng}) => {
        mapRef.current.panTo({lat, lng});
        mapRef.current.setZoom(14);
    }, []);


    if (loadError) return "Error";
    if (!isLoaded) return "Loading...";


    return (
        <div>
            <Localizar panTo={panTo}/><br/>
            <LatELong/><br/>

            <GoogleMap
                id="map"
                mapContainerStyle={mapContainerStyle}
                zoom={4}
                center={center}
                options={options}
                onClick={cliqueNoMapa}
                onLoad={onMapLoad}

            >
                {marcador.map((marcado) => (
                    <Marker
                        key={`${marcado.lat}-${marcado.lng}`}
                        position={{lat: marcado.lat, lng: marcado.lng}}
                        onClick={() => {
                            setSelecionado(marcado);
                        }}
                    />
                ))}

                {selecionado ? (
                    <InfoWindow
                        position={{lat: selecionado.lat, lng: selecionado.lng}}
                        onCloseClick={() => {
                            setSelecionado(null);
                        }}
                    >
                        <div>
                            <h2>
                                Alert
                            </h2>
                            <p>Marcado {formatRelative(selecionado.time, new Date())}</p>
                        </div>
                    </InfoWindow>
                ) : null}
            </GoogleMap>
        </div>
    );

    function LatELong() {
        return <div>
            <label>Marque o mapa clicando com o mouse no lugar desejado <br/> ou pegue a latitude e longitude no
                site: <a
                    tabIndex="-1" href='https://www.latlong.net/' target='conteudo'>https://www.latlong.net</a>, copie e
                cole nos campos correspondentes e assim irá marcar </label>
            <div className='mt'>
                <label>Latitude:</label>
                <input type='text' value={latInput} onChange={e => handleLatInput(e)}/>
                <label>Longitude:</label>
                <input type="number" value={lngInput} onChange={e => handleLngInput(e)}/>
                <button onClick={searchLocation}>Localizar</button>
            </div>
        </div>
    }
}

function Localizar({panTo}) {
    return (
        <button type='button'
                className="localizar"
                onClick={() => {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            panTo({
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                            });
                        },
                        () => null
                    );
                }}
        >
            <img src="/compass.svg" alt="compass"/>
        </button>
    );
}
