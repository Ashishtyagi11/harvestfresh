import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PincodeChecker } from '../components/PincodeChecker';

export const DeliveryCoverage = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await api.get('/delivery-zones');
        setZones(res.data);
      } catch (err) {
        console.error("Delivery zones fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="bg-secondary-container text-on-secondary-container text-xs font-bold px-3.5 py-1.5 rounded-full uppercase">
          URBAN HARVEST NETWORK
        </span>
        <h1 className="font-hanken font-extrabold text-4xl text-primary">Serviceable Delivery Coverage</h1>
        <p className="font-jakarta text-sm text-on-surface-variant">
          HarvestFresh operates direct-to-home express delivery across major metro clusters.
        </p>
      </div>

      {/* PINCODE CHECKER WIDGET */}
      <div className="max-w-2xl mx-auto">
        <PincodeChecker />
      </div>

      {/* COVERAGE ZONES LIST */}
      <div className="space-y-6">
        <h3 className="font-hanken font-bold text-2xl text-primary">Active Metro Service Zones</h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-36 bg-surface-container animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map((zone) => (
              <div key={zone._id || zone.id} className="bg-white p-6 rounded-2xl border border-outline-variant/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm bg-primary/10 text-primary px-2.5 py-1 rounded-md">
                    PIN: {zone.pincode}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {zone.estimated_delivery_minutes} Mins Delivery
                  </span>
                </div>
                <h4 className="font-hanken font-bold text-lg text-primary">{zone.area_name}</h4>
                <p className="font-jakarta text-xs text-on-surface-variant">{zone.city} Region</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
