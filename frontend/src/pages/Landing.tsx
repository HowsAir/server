import { useEffect, useState } from 'react';
import { obtenerMediciones } from '../api-client';
import Medicion from '../components/Medicion';
import { MedicionType } from '../types';

const Landing = () => {
  const [mediciones, setMediciones] = useState<MedicionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMediciones = async () => {
      try {
        const data = await obtenerMediciones();
        setMediciones(data);
      } catch (error) {
        console.error('Error obteniendo mediciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMediciones();
  }, []);

  return (
    <main className="container mx-auto py-10">
      <div className="container mx-auto flex-1 mb-8">
        <h1 className="text-center font-semibold text-4xl">Controla la calidad del aire a tu alrededor</h1>
      </div>
      <h2 className="text-xl font-normal mb-4 text-left">Últimas mediciones:</h2>

      {loading ? (
        <p className="text-center">Cargando mediciones...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediciones.length > 0 ? (
            mediciones.map((medicion) => (
              <Medicion
                key={medicion._id}
                _id={medicion._id}
                fecha={medicion.fecha}
                ppm={medicion.ppm}
                temperatura={medicion.temperatura}
                latitud={medicion.latitud}
                longitud={medicion.longitud}
              />
            ))
          ) : (
            <p className="text-center col-span-full">No hay mediciones disponibles</p>
          )}
        </div>
      )}
    </main>
  );
};

export default Landing;
