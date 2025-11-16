import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Map, MapMarker,CustomOverlayMap  } from 'react-kakao-maps-sdk';
import axiosInstance from '../api/axiosInstance';
import ParkingModal from '../components/ParkingModal';
import styles from './css/ParkingHeader.module.css';
import { useNavigate } from 'react-router-dom';

interface ParkingListItem {
  parkingId: string;
  name: string;
  roadAddress: string;
  lotnoAddress: string;
  lat: number;
  lon: number;
}

interface ParkingDetail {
  parkingId: string;
  parkingName: string;
  address: string;
  tel: string;
  totalSpace: number;
  currentParked: number;
  weekdayOperatingHours: string;
  weekendOperatingHours: string;
  holidayOperatingHours: string;
  baseRate: number;
  baseTime: number;
  additionalRate: number;
  additionalTime: number;
  dailyMaxRate: number;
  paid: boolean;
  nightPaid: boolean;
}

interface Coords {
  lat: number;
  lng: number;
  data: {
    parkingId: string;
    parkingName: string;
    address: string;
  };
}

export default function ParkingMap() {
  const [searchParams] = useSearchParams();
  const city = searchParams.get('city') || '수원시';
  const navigate = useNavigate();
  const latParam = parseFloat(searchParams.get('lat') || '');
  const lngParam = parseFloat(searchParams.get('lng') || '');
  const hasCenterFromParams = !isNaN(latParam) && !isNaN(lngParam);
  const [center, setCenter] = useState<{ lat: number; lng: number }>(() => {
    return hasCenterFromParams
      ? { lat: latParam, lng: lngParam }
      : { lat: 37.4979, lng: 127.0276 }; // 기본값
  });
  
  const [coordsList, setCoordsList] = useState<Coords[]>([]);
  const [selected, setSelected] = useState<ParkingDetail | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/api/auth/user/parking/map/${encodeURIComponent(city)}`);
        const items: ParkingListItem[] = res.data.data;

        // API 응답에 lat, lon이 이미 포함되어 있으므로 geocoder 불필요
        const coordsWithLatLng: Coords[] = items.map((item) => ({
          lat: item.lat,
          lng: item.lon,
          data: {
            parkingId: item.parkingId,
            parkingName: item.name,
            address: item.roadAddress,
          },
        }));

        setCoordsList(coordsWithLatLng);
        if (coordsWithLatLng.length > 0 && !hasCenterFromParams) {
          setCenter({ lat: coordsWithLatLng[0].lat, lng: coordsWithLatLng[0].lng });
        }
        
      } catch (error) {
        console.error('주차장 목록 불러오기 실패', error);
      }
    };

    fetchData();
  }, [city, hasCenterFromParams]);

  const handleMarkerClick = async (parkingId: string) => {
    try {
      const res = await axiosInstance.get(`/api/auth/user/parking/detail/${encodeURIComponent(city)}/${parkingId}`);
      setSelected(res.data.data);
    } catch (error) {
      console.error('상세 정보 불러오기 실패', error);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <img 
          src="/assets/slash.svg" 
          alt="뒤로가기" 
          className={styles.icon} 
          onClick={() => navigate(-1)}
        />
        <div className={styles.title}>지도 자세히 보기</div>
        <div className={styles.placeholder} />
      </div>
      {coordsList.length > 0 && !selected && (
        <div className={styles.guideBanner}>
          마커를 클릭하면 축제 정보를 볼 수 있어요!
        </div>
      )}

      <Map center={center} style={{ width: '100%', height: 'calc(100vh - 56px)', marginTop: '56px' }} level={4}>
      
        {hasCenterFromParams && (
          <>
            {/* 축제 위치 마커 */}
            <MapMarker
              position={{ lat: latParam, lng: lngParam }}
              image={{
                src: '/assets/detail/festival-marker.svg',
                size: { width: 36, height: 36 },
                options: { offset: { x: 18, y: 36 } },
              }}
            />
            
            {/* 텍스트 오버레이 */}
            <CustomOverlayMap position={{ lat: latParam, lng: lngParam }}>
              <div style={{
                background: 'black',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: '8px',
                transform: 'translate(4%, -180%)',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}>
                축제장소
              </div>
            </CustomOverlayMap>
          </>
        )}

        {coordsList.map((coord) => (
          <MapMarker
            key={coord.data.parkingId}
            position={{ lat: coord.lat, lng: coord.lng }}
            onClick={() => handleMarkerClick(coord.data.parkingId)}
          >
            
          </MapMarker>
        ))}
      </Map>

      {selected && (
        <ParkingModal
          data={selected} // detail 전체 응답
          onClose={() => setSelected(null)}
          onRefresh={async () => {
            const res = await axiosInstance.get(`/api/auth/user/parking/detail/${encodeURIComponent(city)}/${selected.parkingId}`);
            setSelected(res.data.data);
          }}
        />
      
      )}
    </div>
  );
}
