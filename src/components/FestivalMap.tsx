import { Map, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";
import styles from "./css/FestivalMap.module.css";
import { useNavigate } from 'react-router-dom';

interface FestivalMapProps {
    lat: number;
    lng: number;
    roadAddress?: string;
    orgName?: string;
}

export default function FestivalMap({ lat, lng, roadAddress = "", orgName = "" }: FestivalMapProps) {
    const position = {
        lat,
        lng
    };
    const navigate = useNavigate();
    
    console.log("position", position);
    console.log("roadAddress", roadAddress);
    
    const handleParkingClick = () => {
        navigate(`/map?gu=${encodeURIComponent(orgName || "")}&lat=${lat}&lng=${lng}`);
    };
      
    return (
        <div className={styles.container}>
            <p className={styles.direction}>길찾기</p>
            {roadAddress && (
                <p className={styles.address}>{roadAddress}</p>
            )}
            <Map
                center={position}
                style={{
                    width: "100%",
                    height: "200px",
                    borderRadius: "8px",
                    overflow: "hidden"
                }}
                level={4}>
                <MapMarker 
                    position={position}
                    image={{
                        src: '/assets/detail/festival-marker.svg',
                        size: { width: 36, height: 36 },
                        options: { offset: { x: 18, y: 36 } },
                    }}
                />
                <CustomOverlayMap position={position}>
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '6px 10px',
                        borderRadius: '8px',
                        transform: 'translate(4%, -180%)',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}>
                        {orgName || '축제장소'}
                    </div>
                </CustomOverlayMap>
            </Map>

            <div className={styles.parkingBox} onClick={handleParkingClick}>
                <img src="/assets/detail/park.svg" alt="주차 아이콘"/>
                <span>근처 주차시설 조회하기</span>
                <img src="/assets/detail/slash.svg" alt="구분선"/>
            </div>
        </div>
    );
}