'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Region {
  name: string;
  demographics?: {
    total_population?: number;
    density_per_sq_km?: number;
    annual_growth_rate_2017_2023?: number;
  };
  education?: {
    total?: {
      literacy_rate?: number;
    };
  };
}

interface Props {
  regions: Region[];
  selectedMetric: 'population' | 'literacy' | 'density' | 'growth';
}

// Province name mapping for better matching
const provinceMapping: { [key: string]: string } = {
  'punjab': 'Punjab',
  'sindh': 'Sindh',
  'khyber pakhtunkhwa': 'Khyber Pakhtunkhwa',
  'kp': 'Khyber Pakhtunkhwa',
  'balochistan': 'Balochistan',
  'islamabad': 'Islamabad Capital Territory',
  'ict': 'Islamabad Capital Territory',
  'federal capital territory': 'Islamabad Capital Territory'
};

export default function PakistanMap({ regions, selectedMetric }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const geoJsonLayer = useRef<L.GeoJSON | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Store reference to container to check if it still exists
    const container = mapContainer.current;

    // Initialize Leaflet map - Focus on Pakistan
    // Disable all animations to prevent cleanup errors
    map.current = L.map(container, {
      center: [30.3753, 69.3451], // Pakistan center
      zoom: 6,
      minZoom: 5,
      maxZoom: 12,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      fadeAnimation: false,
      zoomAnimation: false, // Disable zoom animation
      markerZoomAnimation: false
    });
    
    // Completely disable pan animations by overriding Leaflet's pan methods
    if (map.current) {
      const mapInstance = map.current as any;
      
      // Override panBy to prevent animations
      const originalPanBy = mapInstance.panBy;
      mapInstance.panBy = function(point: any, options?: any) {
        const noAnimOptions = { ...options, animate: false, duration: 0 };
        return originalPanBy.call(this, point, noAnimOptions);
      };
      
      // Override panTo to prevent animations
      const originalPanTo = mapInstance.panTo;
      mapInstance.panTo = function(center: any, options?: any) {
        const noAnimOptions = { ...options, animate: false, duration: 0 };
        return originalPanTo.call(this, center, noAnimOptions);
      };
      
      // Override setView to prevent animations
      const originalSetView = mapInstance.setView;
      mapInstance.setView = function(center: any, zoom?: any, options?: any) {
        const noAnimOptions = { ...options, animate: false, duration: 0 };
        return originalSetView.call(this, center, zoom, noAnimOptions);
      };
      
      // Override fitBounds to prevent animations
      const originalFitBounds = mapInstance.fitBounds;
      mapInstance.fitBounds = function(bounds: any, options?: any) {
        const noAnimOptions = { ...options, animate: false, duration: 0 };
        return originalFitBounds.call(this, bounds, noAnimOptions);
      };
      
      // Patch _onPanTransitionEnd to prevent classList access errors
      const originalOnPanTransitionEnd = mapInstance._onPanTransitionEnd;
      if (originalOnPanTransitionEnd) {
        mapInstance._onPanTransitionEnd = function() {
          try {
            // Check if container still exists before accessing classList
            const container = this.getContainer();
            if (container && container.classList) {
              return originalOnPanTransitionEnd.call(this);
            }
          } catch (e) {
            // Silently ignore - element was removed
          }
        };
      }
      
      // Immediately stop and clear any pan animation
      if (mapInstance._panAnim) {
        try {
          mapInstance._panAnim.stop();
          mapInstance._panAnim = null;
        } catch (e) {
          // Ignore
        }
      }
    }

    // Add a more visually appealing tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      tileSize: 256,
      zoomOffset: 0
    }).addTo(map.current);

    // Set initial bounds to Pakistan region - restrict to Pakistan only
    const pakistanBounds = L.latLngBounds(
      [23.5, 60.0], // Southwest corner
      [37.0, 77.0]  // Northeast corner
    );
    map.current.setMaxBounds(pakistanBounds);
    (map.current as any).setView([30.3753, 69.3451], 6, { animate: false, duration: 0 }); // Center on Pakistan

    // Load GeoJSON data
    const loadGeoJSON = async () => {
      // Check if map still exists and container is still mounted
      if (!map.current || !mapContainer.current || !map.current.getContainer()) {
        return;
      }

      try {
        const response = await fetch('/geo/pakistan_provinces.geojson');
        if (!response.ok) {
          throw new Error(`Failed to load GeoJSON: ${response.status}`);
        }
        
        const text = await response.text();
        if (!text || text.trim().length === 0) {
          throw new Error('GeoJSON file is empty');
        }
        
        let geoData;
        try {
          geoData = JSON.parse(text);
        } catch (parseError) {
          throw new Error('Invalid JSON in GeoJSON file');
        }
        
        if (!geoData || !geoData.features || !Array.isArray(geoData.features)) {
          throw new Error('Invalid GeoJSON structure');
        }

        // Double-check map is still valid before proceeding
        if (!map.current || !map.current.getContainer()) {
          return;
        }

        // Calculate color based on selected metric
        const getColor = (regionName: string): string => {
          const normalizedName = regionName.toLowerCase().trim();
          const mappedName = provinceMapping[normalizedName] || regionName;
          
          const region = regions.find(r => {
            const rName = r.name.toLowerCase();
            return rName === mappedName.toLowerCase() ||
                   rName.includes(normalizedName) ||
                   normalizedName.includes(rName) ||
                   (normalizedName.includes('punjab') && rName.includes('punjab')) ||
                   (normalizedName.includes('sindh') && rName.includes('sindh')) ||
                   (normalizedName.includes('khyber') && rName.includes('khyber')) ||
                   (normalizedName.includes('baloch') && rName.includes('baloch')) ||
                   (normalizedName.includes('islamabad') && rName.includes('islamabad'));
          });

          if (!region) return '#94a3b8';

          let value = 0;
          switch (selectedMetric) {
            case 'population':
              value = region.demographics?.total_population || 0;
              break;
            case 'literacy':
              value = region.education?.total?.literacy_rate || 0;
              break;
            case 'density':
              value = region.demographics?.density_per_sq_km || 0;
              break;
            case 'growth':
              value = region.demographics?.annual_growth_rate_2017_2023 || 0;
              break;
          }

          // Normalize and create color gradient
          const maxValue = Math.max(...regions.map(r => {
            switch (selectedMetric) {
              case 'population': return r.demographics?.total_population || 0;
              case 'literacy': return r.education?.total?.literacy_rate || 0;
              case 'density': return r.demographics?.density_per_sq_km || 0;
              case 'growth': return r.demographics?.annual_growth_rate_2017_2023 || 0;
              default: return 0;
            }
          }));

          const normalized = maxValue > 0 ? value / maxValue : 0;
          
          // Beautiful color gradients based on metric
          let color;
          if (selectedMetric === 'population') {
            // Blue gradient for population
            const intensity = Math.floor(normalized * 180);
            color = `rgb(${100 - intensity * 0.3}, ${150 - intensity * 0.2}, ${200 + intensity})`;
          } else if (selectedMetric === 'literacy') {
            // Green gradient for literacy
            const intensity = Math.floor(normalized * 150);
            color = `rgb(${100 - intensity * 0.4}, ${150 + intensity}, ${100 - intensity * 0.3})`;
          } else if (selectedMetric === 'density') {
            // Purple gradient for density
            const intensity = Math.floor(normalized * 180);
            color = `rgb(${150 + intensity * 0.5}, ${100 + intensity * 0.3}, ${200 + intensity})`;
          } else {
            // Orange gradient for growth
            const intensity = Math.floor(normalized * 150);
            color = `rgb(${255 - intensity * 0.5}, ${150 + intensity * 0.4}, ${50 + intensity * 0.2})`;
          }
          return color;
        };

        // Style function for GeoJSON
        const style = (feature: any) => {
          const regionName = feature.properties?.name || feature.properties?.NAME || 'Unknown';
          const color = getColor(regionName);
          
          return {
            fillColor: color,
            fillOpacity: 0.7,
            color: '#1e3a8a',
            weight: 2.5,
            opacity: 1
          };
        };

        // Create popup content
        const createPopupContent = (feature: any): string => {
          const regionName = feature.properties?.name || feature.properties?.NAME || 'Unknown';
          const normalizedName = regionName.toLowerCase().trim();
          const mappedName = provinceMapping[normalizedName] || regionName;
          
          const region = regions.find(r => {
            const rName = r.name.toLowerCase();
            return rName === mappedName.toLowerCase() ||
                   rName.includes(normalizedName) ||
                   normalizedName.includes(rName) ||
                   (normalizedName.includes('punjab') && rName.includes('punjab')) ||
                   (normalizedName.includes('sindh') && rName.includes('sindh')) ||
                   (normalizedName.includes('khyber') && rName.includes('khyber')) ||
                   (normalizedName.includes('baloch') && rName.includes('baloch')) ||
                   (normalizedName.includes('islamabad') && rName.includes('islamabad'));
          });

          let content = `<div style="padding: 12px; min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="font-weight: bold; margin-bottom: 10px; font-size: 18px; color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px;">${regionName}</h3>`;

          if (region) {
            switch (selectedMetric) {
              case 'population':
                const pop = ((region.demographics?.total_population || 0) / 1_000_000).toFixed(2);
                content += `<div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 10px; border-radius: 8px; margin-top: 8px;">
                  <p style="margin: 0; font-size: 14px; opacity: 0.9;">Population</p>
                  <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: bold;">${pop}M</p>
                </div>`;
                break;
              case 'literacy':
                const lit = (region.education?.total?.literacy_rate || 0).toFixed(1);
                content += `<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 10px; border-radius: 8px; margin-top: 8px;">
                  <p style="margin: 0; font-size: 14px; opacity: 0.9;">Literacy Rate</p>
                  <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: bold;">${lit}%</p>
                </div>`;
                break;
              case 'density':
                const den = (region.demographics?.density_per_sq_km || 0).toFixed(1);
                content += `<div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 10px; border-radius: 8px; margin-top: 8px;">
                  <p style="margin: 0; font-size: 14px; opacity: 0.9;">Population Density</p>
                  <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: bold;">${den}</p>
                  <p style="margin: 0; font-size: 12px; opacity: 0.8;">per sq km</p>
                </div>`;
                break;
              case 'growth':
                const gr = (region.demographics?.annual_growth_rate_2017_2023 || 0).toFixed(2);
                content += `<div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 10px; border-radius: 8px; margin-top: 8px;">
                  <p style="margin: 0; font-size: 14px; opacity: 0.9;">Growth Rate (2017-2023)</p>
                  <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: bold;">${gr}%</p>
                </div>`;
                break;
            }
          } else {
            content += `<p style="color: #6b7280; font-size: 12px; padding: 8px; background: #f3f4f6; border-radius: 6px; margin-top: 8px;">Data not available</p>`;
          }

          content += `</div>`;
          return content;
        };

        // Add GeoJSON layer
        if (!map.current) {
          throw new Error('Map not initialized');
        }

        if (geoJsonLayer.current) {
          map.current.removeLayer(geoJsonLayer.current);
        }

        geoJsonLayer.current = L.geoJSON(geoData as any, {
          style: style,
          onEachFeature: (feature, layer) => {
            const popupContent = createPopupContent(feature);
            layer.bindPopup(popupContent);
            
            // Add hover effects with smooth transitions
            layer.on({
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                  fillOpacity: 0.9,
                  weight: 4,
                  color: '#0f172a',
                  opacity: 1
                });
                if (map.current) {
                  (map.current.getContainer() as HTMLElement).style.cursor = 'pointer';
                }
                // Bring to front
                layer.bringToFront();
              },
              mouseout: (e) => {
                const layer = e.target;
                if (geoJsonLayer.current) {
                  geoJsonLayer.current.resetStyle(e.target);
                }
                if (map.current) {
                  (map.current.getContainer() as HTMLElement).style.cursor = '';
                }
              },
              click: (e) => {
                layer.openPopup();
              }
            });
          }
        });

        if (map.current && geoJsonLayer.current) {
          geoJsonLayer.current.addTo(map.current);
        }

        // Fit map to bounds with proper padding - focus on provinces
        if (geoJsonLayer.current && map.current && map.current.getContainer()) {
          try {
            const bounds = geoJsonLayer.current.getBounds();
            if (bounds.isValid() && map.current && map.current.getContainer()) {
              // Use Pakistan bounds but focus on the provinces
              const pakistanViewBounds = L.latLngBounds(
                [23.5, 60.0],
                [37.0, 77.0]
              );
              // Check if map is still valid before setting bounds
              if (map.current && map.current.getContainer()) {
                // Force no animation
                (map.current as any).fitBounds(pakistanViewBounds, {
                  padding: [60, 60],
                  maxZoom: 7,
                  animate: false,
                  duration: 0 // Instant, no animation
                });
              }
            } else if (map.current && map.current.getContainer()) {
              // Fallback: set view to Pakistan without animation
              (map.current as any).setView([30.3753, 69.3451], 6, { animate: false, duration: 0 });
            }
          } catch (e) {
            console.warn('Could not fit bounds:', e);
            // Fallback: set view to Pakistan
            if (map.current && map.current.getContainer()) {
              try {
                (map.current as any).setView([30.3753, 69.3451], 6, { animate: false, duration: 0 });
              } catch (err) {
                // Ignore errors during cleanup
              }
            }
          }
        } else {
          // If no bounds, just center on Pakistan
          if (map.current && map.current.getContainer()) {
            try {
              (map.current as any).setView([30.3753, 69.3451], 6, { animate: false, duration: 0 });
            } catch (err) {
              // Ignore errors
            }
          }
        }

        // Only update state if map is still mounted
        if (map.current && map.current.getContainer()) {
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Error loading map data:', err);
        // Only update state if map is still mounted
        if (map.current && map.current.getContainer()) {
          setError(err.message || 'Failed to load map data');
          setIsLoading(false);
        }
      }
    };

    loadGeoJSON();

    return () => {
      if (map.current) {
        try {
          const mapInstance = map.current;
          
          // Stop all animations immediately
          if (mapInstance.getContainer && mapInstance.getContainer()) {
            try {
              mapInstance.stop();
            } catch (e) {
              // Ignore
            }
          }
          
          // Stop pan animation if it exists - CRITICAL: prevent classList access
          if ((mapInstance as any)._panAnim) {
            try {
              const panAnim = (mapInstance as any)._panAnim;
              // Stop the animation
              if (panAnim.stop) {
                panAnim.stop();
              }
              // Clear the animation object completely
              (mapInstance as any)._panAnim = null;
              // Remove the event listener that causes the error
              if (panAnim._el) {
                try {
                  panAnim._el = null;
                } catch (e) {
                  // Ignore
                }
              }
            } catch (e) {
              // Force clear even if stop fails
              try {
                (mapInstance as any)._panAnim = null;
              } catch (e2) {
                // Ignore
              }
            }
          }
          
          // Stop zoom animation if it exists
          if ((mapInstance as any)._zoomAnim) {
            try {
              const zoomAnim = (mapInstance as any)._zoomAnim;
              if (zoomAnim.stop) {
                zoomAnim.stop();
              }
              (mapInstance as any)._zoomAnim = null;
            } catch (e) {
              try {
                (mapInstance as any)._zoomAnim = null;
              } catch (e2) {
                // Ignore
              }
            }
          }
          
          // Also clear any pending animation callbacks
          if ((mapInstance as any)._panTransitionEnd) {
            try {
              (mapInstance as any)._panTransitionEnd = null;
            } catch (e) {
              // Ignore
            }
          }
          
          // Remove all layers first
          try {
            mapInstance.eachLayer((layer) => {
              try {
                mapInstance.removeLayer(layer);
              } catch (e) {
                // Ignore errors during cleanup
              }
            });
          } catch (e) {
            // Ignore
          }
          
          // Clear all event listeners
          try {
            mapInstance.off();
          } catch (e) {
            // Ignore
          }
          
          // Remove the map
          try {
            mapInstance.remove();
          } catch (e) {
            // Ignore
          }
        } catch (e) {
          // Silently ignore all cleanup errors
        } finally {
          map.current = null;
        }
      }
      if (geoJsonLayer.current) {
        geoJsonLayer.current = null;
      }
    };
  }, [regions, selectedMetric]);

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-semibold mb-2">{error}</p>
        <p className="text-gray-600 text-sm">Make sure pakistan_provinces.geojson exists in /public/geo/</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '600px' }}>
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-xl border-2 border-gray-300 shadow-inner" 
        style={{ zIndex: 0 }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 bg-opacity-95 rounded-xl z-10 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold">Loading map data...</p>
          </div>
        </div>
      )}
      {/* Custom map controls styling */}
      <style jsx global>{`
        .leaflet-container {
          background: #f0f9ff;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
        }
        .leaflet-control-zoom a {
          background-color: white !important;
          color: #1e40af !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 6px !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 18px !important;
          font-weight: bold !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #eff6ff !important;
          color: #1d4ed8 !important;
        }
        .leaflet-control-attribution {
          background: rgba(255, 255, 255, 0.9) !important;
          border-radius: 4px !important;
          padding: 4px 8px !important;
          font-size: 11px !important;
        }
      `}</style>
    </div>
  );
}
