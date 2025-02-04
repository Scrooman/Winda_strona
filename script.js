document.addEventListener('DOMContentLoaded', () => {
    const wyswietlaczPietra = document.getElementById('wyswietlacz-pietra');
    const wyswietlaczKierunkuJazdy = document.getElementById('wyswietlacz-kierunku-jazdy');
    //const wyswietlaczPracyDrzwi = document.getElementById('wyswietlacz-pracy-drzwi');
    const wyswietlaczWartosciPokonanePietra = document.getElementById('wyswietlacz-wartosci-pokonane-pietra');
    const wyswietlaczWartosciPrzebytaOdleglosc = document.getElementById('wyswietlacz-wartosci-przebyta-odleglosc');
    const wyswietlaczWartosciPrzystanki = document.getElementById('wyswietlacz-wartosci-przystanki');
    const wyswietlaczWartosciStatusSymulacji = document.getElementById('wyswietlacz-wartosci-status-symulacji')
    const suwakCzestotliwosciGenerowania = document.getElementById('suwak-czestotliwosci-generowania');
    const suwakCzestotliwosciGenerowaniaWartosc = document.getElementById('suwak-czestotliwosci-generowania-wartosc');
    const wyswietlaczStatusWindy = document.getElementById('wyswietlacz-wartosci-status-windy');
    const wyswietlaczStatusDrzwi = document.getElementById('wyswietlacz-wartosci-status-drzwi');
    const wyswietlaczTrybPracy = document.getElementById('wyswietlacz-wartosci-tryb-pracy');
    const wyswietlaczObciazenie = document.getElementById('wyswietlacz-wartosci-obciazenie');
    const wyswietlaczPredkoscWindy = document.getElementById('wyswietlacz-wartosci-predkosc-windy');
    const wyswietlaczIndeksZuzycia = document.getElementById('wyswietlacz-wartosci-indeks-zuzycia');
    const wyswietlaczOstatniSerwis = document.getElementById('wyswietlacz-wartosci-ostatni-serwis');
    const wyswietlaczPasazerowTyp1 = document.getElementById('wyswietlacz-wartosci-pasazerow1');
    const wyswietlaczPasazerowTyp2 = document.getElementById('wyswietlacz-wartosci-pasazerow2');
    const wyswietlaczPasazerowTyp3 = document.getElementById('wyswietlacz-wartosci-pasazerow3');
    const wyswietlaczPasazerowWszystko = document.getElementById('wyswietlacz-wartosci-pasazerow4');

    const elevator = document.getElementById('elevator');
    const shaftHeight = 1100; // Wysokość szybu
    const floors = 11; // Liczba pięter
    const floorHeight = shaftHeight / floors; // Wysokość jednego piętra
    let currentPosition = 0; // Obecne piętro windy
    let lokalnePolecenieWindy = null; // Zmienna do przechowywania lokalnej wartości poleceniaWindy[0]
    let lokalnyStatusDrzwi = null; // Zmienna do przechowywania lokalnej wartości statusu pracy drzwi
    let lokalnyRuchWindy = null; // Zmienna do przechowywania lokalnej wartości ruchu windy
    let czyWyswietlonoAnimacjeWyjscia = null
    let czyWyswietlonoAnimacjeWejscia = null

    if (window.location.pathname.endsWith('symulacja_wlasciwosci.html')) {
        const toggleSimulationButton = document.getElementById('toggle-simulation');

        if (toggleSimulationButton) {
            toggleSimulationButton.addEventListener('click', async function(event) {
                event.preventDefault();
        
                const statusSymulacji = await pobierzStatusSymulacji();
                if (statusSymulacji === null) {
                    console.error('Nie udało się pobrać statusu symulacji.');
                    return;
                }
            
                const status = statusSymulacji === 0 ? 1 : 0;
                
                fetch('https://winda.onrender.com/wlacz_wylacz_symulacje', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ statusSymulacji: status })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Status symulacji:', data.statusSymulacji);
                })
                .catch(error => {
                    console.error('Błąd połączenia:', error);
                });
            });
        }


        if (suwakCzestotliwosciGenerowania) {
            suwakCzestotliwosciGenerowania.addEventListener('input', async function() {           
    
                fetch('https://winda.onrender.com/zmien_czestotliwosc', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ zmiennaCzęstotliwościGenerowaniaPasażerów: suwakCzestotliwosciGenerowania.value })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Wartość ustawiona:', data);
                })
                .catch(error => {
                    console.error('Błąd połączenia:', error);
                });
            });
        }
    }


    // Inicjalizacja windy
    window.moveElevator = function(targetFloor) {
        const floorsToTravel = Math.abs(targetFloor - currentPosition);
        const travelTime = floorsToTravel * 5000; // Czas przejazdu (5 sekunda na piętro)

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
        const travelTime = floorsToTravel * 5000; // Czas przejazdu (5 sekunda na piętro)

        // Dodanie opóźnienia, aby animacja była widoczna
        setTimeout(() => {
            elevator.style.transition = `transform ${travelTime}ms ease-in-out`;
            elevator.style.transform = `translateY(-${celRuchuWindy * floorHeight}px)`;
        }, 50);
        setTimeout(() => {
            animacjaWToku = false;
        }, travelTime + 50);
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

    function aktualizujWyswietlaczeStatusuWindy(data) {
        const statusWindy = data.windy_data.statusWindy;
        const statusDrzwi = data.windy_data.statusDrzwi;
        const trybPracy = data.windy_data.trybPracy;
        const obciazenie = data.windy_data.obciazenie;
        const predkoscWindy = data.windy_data.predkoscWindy;
        const indeksZuzycia = data.windy_data.indeksZuzycia;
        const ostatniSerwis = data.windy_data.ostatniSerwis;

        if (statusWindy === 1) {
            wyswietlaczStatusWindySymbol = 'Aktywna';
        } else if (statusWindy === 0) {
            wyswietlaczStatusWindySymbol = 'Nieaktywna';
        }
        if (wyswietlaczStatusWindy) {
            wyswietlaczStatusWindy.textContent = wyswietlaczStatusWindySymbol;
        }

        if (statusDrzwi === 1) {
            wyswietlaczStatusDrzwiSymbol = 'Aktywne';
        } else if (statusDrzwi === 0) {
            wyswietlaczStatusDrzwiSymbol = 'Nieaktywne';
        }
        if (wyswietlaczStatusDrzwi) {
            wyswietlaczStatusDrzwi.textContent = wyswietlaczStatusDrzwiSymbol;
        }

        if (trybPracy === 1) {
            wyswietlaczTrybPracySymbol = 'Standardowy';
        } else if (trybPracy === 0) {
            wyswietlaczTrybPracySymbol = 'Awaryjny';
        }
        if (wyswietlaczTrybPracy) {
            wyswietlaczTrybPracy.textContent = wyswietlaczTrybPracySymbol;
        }
        
        if (wyswietlaczObciazenie) {
            wyswietlaczObciazenie.textContent = `${parseFloat(obciazenie).toFixed(2)} /000 kg`;
        }
        if (wyswietlaczPredkoscWindy) {
            wyswietlaczPredkoscWindy.textContent = `${parseFloat(predkoscWindy).toFixed(2)} m/s`;
        }
        if (wyswietlaczIndeksZuzycia) {
            wyswietlaczIndeksZuzycia.textContent = parseFloat(indeksZuzycia).toFixed(2);
        }
        if (wyswietlaczOstatniSerwis) {
            wyswietlaczOstatniSerwis.textContent = ostatniSerwis;
        }
    }

    function aktualizujWyswietlaczeStatystykiWindy(data) {
        const pokonanePietra = data.pokonane_pietra;
        const przebytaOdleglosc = data.przebyta_odleglosc;
        const przystanki = data.zaliczone_przystanki;
        

        if (wyswietlaczWartosciPokonanePietra) {
            wyswietlaczWartosciPokonanePietra.textContent = pokonanePietra;
        }
        if (wyswietlaczWartosciPrzebytaOdleglosc) {
            wyswietlaczWartosciPrzebytaOdleglosc.textContent = `${parseFloat(przebytaOdleglosc).toFixed(2)} km`;
        }
        if (wyswietlaczWartosciPrzystanki) {
            wyswietlaczWartosciPrzystanki.textContent = przystanki;
        }
    }


    function aktualizujWyswietlaczePasazerow(data) {
        const przewiezieniPasazerowieTyp1 = data.przewiezieni_pasazerowie.typ1;
        const przewiezieniPasazerowieTyp2 = data.przewiezieni_pasazerowie.typ2;
        const przewiezieniPasazerowieTyp3 = data.przewiezieni_pasazerowie.typ3;
        const przewiezieniPasazerowieWszystko = data.przewiezieni_pasazerowie.typ1 + data.przewiezieni_pasazerowie.typ2 + data.przewiezieni_pasazerowie.typ3;
        

        if (wyswietlaczPasazerowTyp1) {
            wyswietlaczPasazerowTyp1.textContent = przewiezieniPasazerowieTyp1;
        }
        if (wyswietlaczPasazerowTyp2) {
            wyswietlaczPasazerowTyp2.textContent = przewiezieniPasazerowieTyp2;
        }
        if (wyswietlaczPasazerowTyp3) {
            wyswietlaczPasazerowTyp3.textContent = przewiezieniPasazerowieTyp3;
        }
        if (wyswietlaczPasazerowWszystko) {
            wyswietlaczPasazerowWszystko.textContent = przewiezieniPasazerowieWszystko;
        }
    }

    function aktualizujWyswietlaczeStatusSymulacji(data) {
        const statusSymulacji = data.statusSymulacji;
        if (statusSymulacji === 1) {
            wyswietlaczWartosciStatusSymulacjiSymbol = 'Aktywna';
        } else if (statusSymulacji === 0) {
            wyswietlaczWartosciStatusSymulacjiSymbol = 'Nieaktywna';
        } else {
            wyswietlaczWartosciStatusSymulacjiSymbol = ' ';
        }

        if (wyswietlaczWartosciStatusSymulacji) {
            wyswietlaczWartosciStatusSymulacji.textContent = wyswietlaczWartosciStatusSymulacjiSymbol;
        }
        
    }
        

    function aktualizujSuwakCzestotliosci(data) {
        const zmiennaCzestotliwosciGenerowaniaPasażerów = data.zmiennaCzestotliwosciGenerowaniaPasażerów;
        if (!isNaN(zmiennaCzestotliwosciGenerowaniaPasażerów)) {
            suwakCzestotliwosciGenerowania.value = zmiennaCzestotliwosciGenerowaniaPasażerów;
            suwakCzestotliwosciGenerowaniaWartosc.textContent = zmiennaCzestotliwosciGenerowaniaPasażerów;
        }
    }


    function aktualizujWyswietlaczePasazerowNaPietrze(data) {
        // Pobierz wszystkie elementy z klasą 'oczekujacy-pasazerowie'
        const oczekujacy_pasazerowieElements = document.querySelectorAll('.oczekujacy-pasazerowie');
        const slownik = data.zawartosc_pieter.oczekujacy_pasazerowie;

        if (!slownik) {
            console.error('Slownik is undefined');
            return;
        }

        oczekujacy_pasazerowieElements.forEach(element => {
            // Pobierz ID elementu i wyciągnij ostatni znak
            const id = element.id;
            const match = id.match(/\d+$/);

            if (match) {
                const idNumber = match[0];
                let found = false;

                // Przejdź przez wszystkie klucze w słowniku
                for (const key in slownik) {
                    if (slownik.hasOwnProperty(key)) {
                        const pasazer = slownik[key];
                        const zrodlo = pasazer['zrodlo'];

                        // Sprawdź, czy idNumber jest takie samo jak zrodlo
                        if (parseInt(idNumber) === parseInt(zrodlo)) {
                            found = true;
                            const rodzajePasazerow = pasazer.rodzaje_pasazerow;

                            // Funkcja do dodawania obrazków
                            const dodajObrazki = (typ, element) => {
                                // Usuń istniejące obrazki tego typu
                                element.querySelectorAll(`img.${typ}`).forEach(img => img.remove());

                                // Dodaj nowe obrazki
                                rodzajePasazerow[typ].forEach(wartosc => {
                                    const img = document.createElement('img');
                                    img.src = `images/${wartosc}.png`;
                                    img.alt = 'Pasażer';
                                    img.classList.add(typ); // Dodaj klasę, aby można było łatwo znaleźć obrazek
                                    element.appendChild(img);
                                });
                            };

                            // Dodaj obrazki dla każdego typu pasażera
                            dodajObrazki('normalny', element);
                            dodajObrazki('unikalny', element);
                            dodajObrazki('legendarny', element);

                            break; // Przerwij pętlę, jeśli znaleziono pasujący element
                        }
                    }
                }

                // Usuń obrazki, jeśli nie znaleziono pasującego elementu
                if (!found) {
                    ['normalny', 'unikalny', 'legendarny'].forEach(typ => {
                        element.querySelectorAll(`img.${typ}`).forEach(img => img.remove());
                    });
                }
            }
        });
    }
            

    function aktualizujGrafike(data) {
        // Pobierz wszystkie elementy z klasą 'pasazerowie'
        const wejscie_do_windyElements = document.querySelectorAll('.wejscie-do-windy');
        const lokalizacjaWindy = data.windy_data.lokalizacjaWindy;
    
        wejscie_do_windyElements.forEach(element => {
            // Pobierz ID elementu i wyciągnij ostatni znak
            const id = element.id;
            const match = id.match(/\d+$/);
            
            if (match) {
                const idNumber = match[0];
    
                // Sprawdź, czy lokalizacjaWindy jest równa wartości z końca nazwy ID
                if (parseInt(idNumber) === lokalizacjaWindy) {
                    const img = element.querySelector('img');
                    // Wyświetl pierwszy obrazek
                    img.src = 'images/walk.gif';
                    img.style.display = 'block';
                    img.style.animation = 'move-left-to-right 2s linear';
                    // Dodaj nasłuchiwanie na zakończenie animacji pierwszego obrazka
                    img.addEventListener('animationend', () => {
                        // Ukryj pierwszy obrazek
                        img.style.display = 'none';
                        setTimeout(() => {
                            // Zmień źródło na drugi obrazek
                            img.src = 'images/walk-left.gif';
                            // Wyświetl drugi obrazek
                            img.style.display = 'block';
                            img.style.animation = 'move-right-to-left 2s linear';
                            // Dodaj nasłuchiwanie na zakończenie animacji drugiego obrazka
                            img.addEventListener('animationend', () => {
                                // Ukryj drugi obrazek
                                img.style.display = 'none';
                            }, { once: true });
                        }, 500); // 0,5-sekundowa przerwa
                    }, { once: true });
                } else {
                    // Ukryj grafikę
                    element.querySelector('img').style.display = 'none';
                }
            }
        });
    }

    function aktualizujGrafikePaneluPietra(data) {
        // Pobierz wszystkie elementy z klasą 'przyciski-sekcja'
        const przyciskiSekcjaElements = document.querySelectorAll('.przyciski-sekcja');
        const slownik = data.wybrane_przyciski ? data.wybrane_przyciski.słownik : {};
    
        if (!slownik) {
            console.error('Slownik is undefined');
            return;
        }
    
        przyciskiSekcjaElements.forEach(element => {
            // Pobierz ID elementu i wyciągnij ostatni znak
            const id = element.id;
            const match = id.match(/\d+$/);
            
            if (match) {
                const idNumber = match[0]; // Pobierz wartość jako string
                const img = element.querySelector('img');
    
                // Sprawdź, czy idNumber jest w słowniku
                if (slownik.hasOwnProperty(idNumber)) {
                    // Wyświetl odpowiednią grafikę na podstawie wartości w słowniku
                    if (slownik[idNumber] === 2) {
                        img.src = 'images/panel-pietra-gora.png';
                    } else if (slownik[idNumber] === 3) {
                        img.src = 'images/panel-pietra-dol.png';
                    } else if (slownik[idNumber] === 1) {
                        // Jeśli wartość wynosi 1, nie wykonuj żadnej dodatkowej akcji
                        return
                    }
                } else {
                    // Wyświetl obrazek panel-pietra.png, jeśli idNumber nie jest w słowniku
                    img.src = 'images/panel-pietra.png';
                }
                img.style.display = 'block';
            }
        });
    }


    // Funkcja do pobierania danych z serwera
    function pobierzStatusWindy() {
        fetch('https://winda.onrender.com/get_winda_status')
            .then(response => response.json())
            .then(data => {
                const nowePolecenieWindy = data.windy_data.polecenia[0]; 
                const nowyStatusDrzwi = data.windy_data.pracaDrzwiWindy;                 
                
                if (data.windy_data.ruchWindy === true && lokalnyRuchWindy === false && !animacjaWToku) {
                    lokalnyRuchWindy = true;
                    animacjaWToku = true;
                    if (window.location.pathname.endsWith('index.html')) {
                        aktualizujRuchWindy(data); // Wykonaj funkcję aktualizujRuchWindy()
                    }
                } else if (data.windy_data.ruchWindy === false) {
                    lokalnyRuchWindy = false;
                    animacjaWToku = false; 
                    }

                // Sprawdź, czy wartość statsu pracy drzwi z serwera jest inna niż lokalna wartość
                if (nowyStatusDrzwi !== lokalnyStatusDrzwi && data.windy_data.pracaDrzwiWindy === true) {
                    if (window.location.pathname.endsWith('index.html')) {
                        aktualizujGrafike(data);
                        czyWyswietlonoAnimacjeWyjscia = false
                    }
                }
                if (lokalnyStatusDrzwi !== nowyStatusDrzwi) {
                    lokalnyStatusDrzwi = nowyStatusDrzwi;
                }   
                aktualizujWyswietlacze(data);   
                aktualizujGrafikePaneluPietra(data)
                aktualizujWyswietlaczeStatusuWindy(data);
                aktualizujWyswietlaczePasazerowNaPietrze(data)          
            })
            .catch(error => {
                console.error('Błąd podczas pobierania danych z serwera:', error);
                return null;
            });
    }

    function pobierzStatystykiWindy() {
        fetch('https://winda.onrender.com/get_statystyki')
            .then(response => response.json())
            .then(data => {
                aktualizujWyswietlaczeStatystykiWindy(data);
                aktualizujWyswietlaczePasazerow(data)
            })
            .catch(error => console.error('Błąd podczas pobierania danych z serwera:', error));
    }

    function pobierzStatusSymulacji() {
        return fetch('https://winda.onrender.com/get_status_symulacji')
            .then(response => response.json())
            .then(data => {
                const statusSymulacji = data.statusSymulacji;
                const zmiennaCzestotliwosciGenerowaniaPasażerów = data.zmiennaCzestotliwosciGenerowaniaPasażerów;
                aktualizujWyswietlaczeStatusSymulacji(data)
                aktualizujSuwakCzestotliosci(data); 
                return statusSymulacji;
            })
            .catch(error => {
                console.error('Błąd podczas pobierania danych z serwera:', error);
                return null;
            });
    }


    // Początkowe pobranie danych
    pobierzStatusWindy();
    pobierzStatystykiWindy();
    pobierzStatusSymulacji();
    setInterval(pobierzStatusWindy, 1000);
    setInterval(pobierzStatystykiWindy, 1000);
    setInterval(pobierzStatusSymulacji, 60000);
    // setInterval(() => aktualizujGrafike(0), 3000);
});