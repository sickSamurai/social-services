import { Controller, Get } from "@nestjs/common"
import { LocationDetail } from "../../models/LocationDetail"
import { LocationService } from "../../services/location/location.service"
import { CountryDetail } from "../../models/CountryDetail"

@Controller("api/locations")
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get("all")
  async getAll(): Promise<LocationDetail[]> {
    return await this.locationService.getAllLocations()
  }

  @Get("countries")
  async getCountries(): Promise<CountryDetail[]> {
    return await this.locationService.getAllCountries()
  }
}
