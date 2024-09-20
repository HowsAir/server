import React from 'react';
import { MedicionData } from '../types';

const Medicion: React.FC<MedicionData> = ({ fecha, ppm, temperatura, latitud, longitud }) => {
  return (
    <div className="p-4 rounded-lg shadow-sm bg-gray-50">
      <p><strong>Fecha:</strong> {new Date(fecha).toLocaleString()}</p>
      <p><strong>PPM:</strong> {ppm}</p>
      <p><strong>Temperatura:</strong> {temperatura}°C</p>
      <p><strong>Latitud:</strong> {latitud}</p>
      <p><strong>Longitud:</strong> {longitud}</p>
    </div>
  );
};

export default Medicion;