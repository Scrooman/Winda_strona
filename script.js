document.addEventListener('DOMContentLoaded', () => {
    const wyswietlaczPietra = document.getElementById('wyswietlacz-pietra');
    const wyswietlaczKierunkuJazdy = document.getElementById('wyswietlacz-kierunku-jazdy');
    const wyswietlaczPracyDrzwi = document.getElementById('wyswietlacz-pracy-drzwi');
    const wyswietlaczWartosciPokonanePietra = document.getElementById('wyswietlacz-wartosci-pokonane-pietra');
    const wyswietlaczWartosciPrzebytaOdleglosc = document.getElementById('wyswietlacz-wartosci-przebyta-odleglosc');
    const wyswietlaczWartosciPrzystanki = document.getElementById('wyswietlacz-wartosci-przystanki');
    
    // Funkcja do aktualizacji wyświetlaczy
    function aktualizujWyswietlacze(data) {
        const lokalizacjaWindy = data.windy_data.lokalizacjaWindy;
        const kierunekJazdy = data.windy_data.kierunekJazdy;

        // Aktualizacja wyświetlacza kierunku jazdy
        let kierunekJazdySymbol = '';
        if (kierunekJazdy === 2) {
            kierunekJazdySymbol = '↑';
        } else if (kierunekJazdy === 1) {
            kierunekJazdySymbol = '↓';
        } else {
            kierunekJazdySymbol = ' ';
        }

        wyswietlaczPietra.textContent = lokalizacjaWindy;
        wyswietlaczKierunkuJazdy.textContent = kierunekJazdySymbol;
    }


    function aktualizujWyswietlaczeStatystykiWindy(data) {
        const pokonanePietra = data.pokonane_pietra;
        const przebytaOdleglosc = data.przebyta_odleglosc;
        const przystanki = data.zaliczone_przystanki;
        wyswietlaczWartosciPokonanePietra.textContent = pokonanePietra;
        wyswietlaczWartosciPrzebytaOdleglosc.textContent = przebytaOdleglosc;
        wyswietlaczWartosciPrzystanki.textContent = przystanki;
    }

    // Funkcja do pobierania danych z serwera
    function pobierzStatusWindy() {
        fetch('https://winda.onrender.com/get_winda_status')
            .then(response => response.json())
            .then(data => {
                aktualizujWyswietlacze(data);
            })
            .catch(error => console.error('Błąd podczas pobierania danych z serwera:', error));
    }

    function pobierzStatystykiWindy() {
        fetch('https://winda.onrender.com/get_statystyki')
            .then(response => response.json())
            .then(data => {
                aktualizujWyswietlaczeStatystykiWindy(data);
            })
            .catch(error => console.error('Błąd podczas pobierania danych z serwera:', error));
    }


    setInterval(pobierzStatusWindy, 1000);
    setInterval(pobierzStatystykiWindy, 1000);

    // Początkowe pobranie danych
    pobierzStatusWindy();
    pobierzStatystykiWindy();
});