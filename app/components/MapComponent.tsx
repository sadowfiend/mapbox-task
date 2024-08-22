"use client";

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2luZ3VsYXJpdHlsYWIiLCJhIjoiY2x6b2JmZGNhMHY0eTJrcXcxOGp0eDluNiJ9.tOMt_XF278-jrGovF9MsAw';

const MapComponent: React.FC = () => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const popupContainer = useRef<HTMLDivElement | null>(null);
    const selectedBuildingId = useRef<number | null>(null);

    useEffect(() => {
        if (mapContainer.current && !mapRef.current) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [-74.0060, 40.7128], // New York
                zoom: 12,
                attributionControl: false
            });

            const map = mapRef.current;

            const customAttribution = new mapboxgl.AttributionControl({
                compact: true // Сжимаем атрибуцию, чтобы она занимала меньше места
            });
            map.addControl(customAttribution, 'bottom-right');

            // Добавление 3D зданий
            map.on('load', () => {
                map.addLayer({
                    id: '3d-buildings',
                    source: 'composite',
                    'source-layer': 'building',
                    filter: ['==', 'extrude', 'true'],
                    type: 'fill-extrusion',
                    minzoom: 15,
                    paint: {
                        'fill-extrusion-color': '#aaa',
                        'fill-extrusion-height': ['get', 'height'],
                        'fill-extrusion-base': ['get', 'min_height'],
                        'fill-extrusion-opacity': 0.6
                    }
                });

                // Попап в верхнем углу
                const popupDiv = document.createElement('div');
                popupDiv.style.position = 'absolute';
                popupDiv.style.top = '10px';
                popupDiv.style.left = '10px';
                popupDiv.style.zIndex = '1';
                popupDiv.style.backgroundColor = 'white';
                popupDiv.style.padding = '10px';
                popupDiv.style.borderRadius = '5px';
                popupDiv.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
                popupDiv.style.fontFamily = 'Arial, sans-serif';
                popupDiv.style.maxWidth = '200px';
                popupDiv.style.display = 'none'; // Начально скрыт
                popupDiv.innerHTML = `
                    <button id="popup-close" style="position: absolute; top: 5px; right: 5px; border: none; background: none; font-size: 16px; cursor: pointer;">
                        &times;
                    </button>
                    <div id="popup-content">
                        <!-- Содержимое попапа будет вставлено динамически -->
                    </div>
                `;

                // Добавляем попап в контейнер карты
                if (mapContainer.current) {
                    mapContainer.current.appendChild(popupDiv);
                }

                // Сохраняем ссылку на попап контейнер
                popupContainer.current = popupDiv;

                // Обработчик клика на иконку крестика
                const closeButton = document.getElementById('popup-close');
                if (closeButton) {
                    closeButton.addEventListener('click', () => {
                        if (popupContainer.current) {
                            popupContainer.current.style.display = 'none'; // Скрываем попап
                        }
                        if (selectedBuildingId.current !== null) {
                            resetBuildingStyle(selectedBuildingId.current);
                            selectedBuildingId.current = null;
                        }
                    });
                }
            });

            // Функция для сброса высоты и цвета здания
            const resetBuildingStyle = (featureId: number) => {
                map.setPaintProperty('3d-buildings', 'fill-extrusion-color', '#aaa');
                map.setPaintProperty('3d-buildings', 'fill-extrusion-height', ['get', 'height']);
            };

            // Функция для увеличения высоты здания
            const increaseHeight = (featureId: number) => {
                map.setPaintProperty('3d-buildings', 'fill-extrusion-height', [
                    'case',
                    ['==', ['id'], featureId],
                    ['+', ['get', 'height'], 50], // Увеличиваем высоту на 50
                    ['get', 'height']
                ]);
            };

            // Обработчик кликов по 3D зданиям
            map.on('click', '3d-buildings', (e) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ['3d-buildings']
                });

                if (!features.length) {
                    // Если ни одно здание не выделено, скрываем попап
                    if (popupContainer.current) {
                        popupContainer.current.style.display = 'none';
                    }
                    selectedBuildingId.current = null;
                    return;
                }

                const feature = features[0];
                const featureId = feature.id;

                console.log('Feature object:', feature);

                if (!featureId) {
                    console.log("Feature does not have a valid ID");
                    return;
                }

                if (!feature.properties) {
                    console.log("Feature properties are null");
                    return;
                }

                // Извлечение данных здания
                const buildingName = feature.properties.name || 'N/A';
                const buildingAddress = feature.properties.address || 'N/A';
                const buildingType = feature.properties.type || 'N/A';
                const buildingHeight = feature.properties.height || 'N/A';

                // Логирование извлеченных данных
                console.log('Building data:', {
                    name: buildingName,
                    address: buildingAddress,
                    type: buildingType,
                    height: buildingHeight
                });

                // Если здание уже выделено, сбросить его стиль
                if (selectedBuildingId.current === featureId) {
                    resetBuildingStyle(featureId as number);
                    selectedBuildingId.current = null;
                    if (popupContainer.current) {
                        popupContainer.current.style.display = 'none'; // Скрываем попап
                    }
                    return;
                }

                // Сброс цвета и высоты предыдущего выбранного здания
                if (selectedBuildingId.current !== null) {
                    resetBuildingStyle(selectedBuildingId.current);
                }

                // Изменение заливки при клике
                map.setPaintProperty('3d-buildings', 'fill-extrusion-color', [
                    'case',
                    ['==', ['id'], featureId],
                    '#f00',
                    '#aaa'
                ]);

                // Обновление идентификатора выбранного здания
                selectedBuildingId.current = featureId as number;

                // Обновление информации в попапе
                if (popupContainer.current) {
                    const popupContent = document.getElementById('popup-content');
                    if (popupContent) {
                        popupContent.innerHTML = `
                            <div>
                                <strong style="font-size: 16px; color: #333;">Building Info</strong><br />
                                <div style="margin-top: 10px;">
                                    <strong style="color: #555;">Type:</strong> ${buildingType}<br />
                                    <strong style="color: #555;">Name:</strong> ${buildingName}<br />
                                    <strong style="color: #555;">Address:</strong> ${buildingAddress}<br />
                                    <strong style="color: #555;">Height:</strong> ${buildingHeight} meters
                                </div>
                            </div>
                        `;
                    }
                    popupContainer.current.style.display = 'block'; // Показываем попап
                }

                // Увеличение высоты здания при клике
                increaseHeight(featureId as number);
            });

            // Закрытие попапа при клике вне зданий
            map.on('click', (e) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ['3d-buildings']
                });

                if (!features.length) {
                    if (popupContainer.current) {
                        popupContainer.current.style.display = 'none'; // Скрываем попап
                    }
                    selectedBuildingId.current = null;
                }
            });
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return <div ref={mapContainer} className="map-container" style={{ height: '100vh', width: '100%', position: 'relative' }} />;
};

export default MapComponent;
