import React from 'react';
import './style.css';
import axios from 'axios';
import { Country } from '../../models/country.model';

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
}

interface Props { }


class Main extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            temperature: 0,
            city: '',
            weather: 'Clear',
            minTemp: 0,
            maxTemp: 0,
            wind: 0,
            humidity: 0,
            sunrise: '00:00',
            sunset: '00:00',
            cities: [],
        };

    }

    componentDidMount() {
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
                console.log(res);
                response.data.forEach((country: Country) => {
                    if (res.data.some((apiCity: any) => apiCity.capital === country.capital)) {
                        this.setState({cities: res.data})
                    }
                });
            });
        });
        console.log(this.state.cities);
        return this.state.cities;
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
            this.setState({ minTemp: response.data.main.temp_min })
        })
    }

    getMaxTemp(city: string) {
        this.getConfig(city).then(response => {
            this.setState({ maxTemp: response.data.main.temp_max })
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
            this.setState({ sunrise: response.data.sys.sunrise })
        })
    }

    getSunset(city: string) {
        this.getConfig(city).then(response => {
            this.setState({ sunset: response.data.sys.sunset })
        })
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
    }

    render() {
        return (
            <div>
                <span>Select your city: </span>
                <select onChange={(e: any) => this.selectCity(e)} value={this.state.city}>
                    {this.showCities()}
                </select>
                <div className="home">
                    <p>{this.state.weather}</p>
                    <p>{this.state.temperature}C</p>
                    <p>{this.state.minTemp}C</p>
                    <p>{this.state.maxTemp}C</p>
                    <p>{this.state.humidity}%</p>
                    <p>{this.state.wind} m/s</p>
                    <p>{this.state.sunrise}</p>
                    <p>{this.state.sunset}</p>
                </div>
            </div>
        );
    }
}

export default Main;