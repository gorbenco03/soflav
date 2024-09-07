import React, { useEffect, useState } from 'react';

interface Reservation {
  tripType: string;
  from: string;
  fromStation: string;
  departureTime: string;
  to: string;
  toStation: string;
  arrivalTime: string;
  date: string;
  name: string;
  surname: string;
  phone: string;
  email: string;
  passportSerial: string;
  isStudent: boolean;
  studentIdSerial: string;
}

interface Routes {
  [key: string]: string[];
}

const ReservationAndPricePage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReservation, setExpandedReservation] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fromCity, setFromCity] = useState<string | undefined>(undefined);
  const [toCity, setToCity] = useState<string | undefined>(undefined);
  const [reservationCount, setReservationCount] = useState<number>(0);
  const [reservationsStopped, setReservationsStopped] = useState<boolean>(false);
  const [routes, setRoutes] = useState<Routes>({});
  const [price, setPrice] = useState('');

  useEffect(() => {
    fetchReservations();
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (filterDate) {
      checkReservationStatus(new Date(filterDate));
    }
  }, [filterDate]);

  useEffect(() => {
    if (filterDate) {
      const count = reservations.filter(
        (reservation) => new Date(reservation.date).toLocaleDateString('ro-RO') === new Date(filterDate).toLocaleDateString('ro-RO')
      ).length;
      setReservationCount(count);
    } else {
      setReservationCount(0);
    }
  }, [filterDate, reservations]);

  const fetchReservations = async () => {
    try {
      const response = await fetch('https://lavial.icu/reservations');
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await fetch('https://lavial.icu/get-routes');
      const data = await response.json();
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
      alert('A apărut o eroare la încărcarea rutelor.');
    }
  };

  const checkReservationStatus = async (date: Date) => {
    try {
      const response = await fetch('https://lavial.icu/check-reservation-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: date.toISOString() }),
      });

      const data = await response.json();
      setReservationsStopped(data.stopped);
    } catch (error) {
      console.error('Error checking reservation status:', error);
      alert('A apărut o eroare la verificarea stării rezervărilor.');
    }
  };

  const fetchPrice = async () => {
    if (!fromCity || !toCity) {
      alert('Vă rugăm să selectați ambele orașe.');
      return;
    }

    try {
      const response = await fetch('https://lavial.icu/get-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromCity,
          to: toCity,
          passengers: [{ isStudent: false }],
        }),
      });

      const data = await response.json();
      if (data.routePrice !== undefined) {
        setPrice(data.routePrice.toString());
      } else {
        alert('Prețul nu a putut fi determinat. Verificați datele introduse.');
      }
    } catch (error) {
      console.error('Error fetching price:', error);
      alert('A apărut o eroare la încărcarea prețului.');
    }
  };

  const handleSavePrice = async () => {
    if (!fromCity || !toCity || !price) {
      alert('Vă rugăm să completați toate câmpurile.');
      return;
    }

    try {
      await fetch('https://lavial.icu/update-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: fromCity, to: toCity, price: parseFloat(price) }),
      });
      alert('Prețul a fost actualizat cu succes.');
    } catch (error) {
      console.error('Error updating price:', error);
      alert('A apărut o eroare la actualizarea prețului.');
    }
  };

  const resetFilters = () => {
    setFilterDate(undefined);
    setSearchQuery('');
    setFromCity('');
    setToCity('');
  };

  const toggleReservations = async () => {
    if (!filterDate) {
      alert('Selectați o dată pentru a opri/pornir rezervările');
      return;
    }

    const action = reservationsStopped ? 'start' : 'stop';
    try {
      const response = await fetch(`https://lavial.icu/${action}-reservation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: new Date(filterDate).toISOString() }),
      });

      setReservationsStopped(!reservationsStopped);
      alert(`Rezervările au fost ${reservationsStopped ? 'pornite' : 'oprite'} pentru data selectată`);
    } catch (error) {
      console.error(`Error ${action}ping reservations:`, error);
      alert(`A apărut o eroare la ${action}ping rezervărilor`);
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    const matchesDate = !filterDate || new Date(reservation.date).toLocaleDateString('ro-RO') === new Date(filterDate).toLocaleDateString('ro-RO');
    const matchesSearch = searchQuery === '' || reservation.name.toLowerCase().includes(searchQuery.toLowerCase()) || reservation.surname.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFromCity = fromCity === undefined || fromCity === '' || reservation.from.toLowerCase().includes(fromCity.toLowerCase());
    const matchesToCity = toCity === undefined || toCity === '' || reservation.to.toLowerCase().includes(toCity.toLowerCase());
    return matchesDate && matchesSearch && matchesFromCity && matchesToCity;
  });

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-8">
      {/* Section for Reservation Management */}
      <h2 className="text-2xl font-bold mb-6">Rezervări</h2>
      <div className="mb-6">
        <label className="block mb-2">Selectați data:</label>
        <input
          type="date"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={filterDate || ''}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <div className="mb-4">
          <button onClick={toggleReservations} className={`w-full py-2 rounded mb-4 ${reservationsStopped ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {reservationsStopped ? 'Porniți Rezervările' : 'Opriți Rezervările'}
          </button>
        </div>
      </div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Căutați după nume..."
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <input
          type="text"
          placeholder="De la oraș..."
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={fromCity || ''}
          onChange={(e) => setFromCity(e.target.value)}
        />
        <input
          type="text"
          placeholder="La oraș..."
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={toCity || ''}
          onChange={(e) => setToCity(e.target.value)}
        />
        <button onClick={resetFilters} className="w-full bg-yellow-500 text-white py-2 rounded mb-4">
          Resetați Filtrele
        </button>
      </div>
      <div className="mb-4">
        <p className="text-lg font-semibold">Rezervări pentru {filterDate ? new Date(filterDate).toLocaleDateString('ro-RO') : 'selectați o dată'}: {reservationCount}</p>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        filteredReservations.map((reservation) => (
          <div key={reservation.email + reservation.date} className="border-b p-4">
            <p>
              <strong>Pasager:</strong> {reservation.name} {reservation.surname}
            </p>
            <p>
              <strong>De la:</strong> {reservation.from} ({reservation.fromStation}) - <strong>La:</strong> {reservation.to} ({reservation.toStation})
            </p>
            <p>
              <strong>Data:</strong> {new Date(reservation.date).toLocaleDateString('ro-RO')}
            </p>
            {expandedReservation === reservation.email + reservation.date && (
              <div className="mt-4">
                <p><strong>Tipul călătoriei:</strong> {reservation.tripType}</p>
                <p><strong>Ora plecării:</strong> {reservation.departureTime}</p>
                <p><strong>Ora sosirii:</strong> {reservation.arrivalTime}</p>
                <p><strong>Email:</strong> {reservation.email}</p>
                <p><strong>Telefon:</strong> {reservation.phone}</p>
                {reservation.isStudent && <p><strong>Legitimația de student:</strong> {reservation.studentIdSerial}</p>}
              </div>
            )}
            <button
              className="mt-4 text-blue-500"
              onClick={() => setExpandedReservation(expandedReservation === reservation.email + reservation.date ? null : reservation.email + reservation.date)}
            >
              {expandedReservation === reservation.email + reservation.date ? 'Ascunde Detalii' : 'Afișează Detalii'}
            </button>
          </div>
        ))
      )}

      {/* Section for Price Management */}
      <h2 className="text-2xl font-bold mb-6 mt-12">Modificare Preț</h2>
      <label className="block mb-2">Selectați orașul de plecare:</label>
      <select
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        value={fromCity || ''}
        onChange={(e) => setFromCity(e.target.value)}
      >
        <option value="">Selectați orașul</option>
        {Object.keys(routes).map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      <label className="block mb-2">Selectați orașul de destinație:</label>
      <select
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        value={toCity || ''}
        onChange={(e) => setToCity(e.target.value)}
        disabled={!fromCity}
      >
        <option value="">Selectați orașul</option>
        {fromCity &&
          routes[fromCity] &&
          routes[fromCity].map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
      </select>

      <button onClick={fetchPrice} className="w-full bg-blue-500 text-white py-2 rounded mb-4">
        Afișează Prețul
      </button>

      <label className="block mb-2">Prețul:</label>
      <input
        type="text"
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <button onClick={handleSavePrice} className="w-full bg-green-500 text-white py-2 rounded">
        Salvează Prețul
      </button>
    </div>
  );
};

export default ReservationAndPricePage;