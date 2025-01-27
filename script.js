document.addEventListener('DOMContentLoaded', () => {
    const wyswietlaczPietra = document.getElementById('wyswietlacz-pietra');
    const wyswietlaczKierunkuJazdy = document.getElementById('wyswietlacz-kierunku-jazdy');
    //const wyswietlaczPracyDrzwi = document.getElementById('wyswietlacz-pracy-drzwi');
    const wyswietlaczWartosciPokonanePietra = document.getElementById('wyswietlacz-wartosci-pokonane-pietra');
    const wyswietlaczWartosciPrzebytaOdleglosc = document.getElementById('wyswietlacz-wartosci-przebyta-odleglosc');
    const wyswietlaczWartosciPrzystanki = document.getElementById('wyswietlacz-wartosci-przystanki');
    const elevator = document.getElementById('elevator');
    const shaftHeight = 1100; // Wysokość szybu
    const floors = 11; // Liczba pięter
    const floorHeight = shaftHeight / floors; // Wysokość jednego piętra
    let currentPosition = 0; // Obecne piętro windy
    let lokalnePolecenieWindy = null; // Zmienna do przechowywania lokalnej wartości poleceniaWindy[0]


    // Inicjalizacja windy
    window.moveElevator = function(targetFloor) {
        const floorsToTravel = Math.abs(targetFloor - currentPosition);
        const travelTime = floorsToTravel * 2000; // Czas przejazdu (2 sekunda na piętro)

        elevator.style.transition = `transform ${travelTime}ms ease-in-out`;
        elevator.style.transform = `translateY(-${targetFloor * floorHeight}px)`;

        currentPosition = targetFloor;
    };

    // Funkcja do aktualizacji pozycji windy @@@@ należy wysyłać z serwera informacje o statusie ruchu windy i drzwi aby na tej podstawie uruchamiac animację lub ja zatrzymywać
    function aktualizujRuchWindy(data) {
        const poleceniaWindy = data.windy_data.polecenia;
        piętroStartuRuchuWindy = data.windy_data.lokalizacjaWindy    
        const celRuchuWindy = poleceniaWindy[0];
        // Ustawienie pozycji windy na piętroStartuRuchuWindy
        elevator.style.transition = 'none'; // Wyłącz animację
        elevator.style.transform = `translateY(-${piętroStartuRuchuWindy * floorHeight}px)`;

        // Aktualizacja pozycji windy
        const floorsToTravel = Math.abs(celRuchuWindy - piętroStartuRuchuWindy);
        const travelTime = floorsToTravel * 2000; // Czas przejazdu (2 sekunda na piętro)

        // Dodanie opóźnienia, aby animacja była widoczna
        setTimeout(() => {
            elevator.style.transition = `transform ${travelTime}ms ease-in-out`;
            elevator.style.transform = `translateY(-${celRuchuWindy * floorHeight}px)`;
        }, 50);
    }
    
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

        if (wyswietlaczPietra) {
            wyswietlaczPietra.textContent = lokalizacjaWindy;
        }
        if (wyswietlaczKierunkuJazdy) {
            wyswietlaczKierunkuJazdy.textContent = kierunekJazdySymbol;
        }
        //if (wyswietlaczPracyDrzwi) {
        //    wyswietlaczPracyDrzwi.textContent = data.windy_data.polecenia; // Zakładam, że polecenia zawiera status drzwi
        //}
    }

    function aktualizujWyswietlaczeStatystykiWindy(data) {
        const pokonanePietra = data.pokonane_pietra;
        const przebytaOdleglosc = data.przebyta_odleglosc;
        const przystanki = data.zaliczone_przystanki;

        if (wyswietlaczWartosciPokonanePietra) {
            wyswietlaczWartosciPokonanePietra.textContent = pokonanePietra;
        }
        if (wyswietlaczWartosciPrzebytaOdleglosc) {
            wyswietlaczWartosciPrzebytaOdleglosc.textContent = przebytaOdleglosc;
        }
        if (wyswietlaczWartosciPrzystanki) {
            wyswietlaczWartosciPrzystanki.textContent = przystanki;
        }
    }

    // Funkcja do pobierania danych z serwera
    function pobierzStatusWindy() {
        fetch('https://winda.onrender.com/get_winda_status')
            .then(response => response.json())
            .then(data => {
                const nowePolecenieWindy = data.windy_data.polecenia[0]; // Pobierz wartość poleceniaWindy[0] z serwera

                // Sprawdź, czy wartość poleceniaWindy[0] z serwera jest inna niż lokalna wartość
                if (nowePolecenieWindy !== lokalnePolecenieWindy && data.windy_data.wydarzenieStatusSymulacji === true) {
                    lokalnePolecenieWindy = nowePolecenieWindy; // Zaktualizuj lokalną wartość
                    aktualizujRuchWindy(data); // Wykonaj funkcję aktualizujRuchWindy()
                }
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



    // Początkowe pobranie danych
    pobierzStatusWindy();
    pobierzStatystykiWindy();
    setInterval(pobierzStatusWindy, 1000);
    setInterval(pobierzStatystykiWindy, 1000);
});