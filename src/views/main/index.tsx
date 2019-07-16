import React from 'react';
import './style.css';
import axios from 'axios';
import {Country}  from '../../models/country.model';
import moment from 'moment-timezone';

interface State {
    cities: Array<Country>;
    temperature: number;
    city: string;
    weather: string;
    minTemp: number;
    maxTemp: number;
    wind: number;
    humidity: number;
    sunrise: string;
    sunset: string;
    windDirec: string;
}

interface Props { }


class Main extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            temperature: 0,
            city: '',
            weather: 'home',
            minTemp: 0,
            maxTemp: 0,
            wind: 0,
            humidity: 0,
            sunrise: '',
            sunset: '',
            cities: [],
            windDirec: ''
        };

    }

    componentDidMount() {
        this.loadTimezones();
        this.loadCities();
    }

    showCities() {
        let options = [];
        for (let i = 0; i < this.state.cities.length; i++) {
            let option = <option key={i}> {this.state.cities[i].capital} </option>
            options.push(option);
        }
        return options;
    };

    getConfig(city: string) {
        const url = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&units=metric&appid=13cd124dd1a95c93145cc3367c2358a1';
        return axios.get(url)
            .then((response: any) => {
                return response;
            }).catch((error: any) => {
                console.log(error);
            });
    }

    loadCities() {
        const citiesJsonUrl = 'city.continent.model.json';
        const weatherApiCitiesJsonUrl = 'city.list.model.json';
        axios.get(citiesJsonUrl).then(response => {
            axios.get(weatherApiCitiesJsonUrl).then(res => {
                response.data.forEach((country: Country) => {
                    if (res.data.some((apiCity: any) => apiCity.capital === country.capital)) {
                        this.setState({ cities: response.data })
                    }
                });
            });
        });
        return this.state.cities;
    }

    loadTimezones() {
        const timeZoneJsonUrl = 'timezones.json';
        axios.get(timeZoneJsonUrl).then(response => {
          response.data.forEach((x: any) => {
            moment.tz.add(x);
          });
        });
      }

    getTemp(city: string) {
        this.getConfig(city).then(response => {
            this.setState({ temperature: response.data.main.temp })
        })
    }

    getWeather(city: string) {
        this.getConfig(city).then(response => {
            this.setState({ weather: response.data.weather[0].main })
        })
    }

    getMinTemp(city: string) {
        this.getConfig(city).then(response => {
            let minTemp = Math.round(response.data.main.temp_min);
            this.setState({ minTemp: minTemp})
        })
    }

    getMaxTemp(city: string) {
        this.getConfig(city).then(response => {
            let maxTemp = Math.round(response.data.main.temp_max)
            this.setState({ maxTemp: maxTemp })
        })
    }

    getHumidity(city: string) {
        this.getConfig(city).then(response => {
            this.setState({ humidity: response.data.main.humidity })
        })
    }

    getWind(city: string) {
        this.getConfig(city).then(response => {
            this.setState({ wind: response.data.wind.speed })
        })
    }

    getSunrise(city: string) {
        this.getConfig(city).then(response => {
            let sunrise = this.getTimeStringFromMiliseconds(response.data.sys.sunrise, city);
            this.setState({ sunrise: sunrise });
        })
    }

    getSunset(city: string) {
        this.getConfig(city).then(response => {
            let sunset = this.getTimeStringFromMiliseconds(response.data.sys.sunset, city)
            this.setState({ sunset: sunset })
        })
    }

    getTimeStringFromMiliseconds(x: number, city: string) {
        const country = this.state.cities.find((y: any) => y.capital === city);
        city = city.split(' ').join('_');
        let formattedContinent = '';
        if(country) {
            formattedContinent = this.getFormattedContinentForMoment(country.continentName);
        }
        const localTime = moment.unix(x).tz(`${formattedContinent}/${city}`);
        const hours = localTime.hours();
        const mins = localTime.minutes();
        const hoursString = `${hours < 10 ? '0' : ''}${hours}`; // add 0 if hrs < 10
        const minsString = `${mins < 10 ? '0' : ''}${mins}`;
        return `${hoursString}:${minsString}`;
      }
    
      getFormattedContinentForMoment(continent: string) {
        if (continent.indexOf('America') > -1) {
          return 'America';
        }
        return continent;
      }

      
  getWindDirection(event: string) {
    this.getConfig(event)
      .then(response => {
        if (response.data.wind.deg > 348.75 || (response.data.wind.deg < 78.75)) {
          this.setState({windDirec: 'Direction: North'})
        } else if (response.data.wind.deg < 168.75) {
          this.setState({windDirec: 'Direction: East'})
        } else if (response.data.wind.deg < 258.75) {
          this.setState({windDirec: 'Direction: South'})
        } else {
          this.setState({windDirec: 'Direction: West'})
        }
      });
  }

    selectCity(event: any) {
        this.setState({ city: event.target.value });
        this.getTemp(event.target.value);
        this.getWeather(event.target.value);
        this.getMinTemp(event.target.value);
        this.getMaxTemp(event.target.value);
        this.getHumidity(event.target.value);
        this.getWind(event.target.value);
        this.getSunrise(event.target.value);
        this.getSunset(event.target.value);
        this.getWindDirection(event.target.value)
    }

    render() {
        return (
            <div className="hero">
                <div className="select">
                    <span>Select your city: </span>
                    <select onChange={(e: any) => this.selectCity(e)} value={this.state.city}>
                        {this.showCities()}
                    </select>
                </div>

                <div className={this.state.weather}>
                    {this.state.city === "" && <div className="firstPage">What's the weather in your city?</div>}
                    {this.state.city !== "" && <div>
                        <div className="city"><img src={require("./assets/placeholder.png")} alt=""></img>{this.state.city}</div>
                        <div className="weather">{this.state.weather}</div>
                        <div className="temperature">{this.state.temperature}°C</div>
                        <div className="minMaxTemp">{this.state.minTemp}°C / {this.state.maxTemp}°C</div>
                        <div className="wind">
                            <p id="wind"><img src={require("./assets/wind.png")} alt=""></img>Wind</p>
                            <p id="windSpeed">{this.state.wind} m/s</p>
                            <p id="windDirec">{this.state.windDirec}</p>
                        </div>
                        <div className="humidity">
                            <p id="humidity"><img src={require("./assets/humidity.png")} alt=""></img>Humidity</p>
                            <p id="hum">{this.state.humidity}%</p>
                        </div>
                        <div className="sun">
                            <p id="sun"><img src={require("./assets/sun.png")} alt=""></img>Sunrise/Sunset</p>
                            <p id="sunTime">{this.state.sunrise}/{this.state.sunset}</p>
                        </div>
                    </div>}
                </div>
            </div >
        );
    }
}

export default Main;