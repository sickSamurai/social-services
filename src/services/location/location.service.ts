import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"
import { LocationDetail } from "../../models/LocationDetail"
import { CountryDetail } from "../../models/CountryDetail"

@Injectable()
export class LocationService {
  constructor(private dataSource: DataSource) {}

  async getAllLocations(): Promise<LocationDetail[]> {
    const sql = `
        SELECT l.LOCATION_CODE              as location_code,
               l.LOCATION_NAME              as location_name,
               lt.LOCATION_TYPE_CODE        as location_type_code,
               lt.LOCATION_TYPE_DESCRIPTION as location_type_description,
               p.LOCATION_CODE              as parent_location_code,
               p.LOCATION_NAME              as parent_location_name,
               pl.LOCATION_TYPE_CODE        as parent_location_type_code,
               pl.LOCATION_TYPE_DESCRIPTION as parent_location_type_description
        FROM SOCIAL_UD.LOCATION l
                 JOIN SOCIAL_UD.LOCATION_TYPE lt ON l.LOCATION_TYPE_CODE = lt.LOCATION_TYPE_CODE
                 LEFT JOIN SOCIAL_UD.LOCATION p ON p.LOCATION_TYPE_CODE = l.PARENT_LOCATION
                 LEFT JOIN SOCIAL_UD.LOCATION_TYPE pl on p.LOCATION_TYPE_CODE = pl.LOCATION_TYPE_CODE`
    return await this.dataSource.query<LocationDetail[]>(sql)
  }

  async getAllCountries(): Promise<CountryDetail[]> {
    const sql = `
        SELECT l.LOCATION_CODE as location_code,
               l.LOCATION_NAME as location_name
        FROM SOCIAL_UD.LOCATION l
        WHERE l.LOCATION_TYPE_CODE = 1`
    return await this.dataSource.query<CountryDetail[]>(sql)
  }
}
