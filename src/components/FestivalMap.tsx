
import {Map, MapMarker} from "react-kakao-maps-sdk";
import styles from "./css/FestivalMap.module.css";
import { useNavigate } from 'react-router-dom';

interface FestivalMapProps {
    lat: number;
    lng: number;
    orgName?: string;
}

export default function FestivalMap({lat, lng, orgName = ""} : FestivalMapProps) {
    const position = {
        lat,
        lng
    };
    console.log("position",position);
    const navigate = useNavigate();
    const handleParkingClick = () => {
        navigate(`/map?gu=${encodeURIComponent(orgName)}&lat=${lat}&lng=${lng}`);
    };
      
    return (
        <div className={styles.container}>
            <p className={styles.direction}>길찾기</p>
            <Map
                center={position}
                style={{
                    width: "100%",
                    height: "160px",
                    borderRadius: "8px",
                    overflow: "hidden"
                }}
                level={6}>
                <MapMarker position={position}/>
            </Map>

            <div className={styles.parkingBox} onClick={handleParkingClick}>
                <img src="/assets/detail/park.svg" alt="주차 아이콘"/>
                <span>근처 주차시설 조회하기</span>
                <img src="/assets/detail/slash.svg" alt="구분선"/>
            </div>
        </div>
    );
}