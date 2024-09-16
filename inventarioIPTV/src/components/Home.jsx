import  { useEffect, useState } from 'react';

const Home = () => {
  const [cajas, setCajas] = useState([]);

  useEffect(() => {
    fetch('http://172.16.2.103:3000/cajasIPTV')
      .then(response => response.json())
      .then(data => setCajas(data))
      .catch(error => console.error('Error fetching cajas:', error));
  }, []);

  return (
    <div className="p-4 w-80 mx-auto">
      <h1 className="text-2xl font-bold text-center">Cajas IPTV</h1>
      <ul>
        {cajas.map(caja => (
          <li key={caja.numeroSerie} className="border p-2 mb-2">
            {caja.numeroSerie} - {caja.estadoAsignacion} - {caja.codigoCliente}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
